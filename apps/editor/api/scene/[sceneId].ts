/**
 * PURPOSE: Vercel serverless entry point for `GET /api/scene/:sceneId`, the public viewer's lookup.
 *
 * INPUT: The publish ID from a share link (`/v/:sceneId`). No sign-in.
 * OUTPUT: `{ cloudAssetUrl }`, a short-lived presigned GET for the published GLB, which
 *         `PublicViewer` hands to `<model-viewer>`; 404 when nothing is published under that ID.
 *
 * A thin adapter around `handlePublishedSceneRequest` (`src/utils/awsPublishHandler.ts`), which the
 * Vite dev middleware also calls.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// `.js` is required: Vercel runs this under Node's ES module loader (see api/publish.ts).
import { handlePublishedSceneRequest } from "../../src/utils/awsPublishHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const rawSceneId = req.query.sceneId;
  const publishId = (Array.isArray(rawSceneId) ? rawSceneId[0] : rawSceneId) ?? "";

  const result = await handlePublishedSceneRequest({ method: req.method ?? "GET", publishId }, process.env);

  Object.entries(result.headers ?? {}).forEach(([name, value]) => res.setHeader(name, value));
  res.status(result.status).json(result.body);
}
