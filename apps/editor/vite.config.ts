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
// `assets/uploads`, or `assets/downloads`, ignoring any query string.
const SCENES_ROUTE_PATTERN = /^\/api\/scenes(?:\/([^/?]*)(?:\/(lock|assets\/uploads|assets\/downloads))?)?\/?(?:\?.*)?$/;
// `/api/scene/:publishId` (the public viewer) and `/api/publish`.
const PUBLISHED_SCENE_ROUTE_PATTERN = /^\/api\/scene\/([^/?]*)\/?(?:\?.*)?$/;
const PUBLISH_ROUTE_PATTERN = /^\/api\/publish\/?(?:\?.*)?$/;

const readSubresource = (value: string | undefined): SceneSubresource | null =>
  value === "lock" || value === "assets/uploads" || value === "assets/downloads" ? value : null;

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
      // api/scenes/[sceneId]/lock.ts, and api/scenes/[sceneId]/assets/[action].ts: same handler,
      // so the two can't drift. Everything route-specific lives in handleScenesRequest.
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
      alias: {
        three: threeModulePath,
      },
      dedupe: ["three"],
    },
    optimizeDeps: {
      // "three-viewport-gizmo" (the top-right navigation gizmo) also imports
      // "three" internally. If Vite's dep optimizer pre-bundled it while
      // "three" stays excluded (just above), the optimizer's copy of
      // "three-viewport-gizmo" could end up pointing at a second, separately
      // -evaluated module instance of "three" instead of the single aliased
      // copy everything else uses — which would be a real correctness risk
      // for a library that receives this app's own THREE.Camera/
      // THREE.WebGLRenderer instances and does `instanceof` checks against
      // them internally. Excluding it here keeps it un-bundled, so its
      // "three" import resolves through the same alias as everything else.
      //
      // (Verified this app already shows three.js's own "Multiple instances
      // of Three.js being imported" console warning even before this
      // feature, unrelated to either of the above — it comes from
      // <model-viewer>'s CDN bundle, which vendors its own three.js. Not
      // something this file can fix; noted here so it isn't mistaken for a
      // regression introduced by the gizmo.)
      exclude: ["three", "three-viewport-gizmo"],
    },
    server: {
      port: 5173,
    },
    build: {
      // Three.js core alone is ~550 kB minified and can't usefully shrink. The limit sits just
      // above it so the warning still catches any other chunk (especially the entry) growing.
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          // Three.js core in its own chunk: it changes far less often than the editor, so browsers
          // keep it cached across deploys. Only the lazily loaded editor imports it.
          // Matched by package path: pnpm resolves the alias above to `.pnpm/three@…/node_modules/three`.
          manualChunks: (id) => (id.replace(/\\/g, "/").includes("/node_modules/three/build/") ? "three" : undefined),
        },
      },
    },
  };
});