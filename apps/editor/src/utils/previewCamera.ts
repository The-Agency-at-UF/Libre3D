import * as THREE from "three";
import type { CameraProfile } from "../store/useEditorStore";

export interface ModelViewerCameraAttrs {
  cameraOrbit: string;
  cameraTarget: string;
  fieldOfView: string;
  minCameraOrbit: string;
  maxCameraOrbit: string;
  minFieldOfView: string;
  maxFieldOfView: string;
}

// Left alone, <model-viewer> ignores the editor's camera entirely: it frames the
// model with its own auto-fit orbit, which is why pressing Play used to open on a
// different zoom than the viewport was showing. Preview needs the editor's camera
// verbatim, so translate the active camera profile (which useViewportControls
// keeps in sync with OrbitControls on every change) into model-viewer's spherical
// camera attributes.
//
// Both systems use the same spherical convention — theta azimuthal from +Z toward
// +X, phi polar from +Y — so THREE.Spherical converts directly. The GLB is
// exported from the live scene with `trs: true` and no recentering, so editor
// world coordinates land 1:1 in the exported model.
//
// Orthographic is approximate by nature: model-viewer has no orthographic camera,
// so an ortho editor view is matched on orbit/target and rendered through the
// profile's perspective fov (which the ortho path preserves untouched).
export function getModelViewerCamera(profile: CameraProfile): ModelViewerCameraAttrs {
  const target = new THREE.Vector3(...profile.target);
  const offset = new THREE.Vector3(...profile.position).sub(target);

  const spherical = new THREE.Spherical().setFromVector3(offset);
  // A degenerate camera (sitting exactly on its target) has no meaningful orbit —
  // fall back to the default profile's distance rather than emitting 0m.
  const radius = spherical.radius > 1e-6 ? spherical.radius : 10;

  const fmt = (value: number) => Number(value.toFixed(4));

  return {
    cameraOrbit: `${fmt(THREE.MathUtils.radToDeg(spherical.theta))}deg ${fmt(
      THREE.MathUtils.radToDeg(spherical.phi),
    )}deg ${fmt(radius)}m`,
    cameraTarget: `${fmt(target.x)}m ${fmt(target.y)}m ${fmt(target.z)}m`,
    fieldOfView: `${fmt(profile.fov)}deg`,
    // model-viewer clamps *both* the orbit radius and the field of view to bounds
    // derived from the model's own size ("auto" on each), which silently overrides
    // a deliberately far-out, close-in or wide-angle editor camera — an unbounded
    // fov in particular reads as preview being zoomed in further than the
    // viewport. Give explicit bounds so the editor's values survive verbatim.
    minCameraOrbit: "auto auto 0m",
    maxCameraOrbit: `auto auto ${fmt(radius * 4)}m`,
    minFieldOfView: "1deg",
    maxFieldOfView: "179deg",
  };
}
