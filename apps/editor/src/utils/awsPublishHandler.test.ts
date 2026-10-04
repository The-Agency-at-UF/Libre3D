import { DynamoDBClient, GetItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createPublishSession, getPublishedScene } from "./awsPublishHandler";

// No network: presigning is stubbed and every DynamoDB call is intercepted, so these
// check what we write to and read from the publish record, not AWS itself.
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn(async () => "https://upload.example/presigned"),
}));

const env = {
  AWS_REGION: "us-east-1",
  S3_BUCKET_NAME: "test-bucket",
  DYNAMODB_TABLE_NAME: "test-table",
  AWS_ACCESS_KEY_ID: "test-key",
  AWS_SECRET_ACCESS_KEY: "test-secret",
};

const mockDynamoSend = (response: unknown = {}) =>
  vi.spyOn(DynamoDBClient.prototype, "send").mockImplementation((async () => response) as never);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createPublishSession", () => {
  it("stores the background colour on the publish record", async () => {
    const send = mockDynamoSend();

    await createPublishSession(env, "scene-1", "https://libre3d.example", "#ff8800");

    const command = send.mock.calls[0][0] as unknown as PutItemCommand;
    expect(command).toBeInstanceOf(PutItemCommand);
    expect(command.input.Item?.bgColor).toEqual({ S: "#ff8800" });
    expect(command.input.Item?.sceneId).toEqual({ S: "scene-1" });
  });

  it("omits the attribute when there is no colour (DynamoDB rejects empty strings)", async () => {
    const send = mockDynamoSend();

    await createPublishSession(env, "scene-1", "https://libre3d.example");

    const command = send.mock.calls[0][0] as unknown as PutItemCommand;
    expect(command.input.Item).not.toHaveProperty("bgColor");
  });
});

describe("getPublishedScene", () => {
  const item = {
    sceneId: { S: "scene-1" },
    assetUrl: { S: "https://test-bucket.s3.us-east-1.amazonaws.com/scenes/scene-1.glb" },
  };

  it("returns the stored background colour", async () => {
    const send = mockDynamoSend({ Item: { ...item, bgColor: { S: "#FF8800" } } });

    const scene = await getPublishedScene("scene-1", env);

    expect(send.mock.calls[0][0]).toBeInstanceOf(GetItemCommand);
    expect(scene).toEqual({ assetUrl: item.assetUrl.S, bgColor: "#ff8800" });
  });

  it("returns null colour for scenes published before it was stored", async () => {
    mockDynamoSend({ Item: item });

    expect(await getPublishedScene("scene-1", env)).toEqual({ assetUrl: item.assetUrl.S, bgColor: null });
  });

  it("never returns a stored value that isn't a hex colour", async () => {
    mockDynamoSend({ Item: { ...item, bgColor: { S: "#000; background-image: url(x)" } } });

    expect((await getPublishedScene("scene-1", env))?.bgColor).toBeNull();
  });
});
