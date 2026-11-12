/**
 * PURPOSE: A picked colour as the colour picker (components/ui/ColorPicker.tsx) edits it: hex,
 * HSV for its square and hue slider, and RGB / HSL for its fields. All sRGB as picked, 0-255 or
 * 0-1 as named; no Three.js, no colour management.
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
