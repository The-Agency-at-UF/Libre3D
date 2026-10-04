/**
 * PURPOSE: Vercel serverless entry point for `POST /api/publish`.
 *
 * INPUT: An optional JSON body of `{ currentPublishId, bgColor }`: the id lets republishing reuse an
 *        existing sceneId, and the colour is stored for the share page (glTF can't carry it).
 * OUTPUT: The publish session (`sceneId`, `assetKey`, presigned `uploadUrl`, `shareUrl`) the editor
 *         needs to upload the exported GLB straight to S3.
 *
 * The dev server serves this same route from Vite middleware in `vite.config.ts`; both paths are
 * thin wrappers around `createPublishSession` so the two environments cannot drift.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { createPublishSession, resolveRequestBaseUrl } from "../src/utils/awsPublishHandler";
import { authorizePublishRequest } from "../src/utils/publishAuth";
import { parsePublishRequestBody } from "../src/utils/publishedSceneStyle";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const auth = authorizePublishRequest(req.headers, process.env);

  if (!auth.authorized) {
    res.status(auth.status).json({ error: auth.error });
    return;
  }

  try {
    const { currentPublishId, bgColor } = parsePublishRequestBody(req.body);
    const session = await createPublishSession(
      process.env,
      currentPublishId,
      resolveRequestBaseUrl(req.headers, process.env),
      bgColor,
    );

    res.status(200).json(session);
  } catch (error) {
    console.error("Publish handler error:", error);

    const message = error instanceof Error ? error.message : "Unable to create publish session.";
    res.status(500).json({ error: message });
  }
}
