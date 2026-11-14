/**
 * PURPOSE: The shaderball: a picture of a layer stack on a sphere, for the Material Builder
 * (components/inspector/MaterialBuilder.tsx).
 *
 * INPUT: A 2D canvas to draw into, the layers to show, and drags that turn the view.
 * OUTPUT: The ball drawn into the canvas whenever its layers, a picture it was waiting for, or the
 * view changes, and at no other time.
 *
 * It's drawn by the editor's own renderer, as the gallery picture is (thumbnailCapture.ts): a
 * second renderer per preview would cost a GPU context each, and browsers cap those. A preview that
 * has changed asks for a picture; the render loop (useViewportRenderer) draws its small scene on its
 * next frame, just before the frame's normal render paints the viewport over it, and the middle of
 * the canvas is copied out in that same frame. While nothing changes, nothing is drawn.
 *
 * The ball is an ordinary sphere entity built by an ObjectManager of its own, so it is shaded by
 * the same code as the scene's objects, under the scene's environment light and one light of its
 * own. `dispose` frees its geometry, material and textures.
 *
 * Editor-only: the share-link viewer never loads this file.
 */

import * as THREE from "three";
import { createEntity } from "../scene/entityFactories";
import type { Entity, MaterialLayer } from "../scene/types";
import { loadTextureForScene } from "../utils/assetTransfers";
import { AMBIENT_FILL_KEY, canvasColor } from "./canvasOutput";
import { getLiveRenderer, getLiveScene } from "./liveViewport";
import { ObjectManager } from "./ObjectManager";
import type { SceneRenderer } from "./rendererSettings";

const BALL_ID = "material-preview-ball";
// How much of the picture the ball fills, and how far the camera sits from it, in ball radii.
const FILL = 0.82;
const DISTANCE = 4;
// The view can be turned all the way round, and up or down to just short of the poles.
const MAX_PITCH = Math.PI / 2 - 0.05;

const waiting = new Set<MaterialPreview>();

/** Whether a preview is waiting for the next frame. */
export const hasPendingPreviews = (): boolean => waiting.size > 0;

/** Called by the render loop, before the frame's normal render: draws every waiting preview. */
export const renderPendingPreviews = (renderer: SceneRenderer): void => {
  const previews = [...waiting];
  waiting.clear();
  previews.forEach((preview) => preview.draw(renderer));
};

export class MaterialPreview {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  private readonly ambient = new THREE.AmbientLight(0xffffff, 0);
  private readonly objects: ObjectManager;
  private readonly light: Entity = { ...createEntity("directionalLight"), id: "material-preview-light", position: [3, 4, 5] };
  private ball: Entity = { ...createEntity("sphere"), id: BALL_ID, position: [0, 0, 0], rotation: [0, 0, 0] };
  private yaw = 0.5;
  private pitch = 0.35;
  private disposed = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    layers: MaterialLayer[],
  ) {
    this.scene.add(this.ambient);
    this.objects = new ObjectManager(
      this.scene,
      new Map(),
      {
        getEntities: () => this.entities(),
        isWireframe: () => false,
        loadModel: async () => null,
        // A picture arrives after the frame that asked for it: draw again once it's here.
        loadTexture: async (assetId) => {
          const blob = await loadTextureForScene(assetId);
          setTimeout(() => this.request(), 0);
          return blob;
        },
        saveTexture: async () => {},
        setMaterialLayers: () => {},
      },
      { getRenderer: getLiveRenderer, editorHelpers: false },
    );
    this.setLayers(layers);
  }

  private entities(): Entity[] {
    return [this.ball, this.light];
  }

  private request(): void {
    if (!this.disposed) waiting.add(this);
  }

  /** Shows another stack (or the same one, edited). */
  public setLayers(layers: MaterialLayer[]): void {
    if (this.ball.materialLayers === layers) return;
    this.ball = { ...this.ball, materialLayers: layers };
    this.request();
  }

  /** Turns the view by a drag of `dx`, `dy` pixels. */
  public orbit(dx: number, dy: number): void {
    this.yaw -= dx * 0.01;
    this.pitch = Math.min(MAX_PITCH, Math.max(-MAX_PITCH, this.pitch + dy * 0.01));
    this.request();
  }

  /** Draws the ball with `renderer` and copies it into the canvas. The render loop calls this. */
  public draw(renderer: SceneRenderer): void {
    if (this.disposed) return;
    const source = renderer.domElement;
    const context = this.canvas.getContext("2d");
    if (!context || source.width === 0 || source.height === 0) return;

    this.objects.syncMeshes(this.entities(), null, false);
    const ball = this.objects.getObject(BALL_ID) as THREE.Mesh | undefined;
    if (!ball) return;

    // Lit as the scene is: its environment, and the fill its other lighting models get.
    const live = getLiveScene();
    const liveAmbient = live?.children.find((child): child is THREE.AmbientLight => child instanceof THREE.AmbientLight);
    this.scene.environment = live?.environment ?? null;
    this.scene.environmentIntensity = live?.environmentIntensity ?? 1;
    this.scene.userData[AMBIENT_FILL_KEY] = live?.userData[AMBIENT_FILL_KEY] ?? 0;
    this.ambient.intensity = liveAmbient?.intensity ?? 1;
    // Behind the ball, the colour the canvas has in the page.
    this.scene.background = canvasColor(new THREE.Color().setStyle(getComputedStyle(this.canvas).backgroundColor || "#181820"));

    ball.geometry.computeBoundingSphere();
    const radius = (ball.geometry.boundingSphere?.radius ?? 1) * Math.max(...ball.scale.toArray());
    const distance = radius * DISTANCE;
    this.camera.position.set(
      distance * Math.cos(this.pitch) * Math.sin(this.yaw),
      distance * Math.sin(this.pitch),
      distance * Math.cos(this.pitch) * Math.cos(this.yaw),
    );
    this.camera.lookAt(0, 0, 0);
    // The ball fills the square cut from the middle of the canvas, whichever way the canvas is longer.
    const aspect = source.width / source.height;
    const squareHalfAngle = Math.atan(radius / FILL / distance);
    const verticalHalfAngle = aspect >= 1 ? squareHalfAngle : Math.atan(Math.tan(squareHalfAngle) / aspect);
    this.camera.fov = THREE.MathUtils.radToDeg(verticalHalfAngle * 2);
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    renderer.render(this.scene, this.camera);

    const side = Math.min(source.width, source.height);
    context.drawImage(source, (source.width - side) / 2, (source.height - side) / 2, side, side, 0, 0, this.canvas.width, this.canvas.height);
  }

  public dispose(): void {
    this.disposed = true;
    waiting.delete(this);
    // Syncing to no objects disposes them all (geometry, materials, textures).
    this.objects.syncMeshes([], null, false);
    this.scene.environment = null;
  }
}
