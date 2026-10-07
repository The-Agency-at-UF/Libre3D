/**
 * PURPOSE: Just enough of the browser for unit tests of browser modules in Vitest's Node
 * environment: in-memory localStorage/sessionStorage, a window with a working location, history,
 * and events, a document with events and `visibilityState`, and `navigator.onLine`. Test-only;
 * nothing in the app imports this.
 *
 * Install with `stubBrowserGlobals()` in `beforeEach` and undo with `vi.unstubAllGlobals()` in
 * `afterEach`. Modules that read `localStorage` when they load (authSession.ts, the store) must be
 * imported after that, with `vi.resetModules()` + `await import(...)`.
 */
import { vi } from "vitest";

/**
 * An in-memory Storage. A Proxy, so `Object.keys(storage)` lists the stored keys like the real
 * thing (sceneCache.ts relies on that).
 */
export const createMemoryStorage = (): Storage => {
  const items = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (index) => [...items.keys()][index] ?? null,
    removeItem: (key) => {
      items.delete(key);
    },
    setItem: (key, value) => {
      items.set(key, String(value));
    },
  };

  return new Proxy(storage, {
    ownKeys: () => [...items.keys()],
    getOwnPropertyDescriptor: (_target, key) =>
      typeof key === "string" && items.has(key)
        ? { value: items.get(key), enumerable: true, configurable: true, writable: true }
        : undefined,
  });
};

export type FakeWindow = EventTarget & {
  location: {
    readonly href: string;
    readonly origin: string;
    readonly pathname: string;
    readonly search: string;
    readonly hash: string;
    assign: ReturnType<typeof vi.fn>;
    reload: ReturnType<typeof vi.fn>;
  };
  history: {
    pushState: ReturnType<typeof vi.fn>;
    replaceState: ReturnType<typeof vi.fn>;
  };
  /** Moves the fake location, as if the user had followed a link to `href`. */
  setLocation: (href: string) => void;
};

export const createFakeWindow = (href = "http://localhost:5173/"): FakeWindow => {
  let url = new URL(href);
  const moveTo = (next: string) => {
    url = new URL(next, url);
  };

  return Object.assign(new EventTarget(), {
    location: {
      get href() {
        return url.href;
      },
      get origin() {
        return url.origin;
      },
      get pathname() {
        return url.pathname;
      },
      get search() {
        return url.search;
      },
      get hash() {
        return url.hash;
      },
      assign: vi.fn(moveTo),
      reload: vi.fn(),
    },
    history: {
      pushState: vi.fn((_state: unknown, _title: string, path: string) => moveTo(path)),
      replaceState: vi.fn((_state: unknown, _title: string, path: string) => moveTo(path)),
    },
    setLocation: moveTo,
  });
};

export type FakeDocument = EventTarget & { visibilityState: "visible" | "hidden" };

export interface BrowserStubs {
  window: FakeWindow;
  document: FakeDocument;
  localStorage: Storage;
  sessionStorage: Storage;
  navigator: { onLine: boolean };
}

/** Installs a fresh fake window, document, storages, and navigator as globals. */
export const stubBrowserGlobals = (href?: string): BrowserStubs => {
  const stubs: BrowserStubs = {
    window: createFakeWindow(href),
    document: Object.assign(new EventTarget(), { visibilityState: "visible" as const }),
    localStorage: createMemoryStorage(),
    sessionStorage: createMemoryStorage(),
    navigator: { onLine: true },
  };

  vi.stubGlobal("window", stubs.window);
  vi.stubGlobal("document", stubs.document);
  vi.stubGlobal("localStorage", stubs.localStorage);
  vi.stubGlobal("sessionStorage", stubs.sessionStorage);
  vi.stubGlobal("navigator", stubs.navigator);

  return stubs;
};

/** A JSON `Response`, as `fetch` would resolve with. */
export const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

/** An unsigned JWT with this payload. Only for code that decodes, never verifies, tokens. */
export const makeUnsignedJwt = (payload: Record<string, unknown>): string => {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.signature`;
};
