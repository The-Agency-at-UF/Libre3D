import path from "node:path";
import fs from "node:fs";

import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

import { handlePublishRequest, handlePublishedSceneRequest } from "./src/utils/awsPublishHandler";
import { handleScenesRequest, type SceneSubresource } from "./src/utils/awsSceneHandler";

const editorConfigDir = fileURLToPath(new URL(".", import.meta.url));
const repoRootDir = path.resolve(editorConfigDir, "../..");
const threeModulePath = path.resolve(editorConfigDir, "node_modules/three");

// `/api/scenes`, `/api/scenes/:sceneId`, or `/api/scenes/:sceneId/` followed by `lock`,
// `assets/uploads`, `assets/downloads`, or `thumbnail`, ignoring any query string.
const SCENES_ROUTE_PATTERN = /^\/api\/scenes(?:\/([^/?]*)(?:\/(lock|assets\/uploads|assets\/downloads|thumbnail))?)?\/?(?:\?.*)?$/;
// `/api/scene/:publishId` (the public viewer) and `/api/publish`.
const PUBLISHED_SCENE_ROUTE_PATTERN = /^\/api\/scene\/([^/?]*)\/?(?:\?.*)?$/;
const PUBLISH_ROUTE_PATTERN = /^\/api\/publish\/?(?:\?.*)?$/;

const readSubresource = (value: string | undefined): SceneSubresource | null =>
  value === "lock" || value === "assets/uploads" || value === "assets/downloads" || value === "thumbnail" ? value : null;

const readRequestBody = (req: NodeJS.ReadableStream): Promise<string> =>
  new Promise<string>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

const awsPublishRoutePlugin = (env: Record<string, string>): Plugin => ({
  name: "libre3d-aws-publish-route",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      // The dev copy of api/scenes/index.ts, api/scenes/[sceneId]/index.ts,
      // api/scenes/[sceneId]/lock.ts, api/scenes/[sceneId]/assets/[action].ts, and
      // api/scenes/[sceneId]/thumbnail.ts: same handler, so the two can't drift. Everything
      // route-specific lives in handleScenesRequest.
      const scenesMatch = req.url?.match(SCENES_ROUTE_PATTERN);

      if (scenesMatch) {
        const method = req.method ?? "GET";
        const [, rawSceneId, subresource] = scenesMatch;
        // Releasing the lock is a DELETE with a body (the session ID); deleting a scene has none.
        const body = method === "GET" || (method === "DELETE" && !subresource) ? "" : await readRequestBody(req);
        const result = await handleScenesRequest(
          {
            method,
            sceneId: rawSceneId === undefined ? null : decodeURIComponent(rawSceneId),
            subresource: readSubresource(subresource),
            headers: req.headers,
            body,
          },
          env,
        );

        res.statusCode = result.status;
        Object.entries(result.headers ?? {}).forEach(([name, value]) => res.setHeader(name, value));
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result.body));
        return;
      }

      // The dev copy of api/scene/[sceneId].ts (public viewer) and api/publish.ts, around the same
      // handlers (awsPublishHandler.ts).
      const publishedMatch = req.url?.match(PUBLISHED_SCENE_ROUTE_PATTERN);

      if (publishedMatch || req.url?.match(PUBLISH_ROUTE_PATTERN)) {
        const method = req.method ?? "GET";
        const result = publishedMatch
          ? await handlePublishedSceneRequest({ method, publishId: decodeURIComponent(publishedMatch[1]) }, env)
          : await handlePublishRequest({ method, headers: req.headers, body: method === "POST" ? await readRequestBody(req) : "" }, env);

        res.statusCode = result.status;
        Object.entries(result.headers ?? {}).forEach(([name, value]) => res.setHeader(name, value));
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result.body));
        return;
      }

      next();
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, repoRootDir, "");

  return {
    plugins: [react(), awsPublishRoutePlugin(env)],
    // The one .env lives at the repo root (the server side already reads it from there). Only its
    // VITE_-prefixed values reach the browser bundle; the AWS keys beside them stay server-side.
    envDir: repoRootDir,
    resolve: {
      // The first two are three's own subpath exports (the WebGPU renderer and its shader
      // language): pointing `three` at a folder skips the package's export map, so they're spelled out.
      alias: [
        { find: /^three\/webgpu$/, replacement: path.join(threeModulePath, "build/three.webgpu.js") },
        { find: /^three\/tsl$/, replacement: path.join(threeModulePath, "build/three.tsl.js") },
        { find: "three", replacement: threeModulePath },
      ],
      dedupe: ["three"],
    },
    optimizeDeps: {
      // Exclude "three" and "three-viewport-gizmo" from pre-bundling so the gizmo resolves
      // through the same aliased Three.js instance without duplicate module evaluations.
      exclude: ["three", "three-viewport-gizmo"],
    },
    server: {
      port: 5173,
    },
    build: {
      // Three.js core with its WebGPU renderer is ~815 kB minified and can't usefully shrink. The
      // limit sits just above it so the warning still catches any other chunk (especially the
      // entry) growing.
      chunkSizeWarningLimit: 850,
      rollupOptions: {
        output: {
          // Three.js core in its own chunk: it changes far less often than the editor, so browsers
          // keep it cached across deploys. Only the lazily loaded editor imports it.
          // Matched by package path: pnpm resolves the alias above to `.pnpm/three@…/node_modules/three`.
          // The WebGL renderer's own build is apart: only the editor's navigation gizmo still draws
          // with it, so the share page never downloads it.
          manualChunks: (id) => {
            const file = id.replace(/\\/g, "/");
            if (!file.includes("/node_modules/three/build/")) return undefined;
            return file.endsWith("/three.module.js") ? "three-webgl" : "three";
          },
        },
      },
    },
  };
});