/**
 * PURPOSE: Vercel serverless entry point for `POST /api/publish` (publish one of the signed-in
 *          user's scenes: `{ sceneId }` → `{ publishId, uploadUrl }`).
 *
 * A thin adapter: auth, ownership, and validation live in `handlePublishRequest`
 * (`src/utils/awsPublishHandler.ts`), which the Vite dev middleware in `vite.config.ts` also calls,
 * so the two environments cannot drift.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
export default function handler(req: VercelRequest, res: VercelResponse): Promise<void>;
