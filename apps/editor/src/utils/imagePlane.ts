import * as THREE from "three";

// Images (type "image"): an imported picture on a flat plane in the object's own XY plane, facing +Z
// like a shape, as wide for its height as the picture. The pixels are its Image layer's texture
// (utils/importImage.ts stores the file as it is), so the picture saves, syncs, exports and publishes
// like any other texture.

/** The longer side of an image plane, in units (a little bigger than the 1-unit cube). */
export const IMAGE_PLANE_SIZE = 2;

/** An image plane's width and height for a picture `aspect` (width / height) wide; square for a damaged one. */
export const imagePlaneSize = (aspect: number | undefined): [number, number] => {
  const ratio = aspect !== undefined && Number.isFinite(aspect) && aspect > 0 ? aspect : 1;
  return ratio >= 1 ? [IMAGE_PLANE_SIZE, IMAGE_PLANE_SIZE / ratio] : [IMAGE_PLANE_SIZE * ratio, IMAGE_PLANE_SIZE];
};

/**
 * The plane, centred on its origin. Textures load the glTF way, with the picture's top row at V = 0
 * (utils/materialLayers.ts, buildTextureFromLayer), so V runs downward here: the picture shows
 * upright, and an exported GLB has it upright too.
 */
export const createImagePlaneGeometry = (aspect: number | undefined): THREE.PlaneGeometry => {
  const geometry = new THREE.PlaneGeometry(...imagePlaneSize(aspect));
  const uv = geometry.getAttribute("uv");
  for (let index = 0; index < uv.count; index += 1) uv.setY(index, 1 - uv.getY(index));
  return geometry;
};

/** Whether RGBA pixel data has a pixel that isn't fully opaque. */
export const hasTransparentPixels = (rgba: ArrayLike<number>): boolean => {
  for (let index = 3; index < rgba.length; index += 4) {
    if (rgba[index] < 255) return true;
  }
  return false;
};
