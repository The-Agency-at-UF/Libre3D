import * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useEditorStore, type EntityType } from "../store/useEditorStore";
import { prepareModelImport } from "./importModel";

// DEV-ONLY viewport performance harness. Installed from main.tsx behind
// `import.meta.env.DEV` via a dynamic import, so none of this reaches a
// production bundle. Exposed as `window.__libre3dPerf` for use from the
// devtools console (or browser automation):
//
//   await __libre3dPerf.addPrimitives(400)
//   await __libre3dPerf.importGlb(await __libre3dPerf.generateHeavyGlb())
//   await __libre3dPerf.measure({ orbit: true, durationMs: 15000 })
//
// FPS is measured from requestAnimationFrame timestamps (the same signal the
// stats.js overlay uses), so it's capped at the display refresh rate. Render
// CPU time is reported alongside it to show headroom below that cap.

type Vector3Tuple = [number, number, number];

// Must match the persist `name` in useEditorStore.
const PERSIST_KEY = "libre3d-scene-state";

interface ViewportDevHandle {
  cameraRef: React.RefObject<THREE.Camera>;
  orbitControlsRef: React.RefObject<OrbitControls | null>;
}

interface MeasureOptions {
  durationMs?: number;
  warmupMs?: number;
  // Continuously orbit the camera around its target, driven through
  // OrbitControls.update() so it fires the same "change" path as a drag.
  orbit?: boolean;
  orbitDegreesPerSecond?: number;
  // Continuously move this entity through updateEntityTransform, the same
  // store action a gizmo drag writes through.
  transformEntityId?: string;
  // Start every run from the same view — draw calls and triangles drawn vary
  // a lot with what's in frame, so runs aren't comparable without this.
  cameraPosition?: Vector3Tuple;
  cameraTarget?: Vector3Tuple;
  // A/B experiment: also write the camera profile to the store synchronously
  // on every OrbitControls "change" event — what useViewportControls would do
  // without its once-per-frame coalescing (profileCommitFrameRef). Expect it
  // to CRASH the editor during a real drag: React aborts with "Maximum update
  // depth exceeded" (thrown from updateProfileData) and the app unmounts —
  // most likely because the write re-renders ViewportCanvas, whose camera-sync
  // effect calls orbitControls.update(), which fires "change" again mid-drag.
  // Reload afterwards.
  emulateUncoalescedCameraWrites?: boolean;
}

// A frame gap this long means the browser stopped delivering frames (window
// occluded/minimized, display asleep) — the run is not a valid FPS sample.
const STALL_MS = 250;

const getRenderer = () =>
  (window as unknown as { __libre3dRenderer?: THREE.WebGLRenderer }).__libre3dRenderer ?? null;

const getScene = () => (window as unknown as { __libre3dScene?: THREE.Scene }).__libre3dScene ?? null;

const getViewport = () =>
  (window as unknown as { __libre3dViewport?: ViewportDevHandle }).__libre3dViewport ?? null;

const nextFrame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const percentile = (values: number[], p: number) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
};

const round = (value: number, digits = 2) => Number(value.toFixed(digits));

const isEditorOnly = (object: THREE.Object3D) => {
  for (let node: THREE.Object3D | null = object; node; node = node.parent) {
    if (node.userData.editorOnly) return true;
  }
  return false;
};

export function environment() {
  const renderer = getRenderer();
  const gl = renderer?.getContext();
  const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
  const drawingBuffer = renderer ? renderer.getDrawingBufferSize(new THREE.Vector2()) : null;
  return {
    userAgent: navigator.userAgent,
    gpu: gl ? String(gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER)) : null,
    gpuVendor: gl ? String(gl.getParameter(debugInfo ? debugInfo.UNMASKED_VENDOR_WEBGL : gl.VENDOR)) : null,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemoryGb: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? null,
    devicePixelRatio: window.devicePixelRatio,
    drawingBuffer: drawingBuffer ? `${drawingBuffer.x}x${drawingBuffer.y}` : null,
    visibilityState: document.visibilityState,
    hasFocus: document.hasFocus(),
  };
}

export function sceneStats() {
  const { entities } = useEditorStore.getState();
  const entitiesByType: Record<string, number> = {};
  for (const entity of entities) {
    entitiesByType[entity.type] = (entitiesByType[entity.type] ?? 0) + 1;
  }

  let meshCount = 0;
  let contentTriangles = 0;
  const materials = new Set<THREE.Material>();
  getScene()?.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || isEditorOnly(object)) return;
    const geometry = mesh.geometry as THREE.BufferGeometry;
    const vertexCount = geometry.index ? geometry.index.count : geometry.attributes.position?.count ?? 0;
    meshCount++;
    contentTriangles += Math.floor(vertexCount / 3);
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) => materials.add(material));
  });
  // Transmissive materials make three.js render the opaque scene a second
  // time into a transmission target, so they're called out separately.
  const transmissiveMaterials = [...materials].filter(
    (material) => ((material as THREE.MeshPhysicalMaterial).transmission ?? 0) > 0,
  ).length;
  const transparentMaterials = [...materials].filter((material) => material.transparent).length;

  const info = getRenderer()?.info;
  return {
    entityCount: entities.length,
    entitiesByType,
    meshCount,
    materialCount: materials.size,
    transparentMaterials,
    transmissiveMaterials,
    // Every mesh triangle in the scene, excluding editor-only helpers (gizmo).
    contentTriangles,
    // What the last renderer.render() call actually drew (after frustum culling,
    // including grid/gizmo/outlines).
    lastFrameTrianglesDrawn: info?.render.triangles ?? null,
    lastFrameDrawCalls: info?.render.calls ?? null,
    gpuGeometries: info?.memory.geometries ?? null,
    gpuTextures: info?.memory.textures ?? null,
    persistedStateBytes: localStorage.getItem(PERSIST_KEY)?.length ?? 0,
  };
}

// Lays primitives out on a grid so they're all in view and not overlapping.
export async function addPrimitives(count: number, spacing = 2.5): Promise<string[]> {
  const types: EntityType[] = ["cube", "sphere", "torus"];
  const side = Math.ceil(Math.sqrt(count));
  const temporal = useEditorStore.temporal.getState();
  temporal.pause();
  const ids: string[] = [];
  try {
    for (let i = 0; i < count; i++) {
      const store = useEditorStore.getState();
      const id = store.addEntity(types[i % types.length]);
      const row = Math.floor(i / side);
      const column = i % side;
      store.updateEntityTransform(id, {
        position: [(column - side / 2) * spacing, 0.5, (row - side / 2) * spacing],
      });
      ids.push(id);
    }
  } finally {
    temporal.resume();
  }
  useEditorStore.getState().selectEntity(null);
  await nextFrame();
  return ids;
}

// Builds a synthetic multi-mesh .glb in memory: a nested hierarchy of dense
// meshes with a few distinct materials. Used when no large real-world asset is
// at hand; importGlb() also accepts a URL to a real file.
export async function generateHeavyGlb({
  groups = 6,
  meshesPerGroup = 8,
  tubularSegments = 400,
  radialSegments = 48,
}: {
  groups?: number;
  meshesPerGroup?: number;
  tubularSegments?: number;
  radialSegments?: number;
} = {}): Promise<File> {
  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
  const root = new THREE.Group();
  root.name = "PerfHeavyModel";
  const palette = [0xd9534f, 0x5bc0de, 0x5cb85c, 0xf0ad4e, 0x9b59b6, 0xecf0f1];

  for (let g = 0; g < groups; g++) {
    const group = new THREE.Group();
    group.name = `Group_${g}`;
    group.position.set((g - groups / 2) * 3, 1.5, -6);
    root.add(group);
    for (let m = 0; m < meshesPerGroup; m++) {
      const geometry = new THREE.TorusKnotGeometry(0.5, 0.15, tubularSegments, radialSegments, 2 + (m % 3), 3 + (m % 4));
      const material = new THREE.MeshStandardMaterial({
        color: palette[(g + m) % palette.length],
        roughness: 0.4,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `Knot_${g}_${m}`;
      mesh.position.set(0, m * 1.4, 0);
      mesh.rotation.set(m * 0.3, g * 0.5, 0);
      group.add(mesh);
    }
  }

  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(root, { binary: true });
  if (!(result instanceof ArrayBuffer)) throw new Error("GLTFExporter did not return a binary .glb");
  return new File([result], "perf-heavy.glb", { type: "model/gltf-binary" });
}

// Imports through the same prepareModelImport → addImportedModelHierarchy path
// as a drag-and-drop, then waits for the model's meshes to appear in the scene.
export async function importGlb(source: File | string, timeoutMs = 60000): Promise<string> {
  let file: File;
  if (typeof source === "string") {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Failed to fetch ${source}: ${response.status}`);
    file = new File([await response.arrayBuffer()], source.split("/").pop() || "model.glb");
  } else {
    file = source;
  }

  const trianglesBefore = sceneStats().contentTriangles;
  const store = useEditorStore.getState();
  store.adjustPendingImports(1);
  let rootId: string;
  try {
    const { assetId, nodes } = await prepareModelImport(file);
    rootId = useEditorStore.getState().addImportedModelHierarchy(assetId, nodes);
  } finally {
    useEditorStore.getState().adjustPendingImports(-1);
  }

  const start = performance.now();
  let lastTriangles = trianglesBefore;
  let stableSince = performance.now();
  while (performance.now() - start < timeoutMs) {
    await nextFrame();
    const triangles = sceneStats().contentTriangles;
    if (triangles !== lastTriangles) {
      lastTriangles = triangles;
      stableSince = performance.now();
    } else if (triangles > trianglesBefore && performance.now() - stableSince > 1000) {
      break;
    }
  }
  useEditorStore.getState().selectEntity(null);
  return rootId;
}

export async function measure({
  durationMs = 10000,
  warmupMs = 1000,
  orbit = true,
  orbitDegreesPerSecond = 60,
  transformEntityId,
  cameraPosition,
  cameraTarget,
  emulateUncoalescedCameraWrites = false,
}: MeasureOptions = {}) {
  const renderer = getRenderer();
  const viewport = getViewport();
  const controls = viewport?.orbitControlsRef.current;
  if (!renderer || !viewport || !controls) throw new Error("Viewport not mounted (renderer/controls missing)");

  const transformBase = transformEntityId
    ? useEditorStore.getState().entities.find((entity) => entity.id === transformEntityId)?.position
    : undefined;
  if (transformEntityId && !transformBase) throw new Error(`Entity ${transformEntityId} not found`);

  if (cameraPosition || cameraTarget) {
    if (cameraTarget) controls.target.set(...cameraTarget);
    if (cameraPosition) viewport.cameraRef.current.position.set(...cameraPosition);
    controls.update();
    // Let the coalesced profile write and React's camera sync settle.
    await nextFrame();
    await nextFrame();
  }

  const temporal = useEditorStore.temporal.getState();
  const historyBefore = temporal.pastStates.length;

  const frameTimes: number[] = [];
  const renderCpuTimes: number[] = [];
  let isRecording = false;
  let orbitChangeEvents = 0;
  let cameraStoreWrites = 0;
  let entityStoreWrites = 0;

  // Time each renderer.render() the app's own loop makes. WebGLRenderer assigns
  // render as an instance property in its constructor, so restore by
  // reassigning the original (deleting it would remove render entirely).
  const originalRender = renderer.render;
  renderer.render = function (this: THREE.WebGLRenderer, scene: THREE.Object3D, camera: THREE.Camera) {
    const t0 = performance.now();
    originalRender.call(this, scene, camera);
    if (isRecording) renderCpuTimes.push(performance.now() - t0);
  };

  const handleChange = () => {
    if (isRecording) orbitChangeEvents++;
    if (emulateUncoalescedCameraWrites) {
      const camera = viewport.cameraRef.current;
      const state = useEditorStore.getState();
      state.updateProfileData(state.activeProfileId, {
        position: [camera.position.x, camera.position.y, camera.position.z],
        target: [controls.target.x, controls.target.y, controls.target.z],
      });
    }
  };
  controls.addEventListener("change", handleChange);
  const unsubscribeCamera = useEditorStore.subscribe(
    (state) => state.cameraProfiles,
    () => {
      if (isRecording) cameraStoreWrites++;
    },
  );
  const unsubscribeEntities = useEditorStore.subscribe(
    (state) => state.entities,
    () => {
      if (isRecording) entityStoreWrites++;
    },
  );

  if (transformEntityId) useEditorStore.getState().selectEntity(transformEntityId);

  const upAxis = new THREE.Vector3(0, 1, 0);
  const offset = new THREE.Vector3();

  try {
    const start = await nextFrame();
    let previous = start;
    let transformWrites = 0;

    while (true) {
      const now = await nextFrame();
      const elapsed = now - start;
      const dt = now - previous;
      previous = now;

      if (elapsed >= warmupMs + durationMs) break;
      if (elapsed >= warmupMs) {
        if (isRecording) frameTimes.push(dt);
        isRecording = true;
      }

      if (orbit) {
        const camera = viewport.cameraRef.current;
        offset.subVectors(camera.position, controls.target);
        offset.applyAxisAngle(upAxis, THREE.MathUtils.degToRad(orbitDegreesPerSecond) * (dt / 1000));
        camera.position.copy(controls.target).add(offset);
        controls.update();
      }

      if (transformEntityId && transformBase) {
        const phase = elapsed / 1000;
        const position: Vector3Tuple = [
          transformBase[0] + Math.sin(phase * 2) * 2,
          transformBase[1] + Math.abs(Math.sin(phase * 3)),
          transformBase[2] + Math.cos(phase * 2) * 2,
        ];
        useEditorStore.getState().updateEntityTransform(transformEntityId, { position });
        // Match a real gizmo drag: the first write lands in history, the rest
        // of the drag is paused (see useViewportControls "objectChange").
        if (transformWrites++ === 0) temporal.pause();
      }
    }
  } finally {
    isRecording = false;
    renderer.render = originalRender;
    controls.removeEventListener("change", handleChange);
    unsubscribeCamera();
    unsubscribeEntities();
    if (transformEntityId) {
      temporal.resume();
      useEditorStore.getState().updateEntityTransform(transformEntityId, { position: transformBase });
    }
  }

  const frames = frameTimes.length;
  const worstOnePercent = [...frameTimes].sort((a, b) => b - a).slice(0, Math.max(1, Math.ceil(frames * 0.01)));
  const recordedSeconds = sum(frameTimes) / 1000;

  const stalledFrames = frameTimes.filter((time) => time > STALL_MS).length;

  return {
    conditions: {
      durationMs,
      warmupMs,
      orbit,
      orbitDegreesPerSecond: orbit ? orbitDegreesPerSecond : null,
      transformEntityId: transformEntityId ?? null,
      emulateUncoalescedCameraWrites,
    },
    // False if the browser paused frame delivery mid-run; discard such runs.
    isValid: stalledFrames === 0 && document.visibilityState === "visible",
    stalledFrames,
    frames,
    averageFps: round(frames / recordedSeconds),
    // Mean FPS over the slowest 1% of frames.
    onePercentLowFps: round(1000 / (sum(worstOnePercent) / worstOnePercent.length)),
    frameTimeMs: {
      p50: round(percentile(frameTimes, 50)),
      p95: round(percentile(frameTimes, 95)),
      p99: round(percentile(frameTimes, 99)),
      max: round(Math.max(...frameTimes)),
    },
    framesOver20Ms: frameTimes.filter((time) => time > 20).length,
    renderCpuMs: {
      calls: renderCpuTimes.length,
      mean: round(sum(renderCpuTimes) / Math.max(1, renderCpuTimes.length)),
      p99: round(percentile(renderCpuTimes, 99)),
    },
    perFrame: {
      // Should be ~1. Near 0 means the viewport wasn't actually drawing
      // (preview mode, or a thrown render), so the FPS figure is meaningless.
      renderCalls: round(renderCpuTimes.length / Math.max(1, frames)),
      orbitChangeEvents: round(orbitChangeEvents / Math.max(1, frames)),
      cameraStoreWrites: round(cameraStoreWrites / Math.max(1, frames)),
      entityStoreWrites: round(entityStoreWrites / Math.max(1, frames)),
    },
    undoHistoryEntriesAdded: useEditorStore.temporal.getState().pastStates.length - historyBefore,
    scene: sceneStats(),
    environment: environment(),
  };
}

// Synchronous cost of one camera-profile store write (set → persist to
// localStorage → zundo history → subscribers). React's re-render is scheduled
// separately and not included. Restores the camera profile afterwards.
export function measureCameraStoreWriteCost(samples = 100) {
  const state = useEditorStore.getState();
  const profileId = state.activeProfileId;
  const original = state.cameraProfiles[profileId];
  const times: number[] = [];
  for (let i = 0; i < samples; i++) {
    const nudge = i % 2 === 0 ? 1e-4 : 0;
    const t0 = performance.now();
    useEditorStore.getState().updateProfileData(profileId, {
      position: [original.position[0] + nudge, original.position[1], original.position[2]],
    });
    times.push(performance.now() - t0);
  }
  useEditorStore.getState().updateProfileData(profileId, { position: original.position });
  return {
    samples,
    meanMs: round(sum(times) / samples, 3),
    p95Ms: round(percentile(times, 95), 3),
    persistedStateBytes: localStorage.getItem(PERSIST_KEY)?.length ?? 0,
    entityCount: useEditorStore.getState().entities.length,
  };
}

export function installPerfHarness() {
  (window as unknown as Record<string, unknown>).__libre3dPerf = {
    addPrimitives,
    generateHeavyGlb,
    importGlb,
    measure,
    measureCameraStoreWriteCost,
    sceneStats,
    environment,
  };
}
