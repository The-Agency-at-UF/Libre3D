/**
 * PURPOSE: Vercel serverless entry point for `GET|PUT|PATCH|DELETE /api/scenes/:sceneId` (open,
 *          save, rename, delete one of the signed-in user's scenes).
 *
 * A thin adapter: routing, auth, and validation live in `handleScenesRequest`
 * (`src/utils/awsSceneHandler.ts`), which the Vite dev middleware in `vite.config.ts` also calls,
 * so the two environments cannot drift.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// `.js` is required: Vercel runs this under Node's ES module loader (see api/publish.ts).
import { handleScenesRequest } from "../../src/utils/awsSceneHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const rawSceneId = req.query.sceneId;
  const sceneId = (Array.isArray(rawSceneId) ? rawSceneId[0] : rawSceneId) ?? "";

  const result = await handleScenesRequest(
    { method: req.method ?? "GET", sceneId, headers: req.headers, body: req.body },
    process.env,
  );

  Object.entries(result.headers ?? {}).forEach(([name, value]) => res.setHeader(name, value));
  res.status(result.status).json(result.body);
}
