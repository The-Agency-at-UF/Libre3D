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
 * environment light), objects (ObjectManager), events (SceneRuntime: Start events on load), pointer
 * input (playInput.ts: the pointer and key triggers, a pointer cursor over what can be clicked) and camera
 * (PlayCamera, with the scene camera's Play setting). Scroll events follow `setScrollProgress`,
 * which the page calls from its scroll (eased by the scene's smoothing setting, scrollProgress.ts). The editor's own objects (grid, light helpers, outlines) are never
 * built (`editorHelpers: false`), so there is nothing to hide. Nothing here loads the editor's
 * store: the published scene is the only state, and nothing is ever saved.
 *
 * Settings and the camera fall back to the defaults a new scene starts with when a scene doesn't
 * hold them (scene/defaults.ts, the same values the editor's store uses).
 */

import * as THREE from "three";
import { hasSoundActions } from "../animation/events";
import { fadingObjects } from "../animation/objectStates";
import { SceneRuntime } from "../animation/sceneRuntime";
import { clampProgress } from "../animation/transitions";
import { DEFAULT_CAMERA_PROFILE, DEFAULT_CAMERA_PROFILE_ID, initialSceneDefaults } from "../scene/defaults";
import { resolveEntities } from "../scene/materialAssets";

import type { CameraProfile, SceneSettingsConfig } from "../scene/types";
import type { StoredSceneContent } from "../utils/sceneDocument";
import { ObjectManager } from "./ObjectManager";
import { PlayCamera, resolvePlayCamera } from "./PlayCamera";
import { pickEntityAt } from "./pickEntity";
import { createPlayEffects } from "./playEffects";
import { attachPlayInput, type PlayInputKeyTarget } from "./playInput";
import { SceneAudio } from "./sceneAudio";
import { createSceneRenderer, disposeSceneRenderer, whenRendererReady, type SceneRenderer } from "./rendererSettings";
import { createRoomEnvironment } from "./sceneEnvironment";
import { easeScrollProgress } from "./scrollProgress";
import { SceneManager } from "./SceneManager";
import type { SceneSource } from "./sceneSource";

/** The scene settings SceneManager draws with, the stored ones over the defaults. */
export const viewerSceneSettings = (stored: StoredSceneContent["sceneSettings"]): SceneSettingsConfig =>
  // SceneManager reads these, and the viewer the scroll settings; the rest are the editor's.
  ({
    bgColor: stored?.bgColor ?? initialSceneDefaults.bgColor,
    fogEnabled: stored?.fogEnabled ?? initialSceneDefaults.fogEnabled,
    showGrid: false,
    environment: {
      enabled: stored?.environment?.enabled ?? initialSceneDefaults.environment.enabled,
      intensity: stored?.environment?.intensity ?? initialSceneDefaults.environment.intensity,
    },
    lights: { intensity: stored?.lights?.intensity ?? initialSceneDefaults.lights.intensity },
    // Read by the viewer itself, for Scroll events.
    scroll: {
      length: stored?.scroll?.length ?? initialSceneDefaults.scroll.length,
      smooth: stored?.scroll?.smooth ?? initialSceneDefaults.scroll.smooth,
    },
    // Read by the page, for the mute button.
    audioButton: {
      visible: stored?.audioButton?.visible ?? initialSceneDefaults.audioButton.visible,
      position: initialSceneDefaults.audioButton.position,
    },
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

export interface SceneViewerOptions {
  /** Plays without camera movement the visitor didn't ask for (prefers-reduced-motion). */
  reduceMotion?: boolean;
  /** Where Key Down and Key Up are listened for: the window unless given (an embed scopes keys to its element). */
  keyTarget?: PlayInputKeyTarget;
  /** Given, an Open Link action calls it instead of opening the link (an embed hands links to its page). */
  onOpenLink?: (url: string, newTab: boolean) => void;
  /** Whether sound starts muted (it does unless the page says otherwise: the visitor unmutes with the page's button). */
  muted?: boolean;
}

export class SceneViewer {
  /** The viewer's own renderer. Handed to what needs it here; the viewer never puts it on `window`. */
  readonly renderer: SceneRenderer;
  /** Whether the scene has a Scroll event that can run, so the page knows to make itself scrollable. */
  readonly hasScrollEvents: boolean;
  /** How much page scroll plays the Scroll events from start to end, in screen heights. */
  readonly scrollLength: number;
  /** Whether the scene plays any sound, so the page knows to show the mute button. */
  readonly hasSound: boolean;
  /** The mute button's settings (whether the author shows it, and where). */
  readonly audioButton: SceneSettingsConfig["audioButton"];
  // The scene's sound; none for a scene that plays none (no audio context is ever made then).
  private readonly audio: SceneAudio | null;
  private scrollTarget = 0; // the page's scroll progress, as last handed in
  private readonly disposers: (() => void)[] = [];
  private frameId = 0;
  private disposed = false;

  constructor(container: HTMLElement, content: StoredSceneContent, source: SceneSource, { reduceMotion = false, keyTarget, onOpenLink, muted = true }: SceneViewerOptions = {}) {
    const renderer = createSceneRenderer();
    this.renderer = renderer;
    container.appendChild(renderer.domElement);
    this.disposers.push(() => disposeSceneRenderer(renderer));
    const canvas = renderer.domElement;

    const settings = viewerSceneSettings(content.sceneSettings);
    const sceneManager = new SceneManager(settings, { editorHelpers: false });
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
    // What its actions ask of the page (open a link, play a sound), shared with the editor's Play.
    this.audio = hasSoundActions(content.animation?.events ?? {}) ? new SceneAudio({ loadAudio: (assetId) => source.loadAudio(assetId), muted }) : null;
    this.hasSound = this.audio !== null;
    this.audioButton = settings.audioButton;
    const effects = createPlayEffects({ onOpenLink, audio: this.audio });
    this.disposers.push(() => effects.dispose());
    const runtime = new SceneRuntime({ entities: drawn, animation: content.animation ?? {} }, { onEffect: effects.onEffect });
    runtime.start();
    this.hasScrollEvents = runtime.hasScrollEvents;
    this.scrollLength = settings.scroll.length;
    // Smoothing eases the shown progress toward the page's; reduced motion follows the page exactly.
    const smoothScroll = settings.scroll.smooth && !reduceMotion;
    let scrollShown = 0;

    const resize = () => {
      renderer.setSize(container.clientWidth, container.clientHeight, false);
      camera.setAspect(aspect());
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    this.disposers.push(() => observer.disconnect());

    // The pointer and key triggers; the cursor is a pointer over what has a pointer trigger (one test a frame).
    const raycaster = new THREE.Raycaster();
    const pick = (x: number, y: number) =>
      pickEntityAt(raycaster, camera.camera, canvas, [...objects.getMeshes().values()].filter((object) => object.visible), x, y, true);
    const input = attachPlayInput({ canvas, cursorElement: container, pick, getRuntime: () => runtime, keyTarget });
    this.disposers.push(() => input.detach());

    let lastTime = 0;
    const animate = () => {
      this.frameId = window.requestAnimationFrame(animate);
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      camera.update(dt);
      runtime.tick(dt);
      if (scrollShown !== this.scrollTarget) {
        scrollShown = easeScrollProgress(scrollShown, this.scrollTarget, dt, smoothScroll);
        runtime.setScrollProgress(scrollShown);
      }
      runtime.poses().forEach((pose, entityId) => objects.applyPose(entityId, pose));
      input.frame();

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

  /** Mutes or unmutes the scene's sound (faded). Unmuting must come from a click or key: browsers start sound only then. */
  setMuted(muted: boolean): void {
    this.audio?.setMuted(muted);
  }

  /** Whether the scene's sound is muted (a scene without sound counts as muted). */
  get isMuted(): boolean {
    return this.audio?.isMuted ?? true;
  }

  /**
   * The page's scroll progress, 0 to 1 (the share page's scroller; an embed's host may call this
   * itself). Only stored: the frame loop eases toward it and moves the Scroll events, and stops once
   * it has arrived, so calling this on every scroll event costs nothing more.
   */
  setScrollProgress(progress: number): void {
    this.scrollTarget = clampProgress(progress);
  }

  dispose(): void {
    this.disposed = true;
    window.cancelAnimationFrame(this.frameId);
    // Last in, first out: listeners and objects go before the renderer they draw with.
    for (const dispose of this.disposers.reverse()) dispose();
    this.disposers.length = 0;
  }
}
