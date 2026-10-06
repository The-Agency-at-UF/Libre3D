/**
 * PURPOSE: Vercel serverless entry point for `POST /api/publish` (publish one of the signed-in
 *          user's scenes: `{ sceneId }` → `{ publishId, uploadUrl }`).
 *
 * A thin adapter: auth, ownership, and validation live in `handlePublishRequest`
 * (`src/utils/awsPublishHandler.ts`), which the Vite dev middleware in `vite.config.ts` also calls,
 * so the two environments cannot drift.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// The `.js` extensions are required: this package is `"type": "module"`, and on Vercel these files
// run under Node's ES module loader, which doesn't guess extensions (Vite does, so `pnpm dev` works
// either way). Without them the function crashes at load with ERR_MODULE_NOT_FOUND.
import { handlePublishRequest } from "../src/utils/awsPublishHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const result = await handlePublishRequest({ method: req.method ?? "POST", headers: req.headers, body: req.body }, process.env);

  Object.entries(result.headers ?? {}).forEach(([name, value]) => res.setHeader(name, value));
  res.status(result.status).json(result.body);
}
