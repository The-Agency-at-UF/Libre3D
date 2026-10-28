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
export default function handler(req: VercelRequest, res: VercelResponse): Promise<void>;
