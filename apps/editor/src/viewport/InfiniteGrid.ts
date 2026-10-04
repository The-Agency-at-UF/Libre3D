import * as THREE from "three";

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
// Uniforms are refreshed in onBeforeRender from whichever camera is rendering,
// so perspective ↔ orthographic swaps through cameraRef need no extra wiring.

const BASE_CELL_SIZE = 2;
const MIN_PIXELS_BETWEEN_LINES = 4;
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

const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uLineColor;
  uniform vec3 uAxisXColor;
  uniform vec3 uAxisZColor;
  uniform vec3 uCameraPosition;
  uniform float uBaseCellSize;
  uniform float uMinPixelsBetweenLines;
  uniform float uFadeDistance;

  varying vec3 vWorldPosition;

  // Full strength renders lines at exactly uLineColor, matching the old
  // GridHelper; lower these to make every grid level fainter.
  const float MINOR_STRENGTH = 0.7;
  const float MAJOR_STRENGTH = 0.7;
  const float AXIS_HALF_WIDTH_PX = 1.5;

  // Coverage (0..1) of the nearest line of a grid with the given cell size.
  // dudv = world units per pixel along x and z. Solid within 0.25px of the
  // line, then a 1px falloff, so a line always lights at least one pixel at
  // full colour (like a 1px GL line) instead of splitting into two dim ones.
  float gridCoverage(vec2 p, float cell, vec2 dudv) {
    vec2 distPx = abs(mod(p + 0.5 * cell, cell) - 0.5 * cell) / dudv;
    return 1.0 - clamp(min(distPx.x, distPx.y) - 0.25, 0.0, 1.0);
  }

  float gridLog10(float x) {
    return log2(x) * 0.30102999566;
  }

  void main() {
    vec2 p = vWorldPosition.xz;
    vec2 dudv = max(fwidth(p), vec2(1e-6));

    // Pick the grid level from the worse axis so grazing views go coarse
    // instead of shimmering. lod's integer part selects the level; its
    // fraction fades the finest level out as its lines approach the minimum
    // on-screen spacing.
    float worldPerPixel = max(dudv.x, dudv.y);
    float lod = max(0.0, gridLog10(worldPerPixel * uMinPixelsBetweenLines / uBaseCellSize) + 1.0);
    float lodFade = fract(lod);
    float cell0 = uBaseCellSize * pow(10.0, floor(lod));
    float cell1 = cell0 * 10.0;
    float cell2 = cell1 * 10.0;

    // Weights are continuous across level changes: level 1 at lodFade = 1
    // equals level 0 at lodFade = 0, and likewise level 2 -> level 1.
    float line0 = gridCoverage(p, cell0, dudv) * MINOR_STRENGTH * (1.0 - lodFade);
    float line1 = gridCoverage(p, cell1, dudv) * mix(MAJOR_STRENGTH, MINOR_STRENGTH, lodFade);
    float line2 = gridCoverage(p, cell2, dudv) * MAJOR_STRENGTH;

    vec3 color = uLineColor;
    float alpha = max(line0, max(line1, line2));

    // World axes: X axis runs along z = 0 (red), Z axis along x = 0 (blue).
    float axisZ = clamp(AXIS_HALF_WIDTH_PX - abs(p.x) / dudv.x, 0.0, 1.0);
    float axisX = clamp(AXIS_HALF_WIDTH_PX - abs(p.y) / dudv.y, 0.0, 1.0);
    color = mix(color, uAxisZColor, axisZ);
    alpha = max(alpha, axisZ);
    color = mix(color, uAxisXColor, axisX);
    alpha = max(alpha, axisX);

    float horizontalDistance = length(vWorldPosition.xz - uCameraPosition.xz);
    alpha *= 1.0 - smoothstep(uFadeDistance * 0.35, uFadeDistance, horizontalDistance);

    if (alpha < 0.002) discard;

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export class InfiniteGrid extends THREE.Mesh<
  THREE.PlaneGeometry,
  THREE.ShaderMaterial
> {
  // Reused every frame so the render loop never allocates.
  private readonly cameraWorldPosition = new THREE.Vector3();
  private readonly extent: GridExtent = { halfSize: 0, fadeDistance: 0 };

  constructor() {
    const geometry = new THREE.PlaneGeometry(2, 2);
    geometry.rotateX(-Math.PI / 2); // lie flat on XZ

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uLineColor: { value: new THREE.Color("#2a3f5f") },
        uAxisXColor: { value: new THREE.Color("#ef4444") },
        uAxisZColor: { value: new THREE.Color("#3b82f6") },
        uCameraPosition: { value: new THREE.Vector3() },
        uBaseCellSize: { value: BASE_CELL_SIZE },
        uMinPixelsBetweenLines: { value: MIN_PIXELS_BETWEEN_LINES },
        uFadeDistance: { value: 100 },
      },
      transparent: true,
      depthWrite: false,
      // Editor UI, not scene content: skip the renderer's tone mapping
      // (neutral, exposure 1.3), which shifts dark slate colours darker and
      // bluer. Colours then render as the exact hex values below.
      toneMapped: false,
      side: THREE.DoubleSide, // still visible when orbiting below the floor
    });

    super(geometry, material);

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
    _renderer: THREE.WebGLRenderer,
    _scene: THREE.Scene,
    camera: THREE.Camera,
  ): void {
    const cameraPosition = this.cameraWorldPosition.setFromMatrixPosition(
      camera.matrixWorld,
    );
    const uniforms = this.material.uniforms;

    const { halfSize, fadeDistance } = computeGridExtent(camera, cameraPosition, this.extent);

    this.position.set(cameraPosition.x, 0, cameraPosition.z);
    this.scale.set(halfSize, 1, halfSize);
    this.updateMatrixWorld();

    (uniforms.uCameraPosition.value as THREE.Vector3).copy(cameraPosition);
    uniforms.uFadeDistance.value = fadeDistance;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
