import type { GizmoAxisOptions, GizmoOptions } from "three-viewport-gizmo";

/**
 * ============================================================================
 * Navigation gizmo theming
 * ============================================================================
 *
 * `three-viewport-gizmo` (see `viewport/hooks/useViewportGizmo.ts`) paints
 * itself with Canvas2D-generated textures, not CSS — it has no way to read
 * `var(--accent)` at runtime the way the rest of the app's chrome does. To
 * avoid hand-maintaining a second, parallel palette that silently drifts
 * from `styles/tokens.css`, every color/font below is read live off the
 * real CSS custom properties via `getComputedStyle`. That has a useful side
 * effect for free: calling `buildGizmoTheme()` again after the user flips
 * the dark/light toggle (App.tsx's `.light-theme` class on `<html>`) picks
 * up the new values automatically — see the `MutationObserver` in
 * `useViewportGizmo.ts` that re-applies this theme on that class change.
 *
 * Design mapping (why each token was chosen):
 * - Background disc → `--bg-panel`, the same translucent glass tone used by
 *   `.left-sidebar` / `.right-sidebar` / `.floating-toolbar`, so the gizmo
 *   reads as one more floating panel in the same system instead of a
 *   foreign, off-the-shelf widget.
 * - Hover / active feedback → `--accent` (Apple Blue), matching every other
 *   hover/focus affordance in the editor: input focus rings
 *   (`--input-border-focus`), the active toolbar button, the selected
 *   hierarchy row, the projection toggle's active pill.
 * - Corner & edge pips → `--text-tertiary`, the same muted tone used for
 *   secondary iconography (tree row icons, chevrons) — present for depth
 *   cues without competing with the axis balls for attention.
 * - Axis colors (X / Y / Z) → deliberately **not** `--red` / `--green` /
 *   `--accent` (the Apple-style status tokens reserved for danger/success
 *   buttons and badges). This app already has a precedent for "which color
 *   is which 3D axis" that predates this feature: the axis-orb placeholder
 *   graphic that used to sit in `ViewportOverlays.tsx` used
 *   `#ef4444` / `#22c55e` / `#3b82f6` for X / Y / Z. This gizmo replaces
 *   that placeholder outright (it was a static, non-interactive decoration),
 *   so it inherits its exact axis colors rather than introducing a second,
 *   conflicting convention for "what color is the X axis" in the same app.
 * - Typography → the computed root `font-family` (Space Grotesk, per
 *   `tokens.css`'s `:root` rule), at medium weight — the same face/weight
 *   `.slider-val` uses for numeric readouts. Axis labels are short,
 *   glanceable data in exactly the same way, so they get the same
 *   treatment rather than the UI-chrome system-font stack (`--font`) used
 *   for buttons and body copy.
 */

/**
 * X / Y / Z axis colors, carried over unchanged from the retired
 * `.axis-orb-gizmo` placeholder (previously in `ViewportOverlays.tsx`) so
 * the editor's notion of "which color is which axis" doesn't shift under
 * the user just because the gizmo became interactive.
 */
const AXIS_COLORS = {
  x: "#ef4444", // red
  y: "#22c55e", // green
  z: "#3b82f6", // blue
} as const;

/** Widget diameter in pixels. Slightly below the library's 128px default —
 *  matches the ~88-96px footprint of the app's other circular viewport
 *  chrome (compare `.axis-orb-gizmo`'s 48px ring at a smaller visual weight,
 *  and the floating toolbar's 32px buttons) rather than the library's own
 *  general-purpose default. */
export const GIZMO_SIZE = 88;

/** A parsed CSS color: a solid `#rrggbb` (for THREE.Color / ColorRepresentation,
 *  which doesn't accept an alpha channel) plus the alpha split out separately,
 *  since `three-viewport-gizmo`'s options treat color and opacity as two
 *  distinct fields. */
type ParsedColor = { hex: string; alpha: number };

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const RGB_COLOR =
  /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i;

/** Parses a `#rrggbb`/`#rgb` or `rgb()`/`rgba()` CSS color string (the only
 *  formats `tokens.css` uses) into a solid hex color plus its alpha. Falls
 *  back to treating the input as an opaque color as-is (e.g. a CSS named
 *  color) if it doesn't match either pattern. */
function parseColor(raw: string): ParsedColor {
  const value = raw.trim();

  if (HEX_COLOR.test(value)) {
    return { hex: value, alpha: 1 };
  }

  const match = value.match(RGB_COLOR);
  if (match) {
    const [, r, g, b, a] = match;
    const toHex = (channel: string) =>
      Math.max(0, Math.min(255, Math.round(Number(channel))))
        .toString(16)
        .padStart(2, "0");
    return {
      hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`,
      alpha: a !== undefined ? Number(a) : 1,
    };
  }

  return { hex: value, alpha: 1 };
}

/** Reads a CSS custom property off `:root` (i.e. whatever theme — dark or
 *  `.light-theme` — is currently active) and parses it as a color. Falls
 *  back to the dark-theme default from `tokens.css` if read outside a
 *  browser context (e.g. during SSR/type-checking) or before styles load. */
function readColorToken(name: string, fallback: string): ParsedColor {
  if (typeof window === "undefined") return parseColor(fallback);
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  return parseColor(raw && raw.trim() ? raw : fallback);
}

/** Builds the shared per-axis option block: a solid color ball with a
 *  white-on-color label (matching how selected/accent UI elsewhere in the
 *  app flips label text to `--text-on-accent` against a solid fill — see
 *  `.editor-tree-item--selected` in `components.css`), and an accent-colored
 *  hover ring, mirroring the `--input-border-focus` treatment focused
 *  inputs get throughout the inspector. */
function positiveAxis(
  color: string,
  label: string,
  textOnAccent: string,
  accentHex: string,
): GizmoAxisOptions {
  return {
    label,
    color,
    labelColor: textOnAccent,
    opacity: 1,
    hover: {
      color,
      labelColor: textOnAccent,
      opacity: 1,
      scale: 1.12,
      border: { size: 2, color: accentHex },
    },
  };
}

/** Negative-axis variant: same color family, no letter and a dimmed resting
 *  opacity — the ball-gizmo equivalent of Blender's hollow/unlabeled
 *  negative-axis indicators, so the six main axes stay readable at a glance
 *  instead of six identically-weighted labelled balls competing for focus. */
function negativeAxis(
  color: string,
  label: string,
  textOnAccent: string,
  accentHex: string,
): GizmoAxisOptions {
  return {
    label,
    color,
    opacity: 0.45,
    hover: {
      color,
      labelColor: textOnAccent,
      opacity: 1,
      scale: 1.12,
      border: { size: 2, color: accentHex },
    },
  };
}

/**
 * Builds a fresh `GizmoOptions` theme block from the currently active CSS
 * theme. Purely visual/typographic options only — layout concerns
 * (`placement`, `offset`, `container`, `className`) are owned by
 * `useViewportGizmo.ts`, which spreads this object's output alongside them.
 *
 * Safe (and cheap enough) to call again on demand — e.g. after a dark/light
 * toggle — since it does no DOM writes itself, only a handful of
 * `getComputedStyle` reads.
 */
export function buildGizmoTheme(): GizmoOptions {
  const bgPanel = readColorToken("--bg-panel", "rgba(30, 30, 35, 0.72)");
  const accent = readColorToken("--accent", "#0A84FF");
  const textOnAccent = readColorToken("--text-on-accent", "#ffffff");
  const textTertiary = readColorToken(
    "--text-tertiary",
    "rgba(255, 255, 255, 0.35)",
  );

  const fontFamily =
    typeof window !== "undefined"
      ? getComputedStyle(document.documentElement).fontFamily
      : '"Space Grotesk", "Segoe UI", sans-serif';

  return {
    type: "sphere",
    size: GIZMO_SIZE,
    animated: true,
    speed: 1.4,
    resolution: 128, // crisper axis-label text at this size on HiDPI/Retina screens than the sphere default of 64
    lineWidth: 1.5,

    font: {
      family: fontFamily,
      weight: 500,
    },

    background: {
      enabled: true,
      color: bgPanel.hex,
      opacity: bgPanel.alpha,
      hover: {
        color: accent.hex,
        opacity: 0.18, // same faint-wash intensity family as --accent-dim (0.1–0.16)
      },
    },

    // corners: {
    //   enabled: false,
    //   color: textTertiary.hex,
    //   opacity: 0.5,
    //   scale: 0.85,
    //   hover: { color: accent.hex, opacity: 1, scale: 1.15 },
    // },

    // edges: {
    //   enabled: false,
    //   color: textTertiary.hex,
    //   opacity: 0.5,
    //   scale: 0.85,
    //   hover: { color: accent.hex, opacity: 1, scale: 1.15 },
    // },

    x: positiveAxis(AXIS_COLORS.x, "X", textOnAccent.hex, accent.hex),
    nx: negativeAxis(AXIS_COLORS.x, "-X", textOnAccent.hex, accent.hex),
    y: positiveAxis(AXIS_COLORS.y, "Y", textOnAccent.hex, accent.hex),
    ny: negativeAxis(AXIS_COLORS.y, "-Y", textOnAccent.hex, accent.hex),
    z: positiveAxis(AXIS_COLORS.z, "Z", textOnAccent.hex, accent.hex),
    nz: negativeAxis(AXIS_COLORS.z, "-Z", textOnAccent.hex, accent.hex),
  };
}
