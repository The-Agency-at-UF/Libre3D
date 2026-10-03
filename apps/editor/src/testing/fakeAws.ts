/**
 * PURPOSE: In-memory stand-ins for the DynamoDB and S3 clients, for unit tests of the server
 * handlers. Test-only; nothing in the app imports this.
 *
 * They implement the commands the handlers send, and evaluate the expressions the handlers use
 * (`attribute_exists(x)`, `attribute_not_exists(x)`, `#a = :b` joined by AND, `SET a = :b, …`)
 * rather than matching on them, so a wrong condition fails a test instead of passing a fake.
 * Query and ListObjectsV2 return small pages so the handlers' pagination loops run.
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
  ListObjectsV2Command,
  NoSuchKey,
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

const meetsCondition = (item: Item | undefined, condition: string | undefined, input: ExpressionInput): boolean =>
  !condition ||
  condition.split(/\s+AND\s+/).every((clause) => {
    const exists = clause.match(/^attribute_exists\((\S+)\)$/);
    const notExists = clause.match(/^attribute_not_exists\((\S+)\)$/);
    const equals = clause.match(/^(\S+) = (:\w+)$/);

    if (exists) return item?.[resolveName(exists[1], input)] !== undefined;
    if (notExists) return item?.[resolveName(notExists[1], input)] === undefined;
    if (equals) return sameValue(item?.[resolveName(equals[1], input)], resolveValue(equals[2], input));

    throw new Error(`Fake DynamoDB: unsupported condition clause "${clause}"`);
  });

const applySet = (item: Item, expression: string, input: ExpressionInput): string[] => {
  const match = expression.match(/^SET (.+)$/);

  if (!match) {
    throw new Error(`Fake DynamoDB: unsupported update expression "${expression}"`);
  }

  return match[1].split(",").map((assignment) => {
    const [name, value] = assignment.split("=").map((part) => part.trim());
    const attribute = resolveName(name, input);
    item[attribute] = resolveValue(value, input);
    return attribute;
  });
};

const conditionFailed = (item: Item | undefined, returnOld: boolean) =>
  new ConditionalCheckFailedException({
    message: "The conditional request failed",
    $metadata: {},
    Item: returnOld ? item : undefined,
  });

/** A user-scenes-shaped table: partition key `userId`, sort key `sceneId`. */
export class FakeDynamoDB {
  readonly items = new Map<string, Item>();
  /** Thrown by the next `send`, once (e.g. to simulate an outage). */
  failNextWith: Error | null = null;

  private keyOf(key: Item): string {
    return `${key.userId?.S}|${key.sceneId?.S}`;
  }

  getItem(userId: string, sceneId: string): Item | undefined {
    return this.items.get(`${userId}|${sceneId}`);
  }

  async send(command: unknown): Promise<unknown> {
    if (this.failNextWith) {
      const error = this.failNextWith;
      this.failNextWith = null;
      throw error;
    }

    if (command instanceof PutItemCommand) {
      const { Item: item, ConditionExpression } = command.input;
      const existing = this.items.get(this.keyOf(item!));

      if (!meetsCondition(existing, ConditionExpression, command.input)) {
        throw conditionFailed(existing, false);
      }

      this.items.set(this.keyOf(item!), structuredClone(item!));
      return {};
    }

    if (command instanceof GetItemCommand) {
      const item = this.items.get(this.keyOf(command.input.Key!));
      return { Item: item ? structuredClone(item) : undefined };
    }

    if (command instanceof QueryCommand) {
      const input = command.input;
      const keyMatch = input.KeyConditionExpression?.match(/^userId = (:\w+)$/);

      if (!keyMatch) {
        throw new Error(`Fake DynamoDB: unsupported key condition "${input.KeyConditionExpression}"`);
      }

      const userId = resolveValue(keyMatch[1], input).S;
      const matching = [...this.items.values()]
        .filter((item) => item.userId?.S === userId)
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
      const existing = this.items.get(this.keyOf(input.Key!));

      if (!meetsCondition(existing, input.ConditionExpression, input)) {
        throw conditionFailed(existing, input.ReturnValuesOnConditionCheckFailure === "ALL_OLD");
      }

      const before = structuredClone(existing ?? { ...input.Key! });
      const updated = structuredClone(before);
      const changed = applySet(updated, input.UpdateExpression!, input);
      this.items.set(this.keyOf(input.Key!), updated);

      return input.ReturnValues === "UPDATED_OLD"
        ? { Attributes: Object.fromEntries(changed.filter((name) => before[name]).map((name) => [name, before[name]])) }
        : {};
    }

    if (command instanceof DeleteItemCommand) {
      const key = this.keyOf(command.input.Key!);
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

/** One bucket: object keys to bodies. */
export class FakeS3 {
  readonly objects = new Map<string, string>();
  /** Thrown by the next `send` of this command type, once. */
  failNext: { command: new (...args: never[]) => unknown; error: Error } | null = null;

  keysUnder(prefix: string): string[] {
    return [...this.objects.keys()].filter((key) => key.startsWith(prefix)).sort();
  }

  async send(command: unknown): Promise<unknown> {
    if (this.failNext && command instanceof this.failNext.command) {
      const { error } = this.failNext;
      this.failNext = null;
      throw error;
    }

    if (command instanceof PutObjectCommand) {
      this.objects.set(command.input.Key!, String(command.input.Body));
      return {};
    }

    if (command instanceof GetObjectCommand) {
      const body = this.objects.get(command.input.Key!);

      if (body === undefined) {
        throw new NoSuchKey({ message: "The specified key does not exist.", $metadata: {} });
      }

      return { Body: { transformToString: async () => body } };
    }

    if (command instanceof DeleteObjectCommand) {
      this.objects.delete(command.input.Key!);
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
      command.input.Delete?.Objects?.forEach((object) => this.objects.delete(object.Key!));
      return {};
    }

    throw new Error(`Fake S3: unsupported command ${(command as object).constructor.name}`);
  }
}
