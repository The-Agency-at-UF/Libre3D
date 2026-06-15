import path from "node:path";
import fs from "node:fs";

import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

import { createPublishSession, getPublishedScene } from "./src/utils/awsPublishHandler";

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

          const session = await createPublishSession(env, currentPublishId);

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
    resolve: {
      alias: {
        three: threeModulePath,
      },
      dedupe: ["three"],
    },
    optimizeDeps: {
      exclude: ["three"],
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  };
});