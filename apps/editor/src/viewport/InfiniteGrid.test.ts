import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";
import {
  FADE_DISTANCE_PER_HEIGHT,
  FADE_EDGE_RATIO,
  InfiniteGrid,
  MIN_FADE_DISTANCE,
  computeGridExtent,
} from "./InfiniteGrid";

// The shader itself needs WebGL and is checked by eye in the dev server; these
// cover the CPU side — how the quad is sized, faded and placed each frame, and
// the material flags the look and export rely on.

const at = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const makePerspective = (far = 1000) => new THREE.PerspectiveCamera(45, 16 / 9, 0.1, far);

// Same frustum CameraManager builds: orthoSize 5, scaled by aspect.
const makeOrtho = (zoom = 1, far = 1000, aspect = 16 / 9) => {
  const size = 5;
  const camera = new THREE.OrthographicCamera(-size * aspect, size * aspect, size, -size, 0.1, far);
  camera.zoom = zoom;
  return camera;
};

// The renderer updates matrixWorld before onBeforeRender; do the same here.
const placeCamera = <T extends THREE.Camera>(camera: T, x: number, y: number, z: number): T => {
  camera.position.set(x, y, z);
  camera.updateMatrixWorld(true);
  return camera;
};

const render = (grid: InfiniteGrid, camera: THREE.Camera) =>
  grid.onBeforeRender(
    null as unknown as THREE.WebGLRenderer,
    null as unknown as THREE.Scene,
    camera,
  );

describe("computeGridExtent", () => {
  describe("perspective", () => {
    it("sizes the quad to the far plane", () => {
      expect(computeGridExtent(makePerspective(500), at(0, 5, 0)).halfSize).toBe(500);
    });

    it("scales the fade distance with camera height", () => {
      const { fadeDistance } = computeGridExtent(makePerspective(), at(0, 2, 0));
      expect(fadeDistance).toBe(2 * FADE_DISTANCE_PER_HEIGHT);
    });

    it("keeps a minimum fade distance when the camera is at or near the grid", () => {
      expect(computeGridExtent(makePerspective(), at(0, 0, 0)).fadeDistance).toBe(MIN_FADE_DISTANCE);
      expect(computeGridExtent(makePerspective(), at(0, 0.1, 0)).fadeDistance).toBe(MIN_FADE_DISTANCE);
    });

    it("treats a camera below the grid the same as one above it", () => {
      const above = computeGridExtent(makePerspective(), at(0, 3, 0));
      const below = computeGridExtent(makePerspective(), at(0, -3, 0));
      expect(below).toEqual(above);
    });

    it("finishes fading before the far plane so the cut is never visible", () => {
      const far = 1000;
      const { fadeDistance } = computeGridExtent(makePerspective(far), at(0, 500, 0));
      expect(fadeDistance).toBe(far * FADE_EDGE_RATIO);
    });

    it("ignores horizontal camera position", () => {
      const origin = computeGridExtent(makePerspective(), at(0, 4, 0));
      const far = computeGridExtent(makePerspective(), at(1e4, 4, -1e4));
      expect(far).toEqual(origin);
    });
  });

  describe("orthographic", () => {
    it("sizes the quad to the far plane at normal zoom", () => {
      const { halfSize, fadeDistance } = computeGridExtent(makeOrtho(1, 1000), at(0, 50, 0));
      expect(halfSize).toBe(1000);
      expect(fadeDistance).toBe(1000 * FADE_EDGE_RATIO);
    });

    it("grows past the far plane to cover a zoomed-out view", () => {
      const camera = makeOrtho(0.01, 1000, 2);
      // Visible width = (right - left) / zoom = 20 / 0.01 = 2000 units.
      const { halfSize, fadeDistance } = computeGridExtent(camera, at(0, 50, 0));
      expect(halfSize).toBe(4000);
      expect(fadeDistance).toBe(4000 * FADE_EDGE_RATIO);
    });

    it("doesn't scale the fade with camera height", () => {
      const low = computeGridExtent(makeOrtho(), at(0, 1, 0));
      const high = computeGridExtent(makeOrtho(), at(0, 300, 0));
      expect(high).toEqual(low);
    });
  });

  it("writes into and returns the target object (no per-frame allocation)", () => {
    const target = { halfSize: 0, fadeDistance: 0 };
    const result = computeGridExtent(makePerspective(), at(0, 2, 0), target);
    expect(result).toBe(target);
    expect(target.fadeDistance).toBe(2 * FADE_DISTANCE_PER_HEIGHT);
  });
});

describe("InfiniteGrid", () => {
  it("is set up as an editor-only transparent overlay", () => {
    const grid = new InfiniteGrid();
    expect(grid.userData.editorOnly).toBe(true); // keeps it out of exports
    expect(grid.frustumCulled).toBe(false);
    expect(grid.renderOrder).toBe(-1);
    expect(grid.material.transparent).toBe(true);
    expect(grid.material.depthWrite).toBe(false);
    expect(grid.material.toneMapped).toBe(false); // exact UI colours
    expect(grid.material.side).toBe(THREE.DoubleSide);
  });

  it("lies flat on the XZ plane", () => {
    const grid = new InfiniteGrid();
    grid.geometry.computeBoundingBox();
    const box = grid.geometry.boundingBox!;
    expect(box.max.y - box.min.y).toBeCloseTo(0);
    expect(box.max.x - box.min.x).toBeCloseTo(2);
    expect(box.max.z - box.min.z).toBeCloseTo(2);
  });

  it("follows the camera on XZ, stays at y = 0, and scales to the extent", () => {
    const grid = new InfiniteGrid();
    const camera = placeCamera(makePerspective(800), 12, 3, -7);
    render(grid, camera);

    expect(grid.position.toArray()).toEqual([12, 0, -7]);
    expect(grid.scale.toArray()).toEqual([800, 1, 800]);
  });

  it("updates its world matrix in the same frame", () => {
    const grid = new InfiniteGrid();
    render(grid, placeCamera(makePerspective(), 5, 2, 9));

    const worldPosition = new THREE.Vector3().setFromMatrixPosition(grid.matrixWorld);
    expect(worldPosition.toArray()).toEqual([5, 0, 9]);
  });

  it("feeds the camera position and fade distance to the shader", () => {
    const grid = new InfiniteGrid();
    render(grid, placeCamera(makePerspective(), 1, 4, 2));

    const { uCameraPosition, uFadeDistance } = grid.material.uniforms;
    expect((uCameraPosition.value as THREE.Vector3).toArray()).toEqual([1, 4, 2]);
    expect(uFadeDistance.value).toBe(4 * FADE_DISTANCE_PER_HEIGHT);
  });

  it("uses the camera's world position, not its local one", () => {
    const grid = new InfiniteGrid();
    const rig = new THREE.Group();
    rig.position.set(100, 10, 0);
    const camera = makePerspective();
    camera.position.set(1, 2, 3);
    rig.add(camera);
    rig.updateMatrixWorld(true);

    render(grid, camera);

    expect(grid.position.toArray()).toEqual([101, 0, 3]);
    expect((grid.material.uniforms.uCameraPosition.value as THREE.Vector3).y).toBe(12);
  });

  it("re-sizes when the active camera switches between perspective and ortho", () => {
    const grid = new InfiniteGrid();
    render(grid, placeCamera(makePerspective(1000), 0, 2, 0));
    expect(grid.material.uniforms.uFadeDistance.value).toBe(2 * FADE_DISTANCE_PER_HEIGHT);

    render(grid, placeCamera(makeOrtho(0.01, 1000, 2), 0, 2, 0));
    expect(grid.scale.x).toBe(4000);
    expect(grid.material.uniforms.uFadeDistance.value).toBe(4000 * FADE_EDGE_RATIO);
  });

  it("disposes its geometry and material", () => {
    const grid = new InfiniteGrid();
    const onGeometryDispose = vi.fn();
    const onMaterialDispose = vi.fn();
    grid.geometry.addEventListener("dispose", onGeometryDispose);
    grid.material.addEventListener("dispose", onMaterialDispose);

    grid.dispose();

    expect(onGeometryDispose).toHaveBeenCalledOnce();
    expect(onMaterialDispose).toHaveBeenCalledOnce();
  });
});
