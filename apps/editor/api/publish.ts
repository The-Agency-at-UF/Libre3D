/**
 * PURPOSE: Vercel serverless entry point for `POST /api/publish`.
 *
 * INPUT: An optional JSON body of `{ currentPublishId }` so republishing reuses an existing sceneId.
 * OUTPUT: The publish session (`sceneId`, `assetKey`, presigned `uploadUrl`, `shareUrl`) the editor
 *         needs to upload the exported GLB straight to S3.
 *
 * The dev server serves this same route from Vite middleware in `vite.config.ts`; both paths are
 * thin wrappers around `createPublishSession` so the two environments cannot drift.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { createPublishSession, resolveRequestBaseUrl } from "../src/utils/awsPublishHandler";

const readCurrentPublishId = (body: unknown): string | null => {
  if (!body) {
    return null;
  }

  // Vercel parses JSON bodies for us, but a client sending another content type leaves a string.
  let parsed: unknown = body;

  if (typeof body === "string") {
    try {
      parsed = JSON.parse(body);
    } catch {
      return null;
    }
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const currentPublishId = (parsed as { currentPublishId?: unknown }).currentPublishId;

  return typeof currentPublishId === "string" && currentPublishId.trim() ? currentPublishId : null;
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const session = await createPublishSession(
      process.env,
      readCurrentPublishId(req.body),
      resolveRequestBaseUrl(req.headers, process.env),
    );

    res.status(200).json(session);
  } catch (error) {
    console.error("Publish handler error:", error);

    const message = error instanceof Error ? error.message : "Unable to create publish session.";
    res.status(500).json({ error: message });
  }
}
