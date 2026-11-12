/**
 * PURPOSE: How a scene's colours reach the canvas: tone mapping, the conversion to sRGB, then fog,
 * done by each material as it draws, in the order three's WebGLRenderer did them.
 *
 * WebGPURenderer's own way is to draw everything first and then tone-map and convert the whole
 * picture. That would also tone-map what was never meant to be: the background colour and the
 * editor's own objects (grid, gizmo, outlines: `toneMapped: false`), which three no longer honours
 * per material. It would blend see-through surfaces before the conversion instead of after, which
 * changes how they look, and cost a second full-screen pass every frame. It also fogs before tone
 * mapping and toward the linear fog colour, where WebGLRenderer fogged after the conversion toward
 * the sRGB one. So
 * the renderer is told to do none of it (rendererSettings.ts), and every material ends in
 * `canvasOutput` instead. Scenes then come out as they always have.
 *
 * Only on the way to the canvas: a material drawn into a texture (the environment map's room) keeps
 * its linear colours, as it did with WebGLRenderer.
 *
 * No store, React or DOM here: the share-link viewer draws with this too.
 */

import * as THREE from "three";
import type { Material } from "three";
import type { NodeMaterial, Renderer } from "three/webgpu";
import { Fn, float, mix, output, positionView, select, smoothstep, sRGBTransferOETF, toneMapping, uniform, vec4 } from "three/tsl";

// The exposure the scene is tone-mapped with. It was read off <model-viewer> 4.0.0 when that played
// published scenes (Neutral tone mapping, boosted 1.3x with no environment image) so the editor was
// a truthful preview of them. Kept now that the share link plays scenes itself (SceneViewer.ts), so
// scenes look as they always have, in the editor and published alike.
export const SCENE_EXPOSURE = 1.3;

// 1 while the renderer draws to the canvas, 0 while it draws into a texture.
const toCanvas = uniform(1).onRenderUpdate(({ renderer }) => (renderer?.getRenderTarget() === null ? 1 : 0));

// The scene's fog, read from `scene.fog` at each render, as WebGLRenderer's fog_fragment used it:
// its colour as the canvas takes it (sRGB) while drawing to the canvas, linear while drawing into a
// texture; FogExp2's density, or Fog's near and far. No fog: nothing mixed in.
const FOG_NONE = 0;
const FOG_EXP2 = 1;
const FOG_RANGE = 2;
const fogColorValue = new THREE.Color();
const fogKind = uniform(FOG_NONE).onRenderUpdate(({ scene }) => {
  const fog = scene?.fog;
  return fog instanceof THREE.FogExp2 ? FOG_EXP2 : fog instanceof THREE.Fog ? FOG_RANGE : FOG_NONE;
});
const fogColor = uniform(new THREE.Color()).onRenderUpdate(({ scene, renderer }) => {
  const fog = scene?.fog;
  if (!fog) return fogColorValue; // not mixed in
  fogColorValue.copy(fog.color);
  return renderer?.getRenderTarget() === null ? fogColorValue.convertLinearToSRGB() : fogColorValue;
});
const fogDensity = uniform(0).onRenderUpdate(({ scene }) => (scene?.fog instanceof THREE.FogExp2 ? scene.fog.density : 0));
const fogNear = uniform(0).onRenderUpdate(({ scene }) => (scene?.fog instanceof THREE.Fog ? scene.fog.near : 0));
const fogFar = uniform(1).onRenderUpdate(({ scene }) => (scene?.fog instanceof THREE.Fog ? scene.fog.far : 1));
const fogFactor = Fn(() => {
  const depth = positionView.z.negate();
  const exp2 = fogDensity.mul(fogDensity).mul(depth).mul(depth).negate().exp().oneMinus();
  const range = smoothstep(fogNear, fogFar, depth);
  return select(fogKind.equal(FOG_EXP2), exp2, select(fogKind.equal(FOG_RANGE), range, float(0)));
});

// What a material's fragment ends in (`output` is three's name for the colour it worked out):
// tone-mapped unless the material opted out, then sRGB, then the scene's fog if the material takes
// fog: WebGLRenderer's order (tonemapping, colorspace, then fog_fragment).
const canvasOutput = (toneMapped: boolean, fogged: boolean) =>
  Fn(() => {
    const color = toneMapped ? toneMapping(THREE.NeutralToneMapping, float(SCENE_EXPOSURE), output).rgb : output.rgb;
    const finished = mix(output.rgb, sRGBTransferOETF(color), toCanvas);
    return vec4(fogged ? mix(finished, fogColor, fogFactor()) : finished, output.a);
  })();
const endings = {
  toneMapped: { fogged: canvasOutput(true, true), clear: canvasOutput(true, false) },
  plain: { fogged: canvasOutput(false, true), clear: canvasOutput(false, false) },
};
const allEndings = new Set<unknown>(Object.values(endings).flatMap((pair) => Object.values(pair)));

// Whether a node material took fog before installCanvasOutput turned three's own fog off on it (a
// node material is handed back as itself, so its own `fog` can't be read again).
const takesFog = new WeakMap<Material, boolean>();

/**
 * Makes every material `renderer` draws end in `canvasOutput`. Three asks the renderer's material
 * library for the node material to build a shader from (its own for a built-in material like
 * MeshStandardMaterial, the material itself when it already is one); that is where the ending is
 * put on, and three's own fog step turned off. A node material that sets its own `outputNode` keeps
 * it, and its fog.
 */
export const installCanvasOutput = (renderer: Renderer): void => {
  const library = renderer.library;
  const toNodeMaterial = library.fromMaterial.bind(library);
  library.fromMaterial = (material: Material) => {
    // Three's types say a plain Material can come back; what does is a node material or null.
    const nodeMaterial = toNodeMaterial(material) as NodeMaterial | null;
    // A material with an ending of its own keeps it.
    if (!nodeMaterial || (nodeMaterial.outputNode !== null && !allEndings.has(nodeMaterial.outputNode))) return nodeMaterial;
    // Not every material has `fog` (three's types leave it off Material); one without takes none.
    const fogged = takesFog.get(material) ?? (material as Material & { fog?: boolean }).fog === true;
    if (nodeMaterial === material) takesFog.set(material, fogged);
    nodeMaterial.outputNode = endings[material.toneMapped === false ? "plain" : "toneMapped"][fogged ? "fogged" : "clear"];
    nodeMaterial.fog = false;
    return nodeMaterial;
  };
};

/**
 * A colour as the canvas takes it, for what is not drawn by a material: the scene's background,
 * which three writes to the canvas as it is. Changes `color` and returns it.
 */
export const canvasColor = (color: THREE.Color): THREE.Color => color.convertLinearToSRGB();
