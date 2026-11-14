/**
 * PURPOSE: Vercel serverless entry point for the Libre3D material library:
 *          `GET /api/library/materials` (public: the whole library), `POST` (add one) and `DELETE`
 *          (remove one), the last two for signed-in Libre3D developers only.
 *
 * A thin adapter: auth, the developer check, and validation live in `handleMaterialLibraryRequest`
 * (`src/utils/awsLibraryHandler.ts`), which the Vite dev middleware in `vite.config.ts` also calls,
 * so the two environments cannot drift.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

// `.js` is required: Vercel runs this under Node's ES module loader (see api/publish.ts).
import { handleMaterialLibraryRequest } from "../../src/utils/awsLibraryHandler.js";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const result = await handleMaterialLibraryRequest({ method: req.method ?? "GET", headers: req.headers, body: req.body }, process.env);

  Object.entries(result.headers ?? {}).forEach(([name, value]) => res.setHeader(name, value));
  res.status(result.status).json(result.body);
}
