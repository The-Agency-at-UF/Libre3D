/**
 * PURPOSE: A picked colour as the colour picker (components/ui/ColorPicker.tsx) edits it: hex,
 * HSV for its square and hue slider, and RGB / HSL for its fields. All sRGB as picked, 0-255 or
 * 0-1 as named; no Three.js, no colour management.
 *
 * Also the sRGB transfer curve and a mix of two picked colours in linear light, for the animation
 * runtime (animation/sceneRuntime.ts), which every page loads and so can't use Three's Color.
 */

export interface Hsv {
  h: number; // 0-360
  s: number; // 0-1
  v: number; // 0-1
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** "#rrggbb" (or "#rgb") as 0-255 channels; null when it isn't one. */
export const parseHex = (text: string): [number, number, number] | null => {
  let hex = text.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) hex = hex.replace(/./g, (c) => c + c);
  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  const value = parseInt(hex, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
};

export const toHex = (rgb: [number, number, number]): string =>
  `#${rgb.map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, "0")).join("")}`;

export const rgbToHsv = ([r, g, b]: [number, number, number]): Hsv => {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const delta = max - Math.min(rn, gn, bn);
  let h = 0;
  if (delta > 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
};

export const hsvToRgb = ({ h, s, v }: Hsv): [number, number, number] => {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return (v - v * s * Math.max(0, Math.min(k, 4 - k, 1))) * 255;
  };
  return [f(5), f(3), f(1)];
};

/** HSL as 0-360, 0-100, 0-100, as the picker's fields show it. */
export const rgbToHsl = ([r, g, b]: [number, number, number]): [number, number, number] => {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const delta = max - min;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  const { h } = rgbToHsv([r, g, b]);
  return [h, s * 100, l * 100];
};

export const hslToRgb = ([h, s, l]: [number, number, number]): [number, number, number] => {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return (ln - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) * 255;
  };
  return [f(0), f(8), f(4)];
};

/** One sRGB channel (0-1, as picked) as linear light (0-1). */
export const srgbToLinear = (channel: number): number =>
  channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);

/** One linear-light channel (0-1) as sRGB (0-1). */
export const linearToSrgb = (channel: number): number =>
  channel <= 0.0031308 ? channel * 12.92 : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;

/**
 * The colour `progress` (0-1) of the way from one "#rrggbb" to another, mixed in linear light as
 * THREE.Color.lerp does on its working values: the midpoint of black and white is the grey that
 * gives off half the light (#bcbcbc), not #808080. At 0 and 1 it is the colour given, as given. A
 * text that isn't a colour counts as the other one.
 */
export const mixHexLinear = (from: string, to: string, progress: number): string => {
  if (progress <= 0 || from === to) return from;
  if (progress >= 1) return to;
  const a = parseHex(from);
  const b = parseHex(to);
  if (!a || !b) return a ? from : to;
  const mixed = a.map((channel, index) => {
    const start = srgbToLinear(channel / 255);
    return linearToSrgb(start + (srgbToLinear(b[index] / 255) - start) * progress) * 255;
  }) as [number, number, number];
  return toHex(mixed);
};
