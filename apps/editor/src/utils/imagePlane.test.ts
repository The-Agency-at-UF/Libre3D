import { describe, expect, it } from "vitest";

import { IMAGE_PLANE_SIZE, createImagePlaneGeometry, hasTransparentPixels, imagePlaneSize } from "./imagePlane";

describe("imagePlaneSize", () => {
  it("gives the longer side the plane size and keeps the picture's proportions", () => {
    expect(imagePlaneSize(2)).toEqual([IMAGE_PLANE_SIZE, IMAGE_PLANE_SIZE / 2]);
    expect(imagePlaneSize(0.5)).toEqual([IMAGE_PLANE_SIZE / 2, IMAGE_PLANE_SIZE]);
    expect(imagePlaneSize(1)).toEqual([IMAGE_PLANE_SIZE, IMAGE_PLANE_SIZE]);
  });

  it("makes a damaged aspect square", () => {
    for (const aspect of [undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(imagePlaneSize(aspect)).toEqual([IMAGE_PLANE_SIZE, IMAGE_PLANE_SIZE]);
    }
  });
});

describe("createImagePlaneGeometry", () => {
  it("is flat in XY, centred, and as wide as the picture", () => {
    const geometry = createImagePlaneGeometry(2);
    geometry.computeBoundingBox();

    expect(geometry.boundingBox!.min.toArray()).toEqual([-1, -0.5, 0]);
    expect(geometry.boundingBox!.max.toArray()).toEqual([1, 0.5, 0]);
  });

  it("puts the picture's top row (V = 0, as textures load) at the top", () => {
    const geometry = createImagePlaneGeometry(1);
    const position = geometry.getAttribute("position");
    const uv = geometry.getAttribute("uv");

    for (let index = 0; index < position.count; index += 1) {
      const isTop = position.getY(index) > 0;
      const isLeft = position.getX(index) < 0;
      expect([uv.getX(index), uv.getY(index)]).toEqual([isLeft ? 0 : 1, isTop ? 0 : 1]);
    }
  });
});

describe("hasTransparentPixels", () => {
  it("finds a pixel that isn't fully opaque", () => {
    expect(hasTransparentPixels([10, 20, 30, 255, 0, 0, 0, 255])).toBe(false);
    expect(hasTransparentPixels([10, 20, 30, 255, 0, 0, 0, 254])).toBe(true);
    expect(hasTransparentPixels([])).toBe(false);
  });
});
