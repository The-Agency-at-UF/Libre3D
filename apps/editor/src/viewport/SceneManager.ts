import * as THREE from "three";
import { type EditorState } from "../store/useEditorStore";
import { getSafeColor } from "../utils/sceneColor";
import { InfiniteGrid } from "./InfiniteGrid";

export class SceneManager {
  public scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  private lightIntensity: number;
  // The generated environment (sceneEnvironment.ts), once the renderer has made it, and whether the
  // scene settings want it shown.
  private environmentMap: THREE.Texture | null = null;
  private environmentEnabled: boolean;
  public grid: InfiniteGrid;

  constructor(initialSettings: EditorState["sceneSettings"]) {
    this.scene = new THREE.Scene();

    const initialBgColor = new THREE.Color(getSafeColor(initialSettings.bgColor));
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
    this.grid = new InfiniteGrid();
    this.grid.visible = initialSettings.showGrid !== false;
    this.scene.add(this.grid);
  }

  public updateBackground(color: string) {
    const nextColor = new THREE.Color(getSafeColor(color));
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
    this.scene.environmentIntensity = intensity;
    this.applyLighting();
  }

  /** The environment the renderer made (sceneEnvironment.ts), or null when it's gone. */
  public setEnvironmentMap(map: THREE.Texture | null) {
    this.environmentMap = map;
    this.applyLighting();
  }

  // The environment replaces the ambient light: it already fills the shadows (unevenly, as a room
  // does), and both together wash out dark materials. Only Physical materials take environment
  // light, so Lambert, Phong and Toon are lit by the directional lights alone while it's on.
  private applyLighting() {
    this.scene.environment = this.environmentEnabled ? this.environmentMap : null;
    this.ambientLight.intensity = this.scene.environment ? 0 : this.lightIntensity * 1.5;
  }

  public updateGridVisibility(visible: boolean) {
    this.grid.visible = visible;
  }

  public dispose() {
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.grid);
    this.grid.dispose();
  }
}
