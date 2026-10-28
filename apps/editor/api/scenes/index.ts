/**
 * PURPOSE: Vercel serverless entry point for `GET /api/scenes` (list) and `POST /api/scenes`
 *          (create).
 *
 * A thin adapter: routing, auth, and validation live in `handleScenesRequest`
 * (`src/utils/awsSceneHandler.ts`), which the Vite dev middleware in `vite.config.ts` also calls,
 * so the two environments cannot drift.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// `.js` is required: Vercel runs this under Node's ES module loader (see api/publish.ts).
import { handleScenesRequest } from "../../src/utils/awsSceneHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const result = await handleScenesRequest(
    { method: req.method ?? "GET", sceneId: null, headers: req.headers, body: req.body },
    process.env,
  );

  Object.entries(result.headers ?? {}).forEach(([name, value]) => res.setHeader(name, value));
  res.status(result.status).json(result.body);
}
