/**
 * PURPOSE: Vercel serverless entry point for `POST /api/scenes/:sceneId/assets/uploads` (presigned
 *          PUTs for a scene's imported models and textures the cloud doesn't have yet) and
 *          `POST /api/scenes/:sceneId/assets/downloads` (presigned GETs for them).
 *
 * A thin adapter: routing, auth, and validation live in `handleScenesRequest`
 * (`src/utils/awsSceneHandler.ts`), which the Vite dev middleware in `vite.config.ts` also calls,
 * so the two environments cannot drift.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// `.js` is required: Vercel runs this under Node's ES module loader (see api/publish.ts).
import { handleScenesRequest } from "../../../../src/utils/awsSceneHandler.js";

const firstValue = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value) ?? "";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const action = firstValue(req.query.action);

  if (action !== "uploads" && action !== "downloads") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const result = await handleScenesRequest(
    {
      method: req.method ?? "POST",
      sceneId: firstValue(req.query.sceneId),
      subresource: `assets/${action}`,
      headers: req.headers,
      body: req.body,
    },
    process.env,
  );

  Object.entries(result.headers ?? {}).forEach(([name, value]) => res.setHeader(name, value));
  res.status(result.status).json(result.body);
}
