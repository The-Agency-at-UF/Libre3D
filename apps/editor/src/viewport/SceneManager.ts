import * as THREE from "three";
import type { SceneSettingsConfig } from "../scene/types";
import { getSafeColor } from "../utils/sceneColor";
import { AMBIENT_FILL_KEY, canvasColor } from "./canvasOutput";
import { InfiniteGrid } from "./InfiniteGrid";

export class SceneManager {
  public scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  private lightIntensity: number;
  // The generated environment (sceneEnvironment.ts), once the renderer has made it, and whether the
  // scene settings want it shown.
  private environmentMap: THREE.Texture | null = null;
  private environmentEnabled: boolean;
  // The editor's grid. Null when the scene is built without the editor's helpers (the share-link viewer).
  public grid: InfiniteGrid | null = null;

  /** `editorHelpers: false` builds the scene without the editor's grid, for the share-link viewer. */
  constructor(initialSettings: SceneSettingsConfig, { editorHelpers = true }: { editorHelpers?: boolean } = {}) {
    this.scene = new THREE.Scene();

    const initialBgColor = canvasColor(new THREE.Color(getSafeColor(initialSettings.bgColor)));
    this.scene.background = initialBgColor;

    if (initialSettings.fogEnabled) {
      this.scene.fog = new THREE.FogExp2(getSafeColor(initialSettings.bgColor), 0.05);
    }

    this.lightIntensity = initialSettings.lights.intensity;
    this.environmentEnabled = initialSettings.environment.enabled;
    this.scene.environmentIntensity = initialSettings.environment.intensity;
    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);
    this.applyLighting();

    // Shader-drawn infinite XZ grid (X axis red, Z axis blue) — see InfiniteGrid.
    if (editorHelpers) {
      this.grid = new InfiniteGrid();
      this.grid.visible = initialSettings.showGrid !== false;
      this.scene.add(this.grid);
    }
  }

  public updateBackground(color: string) {
    // As the canvas takes it: three writes the background there without converting it.
    const nextColor = canvasColor(new THREE.Color(getSafeColor(color)));
    if (this.scene.background instanceof THREE.Color) {
      if (!this.scene.background.equals(nextColor)) {
        this.scene.background.set(nextColor);
      }
    } else {
      this.scene.background = nextColor;
    }
  }

  public updateFog(enabled: boolean, color: string) {
    if (enabled) {
      const fogColor = new THREE.Color(getSafeColor(color));
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.set(fogColor);
      } else {
        this.scene.fog = new THREE.FogExp2(fogColor, 0.05);
      }
    } else {
      this.scene.fog = null;
    }
  }

  public updateLightIntensity(intensity: number) {
    this.lightIntensity = intensity;
    this.applyLighting();
  }

  public updateEnvironment(enabled: boolean, intensity: number) {
    this.environmentEnabled = enabled;
    if (this.scene.environmentIntensity !== intensity) {
      this.scene.environmentIntensity = intensity;
      this.refreshEnvironmentIntensity(intensity);
    }
    this.applyLighting();
  }

  // Three hands a material the scene's environment intensity in a uniform it only refreshes for an
  // object whose material or matrix changed (NodeMaterialObserver), not when the scene's value
  // does: in the editor, which draws the same objects frame after frame, only the first object
  // drawn each frame took a new intensity. The observer does compare `envMapIntensity`, so every
  // material without an environment map of its own (which then ignores that value) is given it.
  private refreshEnvironmentIntensity(intensity: number) {
    this.scene.traverse((object) => {
      const material = (object as THREE.Mesh).material;
      for (const each of Array.isArray(material) ? material : material ? [material] : []) {
        const lit = each as THREE.MeshStandardMaterial;
        if ("envMapIntensity" in lit && !lit.envMap) lit.envMapIntensity = intensity;
      }
    });
  }

  /** The environment the renderer made (sceneEnvironment.ts), or null when it's gone. */
  public setEnvironmentMap(map: THREE.Texture | null) {
    this.environmentMap = map;
    this.applyLighting();
  }

  // The environment replaces the ambient light: it already fills the shadows (unevenly, as a room
  // does), and both together wash out dark materials. Only Physical materials take environment
  // light: Lambert, Phong and Toon don't, so they get the ambient light's fill on their own then.
  private applyLighting() {
    this.scene.environment = this.environmentEnabled ? this.environmentMap : null;
    const ambient = this.lightIntensity * 1.5;
    this.ambientLight.intensity = this.scene.environment ? 0 : ambient;
    // Lambert, Phong and Toon don't take environment light: with the ambient light off they'd lose
    // their fill and go darker, so they get it on their own (canvasOutput.ts).
    this.scene.userData[AMBIENT_FILL_KEY] = this.scene.environment ? ambient : 0;
  }

  public updateGridVisibility(visible: boolean) {
    if (this.grid) this.grid.visible = visible;
  }

  public dispose() {
    this.scene.remove(this.ambientLight);
    if (this.grid) {
      this.scene.remove(this.grid);
      this.grid.dispose();
    }
  }
}
