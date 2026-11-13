/**
 * PURPOSE: The choices more than one layer drawer offers: a ramp's blending (Depth, Gradient) and
 * the noises with Voronoi's styles (Noise, Displace).
 */

import type { NoiseType, VoronoiStyle } from "../../../store/useEditorStore";

export const BLENDING_OPTIONS: { label: string; value: "linear" | "smooth" }[] = [
  { label: "Linear", value: "linear" },
  { label: "Smooth", value: "smooth" },
];

export const NOISE_TYPE_OPTIONS: { label: string; value: NoiseType }[] = [
  { label: "Simplex", value: "simplex" },
  { label: "Simplex Fractal", value: "simplexFractal" },
  { label: "Perlin", value: "perlin" },
  { label: "FBM", value: "fbm" },
  { label: "Voronoi", value: "voronoi" },
];

export const VORONOI_STYLE_OPTIONS: { label: string; value: VoronoiStyle }[] = [
  { label: "F1", value: "f1" },
  { label: "F2", value: "f2" },
  { label: "F2 − F1", value: "f2MinusF1" },
  { label: "Smooth Blend", value: "smoothBlend" },
  { label: "Edge", value: "edge" },
];
