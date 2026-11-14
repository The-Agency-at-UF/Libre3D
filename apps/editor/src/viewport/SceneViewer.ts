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
 * scene camera's Play setting). The editor's own objects (grid, light helpers, outlines) are never
 * built (`editorHelpers: false`), so there is nothing to hide. Nothing here loads the editor's
 * store: the published scene is the only state, and nothing is ever saved.
 *
 * Settings and the camera fall back to the defaults a new scene starts with when a scene doesn't
 * hold them (scene/defaults.ts, the same values the editor's store uses).
 */

import * as THREE from "three";
import { fadingObjects } from "../animation/objectStates";
import { SceneRuntime } from "../animation/sceneRuntime";
import { DEFAULT_CAMERA_PROFILE, DEFAULT_CAMERA_PROFILE_ID, initialSceneDefaults } from "../scene/defaults";
import { resolveEntities } from "../scene/materialAssets";

import type { CameraProfile, SceneSettingsConfig } from "../scene/types";
import type { StoredSceneContent } from "../utils/sceneDocument";
import { ObjectManager } from "./ObjectManager";
import { PlayCamera, resolvePlayCamera } from "./PlayCamera";
import { pickEntityAt } from "./pickEntity";
import { createSceneRenderer, disposeSceneRenderer, whenRendererReady, type SceneRenderer } from "./rendererSettings";
import { createRoomEnvironment } from "./sceneEnvironment";
import { SceneManager } from "./SceneManager";
import type { SceneSource } from "./sceneSource";

/** The scene settings SceneManager draws with, the stored ones over the defaults. */
export const viewerSceneSettings = (stored: StoredSceneContent["sceneSettings"]): SceneSettingsConfig =>
  // SceneManager reads only these; the rest of the settings are the editor's.
  ({
    bgColor: stored?.bgColor ?? initialSceneDefaults.bgColor,
    fogEnabled: stored?.fogEnabled ?? initialSceneDefaults.fogEnabled,
    showGrid: false,
    environment: {
      enabled: stored?.environment?.enabled ?? initialSceneDefaults.environment.enabled,
      intensity: stored?.environment?.intensity ?? initialSceneDefaults.environment.intensity,
    },
    lights: { intensity: stored?.lights?.intensity ?? initialSceneDefaults.lights.intensity },
  }) as SceneSettingsConfig;

/** The camera a published scene starts from: its active profile, over the default camera's values. */
export const viewerCamera = (content: StoredSceneContent): Pick<CameraProfile, "position" | "target" | "fov" | "near" | "far" | "play"> => {
  const profiles = content.cameraProfiles ?? {};
  const profile = profiles[content.activeProfileId ?? DEFAULT_CAMERA_PROFILE_ID] ?? profiles[DEFAULT_CAMERA_PROFILE_ID];
  const { position, target, fov, near, far } = DEFAULT_CAMERA_PROFILE;
  // A profile read from a document may be missing (or missing values): the defaults stay under it.
  const defaults = { position, target, fov, near, far };
  return { ...defaults, ...profile };
};

export class SceneViewer {
  /** The viewer's own renderer. Handed to what needs it here; the viewer never puts it on `window`. */
  readonly renderer: SceneRenderer;
  private readonly disposers: (() => void)[] = [];
  private frameId = 0;
  private disposed = false;

  constructor(container: HTMLElement, content: StoredSceneContent, source: SceneSource, { reduceMotion = false } = {}) {
    const renderer = createSceneRenderer();
    this.renderer = renderer;
    container.appendChild(renderer.domElement);
    this.disposers.push(() => disposeSceneRenderer(renderer));
    const canvas = renderer.domElement;

    const sceneManager = new SceneManager(viewerSceneSettings(content.sceneSettings), { editorHelpers: false });
    const scene = sceneManager.scene;
    // Made once the renderer has started, below.
    let environment: THREE.RenderTarget | null = null;

    const objects = new ObjectManager(scene, new Map(), source, { getRenderer: () => renderer, editorHelpers: false });
    // Objects that use a material asset are drawn with its layers, from the document alone.
    const drawn = resolveEntities(content.entities, content.materials);
    objects.setFadingObjects(fadingObjects(content.animation?.states));
    objects.syncMeshes(drawn, null, false);

    // Syncing to no objects disposes them all (geometry, materials, textures).
    this.disposers.push(() => {
      objects.syncMeshes([], null, false);
      sceneManager.setEnvironmentMap(null);
      environment?.dispose();
      sceneManager.dispose();
    });

    const start = viewerCamera(content);
    const aspect = () => container.clientWidth / Math.max(1, container.clientHeight);
    const camera = new PlayCamera(start, resolvePlayCamera(start.play), aspect(), { reduceMotion });
    this.disposers.push(camera.attach(canvas));

    // The drawn entities, so a state's colour goes over an asset's layers.
    const runtime = new SceneRuntime({ entities: drawn, animation: content.animation ?? {} });
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

    let lastTime = 0;
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

      renderer.render(scene, camera.camera);
    };

    // Nothing can be drawn until the renderer has started. Start events fired above, but their
    // transitions only move with the frames, so they play from their beginning once it has.
    whenRendererReady(renderer).then(
      () => {
        if (this.disposed) return;
        environment = createRoomEnvironment(renderer);
        sceneManager.setEnvironmentMap(environment.texture);
        lastTime = performance.now();
        animate();
      },
      (error) => console.error("[Libre3D] The renderer could not start:", error),
    );
  }

  dispose(): void {
    this.disposed = true;
    window.cancelAnimationFrame(this.frameId);
    // Last in, first out: listeners and objects go before the renderer they draw with.
    for (const dispose of this.disposers.reverse()) dispose();
    this.disposers.length = 0;
  }
}
