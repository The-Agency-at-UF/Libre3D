/**
 * PURPOSE: Moves an object's surface by its Displace layers (scene/types.ts, DisplaceLayer), as TSL
 * for the vertex stage, and turns its normals with it so the lighting and the colour layers that
 * look at the surface's direction (Fresnel, Normal, Matcap, Rainbow, Glass) follow the bumps.
 *
 * INPUT: The plan's Displace layers (scene/layerStack.ts) and a picture source. OUTPUT: The position
 * node a material's stand-in is built with (layerNodes.ts puts it on).
 *
 * Each point moves along its push direction (the `displaceDirection` attribute displaced primitives
 * get: entityGeometry.ts; the normal otherwise) by the layers' heights added up: a noise in the
 * object's own space (the Noise layer's maths, layerSources.ts) or a picture's lightness at the
 * point's UV. The new normal comes from two neighbours a step away, pushed the same way.
 *
 * No store, React or DOM here: the share-link viewer draws with this too.
 */

import * as THREE from "three";
import { attribute, clamp, cross, dot, float, Fn, max, normalize, normalLocal, positionLocal, select, time, uv, vec2, vec3 } from "three/tsl";
import type { DisplaceLayer } from "../scene/types";
import { NO_PICTURE, noiseValue, type PictureSource } from "./layerSources";
import { objectSlot, objectTexture, objectUniform, shaderNode } from "./objectValues";

type Node = ReturnType<typeof float>;
type Vec3Uniform = ReturnType<typeof objectUniform<THREE.Vector3>>;

const n = (node: unknown): Node => shaderNode(node) as Node;

/** The attribute a displaced primitive's points are pushed along (entityGeometry.ts). */
export const DISPLACE_DIRECTION = "displaceDirection";

// How far apart the neighbours the new normal is worked out from are: in the object's own units,
// and along the picture (UV).
const STEP = 0.004;

// How many of Spline's noise units one of the object's own is: Spline's Scale 10 puts about three
// bumps across a unit sphere, as its default does.
const SCALE_TO_NOISE = 0.3;

/** A picture's ref for a Displace layer: repeated, drawn the way up it was made, as an Image layer's upload. */
export const displacePictureRef = (layer: DisplaceLayer) => ({
  textureAssetId: layer.textureAssetId ?? "",
  wrapS: THREE.RepeatWrapping,
  wrapT: THREE.RepeatWrapping,
  flipY: true,
});

export interface DisplaceSource {
  /** Brings its values up to date; true when its picture changed (the shader's bindings must be remade). */
  update(layer: DisplaceLayer, pictures: PictureSource): boolean;
  /** How far the point at `position` (own space) with `at` (UV) moves, in the object's own units. */
  height(position: Node, at: Node): Node;
}

export const createDisplaceSource = (first: DisplaceLayer, pictures: PictureSource): DisplaceSource => {
  const scale = objectUniform(10);
  const movement = objectUniform(1);
  const offset: Vec3Uniform = objectUniform(new THREE.Vector3());
  const intensity = objectUniform(8);
  const smoothness = objectUniform(0.3);
  const seed = objectUniform(0);
  const lowCut = objectUniform(0);
  const highCut = objectUniform(1);
  const picture = objectSlot<THREE.Texture>(NO_PICTURE);
  const source: DisplaceSource = {
    update(layer) {
      scale.value = layer.scale;
      movement.value = layer.movement;
      offset.value.set(...layer.offset);
      intensity.value = layer.intensity;
      smoothness.value = layer.smoothness;
      seed.value = layer.seed;
      lowCut.value = layer.lowCut;
      highCut.value = layer.highCut;
      if (layer.displaceType !== "image") return false;
      const next = (layer.textureAssetId ? pictures(displacePictureRef(layer), { nearest: false }) : null) ?? NO_PICTURE;
      if (next === picture.value) return false;
      picture.value = next;
      return true;
    },
    height(position, at) {
      let value: Node;
      if (first.displaceType === "image") {
        // A picture's lightness (Rec. 709); a vertex has no derivatives, so its full-size level.
        const color = n((objectTexture(picture, at) as unknown as { level(lod: number): Node }).level(0));
        value = n(dot(color.rgb, vec3(0.2126, 0.7152, 0.0722)).mul(color.a));
      } else {
        const p = n(
          position
            .mul(n(scale).mul(SCALE_TO_NOISE))
            .add(n(offset))
            .add(n(seed).mul(vec3(17.13, 31.71, 9.37)))
            .add(vec3(0, 0, n(time).mul(n(movement)).mul(0.1))),
        );
        value = noiseValue(first.displaceType, first.voronoiStyle, p, n(smoothness));
      }
      const span = n(max(n(highCut).sub(n(lowCut)), 1e-4));
      const remapped = n(clamp(value.sub(n(lowCut)).div(span), 0, 1));
      // Hundredths of the object's own units, as Spline's sizes are a hundred times Libre3D's.
      return n(remapped.mul(n(intensity)).mul(0.01));
    },
  };
  source.update(first, pictures);
  return source;
};

/** What a Displace layer's shader looks like: two with the same shape share one. */
export const displaceShape = (layer: DisplaceLayer): string =>
  `displace:${layer.displaceType}${layer.displaceType === "voronoi" ? `:${layer.voronoiStyle}` : ""}`;

/**
 * The position node for `sources`: each point pushed by their heights, added up, with the normal
 * (`normalLocal`, which every later normal comes from) turned to the pushed surface's.
 * Only a geometry built for it moves (one with DISPLACE_DIRECTION and tangents: a displaced
 * primitive); any other keeps its shape.
 */
export const displacedPosition = (sources: DisplaceSource[]): Node =>
  n(
    Fn((builder: { geometry: THREE.BufferGeometry }) => {
      if (!builder.geometry.hasAttribute(DISPLACE_DIRECTION) || !builder.geometry.hasAttribute("tangent")) return positionLocal;
      const height = (position: Node, at: Node): Node =>
        sources.reduce<Node>((sum, source) => n(sum.add(source.height(position, at))), float(0));
      const normal = n(normalize(normalLocal));
      const direction = n(normalize(attribute(DISPLACE_DIRECTION, "vec3")));
      // Two directions along the surface: the UV's (so a picture's neighbours are its next pixels),
      // or any two, where the UV has none (a sphere's poles).
      const tangent = n(attribute("tangent", "vec4"));
      const along = n(tangent.xyz.sub(normal.mul(dot(tangent.xyz, normal))));
      const fallback = n(normalize(cross(normal, select(normal.y.abs().lessThan(0.99), vec3(0, 1, 0), vec3(1, 0, 0)))));
      const t = n(select(dot(along, along).greaterThan(1e-8), normalize(along), fallback));
      const handedness = n(select(tangent.w.lessThan(0), float(-1), float(1)));
      const b = n(cross(normal, t).mul(handedness));

      const p0 = n(positionLocal);
      const uv0 = n(uv());
      const p1 = n(p0.add(t.mul(STEP)));
      const p2 = n(p0.add(b.mul(STEP)));
      const moved0 = n(p0.add(direction.mul(height(p0, uv0))));
      const moved1 = n(p1.add(direction.mul(height(p1, uv0.add(vec2(STEP, 0))))));
      const moved2 = n(p2.add(direction.mul(height(p2, uv0.add(vec2(0, STEP))))));
      const turned = n(normalize(cross(moved1.sub(moved0), moved2.sub(moved0))));
      // Facing the same side as the surface did.
      normalLocal.assign(select(dot(turned, normal).lessThan(0), turned.negate(), turned) as never);
      return moved0;
    })(),
  );
