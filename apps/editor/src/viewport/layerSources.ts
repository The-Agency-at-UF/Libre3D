/**
 * PURPOSE: What each colour layer paints at a pixel, as TSL: Color, Image, Depth, Gradient, Noise,
 * Fresnel, Normal, Matcap, Rainbow, Glass; and how far a Displace layer pushes the surface.
 * viewport/layerNodes.ts blends them into a stack.
 *
 * INPUT: A layer (scene/types.ts). OUTPUT: A LayerSource: its uniforms, a way to bring them up to
 * date with the layer, and the node for its colour, as sRGB (as picked) plus an alpha.
 *
 * A source's `shape` says what its shader looks like (its type, its ramp's stop count, which
 * gradient or noise); everything else is a uniform, so dragging a value changes a number and never
 * rebuilds a shader. The maths matches the CPU twins in scene/layerStack.ts (the ramp, Depth's and
 * Gradient's positions, Fresnel's amount), which is how Vitest and the pixel checks hold it to them.
 *
 * No store, React or DOM here: the share-link viewer draws with this too.
 */

import * as THREE from "three";
import {
  abs,
  asin,
  cameraProjectionMatrix,
  cameraViewMatrix,
  atan,
  cameraPosition,
  clamp,
  div,
  dot,
  exp,
  float,
  floor,
  Fn,
  fract,
  length,
  log,
  log2,
  matcapUV,
  max,
  min,
  mix,
  modelScale,
  mx_fractal_noise_float,
  mx_noise_float,
  mx_worley_noise_vec2,
  normalize,
  normalLocal,
  normalView,
  normalWorld,
  positionView,
  positionViewDirection,
  positionWorld,
  pow,
  refract,
  screenSize,
  select,
  smoothstep,
  sqrt,
  sRGBTransferEOTF,
  sRGBTransferOETF,
  step,
  textureBicubicLevel,
  texture,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
  viewportMipTexture,
} from "three/tsl";
import { hexToRgb, sortedStops, type PaintLayer } from "../scene/layerStack";
import { DEFAULT_MATCAP, matcapTexture } from "./matcaps";
import { SCENE_EXPOSURE } from "./canvasOutput";
import { objectSlot, objectTexture, objectUniform, shaderNode } from "./objectValues";
import type { DepthLayer, FresnelLayer, GradientLayer, ImageLayer, NoiseLayer, PaintColor, RampStop, TextureRef } from "../scene/types";

// TSL's node types are too loose to name usefully here; every node is this.
type Node = ReturnType<typeof float>;
type FloatUniform = ReturnType<typeof uniform<number>>;
type Vec2Uniform = ReturnType<typeof uniform<THREE.Vector2>>;
type Vec3Uniform = ReturnType<typeof uniform<THREE.Vector3>>;
type Vec4Uniform = ReturnType<typeof uniform<THREE.Vector4>>;

// A node for the shader: a stack's own value (objectUniform) goes in as the shared node that reads
// the drawn object's (objectValues.ts).
const n = (node: unknown): Node => shaderNode(node) as Node;

/** A layer's colour at a pixel: sRGB (as picked) and how much of it there is. */
export interface SourceColor {
  rgb: Node;
  a: Node;
}

/** Where the pixel is, as the sources need it. */
export interface SourceContext {
  // In the object's own space (positionLocal, or a path's space for its end caps).
  objectPosition: Node;
}

/** A picture to draw, as a texture made how `options` say; null while it's loading (viewport/entityMaterials.ts). */
export type PictureSource = (ref: TextureRef, options: { nearest: boolean }) => THREE.Texture | null;

export interface LayerSource {
  /** Brings the uniforms up to date; true when a texture changed (the shader's bindings must be remade). */
  update(layer: PaintLayer, pictures: PictureSource): boolean | void;
  node(context: SourceContext): SourceColor;
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

const setPaint = (target: Vec4Uniform, paint: PaintColor): void => {
  const [r, g, b] = hexToRgb(paint.color);
  target.value.set(r, g, b, Math.min(1, Math.max(0, paint.alpha ?? 1)));
};

const vec4Uniform = (): Vec4Uniform => objectUniform(new THREE.Vector4(1, 1, 1, 1));

interface RampUniforms {
  colors: Vec4Uniform[];
  positions: FloatUniform[];
  smooth: FloatUniform;
}

const rampUniforms = (count: number): RampUniforms => ({
  colors: Array.from({ length: count }, vec4Uniform),
  positions: Array.from({ length: count }, () => objectUniform(0)),
  smooth: objectUniform(0),
});

const updateRamp = (ramp: RampUniforms, stops: RampStop[], smooth: boolean): void => {
  sortedStops(stops).forEach((stop, index) => {
    if (!ramp.colors[index]) return;
    setPaint(ramp.colors[index], stop);
    ramp.positions[index].value = stop.position;
  });
  ramp.smooth.value = smooth ? 1 : 0;
};

// A colour with its alpha, premultiplied (rgb × a) and back: colours with alpha are blended
// premultiplied, as CSS gradients are (scene/layerStack.ts, sampleRamp).
const premultiply = (color: Node): Node => n(vec4(n(color.xyz).mul(n(color.w)), n(color.w)));
const unpremultiply = (color: Node): Node => n(vec4(n(color.xyz).div(max(n(color.w), 1e-6)), n(color.w)));

/** The ramp's colour at `t` (scene/layerStack.ts, sampleRamp): each stop blended in over its own span. */
const sampleRampNode = (ramp: RampUniforms, t: Node): Node => {
  let color = premultiply(n(ramp.colors[0]));
  for (let i = 1; i < ramp.colors.length; i++) {
    const from = n(ramp.positions[i - 1]);
    const span = n(ramp.positions[i]).sub(from);
    const blended = clamp(t.sub(from).div(max(span, 1e-6)), 0, 1);
    let amount = n(select(span.greaterThan(0), blended, step(from, t)));
    amount = n(mix(amount, amount.mul(amount).mul(float(3).sub(amount.mul(2))), n(ramp.smooth)));
    color = n(mix(color, premultiply(n(ramp.colors[i])), amount));
  }
  return unpremultiply(color);
};

const stopCount = (stops: RampStop[]): number => Math.max(1, sortedStops(stops).length);

// ─── Color ───────────────────────────────────────────────────────────────────

const colorSource = (): LayerSource => {
  const color = objectUniform(new THREE.Vector3(1, 1, 1));
  return {
    update(layer) {
      if (layer.type !== "color") return;
      const [r, g, b] = hexToRgb(layer.color);
      color.value.set(r, g, b);
    },
    node: () => ({ rgb: n(color), a: float(1) }),
  };
};

// ─── Depth ───────────────────────────────────────────────────────────────────

/** Where a point is between near (0) and far (1) (scene/layerStack.ts, nearFarPosition). */
const nearFarNode = (distance: Node, near: Node, far: Node): Node => {
  const span = far.sub(near);
  return n(select(span.greaterThan(0), clamp(distance.sub(near).div(max(span, 1e-6)), 0, 1), step(near, distance)));
};

const depthSource = (first: DepthLayer): LayerSource => {
  const camera = first.originType === "camera";
  const world = first.space === "world";
  const linear = first.gradientType === "linear";
  const ramp = rampUniforms(stopCount(first.stops));
  const origin: Vec3Uniform = objectUniform(new THREE.Vector3());
  const direction: Vec3Uniform = objectUniform(new THREE.Vector3(1, 0, 0));
  const near = objectUniform(0);
  const far = objectUniform(1);
  return {
    update(layer) {
      if (layer.type !== "depth") return;
      updateRamp(ramp, layer.stops, layer.smooth);
      origin.value.set(...layer.origin);
      direction.value.set(...layer.direction);
      if (direction.value.lengthSq() === 0) direction.value.set(1, 0, 0);
      direction.value.normalize();
      near.value = layer.near;
      far.value = layer.far;
    },
    node(context) {
      let distance: Node;
      if (camera) {
        // Straight out from the camera, or along the view (the depth in front of it).
        distance = linear ? n(positionView.z.negate()) : n(length(n(positionWorld).sub(n(cameraPosition))));
      } else {
        const point = world ? n(positionWorld) : context.objectPosition;
        const offset = point.sub(n(origin));
        distance = linear ? n(dot(offset, n(direction))) : n(length(offset));
      }
      const color = sampleRampNode(ramp, nearFarNode(distance, n(near), n(far)));
      return { rgb: n(color.xyz), a: n(color.w) };
    },
  };
};

// ─── Gradient ────────────────────────────────────────────────────────────────

/** Spline's gradient maths on the mesh's UVs (scene/layerStack.ts, gradientPosition). */
const gradientPositionNode = (type: GradientLayer["gradientType"], angle: Node, offset: Node, morph: Node): Node => {
  const coordinates = n(uv());
  const u = n(coordinates.x);
  const v = n(coordinates.y);
  if (type === "radial") {
    const x = u.add(morph.x).mul(3).sub(u.add(offset.x)).sub(1);
    const y = v.add(morph.y).mul(3).sub(v.add(offset.y)).sub(1);
    return n(length(vec2(x, y)).add(angle));
  }
  if (type === "polar") {
    const turn = n(atan(u.add(morph.x).sub(0.5).add(offset.x), v.add(morph.y).sub(0.5).add(offset.y))).negate();
    return n(fract(angle.div(Math.PI).div(-2).add(turn.mul(0.5).div(Math.PI))));
  }
  const safe = (value: Node) => n(select(value.notEqual(0), value, float(1e-6)));
  const e = n(float(0.5).add(n(morph.x).div(safe(u))));
  const l = n(n(morph.y).div(safe(v)));
  const dx = n(angle.cos().mul(e).sub(angle.sin().mul(l)));
  const dy = n(angle.sin().mul(e).add(angle.cos().mul(l)));
  const lengthSq = n(dx.mul(dx).add(dy.mul(dy)));
  const along = u.sub(0.5).add(offset.x).div(2).add(dx.div(2)).mul(dx).add(v.sub(0.5).add(offset.y).div(2).add(dy.div(2)).mul(dy));
  return n(select(lengthSq.greaterThan(1e-12), along.div(max(lengthSq, 1e-12)), float(0)));
};

const gradientSource = (first: GradientLayer): LayerSource => {
  const ramp = rampUniforms(stopCount(first.stops));
  const angle = objectUniform(0);
  const offset: Vec2Uniform = objectUniform(new THREE.Vector2());
  const morph: Vec2Uniform = objectUniform(new THREE.Vector2());
  return {
    update(layer) {
      if (layer.type !== "gradient") return;
      updateRamp(ramp, layer.stops, layer.smooth);
      angle.value = (layer.angle * Math.PI) / 180;
      offset.value.set(...layer.offset);
      morph.value.set(...layer.morph);
    },
    node() {
      const color = sampleRampNode(ramp, gradientPositionNode(first.gradientType, n(angle), n(offset), n(morph)));
      return { rgb: n(color.xyz), a: n(color.w) };
    },
  };
};

// ─── Noise ───────────────────────────────────────────────────────────────────

// 3D simplex noise, -1 to 1: Stefan Gustavson and Ian McEwan's (webgl-noise, MIT licence, 2022
// version), written in TSL.
const mod289 = (x: Node): Node => n(x.sub(floor(x.mul(1 / 289)).mul(289)));
const permute = (x: Node): Node => mod289(n(x.mul(34).add(10).mul(x)));
const simplex3 = Fn(([input]: [Node]) => {
  const v = n(input);
  const C = vec2(1 / 6, 1 / 3);
  const i0 = n(floor(v.add(dot(v, n(C.yyy)))));
  const x0 = n(v.sub(i0).add(dot(i0, n(C.xxx))));
  const g = n(step(n(x0.yzx), n(x0.xyz)));
  const l = n(float(1).sub(g));
  const i1 = n(min(n(g.xyz), n(l.zxy)));
  const i2 = n(max(n(g.xyz), n(l.zxy)));
  const x1 = n(x0.sub(i1).add(n(C.xxx)));
  const x2 = n(x0.sub(i2).add(n(C.yyy)));
  const x3 = n(x0.sub(0.5));
  const i = mod289(i0);
  const p = permute(
    n(
      permute(n(permute(n(vec4(0, i1.z, i2.z, 1).add(i.z))).add(i.y).add(vec4(0, i1.y, i2.y, 1))))
        .add(i.x)
        .add(vec4(0, i1.x, i2.x, 1)),
    ),
  );
  // ns = (1/7) * (2, 0.5, 1) - (0, 1, 0)
  const nsX = 2 / 7;
  const nsY = 0.5 / 7 - 1;
  const nsZ = 1 / 7;
  const j = n(p.sub(floor(p.mul(nsZ * nsZ)).mul(49)));
  const xs = n(floor(j.mul(nsZ)));
  const ys = n(floor(j.sub(xs.mul(7))));
  const x = n(xs.mul(nsX).add(nsY));
  const y = n(ys.mul(nsX).add(nsY));
  const h = n(float(1).sub(abs(x)).sub(abs(y)));
  const b0 = n(vec4(n(x.xy), n(y.xy)));
  const b1 = n(vec4(n(x.zw), n(y.zw)));
  const s0 = n(floor(b0).mul(2).add(1));
  const s1 = n(floor(b1).mul(2).add(1));
  const sh = n(step(h, vec4(0)).negate());
  const a0 = n(n(b0.xzyw).add(n(s0.xzyw).mul(n(sh.xxyy))));
  const a1 = n(n(b1.xzyw).add(n(s1.xzyw).mul(n(sh.zzww))));
  const g0 = n(vec3(n(a0.xy), n(h.x)));
  const g1 = n(vec3(n(a0.zw), n(h.y)));
  const g2 = n(vec3(n(a1.xy), n(h.z)));
  const g3 = n(vec3(n(a1.zw), n(h.w)));
  const norm = n(float(1.79284291400159).sub(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)).mul(0.85373472095314)));
  const m0 = n(max(float(0.5).sub(vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3))), 0));
  const m = n(m0.mul(m0));
  const gradients = vec4(dot(g0.mul(norm.x), x0), dot(g1.mul(norm.y), x1), dot(g2.mul(norm.z), x2), dot(g3.mul(norm.w), x3));
  return dot(m.mul(m), gradients).mul(105);
});

const simplexNode = (p: Node): Node => n(simplex3(p));

const VORONOI_STYLE_CODES = { f1: 0, f2: 1, f2MinusF1: 2, smoothBlend: 3, edge: 4 } as const;

/** One noise value at `p`, 0-1, of the layer's type. */
export const noiseValue = (type: NoiseLayer["noiseType"], style: NoiseLayer["voronoiStyle"], p: Node, smoothness: Node): Node => {
  switch (type) {
    case "perlin":
      return n(mx_noise_float(p).mul(0.5).add(0.5));
    case "fbm":
      return n(mx_fractal_noise_float(p, 5, 2, 0.5).mul(0.5).add(0.5));
    case "simplexFractal": {
      let sum = simplexNode(p);
      let weight = 1;
      let total = 1;
      for (let octave = 1; octave < 4; octave++) {
        weight *= 0.5;
        total += weight;
        sum = n(sum.add(simplexNode(n(p.mul(2 ** octave))).mul(weight)));
      }
      return n(sum.div(total).mul(0.5).add(0.5));
    }
    case "voronoi": {
      // Distances to the nearest cell centre (F1) and the next (F2), in cells.
      const cells = n(mx_worley_noise_vec2(p));
      const f1 = n(cells.x);
      const f2 = n(cells.y);
      const code = VORONOI_STYLE_CODES[style];
      if (code === 1) return n(clamp(f2, 0, 1));
      if (code === 2) return n(clamp(f2.sub(f1), 0, 1));
      if (code === 3) {
        // A smooth minimum of the two, so neighbouring cells melt together by `smoothness`.
        const k = n(max(smoothness, 1e-3));
        const h = n(max(k.sub(f2.sub(f1)), 0).div(k));
        return n(clamp(f1.sub(h.mul(h).mul(k).mul(0.25)), 0, 1));
      }
      if (code === 4) return n(smoothstep(0, max(smoothness, 1e-3), f2.sub(f1)));
      return n(clamp(f1, 0, 1));
    }
    case "simplex":
    default:
      return n(simplexNode(p).mul(0.5).add(0.5));
  }
};

const noiseSource = (first: NoiseLayer): LayerSource => {
  const colors = [vec4Uniform(), vec4Uniform(), vec4Uniform(), vec4Uniform()];
  const size: Vec3Uniform = objectUniform(new THREE.Vector3(1, 1, 1));
  const scale = objectUniform(1);
  const movement = objectUniform(0);
  const distortion: Vec2Uniform = objectUniform(new THREE.Vector2(1, 1));
  const factorA: Vec2Uniform = objectUniform(new THREE.Vector2());
  const factorB: Vec2Uniform = objectUniform(new THREE.Vector2());
  const smoothness = objectUniform(0.3);
  const seed = objectUniform(0);
  const lowCut = objectUniform(0);
  const highCut = objectUniform(1);
  return {
    update(layer) {
      if (layer.type !== "noise") return;
      layer.colors.forEach((color, index) => setPaint(colors[index], color));
      // A size of 0 would divide by zero: the smallest size is a hundredth.
      size.value.set(...layer.size.map((axis) => Math.max(0.01, Math.abs(axis))) as [number, number, number]);
      scale.value = layer.scale;
      movement.value = layer.movement;
      distortion.value.set(...layer.distortion);
      factorA.value.set(...layer.factorA);
      factorB.value.set(...layer.factorB);
      smoothness.value = layer.smoothness;
      seed.value = layer.seed;
      lowCut.value = layer.lowCut;
      highCut.value = layer.highCut;
    },
    node(context) {
      const value = (p: Node) => noiseValue(first.noiseType, first.voronoiStyle, p, n(smoothness));
      // The seed moves the pattern somewhere else; the movement drifts the second warp over time.
      const p = n(context.objectPosition.div(n(size)).mul(n(scale)).add(n(seed).mul(vec3(17.13, 31.71, 9.37))));
      const drift = n(n(time).mul(n(movement)).mul(0.1));
      // Inigo Quilez's domain warp: q warps p, r warps it again, and f is the noise there.
      const q = n(vec2(value(p), value(n(p.add(vec3(5.2, 1.3, 0))))));
      const pushedByQ = n(p.add(vec3(q.mul(n(distortion).x).mul(4), 0)));
      const r = n(
        vec2(
          value(n(pushedByQ.add(vec3(n(factorA), drift)))),
          value(n(pushedByQ.add(vec3(n(factorB), drift.negate())))),
        ),
      );
      const raw = value(n(p.add(vec3(r.mul(n(distortion).y).mul(4), 0))));
      const span = n(max(n(highCut).sub(n(lowCut)), 1e-4));
      const f = n(clamp(raw.sub(n(lowCut)).div(span), 0, 1));
      // Premultiplied, as a ramp is: a see-through colour adds only as much as it shows.
      let color = n(mix(premultiply(n(colors[0])), premultiply(n(colors[1])), clamp(f.mul(f).mul(4), 0, 1)));
      color = n(mix(color, premultiply(n(colors[2])), clamp(length(q), 0, 1)));
      color = unpremultiply(n(mix(color, premultiply(n(colors[3])), clamp(r.x, 0, 1))));
      return { rgb: n(color.xyz), a: n(color.w) };
    },
  };
};

// ─── Image ───────────────────────────────────────────────────────────────────

// What an Image layer with no picture yet (or one still loading) samples: nothing, see-through.
export const NO_PICTURE = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
NO_PICTURE.needsUpdate = true;

// Where a point falls on the picture, before scale, offset and rotation: the mesh's UVs, or the
// object-space position projected (a unit object covers the picture once). Planar looks along
// `axis`; spherical goes around Y; cylindrical goes around `axis`.
const planarUv = (p: Node, axis: "x" | "y" | "z"): Node =>
  n(axis === "x" ? vec2(p.z.negate(), p.y) : axis === "y" ? vec2(p.x, p.z.negate()) : vec2(p.x, p.y)).add(0.5);

const around = (p: Node, axis: "x" | "y" | "z"): { a: Node; b: Node; along: Node } =>
  axis === "x" ? { a: n(p.y), b: n(p.z), along: n(p.x) } : axis === "z" ? { a: n(p.x), b: n(p.y), along: n(p.z) } : { a: n(p.x), b: n(p.z), along: n(p.y) };

const projectedUv = (layer: ImageLayer, p: Node): Node => {
  switch (layer.projection) {
    case "planar":
      return planarUv(p, layer.axis);
    case "spherical": {
      const direction = n(p.normalize());
      return n(vec2(n(atan(p.x, p.z)).div(2 * Math.PI).add(0.5), n(asin(clamp(direction.y, -1, 1))).div(Math.PI).add(0.5)));
    }
    case "cylindrical": {
      const { a, b, along } = around(p, layer.axis);
      return n(vec2(n(atan(a, b)).div(2 * Math.PI).add(0.5), along.add(0.5)));
    }
    case "uv":
    default:
      return n(uv());
  }
};

const imageSource = (first: ImageLayer): LayerSource => {
  // The picture (each sample, of which triplanar takes three, reads the drawn object's own).
  const picture = objectSlot<THREE.Texture>(NO_PICTURE);
  const scale: Vec2Uniform = objectUniform(new THREE.Vector2(1, 1));
  const offset: Vec2Uniform = objectUniform(new THREE.Vector2());
  const rotation = objectUniform(0);
  const crop = objectUniform(0);
  const aspect = objectUniform(1); // the picture's width / height
  const sample = (at: Node): Node => n(objectTexture(picture, at));
  // Rotation and repeats about the picture's middle, then the offset; Crop keeps its shape.
  const place = (at: Node): Node => {
    const centred = n(at.sub(0.5));
    const fit = n(mix(vec2(1, 1), vec2(min(1, n(aspect).reciprocal()), min(1, n(aspect))), n(crop)));
    const cosine = n(n(rotation).cos());
    const sine = n(n(rotation).sin());
    const turned = n(vec2(centred.x.mul(cosine).sub(centred.y.mul(sine)), centred.x.mul(sine).add(centred.y.mul(cosine))));
    return n(turned.mul(fit).mul(n(scale)).add(0.5).add(n(offset)));
  };
  return {
    update(layer, pictures) {
      if (layer.type !== "image") return false;
      scale.value.set(...layer.scale);
      offset.value.set(...layer.offset);
      rotation.value = (layer.rotation * Math.PI) / 180;
      crop.value = layer.crop ? 1 : 0;
      const next = (layer.textureAssetId ? pictures(layer, { nearest: layer.sharpness === "pixelated" }) : null) ?? NO_PICTURE;
      const image = next.image as { width?: number; height?: number } | undefined;
      aspect.value = image?.width && image.height ? image.width / image.height : 1;
      if (next === picture.value) return false;
      picture.value = next;
      return true;
    },
    node(context) {
      let color: Node;
      if (first.projection === "triplanar") {
        // Planar from each side, weighted by how squarely the surface faces it.
        const weights = n(pow(abs(n(normalLocal)), vec3(4, 4, 4)));
        const total = n(max(weights.x.add(weights.y).add(weights.z), 1e-5));
        const p = context.objectPosition;
        color = n(
          sample(place(planarUv(p, "x")))
            .mul(weights.x)
            .add(sample(place(planarUv(p, "y"))).mul(weights.y))
            .add(sample(place(planarUv(p, "z"))).mul(weights.z))
            .div(total),
        );
      } else {
        color = sample(place(projectedUv(first, context.objectPosition)));
      }
      // The texture is decoded to linear values; the stack blends sRGB ones, as the colours are picked.
      return { rgb: n(sRGBTransferOETF(n(color.rgb))), a: n(color.a) };
    },
  };
};

// ─── Normal ──────────────────────────────────────────────────────────────────

const normalSource = (): LayerSource => {
  const axes: Vec3Uniform = objectUniform(new THREE.Vector3(1, 1, 1));
  return {
    update(layer) {
      if (layer.type !== "normal") return;
      axes.value.set(...(layer.axes.map((on) => (on ? 1 : 0)) as [number, number, number]));
    },
    node() {
      // The way the surface faces, in the scene's space, -1 to 1 as 0 to 1 (scene/types.ts, NormalLayer).
      return { rgb: n(n(normalWorld).mul(0.5).add(0.5).mul(n(axes))), a: float(1) };
    },
  };
};

// ─── Matcap ──────────────────────────────────────────────────────────────────

const matcapSource = (): LayerSource => {
  const picture = objectSlot<THREE.Texture>(matcapTexture(DEFAULT_MATCAP));
  const rotation = objectUniform(0);
  return {
    update(layer, pictures) {
      if (layer.type !== "matcap") return false;
      rotation.value = (layer.rotation * Math.PI) / 180;
      const own = layer.textureAssetId ? pictures({ textureAssetId: layer.textureAssetId, wrapS: 1001, wrapT: 1001, flipY: true }, { nearest: false }) : null;
      const next = own ?? matcapTexture(layer.preset);
      if (next === picture.value) return false;
      picture.value = next;
      return true;
    },
    node() {
      // Where the surface's view-space normal points, on the picture; turned about its middle.
      const at = n(matcapUV).sub(0.5);
      const cosine = n(n(rotation).cos());
      const sine = n(n(rotation).sin());
      const turned = n(vec2(at.x.mul(cosine).sub(at.y.mul(sine)), at.x.mul(sine).add(at.y.mul(cosine))).add(0.5));
      const color = n(objectTexture(picture, turned));
      return { rgb: n(sRGBTransferOETF(n(color.rgb))), a: float(1) };
    },
  };
};

// ─── Rainbow ─────────────────────────────────────────────────────────────────

const rainbowSource = (): LayerSource => {
  const frequency = objectUniform(30);
  const movement = objectUniform(0);
  const shift: Vec3Uniform = objectUniform(new THREE.Vector3());
  const wobble = objectUniform(0);
  const wobbleScale = objectUniform(1);
  const offset: Vec3Uniform = objectUniform(new THREE.Vector3());
  return {
    update(layer) {
      if (layer.type !== "rainbow") return;
      frequency.value = layer.frequency;
      movement.value = layer.movement;
      shift.value.set(...layer.color);
      wobble.value = layer.noise;
      wobbleScale.value = layer.noiseScale;
      offset.value.set(...layer.offset);
    },
    node(context) {
      // Where along the bands: how far the surface turns from the view (Frequency 30: one round of
      // hues from facing it to edge-on), drifting with time, wobbled by noise. (Spline's shader isn't
      // in its player; this is a reconstruction of what it draws.)
      const facing = n(clamp(abs(dot(n(normalView), n(positionViewDirection))), 0, 1));
      const noisy = simplexNode(n(context.objectPosition.mul(n(wobbleScale)).add(n(offset))));
      const band = n(
        float(1)
          .sub(facing)
          .mul(n(frequency).div(30))
          .add(n(time).mul(n(movement)).mul(0.1))
          .add(noisy.mul(n(wobble))),
      );
      const phases = n(vec3(0, 1 / 3, 2 / 3).add(n(shift)));
      const rgb = n(n(band).add(phases).mul(2 * Math.PI).cos().mul(0.5).add(0.5));
      return { rgb, a: float(1) };
    },
  };
};

// ─── Glass ───────────────────────────────────────────────────────────────────

// What's been drawn so far this frame, copied once (on the first glass drawn) with its mipmaps, which
// the blur reads. One for every glass, as three's own transmission has: glass doesn't see glass.
const backdrop = viewportMipTexture() as unknown as { sample(uv: Node): Node };

// Neutral tone mapping (as the canvas ending does it: canvasOutput.ts) undone, so a colour read
// off the canvas comes back out as itself: the inverse of three's neutralToneMapping, step by step
// backwards (the highlight squeeze and its desaturation, then the dark offset), then the exposure.
const untoneMap = (shown: Node): Node => {
  const start = 0.8 - 0.04;
  const d = 1 - start;
  const desaturation = 0.15;
  const out = n(min(shown, vec3(0.999, 0.999, 0.999)));
  const newPeak = n(max(out.x, max(out.y, out.z)));
  const peak = n(div(d * d, float(1).sub(newPeak)).sub(d - start));
  const g = n(float(1).sub(div(1, peak.sub(newPeak).mul(desaturation).add(1))));
  const squeezed = n(out.sub(newPeak.mul(g)).div(max(g.oneMinus(), 1e-6)).mul(peak.div(max(newPeak, 1e-6))));
  const compressed = n(select(newPeak.lessThan(start), out, squeezed));
  const least = n(min(compressed.x, min(compressed.y, compressed.z)));
  const darkest = n(sqrt(max(least, 0).div(6.25)));
  const offset = n(select(least.lessThan(0.04), darkest.sub(least), float(0.04)));
  return n(compressed.add(offset).div(SCENE_EXPOSURE));
};

const glassSource = (): LayerSource => {
  const blur = objectUniform(10);
  const thickness = objectUniform(10);
  const ior = objectUniform(1.5);
  const absorption: Vec3Uniform = objectUniform(new THREE.Vector3(1, 1, 1));
  const absorbDistance = objectUniform(0);
  return {
    update(layer) {
      if (layer.type !== "glass") return;
      blur.value = Math.max(0, layer.blur);
      thickness.value = Math.max(0, layer.thickness);
      ior.value = Math.max(1, layer.ior);
      const tint = new THREE.Color(layer.absorption);
      absorption.value.set(Math.max(1e-4, tint.r), Math.max(1e-4, tint.g), Math.max(1e-4, tint.b));
      absorbDistance.value = Math.max(0, layer.absorbDistance);
    },
    node() {
      // As three's transmission (PhysicalLightingModel, getIBLVolumeRefraction): the ray bent into
      // the glass, as far as its thickness (hundredths of the object's own units, scaled with it),
      // and where it comes out, on the canvas.
      const view = n(normalize(n(cameraPosition).sub(positionWorld)));
      const bent = n(normalize(refract(view.negate(), normalize(normalWorld), div(1, n(ior)))));
      const ray = n(bent.mul(n(thickness).mul(0.01)).mul(modelScale));
      const exit = n(n(cameraProjectionMatrix).mul(n(cameraViewMatrix).mul(vec4(n(positionWorld).add(ray), 1))));
      const at = n(exit.xy.div(exit.w).add(1).div(2));
      const onCanvas = n(vec2(at.x, at.y.oneMinus()));
      // Blur: a smaller mip the rougher it is, as three's (roughness scaled by the IOR). Three's goes
      // down to the 1-pixel mip at roughness 1, one flat colour; Spline's Blur 10 is frosted but still
      // shows shapes, so it reaches 60% of the way.
      const roughness = n(clamp(n(blur).div(10), 0, 1).mul(clamp(n(ior).mul(2).sub(2), 0, 1)));
      const lod = n(log2(n(screenSize).x).mul(roughness).mul(0.6));
      const shown = n(textureBicubicLevel(n(backdrop.sample(onCanvas)), lod).rgb);
      // Absorption (Beer's law, as three's volumeAttenuation): the colour it reaches at its distance.
      const tint = n(exp(log(n(absorption)).mul(length(ray).mul(100).div(max(n(absorbDistance), 1e-6)))));
      const absorbed = n(select(n(absorbDistance).greaterThan(0), tint, vec3(1, 1, 1)));
      // Back to the stack's sRGB, so the canvas ending turns it into what was shown.
      const light = n(untoneMap(n(sRGBTransferEOTF(shown))).mul(absorbed));
      return { rgb: n(sRGBTransferOETF(light)), a: float(1) };
    },
  };
};

// ─── Fresnel ─────────────────────────────────────────────────────────────────

const fresnelSource = (): LayerSource => {
  const color = vec4Uniform();
  const bias = objectUniform(0.1);
  const scale = objectUniform(1);
  const intensity = objectUniform(2);
  const factor = objectUniform(1);
  return {
    update(layer) {
      if (layer.type !== "fresnel") return;
      setPaint(color, layer as FresnelLayer);
      bias.value = layer.bias;
      scale.value = layer.scale;
      intensity.value = layer.intensity;
      factor.value = layer.factor;
    },
    node() {
      // How far the surface turns from the view: 0 facing it, 1 edge-on (scene/layerStack.ts, fresnelAmount).
      const facing = n(clamp(abs(dot(n(normalView), n(positionViewDirection))), 0, 1));
      const rim = n(clamp(n(bias).add(n(scale).mul(pow(float(1).sub(facing), n(intensity)))), 0, 1));
      const amount = n(clamp(rim.mul(n(factor)), 0, 1));
      return { rgb: n(n(color).xyz), a: n(n(color).w.mul(amount)) };
    },
  };
};

// Each painting layer type's source. A Record, so a new type without one doesn't compile (it
// would otherwise draw as a flat colour). Some sources build their shader from the first layer.
const SOURCES: { [T in PaintLayer["type"]]: (first: Extract<PaintLayer, { type: T }>) => LayerSource } = {
  color: colorSource,
  depth: depthSource,
  gradient: gradientSource,
  noise: noiseSource,
  fresnel: fresnelSource,
  image: imageSource,
  normal: normalSource,
  matcap: matcapSource,
  rainbow: rainbowSource,
  glass: glassSource,
};

/** A source for `layer`, with its uniforms set from it. Its shader is the one for layerSourceShape(layer). */
export const createLayerSource = (layer: PaintLayer, pictures: PictureSource): LayerSource => {
  const source = (SOURCES[layer.type] as (first: PaintLayer) => LayerSource)(layer);
  source.update(layer, pictures);
  return source;
};

/** What a layer's source shader looks like: two layers with the same shape share one. */
export const layerSourceShape = (layer: PaintLayer): string => {
  switch (layer.type) {
    case "depth":
      return `depth:${stopCount(layer.stops)}:${layer.originType === "camera" ? "camera" : layer.space === "world" ? "world" : "local"}:${layer.gradientType}`;
    case "gradient":
      return `gradient:${stopCount(layer.stops)}:${layer.gradientType}`;
    case "noise":
      return `noise:${layer.noiseType}${layer.noiseType === "voronoi" ? `:${layer.voronoiStyle}` : ""}`;
    case "fresnel":
      return "fresnel";
    case "normal":
      return "normal";
    case "matcap":
      return "matcap";
    case "rainbow":
      return "rainbow";
    case "glass":
      return "glass";
    case "image":
      return `image:${layer.projection}${layer.projection === "planar" || layer.projection === "cylindrical" ? `:${layer.axis}` : ""}`;
    case "color":
      return "color";
  }
};
