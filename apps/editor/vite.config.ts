import path from "node:path";
import fs from "node:fs";

import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

import { createPublishSession, getPublishedScene, resolveRequestBaseUrl } from "./src/utils/awsPublishHandler";
import { verifyAuth } from "./src/utils/verifyAuth";

const editorConfigDir = fileURLToPath(new URL(".", import.meta.url));
const repoRootDir = path.resolve(editorConfigDir, "../..");
const threeModulePath = path.resolve(editorConfigDir, "node_modules/three");

const awsPublishRoutePlugin = (env: Record<string, string>): Plugin => ({
  name: "libre3d-aws-publish-route",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url && req.url.startsWith("/api/scene/") && req.method === "GET") {
        const sceneId = req.url.slice("/api/scene/".length);
        if (!sceneId) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Missing sceneId parameter" }));
          return;
        }
        try {
          const sceneData = await getPublishedScene(sceneId, env);
          if (!sceneData) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Scene not found" }));
            return;
          }
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ cloudAssetUrl: sceneData.assetUrl }));
        } catch (error) {
          console.error("Vite Backend Error:", error);
          const message = error instanceof Error ? error.message : "Unable to retrieve scene.";
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: message }));
        }
        return;
      }

      if (req.url === "/api/publish" && req.method === "POST") {
        const auth = await verifyAuth(req.headers, env);

        if (!auth.authorized) {
          res.statusCode = auth.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: auth.error }));
          return;
        }

        try {
          const bodyStr = await new Promise<string>((resolve, reject) => {
            let body = "";
            req.on("data", (chunk) => {
              body += chunk;
            });
            req.on("end", () => {
              resolve(body);
            });
            req.on("error", (err) => {
              reject(err);
            });
          });

          let currentPublishId: string | null = null;
          if (bodyStr) {
            try {
              const parsed = JSON.parse(bodyStr);
              currentPublishId = parsed.currentPublishId || null;
            } catch {
              // Ignore invalid JSON
            }
          }

          const session = await createPublishSession(env, currentPublishId, resolveRequestBaseUrl(req.headers, env));

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(session));
        } catch (error) {
          console.error("Vite Backend Error:", error);

          const message = error instanceof Error ? error.message : "Unable to create publish session.";
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: message }));
        }
        return;
      }

      if (req.url !== "/api/publish" || req.method !== "POST") {
        next();
        return;
      }
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