/**
 * PURPOSE: The camera Play looks through (and later the share-link viewer, `<libre3d-viewer>`): a
 * camera of its own that starts where the scene's camera is and moves the way the camera's Play
 * setting says, without ever writing the scene's camera back.
 *
 * INPUT: The scene camera's values and its Play settings, read once when Play starts; the pointer
 *        (through `attach`, or the methods directly) and the passing of time.
 * OUTPUT: `camera`, posed for each frame by `update`.
 *
 * In the editor, the camera is scene data: orbiting writes it to the store (useViewportControls).
 * Play doesn't: it looks through this camera instead, and on Stop the editor's camera is exactly
 * where it was. Every mode turns the camera around the scene camera's target, never moving the
 * target or the distance: yaw about the world's up axis and pitch towards it, pitch stopping short
 * of straight up or down.
 * - fixed: stays where the scene's camera is.
 * - softOrbit: turns towards the pointer, up to `range` degrees at the canvas's edges (less up and
 *   down), easing there, and eases back to rest when the pointer leaves.
 * - orbit: dragging turns it, as the editor's orbit does, easing out after the pointer.
 * - autoRotate: turns slowly about the up axis, `speed` degrees a second.
 * `smoothness` is how slowly it eases (soft orbit and orbit). With the system's reduce-motion
 * setting on, soft orbit and auto-rotate keep still; dragging still works.
 *
 * Nothing here depends on the store or React; the DOM only in `attach`.
 */

import * as THREE from "three";
import type { CameraProfile, PlayCameraMode, PlayCameraSettings } from "../store/useEditorStore";

/** The modes in the order the Play Camera panel lists them. */
export const PLAY_CAMERA_MODES: { value: PlayCameraMode; label: string }[] = [
  { value: "fixed", label: "Fixed" },
  { value: "softOrbit", label: "Soft Orbit" },
  { value: "orbit", label: "Orbit" },
  { value: "autoRotate", label: "Auto-Rotate" },
];

export const PLAY_CAMERA_LIMITS = {
  range: { min: 1, max: 45 }, // degrees
  smoothness: { min: 0, max: 1 },
  speed: { min: 1, max: 90 }, // degrees a second
};

/** What a camera without Play settings does: orbit by dragging, as Play always let you. */
export const DEFAULT_PLAY_CAMERA: PlayCameraSettings = { mode: "orbit", range: 8, smoothness: 0.5, speed: 6 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const numberIn = (value: unknown, limits: { min: number; max: number }, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? clamp(value, limits.min, limits.max) : fallback;

/** A camera's Play settings with every field present and in range (missing or damaged ones are defaults). */
export const resolvePlayCamera = (settings: Partial<PlayCameraSettings> | undefined): PlayCameraSettings => ({
  mode: PLAY_CAMERA_MODES.some((mode) => mode.value === settings?.mode) ? settings!.mode! : DEFAULT_PLAY_CAMERA.mode,
  range: numberIn(settings?.range, PLAY_CAMERA_LIMITS.range, DEFAULT_PLAY_CAMERA.range),
  smoothness: numberIn(settings?.smoothness, PLAY_CAMERA_LIMITS.smoothness, DEFAULT_PLAY_CAMERA.smoothness),
  speed: numberIn(settings?.speed, PLAY_CAMERA_LIMITS.speed, DEFAULT_PLAY_CAMERA.speed),
});

const DEGREES = Math.PI / 180;
const PITCH_SHARE = 0.6; // soft orbit turns this much less up and down than sideways
const POLE_MARGIN = 0.05; // radians kept from straight up and down

export class PlayCamera {
  readonly camera: THREE.PerspectiveCamera;
  private readonly settings: PlayCameraSettings;
  private readonly target: THREE.Vector3;
  private readonly rest: THREE.Spherical; // the scene camera around its target
  private readonly still: boolean; // reduce motion: no turning the user didn't ask for
  private yaw = 0; // radians from rest, now and where it's easing to
  private pitch = 0;
  private goalYaw = 0;
  private goalPitch = 0;
  private dragFrom: { x: number; y: number } | null = null;

  constructor(
    start: Pick<CameraProfile, "position" | "target" | "fov" | "near" | "far">,
    settings: PlayCameraSettings,
    aspect: number,
    { reduceMotion = false }: { reduceMotion?: boolean } = {},
  ) {
    this.settings = settings;
    this.still = reduceMotion;
    this.target = new THREE.Vector3(...start.target);
    this.rest = new THREE.Spherical().setFromVector3(new THREE.Vector3(...start.position).sub(this.target));
    this.camera = new THREE.PerspectiveCamera(start.fov, aspect, start.near, start.far);
    this.pose();
  }

  get mode(): PlayCameraMode {
    return this.settings.mode;
  }

  setAspect(aspect: number): void {
    if (!(aspect > 0) || this.camera.aspect === aspect) return;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  /** Where the pointer is over the canvas, -1 to 1 each way with y up; null once it has left. */
  setPointer(x: number | null, y = 0): void {
    if (this.settings.mode !== "softOrbit") return;
    const range = this.settings.range * DEGREES;
    this.goalYaw = x === null ? 0 : clamp(x, -1, 1) * range;
    this.goalPitch = x === null ? 0 : clamp(y, -1, 1) * range * PITCH_SHARE;
  }

  /** A drag starting at a point (in pixels). Orbit only; returns whether it's taken. */
  beginDrag(x: number, y: number): boolean {
    if (this.settings.mode !== "orbit") return false;
    this.dragFrom = { x, y };
    return true;
  }

  /** The drag moved to a point, on a canvas `height` pixels tall: a full height turns it once. */
  dragTo(x: number, y: number, height: number): void {
    if (!this.dragFrom || !(height > 0)) return;
    this.goalYaw -= (2 * Math.PI * (x - this.dragFrom.x)) / height;
    this.goalPitch = this.clampPitch(this.goalPitch + (2 * Math.PI * (y - this.dragFrom.y)) / height);
    this.dragFrom = { x, y };
  }

  endDrag(): void {
    this.dragFrom = null;
  }

  get isDragging(): boolean {
    return this.dragFrom !== null;
  }

  /** Moves time on by `dt` seconds and poses the camera. */
  update(dt: number): void {
    if (!(dt > 0)) return;
    const { mode, smoothness, speed } = this.settings;
    if (mode === "autoRotate") {
      if (!this.still) this.goalYaw += speed * DEGREES * dt;
      this.yaw = this.goalYaw;
    } else if (mode === "softOrbit" || mode === "orbit") {
      const follow = mode === "softOrbit" && this.still ? { yaw: 0, pitch: 0 } : { yaw: this.goalYaw, pitch: this.goalPitch };
      // Eases the same however fast frames come: about 63% of the way in `ease` seconds.
      const ease = 0.05 + smoothness * 0.75;
      const step = 1 - Math.exp(-dt / ease);
      this.yaw += (follow.yaw - this.yaw) * step;
      this.pitch += (follow.pitch - this.pitch) * step;
    }
    this.pose();
  }

  /**
   * Feeds the element's pointer to the camera: its position (soft orbit) or drags (orbit).
   * Returns a function that takes the listeners off again.
   */
  attach(element: HTMLElement): () => void {
    const point = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: 1 - ((event.clientY - rect.top) / rect.height) * 2,
        height: rect.height,
      };
    };
    const onPointerMove = (event: PointerEvent) => {
      const { x, y, height } = point(event);
      this.setPointer(x, y);
      this.dragTo(event.clientX, event.clientY, height);
    };
    const onPointerLeave = () => this.setPointer(null);
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !this.beginDrag(event.clientX, event.clientY)) return;
      element.setPointerCapture?.(event.pointerId);
      element.style.cursor = "grabbing";
    };
    const onPointerUp = (event: PointerEvent) => {
      // A touch has no hover: soft orbit follows the finger while it's down, then settles.
      if (event.pointerType === "touch") this.setPointer(null);
      if (!this.isDragging) return;
      this.endDrag();
      element.releasePointerCapture?.(event.pointerId);
      element.style.cursor = "";
    };

    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerleave", onPointerLeave);
    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerUp);
    return () => {
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", onPointerLeave);
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerUp);
      if (this.isDragging) element.style.cursor = "";
      this.endDrag();
    };
  }

  // Pitch is kept so the camera never goes over the top (`rest.phi - pitch` within the poles).
  private clampPitch(pitch: number): number {
    return clamp(pitch, this.rest.phi - Math.PI + POLE_MARGIN, this.rest.phi - POLE_MARGIN);
  }

  private pose(): void {
    const phi = clamp(this.rest.phi - this.pitch, POLE_MARGIN, Math.PI - POLE_MARGIN);
    const offset = new THREE.Vector3().setFromSphericalCoords(this.rest.radius, phi, this.rest.theta + this.yaw);
    this.camera.position.copy(this.target).add(offset);
    this.camera.up.set(0, 1, 0);
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
  }
}
