import * as THREE from "three";
import type { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// The live WebGLRenderer, exposed on window by useViewportRenderer the same way
// window.__libre3dScene exposes the live scene (see conventions.md §5 — reuse
// this sanctioned escape hatch for reaching viewport singletons from non-
// component code rather than inventing a second mechanism). KTX2Loader needs it
// to probe which GPU-compressed texture formats this device supports.
type LiveRendererWindow = Window & {
  __libre3dRenderer?: THREE.WebGLRenderer | null;
};

const getLiveRenderer = (): THREE.WebGLRenderer | null => {
  if (typeof window === "undefined") return null;
  return (window as LiveRendererWindow).__libre3dRenderer ?? null;
};

// Builds a GLTFLoader wired for the three compressed-asset extensions a modern
// exporter is likely to emit: Draco (KHR_draco_mesh_compression) and Meshopt
// (EXT_meshopt_compression) for geometry, KTX2/Basis (KHR_texture_basisu) for
// textures. Exporters declare these as *required* extensions, so without the
// matching decoder registered GLTFLoader.parse() throws outright rather than
// degrading — every call site that parses a .glb must go through here.
//
// Loaders are dynamically imported (matching the pre-existing lazy-load of
// GLTFLoader) so none of this decoder code lands in the main bundle; it's only
// pulled in the first time something actually imports a model.
export async function createConfiguredGltfLoader(): Promise<GLTFLoader> {
  const [{ GLTFLoader }, { DRACOLoader }, { KTX2Loader }, { MeshoptDecoder }] = await Promise.all([
    import("three/examples/jsm/loaders/GLTFLoader.js"),
    import("three/examples/jsm/loaders/DRACOLoader.js"),
    import("three/examples/jsm/loaders/KTX2Loader.js"),
    import("three/examples/jsm/libs/meshopt_decoder.module.js"),
  ]);

  const loader = new GLTFLoader();

  // Draco + Meshopt have no renderer dependency, so they register
  // unconditionally. Decoder/transcoder assets are served from public/ (Vite
  // serves it at the site root) — point at those runtime URLs, not node_modules.
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/gltf/");
  loader.setDRACOLoader(dracoLoader);

  loader.setMeshoptDecoder(MeshoptDecoder);

  // KTX2Loader.detectSupport() needs a real WebGLRenderer to query supported
  // compressed-texture formats before it can transcode. If the viewport hasn't
  // mounted yet (shouldn't normally happen on an import), skip KTX2 for this
  // parse rather than throw — a KTX2-textured .glb will fail, but loudly and
  // diagnosably instead of silently.
  const renderer = getLiveRenderer();
  if (renderer) {
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath("/basis/");
    ktx2Loader.detectSupport(renderer);
    loader.setKTX2Loader(ktx2Loader);
  } else {
    console.warn(
      "[Libre3D] WebGLRenderer not available while configuring GLTFLoader; " +
        "KTX2/Basis-compressed textures will fail to transcode for this parse.",
    );
  }

  return loader;
}
