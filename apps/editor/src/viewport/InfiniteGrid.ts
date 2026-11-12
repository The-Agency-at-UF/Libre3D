import * as THREE from "three";
import { MeshBasicNodeMaterial, type Node } from "three/webgpu";
import { Fn, abs, cameraPosition, clamp, color as color3, float, floor, fract, fwidth, length, log2, max, min, mix, mod, positionWorld, pow, smoothstep, uniform, vec2, vec4, type ShaderNodeObject } from "three/tsl";

// Shader-drawn XZ grid that reads as infinite, in the style of Blender's
// overlay grid. One quad, one draw call: the fragment shader decides per pixel
// whether it sits on a line, so cost is independent of how much grid is
// visible and there's no line geometry to grow, rebuild or alias.
//
// - Lines are anti-aliased with screen-space derivatives (`fwidth`), so they
//   stay ~1px wide at any distance or zoom.
// - Spacing is picked per pixel from the same derivatives: the finest level is
//   the smallest power-of-ten cell that's still at least MIN_PIXELS_BETWEEN_LINES
//   apart on screen, and it fades out smoothly as it gets denser, handing off to
//   the next level. Zooming never pops and distant lines never moiré.
// - The quad follows the camera on XZ and fades out with distance (scaled by
//   camera height), so its edge is never visible. Line positions come from the
//   interpolated *world* position, so moving the quad doesn't move the lines.
//
// The quad and its fade distance are refreshed in onBeforeRender from whichever
// camera is rendering, so perspective ↔ orthographic swaps through cameraRef need
// no extra wiring. The shader is written in TSL (three's node shader language),
// which three compiles for WebGPU and for WebGL 2.

const BASE_CELL_SIZE = 2;
const MIN_PIXELS_BETWEEN_LINES = 4;
const LINE_COLOR = "#2a3f5f";
const AXIS_X_COLOR = "#ef4444";
const AXIS_Z_COLOR = "#3b82f6";
// Fade-out distance = camera height × this, clamped below.
export const FADE_DISTANCE_PER_HEIGHT = 60;
export const MIN_FADE_DISTANCE = 30;
// Fraction of the quad's half-size / the far plane the fade must finish by,
// so the quad's edge (or the far-plane cut) is never visible.
export const FADE_EDGE_RATIO = 0.95;

export interface GridExtent {
  /** Half the quad's side length, in world units. */
  halfSize: number;
  /** Horizontal distance from the camera at which the grid has fully faded. */
  fadeDistance: number;
}

// Pure sizing logic behind InfiniteGrid.onBeforeRender, split out so it can be
// unit-tested without WebGL. Writes into `target` (and returns it) so the
// per-frame call doesn't allocate.
export function computeGridExtent(
  camera: THREE.Camera,
  cameraWorldPosition: THREE.Vector3,
  target: GridExtent = { halfSize: 0, fadeDistance: 0 },
): GridExtent {
  if (camera instanceof THREE.OrthographicCamera) {
    // Cover the whole (zoomed) view; ortho has no horizon to hide, so the
    // fade only needs to hide the quad's edge.
    const visibleExtent =
      Math.max(camera.right - camera.left, camera.top - camera.bottom) / camera.zoom;
    target.halfSize = Math.max(camera.far, visibleExtent * 2);
    target.fadeDistance = target.halfSize * FADE_EDGE_RATIO;
    return target;
  }

  const far = (camera as THREE.PerspectiveCamera).far ?? 1000;
  target.halfSize = far;
  target.fadeDistance = Math.min(
    far * FADE_EDGE_RATIO,
    Math.max(Math.abs(cameraWorldPosition.y) * FADE_DISTANCE_PER_HEIGHT, MIN_FADE_DISTANCE),
  );
  return target;
}

// Full strength renders lines at exactly the line colour, matching the old
// GridHelper; lower these to make every grid level fainter.
const MINOR_STRENGTH = 0.7;
const MAJOR_STRENGTH = 0.7;
const AXIS_HALF_WIDTH_PX = 1.5;

// Coverage (0..1) of the nearest line of a grid with the given cell size.
// dudv = world units per pixel along x and z. Solid within 0.25px of the
// line, then a 1px falloff, so a line always lights at least one pixel at
// full colour (like a 1px GL line) instead of splitting into two dim ones.
const gridCoverage = (p: TslNode, cell: TslNode, dudv: TslNode): TslNode => {
  const distPx = abs(mod(p.add(cell.mul(0.5)), cell).sub(cell.mul(0.5))).div(dudv);
  return float(1).sub(clamp(min(distPx.x, distPx.y).sub(0.25), 0, 1));
};

type TslNode = ShaderNodeObject<Node>;
type FloatUniform = ReturnType<typeof uniform<number>>;

/** The grid's colour and coverage for a pixel, as a TSL node (so it runs on WebGPU and WebGL 2). */
const gridColorNode = (fadeDistance: FloatUniform) =>
  Fn(() => {
    const p = positionWorld.xz;
    const dudv = max(fwidth(p), vec2(1e-6));

    // Pick the grid level from the worse axis so grazing views go coarse
    // instead of shimmering. lod's integer part selects the level; its
    // fraction fades the finest level out as its lines approach the minimum
    // on-screen spacing.
    const worldPerPixel = max(dudv.x, dudv.y);
    const lod = max(0, log2(worldPerPixel.mul(MIN_PIXELS_BETWEEN_LINES / BASE_CELL_SIZE)).mul(Math.LOG10E * Math.LN2).add(1));
    const lodFade = fract(lod);
    const cell0 = pow(10, floor(lod)).mul(BASE_CELL_SIZE);
    const cell1 = cell0.mul(10);
    const cell2 = cell1.mul(10);

    // Weights are continuous across level changes: level 1 at lodFade = 1
    // equals level 0 at lodFade = 0, and likewise level 2 -> level 1.
    const line0 = gridCoverage(p, cell0, dudv).mul(MINOR_STRENGTH).mul(lodFade.oneMinus());
    const line1 = gridCoverage(p, cell1, dudv).mul(mix(MAJOR_STRENGTH, MINOR_STRENGTH, lodFade));
    const line2 = gridCoverage(p, cell2, dudv).mul(MAJOR_STRENGTH);
    const lines = max(line0, max(line1, line2));

    // World axes: X axis runs along z = 0 (red), Z axis along x = 0 (blue).
    const axisZ = clamp(float(AXIS_HALF_WIDTH_PX).sub(abs(p.x).div(dudv.x)), 0, 1);
    const axisX = clamp(float(AXIS_HALF_WIDTH_PX).sub(abs(p.y).div(dudv.y)), 0, 1);
    const color = mix(mix(color3(LINE_COLOR), color3(AXIS_Z_COLOR), axisZ), color3(AXIS_X_COLOR), axisX);
    const coverage = max(max(lines, axisZ), axisX);

    const horizontalDistance = length(p.sub(cameraPosition.xz));
    const fade = smoothstep(fadeDistance.mul(0.35), fadeDistance, horizontalDistance).oneMinus();

    return vec4(color, coverage.mul(fade));
  })();

export class InfiniteGrid extends THREE.Mesh<THREE.PlaneGeometry, MeshBasicNodeMaterial> {
  /** The horizontal distance from the camera at which the grid has fully faded: the shader's one input. */
  readonly fadeDistance: FloatUniform;

  // Reused every frame so the render loop never allocates.
  private readonly cameraWorldPosition = new THREE.Vector3();
  private readonly extent: GridExtent = { halfSize: 0, fadeDistance: 0 };

  constructor() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    geometry.rotateX(-Math.PI / 2); // lie flat on XZ

    const fadeDistance = uniform(100);
    const material = new MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      // Editor UI, not scene content: skip tone mapping (neutral, exposure 1.3),
      // which shifts dark slate colours darker and bluer. Colours then render as
      // the exact hex values above.
      toneMapped: false,
      side: THREE.DoubleSide, // still visible when orbiting below the floor
    });
    material.colorNode = gridColorNode(fadeDistance);
    // Nothing to draw between the lines.
    material.alphaTest = 0.002;

    super(geometry, material);
    this.fadeDistance = fadeDistance;

    this.name = "InfiniteGrid";
    this.userData.editorOnly = true; // never exported — see hideEditorOnlyObjects
    // Repositioned every frame and drawn by the shader, so bounds-based culling
    // would only ever wrongly hide it.
    this.frustumCulled = false;
    // Transparent objects render after all opaque ones; going first among the
    // transparent pass lets glass etc. blend over the grid instead of the grid
    // being drawn on top of them.
    this.renderOrder = -1;
  }

  // Runs after the scene's matrices are updated but before this mesh's
  // modelViewMatrix is computed, so updating the matrix here applies this frame.
  override onBeforeRender(
    _renderer: unknown,
    _scene: THREE.Scene,
    camera: THREE.Camera,
  ): void {
    const cameraPosition = this.cameraWorldPosition.setFromMatrixPosition(
      camera.matrixWorld,
    );
    const { halfSize, fadeDistance } = computeGridExtent(camera, cameraPosition, this.extent);

    this.position.set(cameraPosition.x, 0, cameraPosition.z);
    this.scale.set(halfSize, 1, halfSize);
    this.updateMatrixWorld();

    this.fadeDistance.value = fadeDistance;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
