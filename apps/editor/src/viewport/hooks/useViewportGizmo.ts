import { useEffect } from "react";
import * as THREE from "three";
import { ViewportGizmo } from "three-viewport-gizmo";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useEditorStore } from "../../store/useEditorStore";
import { buildGizmoTheme } from "../gizmoTheme";

/** CSS class stamped onto the gizmo's own DOM element (via `options.className`)
 *  so `styles/components.css` can layer the app's glass-panel chrome on top
 *  of it, and so this hook can find that element again later (for the
 *  preview-mode hide below) without the library exposing a public accessor
 *  for its internal DOM node. */
const GIZMO_CLASS_NAME = "libre3d-viewport-gizmo";

/** Fixed width of `.right-sidebar` (296px) plus its 16px right margin, plus
 *  16px of breathing room so the gizmo doesn't sit flush against the
 *  inspector's edge. `.viewport-sandbox-container` (this hook's `container`
 *  option) spans the *entire* viewport width, underneath the absolutely
 *  positioned sidebars (see `.viewport-container { position: absolute;
 *  inset: 0; }` in components.css) — without this offset, a naive
 *  `placement: "top-right"` would park the gizmo directly behind the
 *  inspector panel instead of in the visible 3D view.
 *
 *  The right sidebar's width isn't user-resizable (only the left one is —
 *  see `left-sidebar-resize-handle` in `App.tsx`), so this can be a
 *  constant instead of something measured live off the DOM every resize. */
const RIGHT_SIDEBAR_CLEARANCE = 296 + 16 + 16;

/** Top offset matching the sidebars' own 16px outer margin, so the gizmo's
 *  top edge lines up with the top of the left/right inspector panels. */
const TOP_OFFSET = 16;

function gizmoOptions(container: HTMLElement) {
  return {
    container,
    placement: "top-right" as const,
    offset: { top: TOP_OFFSET, right: RIGHT_SIDEBAR_CLEARANCE },
    className: GIZMO_CLASS_NAME,
    ...buildGizmoTheme(),
  };
}

/**
 * ============================================================================
 * useViewportGizmo — the top-right "navigation gizmo" (Blender-style)
 * ============================================================================
 *
 * Wires up a `three-viewport-gizmo` `ViewportGizmo` instance: a clickable
 * orientation widget that shows the camera's current facing and lets the
 * user snap to/drag between axis-aligned views, same idea as Blender's
 * viewport gizmo. Colors/typography come from `viewport/gizmoTheme.ts`,
 * which derives them from the app's own CSS design tokens.
 *
 * This replaces the non-interactive axis-orb decoration that used to sit in
 * `ViewportOverlays.tsx` (a static SVG with a tooltip, no click/drag
 * behavior) — see that file for the removal note.
 *
 * ── Why this is its own hook ──────────────────────────────────────────────
 * Mirrors the existing `useViewportControls`/`useViewportRaycaster` split:
 * one viewport concern per hook, each taking the shared `cameraRef` /
 * `rendererRef` refs per `conventions.md` §5 ("shared refs over cached
 * values for the active camera").
 *
 * ── Render ordering ───────────────────────────────────────────────────────
 * `ViewportGizmo.render()` draws itself into a scissored corner of the
 * *same* `WebGLRenderer`/canvas the main scene uses, so it must run
 * strictly after `renderer.render(scene, camera)` each frame, not before.
 * `useViewportRenderer.ts` was extended with an `onAfterRender` callback for
 * exactly this (see its own doc comment) — `ViewportCanvas.tsx` wires
 * `() => gizmoRef.current?.render()` into that slot via a ref, since this
 * hook (which actually owns the `ViewportGizmo` instance) necessarily runs
 * *after* `useViewportRenderer`'s call in that component, and the ref
 * indirection lets the render loop started earlier still pick it up once it
 * exists.
 *
 * ── Camera swaps ──────────────────────────────────────────────────────────
 * Unlike `OrbitControls`, `ViewportGizmo` is constructed against one
 * specific camera object, not a ref — so it doesn't automatically follow
 * `cameraRef.current` across perspective ↔ orthographic switches. Rather
 * than rebuilding the gizmo on every switch, `ViewportCanvas.tsx`'s "Sync
 * Camera Profile" effect writes the new camera straight into the public
 * `gizmo.camera` property, exactly like it already does for
 * `orbitControls.object`.
 *
 * ── OrbitControls, not a ref ──────────────────────────────────────────────
 * `attachControls` takes one `OrbitControls` instance, not a ref, but that's
 * fine here: unlike the camera, `useViewportControls` never swaps out the
 * `OrbitControls` instance itself (only its `.object`), so attaching once at
 * construction is correct for the component's lifetime.
 */
export function useViewportGizmo(
  gizmoRef: React.RefObject<ViewportGizmo | null>,
  cameraRef: React.RefObject<THREE.Camera>,
  rendererRef: React.RefObject<THREE.WebGLRenderer | null>,
  orbitControlsRef: React.RefObject<OrbitControls | null>,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const renderer = rendererRef.current;
    const container = containerRef.current;
    const orbitControls = orbitControlsRef.current;
    const camera = cameraRef.current;
    if (!renderer || !container || !orbitControls || !camera) return;

    const gizmo = new ViewportGizmo(
      camera as THREE.PerspectiveCamera | THREE.OrthographicCamera,
      renderer,
      gizmoOptions(container)
    );
    gizmo.attachControls(orbitControls);
    gizmoRef.current = gizmo;

    // Re-theme on dark/light toggle. App.tsx flips a `.light-theme` class on
    // <html> (see tokens.css's `:root.light-theme` block); `gizmoTheme.ts`
    // reads CSS custom properties live, so re-running it after that class
    // changes picks up the new palette automatically. `.set()` fully rebuilds
    // the gizmo's geometry/textures and is explicitly "not recommended for
    // real-time/animation loop use" per the library's own docs — acceptable
    // here because a theme flip is a rare, deliberate user action, not a
    // per-frame update.
    const themeObserver = new MutationObserver(() => {
      gizmo.set(gizmoOptions(container));
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Keep the gizmo's DOM sizing/hit-testing in sync with layout changes
    // that resize its container: window resize, left-sidebar drag (which
    // reflows the viewport width), fixed-frame auto-scale, etc. Per the
    // library's own guidance, resize handling calls `update()`, not `set()`.
    const resizeObserver = new ResizeObserver(() => gizmo.update());
    resizeObserver.observe(container);

    // Hide during preview. The render loop already stops drawing entirely
    // while `isPreviewMode` is true (see useViewportRenderer.ts), which
    // blanks the gizmo's pixels along with the rest of the scene, but its
    // DOM element (used for hit-testing/hover) would otherwise still sit on
    // top of the opaque <model-viewer> preview overlay and intercept clicks
    // meant for it. Mirrors the `{!isPreviewMode && <ViewportOverlays />}` /
    // `{!isPreviewMode && <FloatingToolbar />}` pattern in App.tsx.
    const unsubscribePreview = useEditorStore.subscribe(
      (state) => state.isPreviewMode,
      (isPreviewMode) => {
        gizmo.enabled = !isPreviewMode;
        const el = container.querySelector<HTMLElement>(`.${GIZMO_CLASS_NAME}`);
        if (el) el.style.display = isPreviewMode ? "none" : "";
      },
      { fireImmediately: true }
    );

    return () => {
      unsubscribePreview();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      gizmo.detachControls();
      gizmo.dispose();
      if (gizmoRef.current === gizmo) gizmoRef.current = null;
    };
    // Created once against the initial renderer/container/controls instances
    // (all stable for the component's lifetime); camera swaps are handled
    // externally by ViewportCanvas.tsx writing into `gizmo.camera` directly,
    // same rationale as useViewportControls' own top-level effect comment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendererRef, containerRef, orbitControlsRef]);
}
