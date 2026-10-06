import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { stubBrowserGlobals, type BrowserStubs } from "../testing/browserStubs";

let browser: BrowserStubs;

// navigation.ts imports authSession.ts, which reads localStorage when it loads.
const loadNavigation = async () => {
  vi.resetModules();
  return import("./navigation");
};

beforeEach(() => {
  browser = stubBrowserGlobals("http://localhost:5173/");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("landingPathFor", () => {
  it("remembers the full path, query included, as ?next", async () => {
    const { landingPathFor } = await loadNavigation();

    const landing = landingPathFor("/edit/abc?tab=1");

    expect(landing).toBe("/?next=%2Fedit%2Fabc%3Ftab%3D1");
    expect(new URL(landing, "http://localhost:5173").searchParams.get("next")).toBe("/edit/abc?tab=1");
  });
});

describe("shareUrlFor", () => {
  it("links to the public viewer on this deployment", async () => {
    browser = stubBrowserGlobals("https://libre3d-editor-git-dev-libre3-d.vercel.app/edit/abc");
    const { shareUrlFor } = await loadNavigation();

    expect(shareUrlFor("1b2c3d4e-0000-4000-8000-000000000000")).toBe(
      "https://libre3d-editor-git-dev-libre3-d.vercel.app/v/1b2c3d4e-0000-4000-8000-000000000000",
    );
  });
});

describe("getPostSignInPath", () => {
  it.each([
    ["the remembered deep link", "/?next=%2Fedit%2Fabc", "/edit/abc"],
    ["the gallery without a ?next", "/", "/scenes"],
    ["the gallery instead of bouncing back to the landing page", "/?next=%2F", "/scenes"],
    ["the gallery instead of the landing page with its own query", "/?next=%2F%3Fnext%3D%252Fx", "/scenes"],
    ["the gallery instead of another site", "/?next=https%3A%2F%2Fevil.example", "/scenes"],
    ["the gallery instead of a protocol-relative URL", "/?next=%2F%2Fevil.example", "/scenes"],
  ])("goes to %s", async (_label, location, expected) => {
    browser.window.setLocation(location);
    const { getPostSignInPath } = await loadNavigation();

    expect(getPostSignInPath()).toBe(expected);
  });
});

describe("navigate and subscribeToLocation", () => {
  it("pushes a history entry, or replaces the current one, and tells subscribers", async () => {
    const { getPathname, navigate, subscribeToLocation } = await loadNavigation();
    const listener = vi.fn();
    subscribeToLocation(listener);

    navigate("/scenes");
    navigate("/edit/abc", { replace: true });

    expect(browser.window.history.pushState).toHaveBeenCalledWith(null, "", "/scenes");
    expect(browser.window.history.replaceState).toHaveBeenCalledWith(null, "", "/edit/abc");
    expect(getPathname()).toBe("/edit/abc");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("follows Back/Forward and stops after unsubscribing", async () => {
    const { subscribeToLocation } = await loadNavigation();
    const listener = vi.fn();
    const unsubscribe = subscribeToLocation(listener);

    browser.window.dispatchEvent(new Event("popstate"));
    unsubscribe();
    browser.window.dispatchEvent(new Event("popstate"));

    expect(listener).toHaveBeenCalledOnce();
  });
});
