/**
 * The share-link viewer (SceneViewer.ts) is built from the editor's own viewport code, and that code
 * is what the player packages will be made of. So nothing it imports, directly or through another
 * module, may reach the editor's store, React, the editor's UI, or this browser's storage.
 *
 * These tests walk the imports from the viewer's two entry points and check. `import type` is
 * skipped, since it loads nothing. `import { type X }` is not: a bundler drops it, but nothing here
 * can tell it from a real import, so write `import type` in the files the viewer reaches.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENTRY_POINTS = ["viewport/SceneViewer.ts", "viewport/ObjectManager.ts"];

const withoutComments = (source: string): string => source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

/** The module specifiers a file loads at run time: imports, re-exports, and `import()`. */
const runtimeImports = (source: string): string[] => {
  const code = withoutComments(source);
  const patterns = [
    // import a, { b, type c } from "x" / import * as a from "x"   (not `import type …`)
    /\bimport\s+(?!type[\s{])[\w\s{},*$]*?\sfrom\s*["']([^"']+)["']/g,
    // export { a } from "x" / export * from "x"   (not `export type …`)
    /\bexport\s+(?!type[\s{])(?:\*(?:\s+as\s+\w+)?|\{[\w\s,$]*\})\s*from\s*["']([^"']+)["']/g,
    // import "x"
    /\bimport\s*["']([^"']+)["']/g,
    // import("x")
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  ];
  return patterns.flatMap((pattern) => [...code.matchAll(pattern)].map((match) => match[1]));
};

const resolveLocal = (fromFile: string, specifier: string): string | null => {
  const base = path.resolve(path.dirname(fromFile), specifier.replace(/\.js$/, ""));
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts"), path.join(base, "index.tsx")];
  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
};

const packageName = (specifier: string): string => specifier.split("/").slice(0, specifier.startsWith("@") ? 2 : 1).join("/");

/**
 * Everything reachable from the entry points: source files (relative to `src/`) and packages, each
 * with the module that first imported it, so a failure can show the chain.
 */
const reachable = (): Map<string, string | null> => {
  const importedBy = new Map<string, string | null>();
  const queue: [string, string | null][] = ENTRY_POINTS.map((entry) => [entry, null]);

  while (queue.length > 0) {
    const [module, importer] = queue.shift()!;
    if (importedBy.has(module)) continue;
    importedBy.set(module, importer);

    const file = path.join(SRC, module);
    if (!existsSync(file)) continue; // a package

    for (const specifier of runtimeImports(readFileSync(file, "utf8"))) {
      if (!specifier.startsWith(".")) {
        queue.push([packageName(specifier), module]);
        continue;
      }
      const resolved = resolveLocal(file, specifier);
      if (resolved) queue.push([path.relative(SRC, resolved).replace(/\\/g, "/"), module]);
    }
  }
  return importedBy;
};

/** "components/ui/Dialog.tsx <- utils/importModel.ts <- viewport/ObjectManager.ts" */
const chainTo = (importedBy: Map<string, string | null>, module: string): string => {
  const chain = [module];
  for (let importer = importedBy.get(module); importer; importer = importedBy.get(importer)) chain.push(importer);
  return chain.join(" <- ");
};

/** The viewer's own source files, among everything it reaches. */
const reachableFiles = (): string[] => [...reachable().keys()].filter((module) => existsSync(path.join(SRC, module)));

const offenders = (isOffender: (module: string) => boolean): string[] => {
  const importedBy = reachable();
  return [...importedBy.keys()].filter(isOffender).map((module) => chainTo(importedBy, module));
};

describe("what the share-link viewer imports", () => {
  it("includes the scene's types, defaults, and the animation runtime (the walk itself works)", () => {
    const modules = [...reachable().keys()];

    expect(modules).toEqual(expect.arrayContaining(["scene/defaults.ts", "scene/entityIndex.ts", "animation/sceneRuntime.ts", "paths/PathMesh.ts", "three"]));
  });

  it("never reaches the editor's store", () => {
    expect(offenders((module) => module.startsWith("store/") || module === "zustand" || module === "zundo")).toEqual([]);
  });

  // What the viewer shares with the importer and the exporter has its own modules: the parsed-model
  // cache (utils/parsedModelCache.ts), hiding editor-only objects (editorOnly.ts), and base poses
  // (basePoses.ts). The importer shows dialogs, and the exporter is the editor's.
  it("never reaches React, the editor's UI, or the importer and exporter", () => {
    const editorOnly = ["utils/importModel.ts", "utils/exportScene.ts"];

    expect(
      offenders(
        (module) =>
          module.startsWith("components/") || module.startsWith("hooks/") || module === "react" || module.startsWith("react-dom") || editorOnly.includes(module),
      ),
    ).toEqual([]);
  });

  // Two viewers on one page (the embed) would share a global and the second would take the first's.
  // What a module needs is handed to it: the renderer through ObjectManager's options, the scene as
  // an argument. The editor's console handles (utils/consoleHandle.ts) are set by the editor and the
  // share page, outside what the viewer imports.
  it("reads and sets no window globals", () => {
    // A handle's name, or `window` cast to another type, which is how a made-up property is reached.
    const usesGlobal = (module: string) => /__libre3d|\bwindow as\b/.test(withoutComments(readFileSync(path.join(SRC, module), "utf8")));

    expect(reachableFiles().filter(usesGlobal)).toEqual([]);
  });

  // Deriving an imported mesh's material layers takes the textures out of its material. Where they
  // are kept is the SceneSource's `saveTexture`: the editor's writes to this browser's storage, the
  // viewer's keeps them in memory, so a visitor's browser is never written to.
  it("never reaches this browser's asset storage", () => {
    const storage = ["utils/createAssetStore.ts", "utils/modelAssetStore.ts", "utils/textureAssetStore.ts"];

    expect(offenders((module) => storage.includes(module))).toEqual([]);
  });
});
