/**
 * PURPOSE: In-memory stand-ins for the DynamoDB and S3 clients, for unit tests of the server
 * handlers. Test-only; nothing in the app imports this.
 *
 * They implement the commands the handlers send, and evaluate the expressions the handlers use
 * (`attribute_exists(x)`, `attribute_not_exists(x)`, `#a = :b`, `a < :b`, `a > :b`, joined by
 * AND / OR with parentheses; `SET a = :b, a = if_not_exists(a, :b), …` and `REMOVE a, …`) rather
 * than matching on them, so a wrong condition fails a test instead of passing a fake.
 * `FakeDynamoDB` keeps each `TableName` apart, so one instance serves both tables.
 * Query and ListObjectsV2 return small pages so the handlers' pagination loops run.
 *
 * `FakePresigner` stands in for `getSignedUrl` (`@aws-sdk/s3-request-presigner`): it records what
 * each URL was signed for, so tests can check the key, size, checksum, and signing options without
 * real credentials. A test plays the browser's presigned PUT with `FakeS3.upload`.
 */
import {
  ConditionalCheckFailedException,
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  UpdateItemCommand,
  type AttributeValue,
} from "@aws-sdk/client-dynamodb";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  NoSuchKey,
  NotFound,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

type Item = Record<string, AttributeValue>;

interface ExpressionInput {
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, AttributeValue>;
}

const PAGE_SIZE = 2;

const resolveName = (token: string, input: ExpressionInput): string =>
  token.startsWith("#") ? (input.ExpressionAttributeNames?.[token] ?? token) : token;

const resolveValue = (token: string, input: ExpressionInput): AttributeValue => {
  const value = input.ExpressionAttributeValues?.[token];

  if (!value) {
    throw new Error(`Fake DynamoDB: expression uses ${token} but no value was given`);
  }

  return value;
};

const sameValue = (a: AttributeValue | undefined, b: AttributeValue): boolean => JSON.stringify(a) === JSON.stringify(b);

// DynamoDB rejects a request that defines an expression name or value none of its expressions use
// (a ValidationException), so a handler that builds expressions conditionally must not leave one over.
const assertAllUsed = (
  input: ExpressionInput & { ConditionExpression?: string; UpdateExpression?: string; KeyConditionExpression?: string; ProjectionExpression?: string },
): void => {
  const expressions = [input.ConditionExpression, input.UpdateExpression, input.KeyConditionExpression, input.ProjectionExpression]
    .filter(Boolean)
    .join(" ");
  const defined = [...Object.keys(input.ExpressionAttributeNames ?? {}), ...Object.keys(input.ExpressionAttributeValues ?? {})];
  const unused = defined.filter((token) => !new RegExp(`${token}(?![\\w])`).test(expressions));

  if (unused.length > 0) {
    throw new Error(`Fake DynamoDB: ValidationException, unused in expressions: ${unused.join(", ")}`);
  }
};

// `<` / `>` like DynamoDB: numbers by value, strings by code point; anything else is unsupported.
const compareValues = (a: AttributeValue | undefined, b: AttributeValue, op: "<" | ">"): boolean => {
  if (a === undefined) {
    // A comparison against a missing attribute is false, as in DynamoDB.
    return false;
  }

  if (a.N !== undefined && b.N !== undefined) {
    return op === "<" ? Number(a.N) < Number(b.N) : Number(a.N) > Number(b.N);
  }

  if (a.S !== undefined && b.S !== undefined) {
    return op === "<" ? a.S < b.S : a.S > b.S;
  }

  throw new Error(`Fake DynamoDB: can't compare ${JSON.stringify(a)} ${op} ${JSON.stringify(b)}`);
};

// A small recursive-descent evaluator: OR binds looser than AND, parentheses group.
const meetsCondition = (item: Item | undefined, condition: string | undefined, input: ExpressionInput): boolean => {
  if (!condition) {
    return true;
  }

  const tokens = condition.match(/attribute_(?:not_)?exists\([^)\s]+\)|[()]|[^\s()]+/g) ?? [];
  let position = 0;
  const peek = () => tokens[position];
  const next = () => {
    const token = tokens[position];
    position += 1;

    if (token === undefined) {
      throw new Error(`Fake DynamoDB: condition ended early: "${condition}"`);
    }

    return token;
  };

  const parsePrimary = (): boolean => {
    const token = next();

    if (token === "(") {
      const value = parseOr();

      if (next() !== ")") {
        throw new Error(`Fake DynamoDB: unbalanced parentheses in "${condition}"`);
      }

      return value;
    }

    const exists = token.match(/^attribute_exists\((\S+)\)$/);
    const notExists = token.match(/^attribute_not_exists\((\S+)\)$/);

    if (exists) return item?.[resolveName(exists[1], input)] !== undefined;
    if (notExists) return item?.[resolveName(notExists[1], input)] === undefined;

    const op = next();
    const value = resolveValue(next(), input);
    const actual = item?.[resolveName(token, input)];

    if (op === "=") return sameValue(actual, value);
    if (op === "<" || op === ">") return compareValues(actual, value, op);

    throw new Error(`Fake DynamoDB: unsupported comparison "${token} ${op}" in "${condition}"`);
  };

  // Every operand is evaluated (no short-circuit), so a typo anywhere in the expression throws.
  const parseAnd = (): boolean => {
    let value = parsePrimary();

    while (peek() === "AND") {
      next();
      const right = parsePrimary();
      value = value && right;
    }

    return value;
  };

  const parseOr = (): boolean => {
    let value = parseAnd();

    while (peek() === "OR") {
      next();
      const right = parseAnd();
      value = value || right;
    }

    return value;
  };

  const result = parseOr();

  if (position !== tokens.length) {
    throw new Error(`Fake DynamoDB: unsupported condition "${condition}"`);
  }

  return result;
};

// Splits on top-level commas only: `if_not_exists(a, :b)` has one of its own.
const splitTopLevel = (list: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (const char of list) {
    if (char === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }

    depth += char === "(" ? 1 : char === ")" ? -1 : 0;
    current += char;
  }

  return [...parts, current].map((part) => part.trim()).filter(Boolean);
};

/** Applies `SET a = :b, a = if_not_exists(a, :b), …` and/or `REMOVE a, …`; returns the attributes it changed. */
const applyUpdate = (item: Item, expression: string, input: ExpressionInput): string[] => {
  const match = expression.match(/^(?:SET (.+?))?\s*(?:REMOVE (.+))?$/);

  if (!match || (!match[1] && !match[2])) {
    throw new Error(`Fake DynamoDB: unsupported update expression "${expression}"`);
  }

  const set = splitTopLevel(match[1] ?? "").map((assignment) => {
    const [name, value] = assignment.split(/=(.*)/s).map((part) => part.trim());
    const attribute = resolveName(name, input);
    const ifNotExists = value.match(/^if_not_exists\((\S+?),\s*(\S+?)\)$/);

    if (ifNotExists) {
      if (resolveName(ifNotExists[1], input) !== attribute) {
        throw new Error(`Fake DynamoDB: unsupported if_not_exists in "${assignment}"`);
      }

      item[attribute] ??= resolveValue(ifNotExists[2], input);
    } else {
      item[attribute] = resolveValue(value, input);
    }

    return attribute;
  });
  const removed = splitTopLevel(match[2] ?? "").map((name) => {
    const attribute = resolveName(name, input);
    delete item[attribute];
    return attribute;
  });

  return [...set, ...removed];
};

const conditionFailed = (item: Item | undefined, returnOld: boolean) =>
  new ConditionalCheckFailedException({
    message: "The conditional request failed",
    $metadata: {},
    Item: returnOld ? item : undefined,
  });

/**
 * Any number of tables, told apart by `TableName`. An item's key is `userId` + `sceneId` when it has
 * a `userId` (user-scenes) and `sceneId` alone otherwise (published-scenes).
 */
export class FakeDynamoDB {
  /** Every table's items, under `<table>|<userId>|<sceneId>`. */
  readonly items = new Map<string, Item>();
  /** Thrown by the next `send`, once (e.g. to simulate an outage). */
  failNextWith: Error | null = null;

  private keyOf(table: string | undefined, key: Item): string {
    return `${table}|${key.userId?.S ?? ""}|${key.sceneId?.S}`;
  }

  /** A row of the user-scenes table (`user-scenes` unless the test named it otherwise). */
  getItem(userId: string, sceneId: string, table = "user-scenes"): Item | undefined {
    return this.items.get(this.keyOf(table, { userId: { S: userId }, sceneId: { S: sceneId } }));
  }

  /** A row of the published-scenes table, by publish ID. */
  getPublished(publishId: string, table = "published-scenes"): Item | undefined {
    return this.items.get(this.keyOf(table, { sceneId: { S: publishId } }));
  }

  /** Stores a row as it is, bypassing the handlers (e.g. one written by older code). */
  putItem(table: string, item: Item): void {
    this.items.set(this.keyOf(table, item), structuredClone(item));
  }

  async send(command: unknown): Promise<unknown> {
    if (this.failNextWith) {
      const error = this.failNextWith;
      this.failNextWith = null;
      throw error;
    }

    if (command instanceof PutItemCommand) {
      assertAllUsed(command.input);
      const { Item: item, ConditionExpression, TableName } = command.input;
      const existing = this.items.get(this.keyOf(TableName, item!));

      if (!meetsCondition(existing, ConditionExpression, command.input)) {
        throw conditionFailed(existing, false);
      }

      this.items.set(this.keyOf(TableName, item!), structuredClone(item!));
      return {};
    }

    if (command instanceof GetItemCommand) {
      const item = this.items.get(this.keyOf(command.input.TableName, command.input.Key!));
      return { Item: item ? structuredClone(item) : undefined };
    }

    if (command instanceof QueryCommand) {
      const input = command.input;
      assertAllUsed(input);
      const keyMatch = input.KeyConditionExpression?.match(/^userId = (:\w+)$/);

      if (!keyMatch) {
        throw new Error(`Fake DynamoDB: unsupported key condition "${input.KeyConditionExpression}"`);
      }

      const userId = resolveValue(keyMatch[1], input).S;
      const matching = [...this.items.entries()]
        .filter(([key, item]) => key.startsWith(`${input.TableName}|`) && item.userId?.S === userId)
        .map(([, item]) => item)
        .sort((a, b) => a.sceneId!.S!.localeCompare(b.sceneId!.S!));
      const start = input.ExclusiveStartKey
        ? matching.findIndex((item) => item.sceneId?.S === input.ExclusiveStartKey!.sceneId?.S) + 1
        : 0;
      const page = matching.slice(start, start + PAGE_SIZE);
      const projected = input.ProjectionExpression?.split(",").map((name) => resolveName(name.trim(), input));

      return {
        Items: page.map((item) =>
          projected ? Object.fromEntries(projected.filter((name) => item[name]).map((name) => [name, item[name]])) : item,
        ),
        LastEvaluatedKey:
          start + PAGE_SIZE < matching.length ? { userId: page.at(-1)!.userId, sceneId: page.at(-1)!.sceneId } : undefined,
      };
    }

    if (command instanceof UpdateItemCommand) {
      const input = command.input;
      assertAllUsed(input);
      const existing = this.items.get(this.keyOf(input.TableName, input.Key!));

      if (!meetsCondition(existing, input.ConditionExpression, input)) {
        throw conditionFailed(existing, input.ReturnValuesOnConditionCheckFailure === "ALL_OLD");
      }

      const before = structuredClone(existing ?? { ...input.Key! });
      const updated = structuredClone(before);
      const changed = applyUpdate(updated, input.UpdateExpression!, input);
      this.items.set(this.keyOf(input.TableName, input.Key!), updated);

      if (input.ReturnValues === "UPDATED_OLD") {
        return { Attributes: Object.fromEntries(changed.filter((name) => before[name]).map((name) => [name, before[name]])) };
      }

      return input.ReturnValues === "ALL_NEW" ? { Attributes: structuredClone(updated) } : {};
    }

    if (command instanceof DeleteItemCommand) {
      assertAllUsed(command.input);
      const key = this.keyOf(command.input.TableName, command.input.Key!);
      const existing = this.items.get(key);

      if (!meetsCondition(existing, command.input.ConditionExpression, command.input)) {
        throw conditionFailed(existing, false);
      }

      this.items.delete(key);
      return {};
    }

    throw new Error(`Fake DynamoDB: unsupported command ${(command as object).constructor.name}`);
  }
}

/** What S3 keeps about an object besides its body. */
export interface FakeObjectInfo {
  contentType?: string;
  /** Base64 SHA-256 the object was uploaded with (`x-amz-checksum-sha256`). */
  checksumSha256?: string;
  /** Overrides the body's length, so a test can stand in for a huge file without making one. */
  contentLength?: number;
}

/** One bucket: object keys to bodies (and, in `info`, what HeadObject reports about them). */
export class FakeS3 {
  readonly objects = new Map<string, string>();
  readonly info = new Map<string, FakeObjectInfo>();
  /** Thrown by the next `send` of this command type, once. */
  failNext: { command: new (...args: never[]) => unknown; error: Error } | null = null;

  keysUnder(prefix: string): string[] {
    return [...this.objects.keys()].filter((key) => key.startsWith(prefix)).sort();
  }

  /** Stores an object the way a browser's presigned PUT would, bypassing the API. */
  upload(key: string, body: string, info: FakeObjectInfo = {}): void {
    this.objects.set(key, body);
    this.info.set(key, info);
  }

  private remove(key: string): void {
    this.objects.delete(key);
    this.info.delete(key);
  }

  async send(command: unknown): Promise<unknown> {
    if (this.failNext && command instanceof this.failNext.command) {
      const { error } = this.failNext;
      this.failNext = null;
      throw error;
    }

    if (command instanceof PutObjectCommand) {
      const { Key, Body, ContentType, ChecksumSHA256 } = command.input;
      this.upload(Key!, String(Body), { contentType: ContentType, checksumSha256: ChecksumSHA256 });
      return {};
    }

    if (command instanceof GetObjectCommand) {
      const body = this.objects.get(command.input.Key!);

      if (body === undefined) {
        throw new NoSuchKey({ message: "The specified key does not exist.", $metadata: {} });
      }

      return { Body: { transformToString: async () => body } };
    }

    if (command instanceof HeadObjectCommand) {
      const body = this.objects.get(command.input.Key!);

      if (body === undefined) {
        // What S3 answers when the caller may list the bucket; without ListBucket it would be 403.
        throw new NotFound({ message: "Not Found", $metadata: { httpStatusCode: 404 } });
      }

      const info = this.info.get(command.input.Key!) ?? {};

      return {
        ContentLength: info.contentLength ?? Buffer.byteLength(body, "utf8"),
        ContentType: info.contentType,
        // Like S3, the stored checksum is only reported when asked for.
        ChecksumSHA256: command.input.ChecksumMode === "ENABLED" ? info.checksumSha256 : undefined,
      };
    }

    if (command instanceof DeleteObjectCommand) {
      this.remove(command.input.Key!);
      return {};
    }

    if (command instanceof ListObjectsV2Command) {
      // Like S3, the continuation token is a cursor after the last key returned, not an offset, so
      // deleting a page before asking for the next one doesn't skip anything.
      const after = command.input.ContinuationToken;
      const keys = this.keysUnder(command.input.Prefix ?? "").filter((key) => after === undefined || key > after);
      const page = keys.slice(0, PAGE_SIZE);

      return {
        Contents: page.map((key) => ({ Key: key })),
        NextContinuationToken: keys.length > PAGE_SIZE ? page.at(-1) : undefined,
      };
    }

    if (command instanceof DeleteObjectsCommand) {
      command.input.Delete?.Objects?.forEach((object) => this.remove(object.Key!));
      return {};
    }

    throw new Error(`Fake S3: unsupported command ${(command as object).constructor.name}`);
  }
}

/** One URL handed out by `FakePresigner.getSignedUrl`. */
export interface FakeSignedUrl {
  url: string;
  /** `PutObject` or `GetObject`. */
  operation: string;
  /** The command's input: Bucket, Key, ContentLength, ChecksumSHA256, … */
  input: Record<string, unknown>;
  expiresIn?: number;
  signableHeaders?: string[];
  unhoistableHeaders?: string[];
}

interface PresignOptions {
  expiresIn?: number;
  signableHeaders?: Set<string>;
  unhoistableHeaders?: Set<string>;
}

/** Records every presigned URL instead of signing it. Each URL is unique and maps back to its record. */
export class FakePresigner {
  readonly signed: FakeSignedUrl[] = [];

  readonly getSignedUrl = async (_client: unknown, command: unknown, options: PresignOptions = {}): Promise<string> => {
    const operation =
      command instanceof PutObjectCommand ? "PutObject" : command instanceof GetObjectCommand ? "GetObject" : null;

    if (!operation) {
      throw new Error(`Fake presigner: unsupported command ${(command as object).constructor.name}`);
    }

    const input = { ...(command as PutObjectCommand | GetObjectCommand).input } as Record<string, unknown>;
    const url = `https://${String(input.Bucket)}.s3.test/${String(input.Key)}?op=${operation}&n=${this.signed.length}`;

    this.signed.push({
      url,
      operation,
      input,
      expiresIn: options.expiresIn,
      signableHeaders: options.signableHeaders ? [...options.signableHeaders] : undefined,
      unhoistableHeaders: options.unhoistableHeaders ? [...options.unhoistableHeaders] : undefined,
    });

    return url;
  };

  /** The record behind a URL a handler returned. */
  find(url: string): FakeSignedUrl {
    const record = this.signed.find((entry) => entry.url === url);

    if (!record) {
      throw new Error(`Fake presigner: ${url} wasn't signed here`);
    }

    return record;
  }
}
