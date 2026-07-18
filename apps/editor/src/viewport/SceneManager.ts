import * as THREE from "three";
import { type EditorState } from "../store/useEditorStore";

export class SceneManager {
  public scene: THREE.Scene;
  private ambientLight: THREE.AmbientLight;
  public gridHelper: THREE.GridHelper;

  constructor(initialSettings: EditorState["sceneSettings"]) {
    this.scene = new THREE.Scene();

    const getSafeColor = (c: string) => {
      const colorStr = c || "#0b1020";
      return colorStr.startsWith("#") ? colorStr : "#" + colorStr;
    };

    const initialBgColor = new THREE.Color(getSafeColor(initialSettings.bgColor));
    this.scene.background = initialBgColor;

    if (initialSettings.fogEnabled) {
      this.scene.fog = new THREE.FogExp2(getSafeColor(initialSettings.bgColor), 0.05);
    }

    this.ambientLight = new THREE.AmbientLight(0xffffff, initialSettings.lights.intensity * 1.5);
    this.scene.add(this.ambientLight);

    // XZ-plane grid only. Grid lines are visible slate-blue; axes are red (X) and blue (Z).
    this.gridHelper = new THREE.GridHelper(20, 20, 0xffffff, 0xffffff);
    this.gridHelper.visible = initialSettings.showGrid !== false;
    this.colorAxes();
    this.scene.add(this.gridHelper);
  }

  /** Colour all grid lines a subtle visible shade, then paint the two centre-axis lines. */
  private colorAxes() {
    const colorAttr = this.gridHelper.geometry.attributes.color as THREE.BufferAttribute;
    const posAttr   = this.gridHelper.geometry.attributes.position as THREE.BufferAttribute;
    if (!colorAttr || !posAttr) return;

    const gridColor = new THREE.Color("#2a3f5f");  // visible blue-grey grid
    const red       = new THREE.Color("#ef4444");  // X axis
    const blue      = new THREE.Color("#3b82f6");  // Z axis

    // First pass: paint all lines with the grid colour
    for (let i = 0; i < colorAttr.count; i++) {
      colorAttr.setXYZ(i, gridColor.r, gridColor.g, gridColor.b);
    }

    // Second pass: highlight the two centre-axis lines
    const totalLines = posAttr.count / 2;
    for (let j = 0; j < totalLines; j++) {
      const i1 = j * 2;
      const i2 = j * 2 + 1;

      const x1 = posAttr.getX(i1), x2 = posAttr.getX(i2);
      const z1 = posAttr.getZ(i1), z2 = posAttr.getZ(i2);

      // Line lies along Z axis (x ≈ 0 for both vertices) → blue
      if (Math.abs(x1) < 0.001 && Math.abs(x2) < 0.001) {
        colorAttr.setXYZ(i1, blue.r, blue.g, blue.b);
        colorAttr.setXYZ(i2, blue.r, blue.g, blue.b);
      }
      // Line lies along X axis (z ≈ 0 for both vertices) → red
      else if (Math.abs(z1) < 0.001 && Math.abs(z2) < 0.001) {
        colorAttr.setXYZ(i1, red.r, red.g, red.b);
        colorAttr.setXYZ(i2, red.r, red.g, red.b);
      }
    }

    colorAttr.needsUpdate = true;
  }

  private getSafeColor(c: string) {
    const colorStr = c || "#0b1020";
    return colorStr.startsWith("#") ? colorStr : "#" + colorStr;
  }

  public updateBackground(color: string) {
    const nextColor = new THREE.Color(this.getSafeColor(color));
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
      const fogColor = new THREE.Color(this.getSafeColor(color));
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
    this.gridHelper.visible = visible;
  }

  public dispose() {
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.gridHelper);
    this.gridHelper.dispose();
  }
}
