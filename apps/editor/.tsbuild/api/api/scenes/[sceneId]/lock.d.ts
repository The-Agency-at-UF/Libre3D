/**
 * PURPOSE: Vercel serverless entry point for `POST|DELETE /api/scenes/:sceneId/lock` (claim, renew,
 *          take over, or release the single-editor lock on one of the signed-in user's scenes).
 *
 * A thin adapter: routing, auth, and validation live in `handleScenesRequest`
 * (`src/utils/awsSceneHandler.ts`), which the Vite dev middleware in `vite.config.ts` also calls,
 * so the two environments cannot drift.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
export default function handler(req: VercelRequest, res: VercelResponse): Promise<void>;
