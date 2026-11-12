import type * as THREE from "three";
import { PMREMGenerator } from "three/webgpu";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { SceneRenderer } from "./rendererSettings";

/**
 * The scene's environment light (sceneSettings.environment): three's RoomEnvironment, a grey room
 * with soft box lights, prefiltered for image-based lighting. Generated, so there's nothing to
 * download. It's three's port of the environment <model-viewer> calls "legacy", so the editor
 * lights Physical materials much as the published `/v/` page does.
 *
 * Needs the renderer (PMREMGenerator renders the room on the GPU), so it's made once per renderer,
 * and only after `renderer.init()` has finished. Dispose the returned target with the renderer.
 */
export const createRoomEnvironment = (renderer: SceneRenderer): THREE.RenderTarget => {
  const generator = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  // 0.04 is the blur three's own examples use for this room: soft enough that its lights read as
  // long, smooth highlights on glossy surfaces.
  const target = generator.fromScene(room, 0.04);
  room.dispose();
  generator.dispose();
  return target;
};
