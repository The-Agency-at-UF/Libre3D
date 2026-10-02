/**
 * PURPOSE: Vercel serverless entry point for `GET /api/scene/:sceneId`.
 *
 * INPUT: The `sceneId` path segment from a published share link.
 * OUTPUT: `{ cloudAssetUrl }` pointing at the published GLB, which `PublicViewer` hands to
 *         `<model-viewer>`; 404 when the scene is not in DynamoDB.
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

import { getPublishedScene } from "../../src/utils/awsPublishHandler";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawSceneId = req.query.sceneId;
  const sceneId = Array.isArray(rawSceneId) ? rawSceneId[0] : rawSceneId;

  if (!sceneId) {
    res.status(400).json({ error: "Missing sceneId parameter" });
    return;
  }

  try {
    const sceneData = await getPublishedScene(sceneId, process.env);

    if (!sceneData) {
      res.status(404).json({ error: "Scene not found" });
      return;
    }

    res.status(200).json({ cloudAssetUrl: sceneData.assetUrl });
  } catch (error) {
    console.error("Scene lookup handler error:", error);

    const message = error instanceof Error ? error.message : "Unable to retrieve scene.";
    res.status(500).json({ error: message });
  }
}
