/**
 * PURPOSE: What each colour layer paints at a pixel, as TSL: Color, Depth, Gradient, Noise, Fresnel.
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
  atan,
  cameraPosition,
  clamp,
  dot,
  float,
  floor,
  Fn,
  fract,
  length,
  max,
  min,
  mix,
  mx_fractal_noise_float,
  mx_noise_float,
  mx_worley_noise_vec2,
  normalView,
  positionView,
  positionViewDirection,
  positionWorld,
  pow,
  select,
  smoothstep,
  step,
  time,
  uniform,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";
import { hexToRgb, sortedStops, type PaintLayer } from "../scene/layerStack";
import type { DepthLayer, FresnelLayer, GradientLayer, NoiseLayer, PaintColor, RampStop } from "../scene/types";

// TSL's node types are too loose to name usefully here; every node is this.
type Node = ReturnType<typeof float>;
type FloatUniform = ReturnType<typeof uniform<number>>;
type Vec2Uniform = ReturnType<typeof uniform<THREE.Vector2>>;
type Vec3Uniform = ReturnType<typeof uniform<THREE.Vector3>>;
type Vec4Uniform = ReturnType<typeof uniform<THREE.Vector4>>;

const n = (node: unknown): Node => node as Node;

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

export interface LayerSource {
  update(layer: PaintLayer): void;
  node(context: SourceContext): SourceColor;
}

// ─── Shared pieces ───────────────────────────────────────────────────────────

const setPaint = (target: Vec4Uniform, paint: PaintColor): void => {
  const [r, g, b] = hexToRgb(paint.color);
  target.value.set(r, g, b, Math.min(1, Math.max(0, paint.alpha ?? 1)));
};

const vec4Uniform = (): Vec4Uniform => uniform(new THREE.Vector4(1, 1, 1, 1));

interface RampUniforms {
  colors: Vec4Uniform[];
  positions: FloatUniform[];
  smooth: FloatUniform;
}

const rampUniforms = (count: number): RampUniforms => ({
  colors: Array.from({ length: count }, vec4Uniform),
  positions: Array.from({ length: count }, () => uniform(0)),
  smooth: uniform(0),
});

const updateRamp = (ramp: RampUniforms, stops: RampStop[], smooth: boolean): void => {
  sortedStops(stops).forEach((stop, index) => {
    if (!ramp.colors[index]) return;
    setPaint(ramp.colors[index], stop);
    ramp.positions[index].value = stop.position;
  });
  ramp.smooth.value = smooth ? 1 : 0;
};

/** The ramp's colour at `t` (scene/layerStack.ts, sampleRamp): each stop blended in over its own span. */
const sampleRampNode = (ramp: RampUniforms, t: Node): Node => {
  let color = n(ramp.colors[0]);
  for (let i = 1; i < ramp.colors.length; i++) {
    const from = n(ramp.positions[i - 1]);
    const span = n(ramp.positions[i]).sub(from);
    const blended = clamp(t.sub(from).div(max(span, 1e-6)), 0, 1);
    let amount = n(select(span.greaterThan(0), blended, step(from, t)));
    amount = n(mix(amount, amount.mul(amount).mul(float(3).sub(amount.mul(2))), ramp.smooth));
    color = n(mix(color, n(ramp.colors[i]), amount));
  }
  return color;
};

const stopCount = (stops: RampStop[]): number => Math.max(1, sortedStops(stops).length);

// ─── Color ───────────────────────────────────────────────────────────────────

const colorSource = (): LayerSource => {
  const color = uniform(new THREE.Vector3(1, 1, 1));
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
  const origin: Vec3Uniform = uniform(new THREE.Vector3());
  const direction: Vec3Uniform = uniform(new THREE.Vector3(1, 0, 0));
  const near = uniform(0);
  const far = uniform(1);
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
  const angle = uniform(0);
  const offset: Vec2Uniform = uniform(new THREE.Vector2());
  const morph: Vec2Uniform = uniform(new THREE.Vector2());
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
const noiseValue = (type: NoiseLayer["noiseType"], style: NoiseLayer["voronoiStyle"], p: Node, smoothness: Node): Node => {
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
  const size: Vec3Uniform = uniform(new THREE.Vector3(1, 1, 1));
  const scale = uniform(1);
  const movement = uniform(0);
  const distortion: Vec2Uniform = uniform(new THREE.Vector2(1, 1));
  const factorA: Vec2Uniform = uniform(new THREE.Vector2());
  const factorB: Vec2Uniform = uniform(new THREE.Vector2());
  const smoothness = uniform(0.3);
  const seed = uniform(0);
  const lowCut = uniform(0);
  const highCut = uniform(1);
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
      let color = n(mix(n(colors[0]), n(colors[1]), clamp(f.mul(f).mul(4), 0, 1)));
      color = n(mix(color, n(colors[2]), clamp(length(q), 0, 1)));
      color = n(mix(color, n(colors[3]), clamp(r.x, 0, 1)));
      return { rgb: n(color.xyz), a: n(color.w) };
    },
  };
};

// ─── Fresnel ─────────────────────────────────────────────────────────────────

const fresnelSource = (): LayerSource => {
  const color = vec4Uniform();
  const bias = uniform(0.1);
  const scale = uniform(1);
  const intensity = uniform(2);
  const factor = uniform(1);
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

/** A source for `layer`, with its uniforms set from it. Its shader is the one for layerSourceShape(layer). */
export const createLayerSource = (layer: PaintLayer): LayerSource => {
  const source =
    layer.type === "depth"
      ? depthSource(layer)
      : layer.type === "gradient"
        ? gradientSource(layer)
        : layer.type === "noise"
          ? noiseSource(layer)
          : layer.type === "fresnel"
            ? fresnelSource()
            : colorSource();
  source.update(layer);
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
    case "color":
    default:
      return "color";
  }
};
