/**
 * PURPOSE: Libre3D's own matcaps: "material capture" pictures of a lit sphere (clay, chrome, gold,
 * …) that a Matcap layer (scene/types.ts, layerSources.ts) looks up by the way the surface faces
 * the camera. Drawn here in code, so no picture files are stored or shipped: a scene names a
 * preset by ID, and the editor and the share link draw the same pixels.
 *
 * INPUT: A preset's ID. OUTPUT: Its pixels (sRGB RGBA, rows bottom first, as a texture takes them)
 * and a texture made from them, kept once per preset.
 *
 * No store, React or DOM here: the share-link viewer uses it too, and Vitest checks it in Node.
 */

import * as THREE from "three";

type RGB = [number, number, number];

interface MatcapLook {
  name: string;
  // How it's lit: "shaded" (a coloured surface lit from the top left), "mirror" (it reflects a
  // bright sky and a dark ground), "toon" (flat bands).
  kind: "shaded" | "mirror" | "toon";
  base: RGB; // sRGB 0-1
  ambient: number;
  specular: number; // how strong the highlight is
  shininess: number; // how small it is
  rim: RGB; // colour of the light around the edge
  rimStrength: number;
  // Pearl: the edge's hue shifts as it goes around.
  iridescent?: boolean;
}

const hex = (value: string): RGB => {
  const n = Number.parseInt(value.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const MATCAP_PRESETS: Record<string, MatcapLook> = {
  clay: { name: "Clay", kind: "shaded", base: hex("#c9a48a"), ambient: 0.35, specular: 0.12, shininess: 12, rim: hex("#fff1e6"), rimStrength: 0.15 },
  chalk: { name: "Chalk", kind: "shaded", base: hex("#f0eee8"), ambient: 0.55, specular: 0.02, shininess: 4, rim: hex("#ffffff"), rimStrength: 0.1 },
  plastic: { name: "Plastic", kind: "shaded", base: hex("#e23b3b"), ambient: 0.3, specular: 0.9, shininess: 60, rim: hex("#ff9c9c"), rimStrength: 0.2 },
  jade: { name: "Jade", kind: "shaded", base: hex("#2f9e6f"), ambient: 0.45, specular: 0.5, shininess: 40, rim: hex("#a8f5d0"), rimStrength: 0.55 },
  pearl: { name: "Pearl", kind: "shaded", base: hex("#f2ebe4"), ambient: 0.6, specular: 0.45, shininess: 24, rim: hex("#ffd6ec"), rimStrength: 0.5, iridescent: true },
  chrome: { name: "Chrome", kind: "mirror", base: hex("#ffffff"), ambient: 0, specular: 1, shininess: 200, rim: hex("#ffffff"), rimStrength: 0 },
  gold: { name: "Gold", kind: "mirror", base: hex("#ffcf5a"), ambient: 0, specular: 1, shininess: 200, rim: hex("#ffffff"), rimStrength: 0 },
  toon: { name: "Toon", kind: "toon", base: hex("#5b8def"), ambient: 0.35, specular: 1, shininess: 80, rim: hex("#cfe0ff"), rimStrength: 0.6 },
};

/** The preset a new Matcap layer starts with. */
export const DEFAULT_MATCAP = "clay";

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const normalize = (v: RGB): RGB => {
  const length = Math.hypot(...v) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
};
const dot = (a: RGB, b: RGB) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const LIGHT = normalize([-0.5, 0.6, 0.65]); // top left, toward the camera
const HALF = normalize([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

// What a mirror sees in direction `d` (view space, y up): a bright sky, a soft horizon, a dark floor.
const mirrorWorld = (d: RGB): number => {
  const up = d[1];
  if (up > 0) return 0.35 + 0.65 * Math.pow(up, 0.45);
  return 0.06 + 0.12 * Math.exp(up * 6);
};

/** One point of the matcap, linear RGB, at the sphere's normal `n` (view space). */
const shade = (look: MatcapLook, n: RGB): RGB => {
  const base = look.base.map(toLinear) as RGB;
  const facing = n[2];
  const rimAmount = Math.pow(1 - clamp01(facing), 3) * look.rimStrength;
  let rim = look.rim.map(toLinear) as RGB;
  if (look.iridescent) {
    const angle = Math.atan2(n[1], n[0]);
    rim = [0.5 + 0.5 * Math.cos(angle), 0.5 + 0.5 * Math.cos(angle + 2.1), 0.5 + 0.5 * Math.cos(angle + 4.2)].map((c) => toLinear(0.75 + 0.25 * c)) as RGB;
  }
  if (look.kind === "mirror") {
    // The camera looks down -z: the reflection of (0, 0, -1) about n.
    const reflected: RGB = [2 * facing * n[0], 2 * facing * n[1], 2 * facing * n[2] - 1];
    const sky = mirrorWorld(reflected);
    const glint = Math.pow(clamp01(dot(n, HALF)), look.shininess);
    return base.map((c) => sky * c + glint) as RGB;
  }
  let diffuse = clamp01(dot(n, LIGHT) * 0.5 + 0.5);
  if (look.kind === "toon") diffuse = diffuse > 0.75 ? 1 : diffuse > 0.45 ? 0.62 : 0.32;
  let highlight = look.specular * Math.pow(clamp01(dot(n, HALF)), look.shininess);
  if (look.kind === "toon") highlight = highlight > 0.5 ? 0.6 : 0;
  return base.map((c, i) => c * (look.ambient + (1 - look.ambient) * diffuse) + highlight + rim[i] * rimAmount) as RGB;
};

/**
 * A preset's pixels: `size` × `size`, RGBA, sRGB, rows bottom first (the picture's top is the
 * sphere's top, as a texture with flipY off reads it). Past the sphere's edge it repeats the edge,
 * so filtering never pulls in a background.
 */
export const matcapPixels = (id: string, size: number): Uint8ClampedArray => {
  const look = MATCAP_PRESETS[id] ?? MATCAP_PRESETS[DEFAULT_MATCAP];
  const pixels = new Uint8ClampedArray(size * size * 4);
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      let x = ((column + 0.5) / size) * 2 - 1;
      let y = ((row + 0.5) / size) * 2 - 1;
      const r = Math.hypot(x, y);
      if (r > 0.999) {
        x = (x / r) * 0.999;
        y = (y / r) * 0.999;
      }
      const n: RGB = [x, y, Math.sqrt(Math.max(0, 1 - x * x - y * y))];
      const color = shade(look, n);
      const at = (row * size + column) * 4;
      for (let c = 0; c < 3; c++) pixels[at + c] = Math.round(clamp01(toSrgb(clamp01(color[c]))) * 255);
      pixels[at + 3] = 255;
    }
  }
  return pixels;
};

const textures = new Map<string, THREE.DataTexture>();

/** A preset's texture (256 × 256), made once. */
export const matcapTexture = (id: string): THREE.DataTexture => {
  const key = MATCAP_PRESETS[id] ? id : DEFAULT_MATCAP;
  let texture = textures.get(key);
  if (!texture) {
    texture = new THREE.DataTexture(new Uint8Array(matcapPixels(key, 256).buffer), 256, 256);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    textures.set(key, texture);
  }
  return texture;
};
