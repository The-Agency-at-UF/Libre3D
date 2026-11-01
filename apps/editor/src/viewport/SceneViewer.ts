/**
 * PURPOSE: Plays a published scene (the share link, `/v/:id`): draws it as the editor's viewport
 * does and runs it as Play does, from the scene's document alone.
 *
 * INPUT: A container element, the scene's content (a parsed scene document, utils/sceneDocument.ts)
 *        and a SceneSource for its imported assets (publishedSceneSource.ts).
 * OUTPUT: A canvas filling the container, animated until `dispose`.
 *
 * Built from the editor's own pieces, not copies of them, so a published scene looks and behaves
 * as it did in Play: the same renderer settings (rendererSettings.ts), scene (SceneManager, with its
 * environment light), objects (ObjectManager), events (SceneRuntime: Start events on load, Mouse
 * Down on a click, a pointer cursor over what can be clicked) and camera (PlayCamera, with the
 * scene camera's Play setting). The editor's own objects (grid, light helpers, outlines) are hidden
 * for each frame, as in Play. Nothing here loads the editor's store: the published scene is the
 * only state, and nothing is ever saved.
 *
 * Settings and the camera fall back to the editor's defaults when a scene doesn't hold them
 * (SceneViewer.test.ts keeps the two equal; the store that defines them isn't loaded here).
 */

import * as THREE from "three";
import { SceneRuntime } from "../animation/sceneRuntime";
import type { CameraProfile, SceneSettingsConfig } from "../store/useEditorStore";
import { hideEditorOnlyObjects } from "../utils/exportScene";
import type { StoredSceneContent } from "../utils/sceneDocument";
import { ObjectManager } from "./ObjectManager";
import { PlayCamera, resolvePlayCamera } from "./PlayCamera";
import { pickEntityAt } from "./pickEntity";
import { createSceneRenderer, exposeLiveRenderer } from "./rendererSettings";
import { createRoomEnvironment } from "./sceneEnvironment";
import { SceneManager } from "./SceneManager";
import type { SceneSource } from "./sceneSource";

// The parts of the editor's defaults (initialSceneDefaults, DEFAULT_CAMERA_PROFILE) a published scene uses.
export const VIEWER_DEFAULTS = {
  bgColor: "#0b1020",
  fogEnabled: false,
  lightIntensity: 0.75,
  environment: { enabled: true, intensity: 1 },
  camera: { position: [0, 5, 10] as [number, number, number], target: [0, 0, 0] as [number, number, number], fov: 45, near: 0.1, far: 1000 },
};

/** The scene settings SceneManager draws with, the stored ones over the defaults. No grid: it's the editor's. */
export const viewerSceneSettings = (stored: StoredSceneContent["sceneSettings"]): SceneSettingsConfig =>
  // SceneManager reads only these; the rest of the settings are the editor's.
  ({
    bgColor: stored?.bgColor ?? VIEWER_DEFAULTS.bgColor,
    fogEnabled: stored?.fogEnabled ?? VIEWER_DEFAULTS.fogEnabled,
    showGrid: false,
    environment: {
      enabled: stored?.environment?.enabled ?? VIEWER_DEFAULTS.environment.enabled,
      intensity: stored?.environment?.intensity ?? VIEWER_DEFAULTS.environment.intensity,
    },
    lights: { intensity: stored?.lights?.intensity ?? VIEWER_DEFAULTS.lightIntensity },
  }) as SceneSettingsConfig;

/** The camera a published scene starts from: its active profile, over the defaults. */
export const viewerCamera = (content: StoredSceneContent): Pick<CameraProfile, "position" | "target" | "fov" | "near" | "far" | "play"> => {
  const profiles = content.cameraProfiles ?? {};
  const profile = profiles[content.activeProfileId ?? "personal"] ?? profiles.personal;
  return { ...VIEWER_DEFAULTS.camera, ...profile };
};

export class SceneViewer {
  private readonly disposers: (() => void)[] = [];
  private frameId = 0;

  constructor(container: HTMLElement, content: StoredSceneContent, source: SceneSource, { reduceMotion = false } = {}) {
    const renderer = createSceneRenderer();
    container.appendChild(renderer.domElement);
    this.disposers.push(exposeLiveRenderer(renderer), () => {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    });
    const canvas = renderer.domElement;

    const sceneManager = new SceneManager(viewerSceneSettings(content.sceneSettings));
    const environment = createRoomEnvironment(renderer);
    sceneManager.setEnvironmentMap(environment.texture);
    const scene = sceneManager.scene;

    const objects = new ObjectManager(scene, new Map(), source);
    objects.syncMeshes(content.entities, null, false);
    // Syncing to no objects disposes them all (geometry, materials, textures).
    this.disposers.push(() => {
      objects.syncMeshes([], null, false);
      sceneManager.setEnvironmentMap(null);
      environment.dispose();
      sceneManager.dispose();
    });

    const start = viewerCamera(content);
    const aspect = () => container.clientWidth / Math.max(1, container.clientHeight);
    const camera = new PlayCamera(start, resolvePlayCamera(start.play), aspect(), { reduceMotion });
    this.disposers.push(camera.attach(canvas));

    const runtime = new SceneRuntime({ entities: content.entities, animation: content.animation ?? {} });
    runtime.start();

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      camera.setAspect(aspect());
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    this.disposers.push(() => observer.disconnect());

    // Clicks fire Mouse Down events; the cursor is a pointer over what has one (one test a frame).
    const raycaster = new THREE.Raycaster();
    const pick = (x: number, y: number) =>
      pickEntityAt(raycaster, camera.camera, canvas, [...objects.getMeshes().values()].filter((object) => object.visible), x, y, true);
    let hoverPoint: { x: number; y: number } | null = null;
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const entityId = pick(event.clientX, event.clientY);
      if (entityId) runtime.click(entityId);
    };
    const onPointerMove = (event: PointerEvent) => {
      hoverPoint = { x: event.clientX, y: event.clientY };
    };
    const onPointerLeave = () => {
      hoverPoint = null;
      container.style.cursor = "";
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    this.disposers.push(() => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    });

    let lastTime = performance.now();
    const animate = () => {
      this.frameId = window.requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      camera.update(dt);
      runtime.tick(dt);
      runtime.poses().forEach((pose, entityId) => objects.applyPose(entityId, pose));

      if (hoverPoint) {
        const entityId = runtime.hasClickEvents ? pick(hoverPoint.x, hoverPoint.y) : null;
        container.style.cursor = entityId && runtime.clickOwnerOf(entityId) ? "pointer" : "";
        hoverPoint = null;
      }

      const restoreEditorOnlyObjects = hideEditorOnlyObjects(scene);
      renderer.render(scene, camera.camera);
      restoreEditorOnlyObjects();
    };
    animate();
  }

  dispose(): void {
    window.cancelAnimationFrame(this.frameId);
    // Last in, first out: listeners and objects go before the renderer they draw with.
    for (const dispose of this.disposers.reverse()) dispose();
    this.disposers.length = 0;
  }
}
