import { describe, expect, it } from "vitest";
import { normalizePublishedBgColor, parsePublishRequestBody } from "./publishedSceneStyle";

describe("normalizePublishedBgColor", () => {
  it("accepts 3, 4, 6 and 8 digit hex colours", () => {
    expect(normalizePublishedBgColor("#abc")).toBe("#abc");
    expect(normalizePublishedBgColor("#abcd")).toBe("#abcd");
    expect(normalizePublishedBgColor("#0b1020")).toBe("#0b1020");
    expect(normalizePublishedBgColor("#0b1020ff")).toBe("#0b1020ff");
  });

  it("adds a missing # (the colour inputs store raw hex)", () => {
    expect(normalizePublishedBgColor("ff8800")).toBe("#ff8800");
  });

  it("lowercases and trims", () => {
    expect(normalizePublishedBgColor("  #FF8800 ")).toBe("#ff8800");
  });

  it("rejects anything that isn't a plain hex colour", () => {
    for (const value of [
      "",
      "#",
      "#12",
      "#12345",
      "#1234567",
      "#ggg",
      "red",
      "rgb(0, 0, 0)",
      "#000; background-image: url(https://evil.example)",
      "#000\" onload=\"alert(1)",
      "url(javascript:alert(1))",
    ]) {
      expect(normalizePublishedBgColor(value), value).toBeNull();
    }
  });

  it("rejects non-strings", () => {
    for (const value of [undefined, null, 0, 0xff0000, {}, ["#fff"], true]) {
      expect(normalizePublishedBgColor(value)).toBeNull();
    }
  });
});

describe("parsePublishRequestBody", () => {
  it("reads both fields from a parsed object (Vercel)", () => {
    expect(parsePublishRequestBody({ currentPublishId: "abc", bgColor: "#123456" })).toEqual({
      currentPublishId: "abc",
      bgColor: "#123456",
    });
  });

  it("reads both fields from a raw JSON string (Vite middleware)", () => {
    expect(parsePublishRequestBody(JSON.stringify({ currentPublishId: "abc", bgColor: "123456" }))).toEqual({
      currentPublishId: "abc",
      bgColor: "#123456",
    });
  });

  it("drops an invalid colour without failing the publish", () => {
    expect(parsePublishRequestBody({ currentPublishId: "abc", bgColor: "red; x: y" })).toEqual({
      currentPublishId: "abc",
      bgColor: null,
    });
  });

  it("treats a blank or non-string id as a new publish", () => {
    expect(parsePublishRequestBody({ currentPublishId: "   " }).currentPublishId).toBeNull();
    expect(parsePublishRequestBody({ currentPublishId: 42 }).currentPublishId).toBeNull();
  });

  it("degrades malformed bodies to empty values", () => {
    const empty = { currentPublishId: null, bgColor: null };
    for (const body of [undefined, null, "", "not json", "42", 42, "null"]) {
      expect(parsePublishRequestBody(body), String(body)).toEqual(empty);
    }
  });

  it("still works for old clients that send only the id", () => {
    expect(parsePublishRequestBody({ currentPublishId: "abc" })).toEqual({ currentPublishId: "abc", bgColor: null });
  });
});
