import * as THREE from "three";
import { describe, expect, it } from "vitest";

import { drawEditorOnlyObjects } from "./editorOverlay";
import type { SceneRenderer } from "./rendererSettings";

// A renderer that records what a render would have drawn, and how it was set up at that moment.
const recordingRenderer = () => {
  const seen: { drawn: string[]; background: unknown; autoClear: boolean }[] = [];
  const renderer = {
    autoClear: true,
    render(scene: THREE.Scene, camera: THREE.Camera) {
      const drawn: string[] = [];
      scene.traverse((object) => {
        if (object !== scene && object.layers.test(camera.layers)) drawn.push(object.name);
      });
      seen.push({ drawn, background: scene.background, autoClear: renderer.autoClear });
    },
  };
  return { renderer: renderer as unknown as SceneRenderer, seen };
};

const named = <T extends THREE.Object3D>(object: T, name: string, editorOnly = false): T => {
  object.name = name;
  if (editorOnly) object.userData.editorOnly = true;
  return object;
};

const makeScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#123456");
  const cube = named(new THREE.Mesh(), "cube");
  const outline = named(new THREE.LineSegments(), "outline", true);
  cube.add(outline);
  const gizmo = named(new THREE.Group(), "gizmo", true);
  const handle = named(new THREE.Mesh(), "handle");
  gizmo.add(handle);
  scene.add(cube, gizmo, named(new THREE.Mesh(), "sphere"));
  return { scene, cube, outline, handle };
};

describe("drawEditorOnlyObjects", () => {
  it("draws the editor's objects and everything under them, and nothing else", () => {
    const { scene } = makeScene();
    const { renderer, seen } = recordingRenderer();

    drawEditorOnlyObjects(renderer, scene, new THREE.PerspectiveCamera());

    expect(seen).toHaveLength(1);
    expect(seen[0].drawn.sort()).toEqual(["gizmo", "handle", "outline"]);
  });

  it("draws over what is on the canvas: no clearing and no background", () => {
    const { scene } = makeScene();
    const { renderer, seen } = recordingRenderer();

    drawEditorOnlyObjects(renderer, scene, new THREE.PerspectiveCamera());

    expect(seen[0]).toMatchObject({ background: null, autoClear: false });
  });

  it("leaves the scene, the camera and the renderer as they were", () => {
    const { scene, cube, outline } = makeScene();
    const { renderer } = recordingRenderer();
    const camera = new THREE.PerspectiveCamera();
    const background = scene.background;
    const layers = camera.layers.mask;

    drawEditorOnlyObjects(renderer, scene, camera);

    expect(scene.background).toBe(background);
    expect(camera.layers.mask).toBe(layers);
    expect(renderer.autoClear).toBe(true);
    // Still on three's default layer, which normal renders and raycasts use.
    expect([cube, outline].every((object) => object.layers.test(camera.layers))).toBe(true);
  });

  it("puts things back when the render throws", () => {
    const { scene } = makeScene();
    const camera = new THREE.PerspectiveCamera();
    const background = scene.background;
    const renderer = {
      autoClear: true,
      render() {
        throw new Error("lost");
      },
    };

    expect(() => drawEditorOnlyObjects(renderer as unknown as SceneRenderer, scene, camera)).toThrow("lost");
    expect(scene.background).toBe(background);
    expect(camera.layers.mask).toBe(new THREE.Layers().mask);
    expect(renderer.autoClear).toBe(true);
  });
});
