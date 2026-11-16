/**
 * PURPOSE: A scene's effects (depth of field, pixelation, aberration, bloom, hue, brightness,
 * vignette, noise), drawn over the finished picture, and its exposure.
 *
 * INPUT: A renderer and a scene; then, each frame, the camera and the scene's `postProcessing`.
 * OUTPUT: `render` draws the frame through the chain, or draws nothing and says so when no effect
 *         is on, so the caller draws the scene directly and the frame costs what it always has.
 *
 * The scene is drawn into a texture exactly as it would be to the canvas (tone-mapped, sRGB, fogged:
 * canvasOutput.ts, `takesFinishedPicture`), and each effect changes that picture. So a scene with
 * the chain on and nothing showing looks as it does without it, and the effects' numbers are in what
 * the eye sees: bloom's threshold is a brightness on screen, 0 to 1.
 *
 * Every effect has an `amount`: how much of its result is mixed over the picture before it. Values
 * are uniforms, set from the config on every frame, so changing one never builds a shader; only
 * turning an effect on or off does.
 *
 * The first three read the picture somewhere other than the pixel being drawn (around it, at its
 * block's centre, to either side). Depth of field is 41 reads a pixel, so when one of the other two
 * follows it, its result is drawn into a texture first (one more full-screen pass) and they read
 * that; otherwise each of their reads would be 41. Bloom finds its bright parts in the scene as
 * drawn, before those three: its glow is not blurred or pixelated with the picture under it.
 *
 * Exposure is not an effect in the chain: each material applies it as it tone-maps (canvasOutput.ts),
 * so it costs no pass. `render` keeps it on the scene whether or not anything else is on.
 *
 * `keepDepth` (the editor's edit mode) also puts the scene's depth on the canvas with the picture,
 * so what is drawn onto the canvas afterwards (the editor's own objects, which no effect may touch:
 * editorOverlay.ts) is still hidden behind the scene's objects.
 *
 * No store, React or DOM here: the share-link viewer draws with this too.
 */

import * as THREE from "three";
import { float, hue, mix, orthographicDepthToViewZ, pass, perspectiveDepthToViewZ, rand, rtt, screenUV, select, uniform, uv, vec2, vec3, vec4 } from "three/tsl";
import { NodeMaterial, QuadMesh } from "three/webgpu";
import type { Renderer } from "three/webgpu";
import { bloom } from "three/examples/jsm/tsl/display/BloomNode.js";
import { dof } from "three/examples/jsm/tsl/display/DepthOfFieldNode.js";

import { initialPostProcessingDefaults } from "../scene/defaults";
import type { PostProcessingConfig } from "../scene/types";
import { EXPOSURE_STOPS_KEY, takesFinishedPicture } from "./canvasOutput";
import { disposeBackdropCopy } from "./layerSources";

// The effects, in the order they're applied.
const CHAIN_ORDER = ["dof", "pixelation", "aberration", "bloom", "hue", "brightness", "vignette", "noise"] as const;
export type EffectName = (typeof CHAIN_ORDER)[number];

// How far full-strength noise moves a pixel, up or down, of the 0 to 1 a channel holds.
const NOISE_STRENGTH = 0.15;

// Three's bloom adds up five blurred copies of the bright parts, weighted 1, 0.8, 0.6, 0.4 and 0.2
// (in that order or its reverse, by the radius): 3 in all. Dividing by it makes an intensity of 1
// their weighted average, not three times it.
const BLOOM_LEVELS_WEIGHT = 3;

// How far a depth-of-field Blur of 1 spreads a fully blurred point, as three's `maxblur` (0.4 of
// it is the blur's radius, as a share of the picture's width): a Blur of 5 is a radius of 1%.
const DOF_BLUR_UNIT = 0.005;

// An aberration offset of 1, as a share of the picture's size: offsets are thousandths, so a
// picture looks the same at any size.
const ABERRATION_UNIT = 0.001;

const clamp = (value: number, low: number, high: number): number => Math.min(high, Math.max(low, value));

/** The effects the chain holds for `config`, in order: none while the master switch is off. */
export const activeEffects = (config: PostProcessingConfig): EffectName[] =>
  config.enabled ? CHAIN_ORDER.filter((name) => config[name].enabled) : [];

/** An effect's `amount` (0 to 100) as the share of its result mixed in (0 to 1). */
export const effectShare = (amount: number): number => clamp(amount / 100, 0, 1);

/** The scene's exposure in stops: none while the master switch is off. */
export const exposureStops = (config: PostProcessingConfig): number => (config.enabled ? config.exposure : 0);

/**
 * The config's values as the shaders take them: each effect's share, and its values kept inside
 * what its maths can take (a contrast of 1 would divide by zero).
 */
export const effectValues = (config: PostProcessingConfig) => {
  const dofMaxBlur = Math.max(0, config.dof.blur) * DOF_BLUR_UNIT;
  return {
    dofShare: effectShare(config.dof.amount),
    dofFocus: Math.max(0, config.dof.focusDistance),
    // The blur grows from none at the focus distance to all of it `range` nearer or farther.
    dofAperture: dofMaxBlur / Math.max(config.dof.range, 0.0001),
    dofMaxBlur,
    pixelationShare: effectShare(config.pixelation.amount),
    pixelSize: Math.max(1, config.pixelation.granularity),
    aberrationShare: effectShare(config.aberration.amount),
    aberrationX: config.aberration.offsetX * ABERRATION_UNIT,
    aberrationY: config.aberration.offsetY * ABERRATION_UNIT,
    // Bloom is laid over the picture, so its amount scales how much of it there is.
    bloomStrength: (Math.max(0, config.bloom.intensity) * effectShare(config.bloom.amount)) / BLOOM_LEVELS_WEIGHT,
    bloomRadius: clamp(config.bloom.blurScale, 0, 1),
    bloomThreshold: clamp(config.bloom.threshold, 0, 1),
    bloomSmoothing: Math.max(config.bloom.smoothing, 0.0001),
    hueShare: effectShare(config.hue.amount),
    hueTurn: config.hue.hue,
    saturation: clamp(config.hue.saturation, -1, 1),
    brightnessShare: effectShare(config.brightness.amount),
    brightness: clamp(config.brightness.brightness, -1, 1),
    contrast: clamp(config.brightness.contrast, -1, 0.999),
    vignetteShare: effectShare(config.vignette.amount),
    vignetteDarkness: Math.max(0, config.vignette.darkness),
    vignetteOffset: clamp(config.vignette.offset, 0, 1),
    noiseShare: effectShare(config.noise.amount),
  };
};
type EffectValues = ReturnType<typeof effectValues>;

// TSL's node types are too loose to name usefully here; every node is this.
type Node = ReturnType<typeof float>;
const n = (node: unknown): Node => node as Node;

export interface EffectChain {
  /** Draws one frame. Returns false, having drawn nothing, when no effect is on: the caller draws the scene directly. */
  render(camera: THREE.Camera, config: PostProcessingConfig): boolean;
  dispose(): void;
}

export const createEffectChain = (renderer: Renderer, scene: THREE.Scene, { keepDepth = false } = {}): EffectChain => {
  // One uniform for each of effectValues' numbers.
  const values = Object.fromEntries(Object.keys(effectValues(initialPostProcessingDefaults)).map((name) => [name, uniform(0)])) as Record<
    keyof EffectValues,
    ReturnType<typeof uniform<number>>
  >;
  // A different grain on every frame.
  const noiseSeed = uniform(0);

  // The picture's size in CSS pixels (pixelation's blocks are that many of them), and what turns
  // the scene's depth into a distance from the camera (depth of field).
  const pictureSize = uniform(new THREE.Vector2(1, 1));
  const cameraNear = uniform(0.1);
  const cameraFar = uniform(1000);
  const orthographic = uniform(0);

  // Made when an effect is first on: a scene without effects holds no extra textures.
  let chain: { scenePass: ReturnType<typeof pass>; picture: NodeMaterial; quad: QuadMesh; bloomNode: ReturnType<typeof bloom> | null } | null = null;
  let builtFor = "";
  // The texture depth of field is drawn into when pixelation or aberration reads it.
  let blurredPicture: ReturnType<typeof rtt> | null = null;
  const dropBlurredPicture = () => {
    blurredPicture?.renderTarget?.dispose();
    blurredPicture = null;
  };

  // The picture after the effects that read it away from the pixel being drawn (depth of field,
  // pixelation, aberration), colour and alpha.
  const resample = (effects: EffectName[], scenePass: ReturnType<typeof pass>): Node => {
    const sceneTexture = scenePass.getTextureNode();
    const here = n(uv());
    // The picture so far, at any point of it.
    let read = (at: Node): Node => n(sceneTexture.sample(at));

    if (effects.includes("dof")) {
      const depth = scenePass.getTextureNode("depth");
      const viewZ = select(orthographic.greaterThan(0.5), orthographicDepthToViewZ(depth, cameraNear, cameraFar), perspectiveDepthToViewZ(depth, cameraNear, cameraFar));
      const blurred = n(dof(sceneTexture, viewZ, values.dofFocus, values.dofAperture, values.dofMaxBlur));
      const mixed = n(vec4(mix(n(sceneTexture).rgb, blurred.rgb, values.dofShare), n(sceneTexture).a));
      if (effects.includes("pixelation") || effects.includes("aberration")) {
        const drawn = (blurredPicture = rtt(mixed));
        read = (at) => n(drawn.sample(at));
      } else {
        read = () => mixed;
      }
    }
    if (effects.includes("pixelation")) {
      const before = read;
      const blocks = n(pictureSize.div(values.pixelSize));
      read = (at) => n(mix(before(at), before(n(at.mul(blocks).floor().add(0.5).div(blocks))), values.pixelationShare));
    }
    if (effects.includes("aberration")) {
      const before = read;
      const offset = n(vec2(values.aberrationX, values.aberrationY));
      // Red from one side, blue from the other, green and alpha from where they are.
      read = (at) => {
        const centre = before(at);
        return n(mix(centre, vec4(before(n(at.add(offset))).r, centre.g, before(n(at.sub(offset))).b, centre.a), values.aberrationShare));
      };
    }
    return read(here);
  };

  // The picture after each of `effects`, in order.
  const build = (effects: EffectName[], scenePass: ReturnType<typeof pass>, bloomNode: () => ReturnType<typeof bloom>): Node => {
    const resampled = effects.some((effect) => effect === "dof" || effect === "pixelation" || effect === "aberration");
    const start = resampled ? resample(effects, scenePass) : n(scenePass);
    let rgb = n(start.rgb);
    for (const effect of effects) {
      if (effect === "dof" || effect === "pixelation" || effect === "aberration") {
        continue;
      } else if (effect === "bloom") {
        // Screened over the picture, not added: a glow brightens what's under it without pushing
        // what was already bright to flat white.
        const glow = n(n(bloomNode()).rgb);
        rgb = n(rgb.add(glow.mul(rgb.clamp(0, 1).oneMinus())));
      } else if (effect === "hue") {
        // The hue turned (radians), then the colours pulled toward or away from their grey.
        const turned = n(hue(rgb, values.hueTurn));
        const grey = n(turned.r.add(turned.g).add(turned.b).div(3));
        const spread = n(select(values.saturation.greaterThan(0), float(1).div(float(1.001).sub(values.saturation)), values.saturation.add(1)));
        rgb = n(mix(rgb, mix(vec3(grey), turned, spread), values.hueShare));
      } else if (effect === "brightness") {
        const lifted = n(rgb.add(values.brightness));
        const stretch = n(select(values.contrast.greaterThan(0), float(1).div(float(1).sub(values.contrast)), values.contrast.add(1)));
        rgb = n(mix(rgb, lifted.sub(0.5).mul(stretch).add(0.5), values.brightnessShare));
      } else if (effect === "vignette") {
        // Dark toward the corners: full brightness inside the offset, falling to black by 0.8 of
        // the way out (the distance scaled by darkness plus offset).
        const distance = n(screenUV.sub(vec2(0.5, 0.5)).length().mul(values.vignetteDarkness.add(values.vignetteOffset)));
        const inner = n(values.vignetteOffset.mul(0.799));
        const fall = n(distance.sub(inner).div(float(0.8).sub(inner)).clamp(0, 1));
        const shade = n(float(1).sub(fall.mul(fall).mul(float(3).sub(fall.mul(2)))));
        rgb = n(mix(rgb, rgb.mul(shade), values.vignetteShare));
      } else {
        const grain = n(rand(screenUV.add(noiseSeed)).sub(0.5).mul(2 * NOISE_STRENGTH));
        rgb = n(rgb.add(grain.mul(values.noiseShare)));
      }
    }
    return n(vec4(rgb, start.a));
  };

  return {
    render(camera, config) {
      scene.userData[EXPOSURE_STOPS_KEY] = exposureStops(config);
      const effects = activeEffects(config);
      if (effects.length === 0) return false;

      if (!chain) {
        const scenePass = pass(scene, camera);
        takesFinishedPicture(scenePass.renderTarget);
        // The full-screen pass that puts the picture on the canvas. The picture is finished when it
        // reaches the chain, so there is nothing left to convert (canvasOutput.ts leaves a bare
        // NodeMaterial alone).
        const picture = new NodeMaterial();
        picture.name = "EffectChain";
        if (keepDepth) {
          picture.depthNode = scenePass.getTextureNode("depth");
          picture.depthFunc = THREE.AlwaysDepth;
        } else {
          picture.depthTest = false;
          picture.depthWrite = false;
        }
        chain = { scenePass, picture, quad: new QuadMesh(picture), bloomNode: null };
      }
      const held = chain;

      const key = effects.join(",");
      if (key !== builtFor) {
        builtFor = key;
        dropBlurredPicture();
        held.picture.fragmentNode = build(effects, held.scenePass, () => (held.bloomNode ??= bloom(held.scenePass)));
        held.picture.needsUpdate = true;
      }

      const next = effectValues(config);
      for (const name of Object.keys(next) as (keyof EffectValues)[]) values[name].value = next[name];
      if (held.bloomNode) {
        held.bloomNode.strength.value = next.bloomStrength;
        held.bloomNode.radius.value = next.bloomRadius;
        held.bloomNode.threshold.value = next.bloomThreshold;
        held.bloomNode.smoothWidth.value = next.bloomSmoothing;
      }
      noiseSeed.value = Math.random();
      renderer.getSize(pictureSize.value);
      const lens = camera as THREE.PerspectiveCamera | THREE.OrthographicCamera;
      cameraNear.value = lens.near;
      cameraFar.value = lens.far;
      orthographic.value = (camera as THREE.OrthographicCamera).isOrthographicCamera ? 1 : 0;

      // Each frame's own camera: the editor swaps perspective and orthographic ones.
      held.scenePass.camera = camera;
      held.quad.render(renderer);
      return true;
    },

    dispose() {
      delete scene.userData[EXPOSURE_STOPS_KEY];
      if (!chain) return;
      disposeBackdropCopy(chain.scenePass.renderTarget);
      dropBlurredPicture();
      chain.bloomNode?.dispose();
      chain.scenePass.dispose();
      chain.picture.dispose();
      chain = null;
      builtFor = "";
    },
  };
};
