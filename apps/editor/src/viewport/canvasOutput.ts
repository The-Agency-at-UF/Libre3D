/**
 * PURPOSE: How a scene's colours reach the canvas: tone mapping and the conversion to sRGB, done by
 * each material as it draws, the way three's WebGLRenderer did them.
 *
 * WebGPURenderer's own way is to draw everything first and then tone-map and convert the whole
 * picture. That would also tone-map what was never meant to be: the background colour and the
 * editor's own objects (grid, gizmo, outlines: `toneMapped: false`), which three no longer honours
 * per material. It would blend see-through surfaces before the conversion instead of after, which
 * changes how they look, and cost a second full-screen pass every frame. So the renderer is told to
 * do neither (rendererSettings.ts), and every material ends in `canvasOutput` instead. Scenes then
 * come out as they always have.
 *
 * Only on the way to the canvas: a material drawn into a texture (the environment map's room) keeps
 * its linear colours, as it did with WebGLRenderer.
 *
 * No store, React or DOM here: the share-link viewer draws with this too.
 */

import * as THREE from "three";
import type { Material } from "three";
import type { NodeMaterial, Renderer } from "three/webgpu";
import { float, mix, output, sRGBTransferOETF, toneMapping, uniform, vec4 } from "three/tsl";

// The exposure the scene is tone-mapped with. It was read off <model-viewer> 4.0.0 when that played
// published scenes (Neutral tone mapping, boosted 1.3x with no environment image) so the editor was
// a truthful preview of them. Kept now that the share link plays scenes itself (SceneViewer.ts), so
// scenes look as they always have, in the editor and published alike.
export const SCENE_EXPOSURE = 1.3;

// 1 while the renderer draws to the canvas, 0 while it draws into a texture.
const toCanvas = uniform(1).onRenderUpdate(({ renderer }) => (renderer?.getRenderTarget() === null ? 1 : 0));

// What a material's fragment ends in (`output` is three's name for the colour it worked out, fog
// included): tone-mapped unless the material opted out, then sRGB.
const canvasOutput = (toneMapped: boolean) => {
  const color = toneMapped ? toneMapping(THREE.NeutralToneMapping, float(SCENE_EXPOSURE), output).rgb : output.rgb;
  return vec4(mix(output.rgb, sRGBTransferOETF(color), toCanvas), output.a);
};
const toneMappedOutput = canvasOutput(true);
const plainOutput = canvasOutput(false);

/**
 * Makes every material `renderer` draws end in `canvasOutput`. Three asks the renderer's material
 * library for the node material to build a shader from (its own for a built-in material like
 * MeshStandardMaterial, the material itself when it already is one); that is where the ending is
 * put on. A node material that sets its own `outputNode` keeps it.
 */
export const installCanvasOutput = (renderer: Renderer): void => {
  const library = renderer.library;
  const toNodeMaterial = library.fromMaterial.bind(library);
  library.fromMaterial = (material: Material) => {
    // Three's types say a plain Material can come back; what does is a node material or null.
    const nodeMaterial = toNodeMaterial(material) as NodeMaterial | null;
    if (nodeMaterial && nodeMaterial.outputNode === null) {
      nodeMaterial.outputNode = material.toneMapped === false ? plainOutput : toneMappedOutput;
    }
    return nodeMaterial;
  };
};

/**
 * A colour as the canvas takes it, for what is not drawn by a material: the scene's background,
 * which three writes to the canvas as it is. Changes `color` and returns it.
 */
export const canvasColor = (color: THREE.Color): THREE.Color => color.convertLinearToSRGB();
