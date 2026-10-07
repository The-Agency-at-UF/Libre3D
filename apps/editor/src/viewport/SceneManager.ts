import * as THREE from "three";
import { type EditorState } from "../store/useEditorStore";
import { getSafeColor } from "../utils/sceneColor";
import { InfiniteGrid } from "./InfiniteGrid";

export class SceneManager {
  public scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  public grid: InfiniteGrid;

  constructor(initialSettings: EditorState["sceneSettings"]) {
    this.scene = new THREE.Scene();

    const initialBgColor = new THREE.Color(getSafeColor(initialSettings.bgColor));
    this.scene.background = initialBgColor;

    if (initialSettings.fogEnabled) {
      this.scene.fog = new THREE.FogExp2(getSafeColor(initialSettings.bgColor), 0.05);
    }

    this.ambientLight = new THREE.AmbientLight(0xffffff, initialSettings.lights.intensity * 1.5);
    this.scene.add(this.ambientLight);

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
    this.ambientLight.intensity = intensity * 1.5;
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
