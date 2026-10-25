import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The scene's environment light (sceneSettings.environment): three's RoomEnvironment, a grey room
 * with soft box lights, prefiltered for image-based lighting. Generated, so there's nothing to
 * download. It's three's port of the environment <model-viewer> calls "legacy", so the editor
 * lights Physical materials much as the published `/v/` page does.
 *
 * Needs the renderer (PMREMGenerator renders the room on the GPU), so it's made once per renderer.
 * Dispose the returned target with the renderer.
 */
export const createRoomEnvironment = (renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget => {
  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  // 0.04 is the blur three's own examples use for this room: soft enough that its lights read as
  // long, smooth highlights on glossy surfaces.
  const target = generator.fromScene(room, 0.04);
  room.dispose();
  generator.dispose();
  return target;
};
