/**
 * PURPOSE: A picture of the viewport for the gallery card: what the editor camera sees, without the
 * grid, helpers, selection outline, or gizmos, as a 480×270 JPEG. JPEG because every browser can
 * encode it (Safari can't make WebP) and the picture has no transparency to keep: the scene always
 * draws its background colour.
 *
 * `captureViewportThumbnail` asks for one; the render loop (useViewportRenderer) takes it on its
 * next frame with `renderPendingThumbnail`, just before the frame's normal render. The picture has to
 * be copied in that same frame: the WebGL canvas doesn't keep its drawing buffer once the browser
 * has shown it.
 */

import type * as THREE from "three";

import { useEditorStore } from "../store/useEditorStore";
import { hideEditorOnlyObjects } from "../utils/exportScene";

// The gallery card's 16:9 thumbnail at about twice its displayed size.
const THUMBNAIL_WIDTH = 480;
const THUMBNAIL_HEIGHT = 270;
const JPEG_QUALITY = 0.85;
// The render loop stops during preview and with the editor closed; don't wait for it forever.
const CAPTURE_TIMEOUT_MS = 1000;

type PendingCapture = (canvas: HTMLCanvasElement | null) => void;

let pending: PendingCapture[] = [];

/** Whether a picture is waiting for the next frame. */
export const hasPendingThumbnail = (): boolean => pending.length > 0;

/**
 * Called by the render loop with this frame's camera: renders the scene without the editor's own
 * objects and copies it, cropped to 16:9 from the middle, into a small canvas for every waiting
 * request. The frame's normal render follows and replaces it on screen.
 */
export const renderPendingThumbnail = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void => {
  const waiting = pending;
  pending = [];

  const source = renderer.domElement;
  const canvas = document.createElement("canvas");
  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = THUMBNAIL_HEIGHT;
  const context = canvas.getContext("2d");
  const restoreEditorOnlyObjects = hideEditorOnlyObjects(scene);

  try {
    renderer.render(scene, camera);

    const scale = Math.min(source.width / THUMBNAIL_WIDTH, source.height / THUMBNAIL_HEIGHT);
    const cropWidth = THUMBNAIL_WIDTH * scale;
    const cropHeight = THUMBNAIL_HEIGHT * scale;

    context?.drawImage(
      source,
      (source.width - cropWidth) / 2,
      (source.height - cropHeight) / 2,
      cropWidth,
      cropHeight,
      0,
      0,
      THUMBNAIL_WIDTH,
      THUMBNAIL_HEIGHT,
    );
  } finally {
    restoreEditorOnlyObjects();
  }

  waiting.forEach((resolve) => resolve(context && source.width > 0 && source.height > 0 ? canvas : null));
};

/**
 * The viewport as a JPEG picture, or null when there's none to take (no viewport, or preview mode).
 */
export const captureViewportThumbnail = async (): Promise<Blob | null> => {
  if (useEditorStore.getState().isPreviewMode) {
    return null;
  }

  const canvas = await new Promise<HTMLCanvasElement | null>((resolve) => {
    const request: PendingCapture = (result) => {
      clearTimeout(timeout);
      resolve(result);
    };
    const timeout = setTimeout(() => {
      pending = pending.filter((entry) => entry !== request);
      resolve(null);
    }, CAPTURE_TIMEOUT_MS);

    pending.push(request);
  });

  if (!canvas) {
    return null;
  }

  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
};
