import * as THREE from "three";
import { MeshBasicNodeMaterial, MeshStandardNodeMaterial } from "three/webgpu";
import { describe, expect, it } from "vitest";

import { initialSceneDefaults } from "../scene/defaults";
import { SceneManager } from "./SceneManager";

describe("SceneManager environment intensity", () => {
  // three only refreshes the uniform that carries the scene's environment intensity for an object
  // whose material changed, so a new intensity is also written where it looks (envMapIntensity).
  it("hands a new intensity to every lit material, so every object redraws with it", () => {
    const manager = new SceneManager(initialSceneDefaults, { editorHelpers: false });
    const lit = new MeshStandardNodeMaterial();
    const withOwnMap = new MeshStandardNodeMaterial({ envMap: new THREE.Texture(), envMapIntensity: 0.7 });
    const unlit = new MeshBasicNodeMaterial();
    manager.scene.add(new THREE.Mesh(new THREE.BoxGeometry(), lit), new THREE.Mesh(new THREE.BoxGeometry(), withOwnMap), new THREE.Mesh(new THREE.BoxGeometry(), unlit));

    manager.updateEnvironment(true, 0.25);

    expect(manager.scene.environmentIntensity).toBe(0.25);
    expect(lit.envMapIntensity).toBe(0.25);
    expect(withOwnMap.envMapIntensity).toBe(0.7); // its own map, its own intensity
    expect(unlit).not.toHaveProperty("envMapIntensity");
  });
});

describe("SceneManager ambient fill", () => {
  // Lambert, Phong and Toon don't take environment light, so with the ambient light turned off for
  // the environment they get its fill on their own (canvasOutput.ts reads it from the scene).
  it("hands Lambert, Phong and Toon the ambient light's fill while the environment replaces it", () => {
    const manager = new SceneManager(initialSceneDefaults, { editorHelpers: false });
    const fill = () => manager.scene.userData.libre3dAmbientFill;

    manager.updateEnvironment(false, 1);
    expect(fill()).toBe(0);

    manager.setEnvironmentMap(new THREE.Texture());
    manager.updateEnvironment(true, 1);
    expect(fill()).toBeCloseTo(initialSceneDefaults.lights.intensity * 1.5, 9);

    manager.updateLightIntensity(2);
    expect(fill()).toBeCloseTo(3, 9);
  });
});
