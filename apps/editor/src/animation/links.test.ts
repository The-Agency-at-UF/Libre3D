import { describe, expect, it } from "vitest";
import { linkProblem, safeLinkUrl, withHttps } from "./links";

describe("safeLinkUrl", () => {
  it("allows web and email links, normalized", () => {
    expect(safeLinkUrl("https://example.com")).toBe("https://example.com/");
    expect(safeLinkUrl("  HTTP://Example.com/a b ")).toBe("http://example.com/a%20b");
    expect(safeLinkUrl("mailto:hello@example.com")).toBe("mailto:hello@example.com");
  });

  it("refuses every other scheme, however it's written", () => {
    for (const raw of [
      "javascript:alert(1)",
      " JaVaScRiPt:alert(1)",
      "\tjavascript:alert(1)\n",
      "data:text/html,<script>alert(1)</script>",
      "file:///etc/passwd",
      "vbscript:msgbox(1)",
      "blob:https://example.com/abc",
      "ftp://example.com",
    ]) {
      expect(safeLinkUrl(raw), raw).toBeNull();
    }
  });

  it("refuses empty, relative and unparseable links", () => {
    for (const raw of ["", "   ", "example.com", "/page", "../page", "?q=1", "http://", "not a link"]) {
      expect(safeLinkUrl(raw), raw).toBeNull();
    }
  });
});

describe("linkProblem and withHttps", () => {
  it("says why a link can't open", () => {
    expect(linkProblem("")).toBe("empty");
    expect(linkProblem("javascript:alert(1)")).toBe("unsafe");
    expect(linkProblem("https://example.com")).toBeNull();
  });

  it("offers https:// for a bare domain only", () => {
    expect(withHttps("example.com/page")).toBe("https://example.com/page");
    expect(withHttps(" www.example.com ")).toBe("https://www.example.com/");
    expect(withHttps("localhost:5173")).toBe("https://localhost:5173/");
    expect(withHttps("javascript:alert(1)")).toBeNull();
    expect(withHttps("https://example.com")).toBeNull();
    expect(withHttps("hello")).toBeNull();
    expect(withHttps("/page")).toBeNull();
    expect(withHttps("")).toBeNull();
  });
});
