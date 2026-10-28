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
export default function handler(req: VercelRequest, res: VercelResponse): Promise<void>;
