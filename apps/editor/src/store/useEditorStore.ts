import { create } from "zustand";
import { persist, createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import { temporal } from "zundo";
import { getDescendantIds, getChildren, filterMoveRoots, canReparentEntities } from "./entityIndex";
import { createId } from "../utils/createId";
import { deleteModelAsset } from "../utils/modelAssetStore";
import {
  getEntityWorldMatrix,
  solveLocalFromWorld,
  makeTranslationMatrix,
  getWorldPosition,
  type EntityTRS,
} from "../utils/entityTransforms";

export type EntityType = "cube" | "sphere" | "torus" | "directionalLight" | "importedModel" | "group";

export type MaterialLayerType = "color" | "lighting" | "image";
export type LightingModel = "none" | "lambert" | "phong" | "physical" | "toon";

// Which glTF texture channel an ImageLayer feeds. "metallicRoughness" is a
// single packed map (green = roughness, blue = metalness) that Three assigns to
// both material.roughnessMap and material.metalnessMap — one layer covers both,
// never split into two.
export type ImageSlot = "color" | "normal" | "metallicRoughness" | "emissive" | "ao";

export interface ColorLayer {
  id: string;
  type: "color";
  enabled: boolean;
  opacity: number; // 0-1
  color: string;
}

export interface LightingLayer {
  id: string;
  type: "lighting";
  enabled: boolean;
  opacity: number;
  model: LightingModel;
  roughness: number; // only meaningful when model === "physical"
  metalness: number; // only meaningful when model === "physical"
  shininess: number; // only meaningful when model === "phong"
  emissive: string;
  emissiveIntensity: number; // ignored when model === "none"
}

// A texture map layer, derived from an imported glTF material's maps. The pixel
// data is never stored here (materialLayers is persisted to localStorage) — it
// lives in the OPFS texture asset store, referenced by textureAssetId. wrapS/wrapT
// are the THREE wrap constants copied straight off the source texture.
export interface ImageLayer {
  id: string;
  type: "image";
  enabled: boolean;
  opacity: number;
  textureAssetId: string;
  slot: ImageSlot;
  wrapS: number;
  wrapT: number;
}

export type MaterialLayer = ColorLayer | LightingLayer | ImageLayer;

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color?: string;
  materialLayers?: MaterialLayer[];
  assetId?: string;
  sourceFileName?: string;
  visible: boolean;
  locked: boolean;
  parentId?: string | null;
  nodePath?: number[];
  rootEntityId?: string;
}

export interface ImportNodeSpec {
  tempId: string;
  parentTempId: string | null;
  name: string;
  nodePath: number[];
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface CameraProfile {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  near: number;
  far: number;
  zoom: number;
}

type EntityTransformUpdates = Partial<Pick<Entity, "position" | "rotation" | "scale" | "color">> & {
};

export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export interface PostProcessingConfig {
  enabled: boolean;
  toneMap: string;
  exposure: number;
  bloom: {
    enabled: boolean;
    intensity: number;
    threshold: number;
    radius: number;
  };
  ssao: {
    enabled: boolean;
    intensity: number;
  };
  dof: {
    enabled: boolean;
    focusDistance: number;
    bokeh: number;
  };
  chromaticAberration: {
    enabled: boolean;
    intensity: number;
  };
  motionBlur: {
    enabled: boolean;
    intensity: number;
  };
  filmGrain: {
    enabled: boolean;
    intensity: number;
  };
  vignette: {
    enabled: boolean;
    intensity: number;
  };
  outline: {
    enabled: boolean;
    color: string;
  };
  colorGrading: {
    enabled: boolean;
    brightness: number;
    contrast: number;
    saturation: number;
  };
}

export interface SceneSettingsConfig {
  bgColor: string;
  bgAlpha: string;
  showGrid: boolean;
  wireframe: boolean;
  fogEnabled: boolean;
  showAxisGuides?: boolean;
  lights: {
    intensity: number;
    color: string;
    ambientEnabled: boolean;
    directionalEnabled: boolean;
    shadow: string;
  };
  physics: {
    enabled: boolean;
    gravityY: number;
    collisionType: string;
  };
}

export type FrameMode = "responsive" | "fixed";
export type FrameSizePreset = "responsive" | "1920x1080" | "1080x1080" | "custom";

export interface FrameSettingsConfig {
  mode: FrameMode;
  preset: FrameSizePreset;
  width: number;
  height: number;
}

export const initialPostProcessingDefaults: PostProcessingConfig = {
  enabled: true,
  toneMap: "ACES Filmic",
  exposure: 0.00,
  bloom: {
    enabled: true,
    intensity: 40,
    threshold: 0.85,
    radius: 0.4,
  },
  ssao: {
    enabled: false,
    intensity: 25,
  },
  dof: {
    enabled: false,
    focusDistance: 10.0,
    bokeh: 0.30,
  },
  chromaticAberration: {
    enabled: false,
    intensity: 0,
  },
  motionBlur: {
    enabled: false,
    intensity: 0,
  },
  filmGrain: {
    enabled: false,
    intensity: 0,
  },
  vignette: {
    enabled: true,
    intensity: 15,
  },
  outline: {
    enabled: false,
    color: "5865F2",
  },
  colorGrading: {
    enabled: false,
    brightness: 0.00,
    contrast: 0.00,
    saturation: 0.00,
  },
};

export const initialSceneDefaults: SceneSettingsConfig = {
  bgColor: "#0b1020",
  bgAlpha: "100%",
  showGrid: true,
  wireframe: false,
  fogEnabled: false,
  showAxisGuides: false,
  lights: {
    intensity: 0.75,
    color: "#ffffff",
    ambientEnabled: true,
    directionalEnabled: true,
    shadow: "Soft",
  },
  physics: {
    enabled: false,
    gravityY: -9.8,
    collisionType: "Mesh",
  },
};

export const initialFrameDefaults: FrameSettingsConfig = {
  mode: "responsive",
  preset: "responsive",
  width: 1920,
  height: 1080,
};

export interface EditorState {
  entities: Entity[];
  selectedEntityIds: string[];
  currentPublishId: string | null;
  activeProfileId: string;
  cameraProfiles: Record<string, CameraProfile>;
  setActiveProfile: (id: string) => void;
  addCameraProfile: (id: string, data?: Partial<CameraProfile>) => string;
  deleteCameraProfile: (id: string) => void;
  updateProfileData: (id: string, updates: Partial<CameraProfile>) => void;
  addEntity: (type: EntityType) => string;
  addImportedModelHierarchy: (assetId: string, nodes: ImportNodeSpec[]) => string;
  duplicateEntity: (ids: string[]) => void;
  removeEntity: (ids: string[]) => void;
  reparentEntities: (ids: string[], newParentId: string | null, index?: number) => void;
  groupEntities: (ids: string[]) => string;
  ungroupEntity: (id: string) => void;
  updateEntityTransform: (id: string, updates: EntityTransformUpdates) => void;
  updateMultipleEntityTransforms: (updates: Record<string, EntityTransformUpdates>) => void;
  selectEntity: (id: string | null, multi?: boolean) => void;
  selectEntities: (ids: string[], mode?: "replace" | "add" | "subtract") => void;
  setCurrentPublishId: (id: string | null) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  renameEntity: (id: string, newName: string) => void;
  renameEntities: (updates: Record<string, string>) => void;

  // Viewport / Projection
  activeTransformTool: "translate" | "rotate" | "scale";
  projectionMode: "perspective" | "orthographic";
  transformSpace: "world" | "local";

  sceneSettings: SceneSettingsConfig;
  postProcessing: PostProcessingConfig;

  // Frame
  hudOverlay: string;
  viewportZoom: number;
  frame: FrameSettingsConfig;

  // Play Mode / Preview
  isPreviewMode: boolean;
  previewGlbUrl: string | null;
  setPreviewMode: (active: boolean, url: string | null) => void;

  // Number of .glb imports currently being read/parsed (file picked but
  // entities not yet materialized). Not persisted — like isPreviewMode it's
  // transient session state that happens to need cross-component visibility.
  pendingImportCount: number;
  adjustPendingImports: (delta: number) => void;

  updatePostProcessing: (updates: DeepPartial<PostProcessingConfig>) => void;
  updateSceneSettings: (updates: DeepPartial<SceneSettingsConfig>) => void;
  updateFrameSettings: (updates: DeepPartial<FrameSettingsConfig>) => void;
  addMaterialLayer: (entityId: string, layerType: MaterialLayerType) => void;
  removeMaterialLayer: (entityId: string, layerId: string) => void;
  updateMaterialLayer: (entityId: string, layerId: string, updates: Partial<MaterialLayer>) => void;
  updateMultipleEntityMaterialLayers: (updates: Record<string, { layerId: string; updates: Partial<MaterialLayer> }>) => void;
  setEntityMaterialLayers: (entityId: string, layers: MaterialLayer[]) => void;
  setEditorState: (updates: Partial<Omit<EditorState, "entities" | "selectedEntityIds" | "currentPublishId" | "addEntity" | "addImportedModelHierarchy" | "removeEntity" | "updateEntityTransform" | "updateMultipleEntityTransforms" | "selectEntity" | "selectEntities" | "setCurrentPublishId" | "toggleVisibility" | "toggleLock" | "renameEntity" | "updatePostProcessing" | "updateSceneSettings" | "setEditorState" | "setActiveProfile" | "addCameraProfile" | "updateProfileData" | "setPreviewMode" | "addMaterialLayer" | "removeMaterialLayer" | "updateMaterialLayer" | "updateMultipleEntityMaterialLayers" | "setEntityMaterialLayers">>) => void;
}

const ENTITY_DEFAULTS: Record<EntityType, { name: string; color: string }> = {
  cube: {
    name: "Cube",
    color: "#4f8cff",
  },
  sphere: {
    name: "Sphere",
    color: "#3DFFA0",
  },
  torus: {
    name: "Torus",
    color: "#FF7AE0",
  },
  directionalLight: {
    name: "Directional Light",
    color: "#ffffff",
  },
  importedModel: {
    name: "Imported Model",
    color: "#ffffff",
  },
  group: {
    name: "Group",
    color: "#ffffff",
  },
};

const MANDATORY_LAYER_TYPES: MaterialLayerType[] = ["color", "lighting"];

const createColorLayer = (color: string, opacity = 1): ColorLayer => ({
  id: createEntityId(),
  type: "color",
  enabled: true,
  opacity,
  color,
});

const createLightingLayer = (overrides: Partial<LightingLayer> = {}): LightingLayer => ({
  id: createEntityId(),
  type: "lighting",
  enabled: true,
  opacity: 1,
  model: "physical",
  roughness: 0.45,
  metalness: 0.08,
  shininess: 30,
  emissive: "#000000",
  emissiveIntensity: 1,
  ...overrides,
});

const createDefaultMaterialLayers = (color: string): MaterialLayer[] => [
  createColorLayer(color, 1),
  createLightingLayer(),
];

const ZERO_VECTOR: [number, number, number] = [0, 0, 0];
const UNIT_VECTOR: [number, number, number] = [1, 1, 1];
const DEFAULT_CAMERA_PROFILE_ID = "personal";

export const DEFAULT_CAMERA_PROFILE: CameraProfile = {
  id: "personal",
  name: "Personal Camera",
  position: [0, 5, 10],
  target: [0, 0, 0],
  fov: 45,
  near: 0.1,
  far: 1000,
  zoom: 1,
};

const createEntityId = (): string => createId("entity");

const createEntity = (type: EntityType): Entity => ({
  id: createEntityId(),
  type,
  name: ENTITY_DEFAULTS[type].name,
  position: (type === "directionalLight" ? [5, 8, 4] : [...ZERO_VECTOR]) as [number, number, number],
  rotation: [...ZERO_VECTOR] as [number, number, number],
  scale: [...UNIT_VECTOR] as [number, number, number],
  ...(type === "directionalLight"
    ? { color: ENTITY_DEFAULTS[type].color }
    : type === "group"
      ? null // groups are pure transform pivots — no material, no color
      : { materialLayers: createDefaultMaterialLayers(ENTITY_DEFAULTS[type].color) }),
  visible: true,
  locked: false,
});

const initialEntities: Entity[] = [
  createEntity("cube"),
  {
    id: "directional-light-1",
    type: "directionalLight",
    name: "Directional Light",
    position: [5, 8, 4],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    color: "#ffffff",
    visible: true,
    locked: false,
  },
];

const cloneVector = (vector: [number, number, number]): [number, number, number] => [
  vector[0],
  vector[1],
  vector[2],
];

const cloneCameraProfile = (profile: CameraProfile): CameraProfile => ({
  ...profile,
  position: cloneVector(profile.position),
  target: cloneVector(profile.target),
});

const createCameraProfile = (id: string, data: Partial<CameraProfile> = {}): CameraProfile => ({
  ...cloneCameraProfile(DEFAULT_CAMERA_PROFILE),
  ...data,
  id,
  name: data.name ?? DEFAULT_CAMERA_PROFILE.name,
  position: cloneVector(data.position ?? DEFAULT_CAMERA_PROFILE.position),
  target: cloneVector(data.target ?? DEFAULT_CAMERA_PROFILE.target),
  fov: data.fov ?? DEFAULT_CAMERA_PROFILE.fov,
  near: data.near ?? DEFAULT_CAMERA_PROFILE.near,
  far: data.far ?? DEFAULT_CAMERA_PROFILE.far,
  zoom: data.zoom ?? DEFAULT_CAMERA_PROFILE.zoom,
});

const cloneEntity = (entity: Entity): Entity => ({
  ...entity,
  position: cloneVector(entity.position),
  rotation: cloneVector(entity.rotation),
  scale: cloneVector(entity.scale),
  visible: entity.visible ?? true,
  locked: entity.locked ?? false,
  ...(entity.materialLayers ? { materialLayers: entity.materialLayers.map((layer) => ({ ...layer })) } : null),
});

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceVal = source[key];
      if (sourceVal !== null && typeof sourceVal === "object" && !Array.isArray(sourceVal)) {
        result[key] = deepMerge(target[key] || {}, sourceVal);
      } else {
        result[key] = sourceVal;
      }
    }
  }
  return result;
}

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector(
    temporal(
      persist(
        (set, get) => ({
          entities: initialEntities.map(cloneEntity),
          selectedEntityIds: [],
          currentPublishId: null,
          activeProfileId: DEFAULT_CAMERA_PROFILE_ID,
          cameraProfiles: {
            [DEFAULT_CAMERA_PROFILE_ID]: cloneCameraProfile(DEFAULT_CAMERA_PROFILE),
          },
          setActiveProfile: (id) => set({ activeProfileId: id }),
          addCameraProfile: (id, data = {}) => {
            set((state) => {
              const nextProfile = createCameraProfile(id, data);
              return {
                cameraProfiles: {
                  ...state.cameraProfiles,
                  [id]: nextProfile,
                },
                activeProfileId: id,
              };
            });

            return id;
          },
          deleteCameraProfile: (id) =>
            set((state) => {
              if (id === DEFAULT_CAMERA_PROFILE_ID || !state.cameraProfiles[id]) {
                return state;
              }

              const nextCameraProfiles = { ...state.cameraProfiles };
              delete nextCameraProfiles[id];

              return {
                cameraProfiles: nextCameraProfiles,
                activeProfileId: state.activeProfileId === id ? DEFAULT_CAMERA_PROFILE_ID : state.activeProfileId,
              };
            }),
          updateProfileData: (id, updates) =>
            set((state) => {
              const existingProfile = state.cameraProfiles[id] ?? createCameraProfile(id);
              const nextProfile: CameraProfile = {
                ...existingProfile,
                ...updates,
                position: updates.position ? cloneVector(updates.position) : cloneVector(existingProfile.position),
                target: updates.target ? cloneVector(updates.target) : cloneVector(existingProfile.target),
              };

              return {
                cameraProfiles: {
                  ...state.cameraProfiles,
                  [id]: nextProfile,
                },
              };
            }),
          addEntity: (type) => {
            let newId = "";
            set((state) => {
              const entity = createEntity(type);
              newId = entity.id;

              return {
                entities: [...state.entities, entity],
                selectedEntityIds: [entity.id],
              };
            });
            return newId;
          },
          addImportedModelHierarchy: (assetId, nodes) => {
            let rootRealId = "";
            set((state) => {
              const rootNode = nodes.find((node) => node.parentTempId === null);
              if (!rootNode) return state;

              const tempToReal = new Map<string, string>();
              nodes.forEach((node) => tempToReal.set(node.tempId, createEntityId()));
              rootRealId = tempToReal.get(rootNode.tempId)!;

              const newEntities: Entity[] = nodes.map((node) => {
                const isRoot = node.tempId === rootNode.tempId;
                return {
                  id: tempToReal.get(node.tempId)!,
                  type: "importedModel",
                  name: node.name,
                  position: cloneVector(node.position),
                  rotation: cloneVector(node.rotation),
                  scale: cloneVector(node.scale),
                  parentId: node.parentTempId ? tempToReal.get(node.parentTempId) ?? null : null,
                  nodePath: [...node.nodePath],
                  rootEntityId: rootRealId,
                  ...(isRoot ? { assetId, sourceFileName: node.name } : {}),
                  visible: true,
                  locked: false,
                };
              });

              return {
                entities: [...state.entities, ...newEntities],
                selectedEntityIds: [rootRealId],
              };
            });
            return rootRealId;
          },
          duplicateEntity: (ids) => {
            set((state) => {
              const requestedRootIds = new Set(ids);
              const cloneOrder: string[] = [];
              const seen = new Set<string>();

              ids.forEach((id) => {
                if (!state.entities.some((e) => e.id === id)) return;
                if (!seen.has(id)) {
                  seen.add(id);
                  cloneOrder.push(id);
                }
                getDescendantIds(state.entities, id).forEach((descId) => {
                  if (!seen.has(descId)) {
                    seen.add(descId);
                    cloneOrder.push(descId);
                  }
                });
              });

              if (cloneOrder.length === 0) return state;

              const idMap = new Map<string, string>();
              cloneOrder.forEach((id) => idMap.set(id, createEntityId()));

              const newEntities: Entity[] = cloneOrder.map((id) => {
                const original = state.entities.find((e) => e.id === id)!;
                const isRequestedRoot = requestedRootIds.has(id);
                const newParentId = original.parentId ? idMap.get(original.parentId) ?? original.parentId : original.parentId;
                const newRootEntityId = original.rootEntityId ? idMap.get(original.rootEntityId) ?? original.rootEntityId : original.rootEntityId;

                return {
                  ...cloneEntity(original),
                  id: idMap.get(id)!,
                  name: isRequestedRoot ? `${original.name} (Copy)` : original.name,
                  parentId: newParentId,
                  rootEntityId: newRootEntityId,
                  position: isRequestedRoot
                    ? [
                      original.position[0] + 0.5,
                      original.position[1],
                      original.position[2] + 0.5
                    ] as [number, number, number]
                    : cloneVector(original.position),
                };
              });

              return {
                entities: [...state.entities, ...newEntities],
                selectedEntityIds: cloneOrder.filter((id) => requestedRootIds.has(id)).map((id) => idMap.get(id)!),
              };
            });
          },
          removeEntity: (ids) => {
            const { entities } = get();
            const allIds = new Set(ids);
            ids.forEach((id) => {
              getDescendantIds(entities, id).forEach((descId) => allIds.add(descId));
            });

            // Free each removed imported-model root's stored buffer so it doesn't
            // leak in OPFS forever. Only the import root carries an assetId (the
            // other nodes resolve against it via rootEntityId), so this deletes
            // exactly one buffer per import, never per node. Fire-and-forget: the
            // store update below shouldn't wait on a filesystem write.
            for (const entity of entities) {
              if (allIds.has(entity.id) && entity.type === "importedModel" && entity.assetId) {
                void deleteModelAsset(entity.assetId).catch((error) => {
                  console.error(`[Libre3D] Failed to delete stored model asset "${entity.assetId}":`, error);
                });
              }
            }

            set((state) => ({
              entities: state.entities.filter((entity) => !allIds.has(entity.id)),
              selectedEntityIds: state.selectedEntityIds.filter((id) => !allIds.has(id)),
            }));
          },
          // World-space placement is preserved: the new local TRS is solved from
          // the stored parent chain so the object doesn't visually jump. One
          // set() call = one zundo undo step for the whole move. `index` counts
          // siblings under the new parent *after* the moved entities are removed
          // (standard drop-index semantics); omitted/out-of-range appends last.
          reparentEntities: (ids, newParentId, index) =>
            set((state) => {
              const moveRoots = filterMoveRoots(state.entities, ids);
              if (moveRoots.length === 0 || !canReparentEntities(state.entities, moveRoots, newParentId)) {
                return state;
              }

              const parentWorld = newParentId ? getEntityWorldMatrix(state.entities, newParentId) : null;
              const solvedById = new Map<string, EntityTRS>();
              for (const id of moveRoots) {
                const entity = state.entities.find((e) => e.id === id)!;
                // Same-parent moves are pure sibling reorders — keep the stored
                // TRS bit-identical instead of a solve/decompose round-trip.
                if ((entity.parentId ?? null) === (newParentId ?? null)) continue;
                solvedById.set(id, solveLocalFromWorld(getEntityWorldMatrix(state.entities, id), parentWorld));
              }

              const movingSet = new Set(moveRoots);
              const remaining = state.entities.filter((entity) => !movingSet.has(entity.id));
              const moved: Entity[] = moveRoots.map((id) => {
                const original = state.entities.find((e) => e.id === id)!;
                const solved = solvedById.get(id);
                return {
                  ...original,
                  parentId: newParentId,
                  ...(solved
                    ? {
                      position: cloneVector(solved.position),
                      rotation: cloneVector(solved.rotation),
                      scale: cloneVector(solved.scale),
                    }
                    : null),
                };
              });

              // Sibling order is array position among same-parent entities:
              // insert before the array slot of the sibling currently at `index`.
              let insertAt = remaining.length;
              if (index !== undefined) {
                const siblingArrayIndexes = remaining
                  .map((entity, arrayIndex) => ({ entity, arrayIndex }))
                  .filter(({ entity }) => (entity.parentId ?? null) === (newParentId ?? null))
                  .map(({ arrayIndex }) => arrayIndex);
                if (index < siblingArrayIndexes.length) insertAt = siblingArrayIndexes[index];
              }

              return {
                entities: [...remaining.slice(0, insertAt), ...moved, ...remaining.slice(insertAt)],
              };
            }),
          groupEntities: (ids) => {
            let groupId = "";
            set((state) => {
              const moveRoots = filterMoveRoots(state.entities, ids);
              if (moveRoots.length === 0) return state;

              const parentIds = new Set(
                moveRoots.map((id) => state.entities.find((e) => e.id === id)?.parentId ?? null),
              );
              const groupParentId = parentIds.size === 1 ? [...parentIds][0] : null;
              // The members end up under the new group, whose own parent is
              // groupParentId — legality (cycles, imported-model boundary) is
              // identical to reparenting them straight onto groupParentId,
              // since the group itself is a plain node.
              if (!canReparentEntities(state.entities, moveRoots, groupParentId)) return state;

              const memberWorlds = new Map(
                moveRoots.map((id) => [id, getEntityWorldMatrix(state.entities, id)] as const),
              );
              const centroid: [number, number, number] = [0, 0, 0];
              memberWorlds.forEach((world) => {
                const [x, y, z] = getWorldPosition(world);
                centroid[0] += x / moveRoots.length;
                centroid[1] += y / moveRoots.length;
                centroid[2] += z / moveRoots.length;
              });

              // The group pivots at the members' world centroid, with identity
              // world rotation/scale (Blender's default for a new Empty parent).
              const groupWorld = makeTranslationMatrix(centroid);
              const groupParentWorld = groupParentId ? getEntityWorldMatrix(state.entities, groupParentId) : null;
              const groupLocal = solveLocalFromWorld(groupWorld, groupParentWorld);

              const group: Entity = {
                id: createEntityId(),
                type: "group",
                name: "Group",
                position: cloneVector(groupLocal.position),
                rotation: cloneVector(groupLocal.rotation),
                scale: cloneVector(groupLocal.scale),
                visible: true,
                locked: false,
                parentId: groupParentId,
              };
              groupId = group.id;

              const movingSet = new Set(moveRoots);
              const firstMemberIndex = state.entities.findIndex((entity) => movingSet.has(entity.id));
              const entitiesNext = state.entities.map((entity) => {
                if (!movingSet.has(entity.id)) return entity;
                const solved = solveLocalFromWorld(memberWorlds.get(entity.id)!, groupWorld);
                return {
                  ...entity,
                  parentId: group.id,
                  position: cloneVector(solved.position),
                  rotation: cloneVector(solved.rotation),
                  scale: cloneVector(solved.scale),
                };
              });
              entitiesNext.splice(Math.max(firstMemberIndex, 0), 0, group);

              return { entities: entitiesNext, selectedEntityIds: [group.id] };
            });
            return groupId;
          },
          ungroupEntity: (id) =>
            set((state) => {
              const group = state.entities.find((entity) => entity.id === id);
              if (!group || group.type !== "group") return state;

              const childIds = getChildren(state.entities, id).map((child) => child.id);
              const parentWorld = group.parentId ? getEntityWorldMatrix(state.entities, group.parentId) : null;
              const childSet = new Set(childIds);

              const entitiesNext = state.entities
                .filter((entity) => entity.id !== id)
                .map((entity) => {
                  if (!childSet.has(entity.id)) return entity;
                  const solved = solveLocalFromWorld(getEntityWorldMatrix(state.entities, entity.id), parentWorld);
                  return {
                    ...entity,
                    parentId: group.parentId ?? null,
                    position: cloneVector(solved.position),
                    rotation: cloneVector(solved.rotation),
                    scale: cloneVector(solved.scale),
                  };
                });

              return {
                entities: entitiesNext,
                selectedEntityIds: childIds.length > 0
                  ? childIds
                  : state.selectedEntityIds.filter((selId) => selId !== id),
              };
            }),
          updateEntityTransform: (id, updates) =>
            set((state) => ({
              entities: state.entities.map((entity) =>
                entity.id === id
                  ? {
                    ...entity,
                    ...(updates.position
                      ? { position: cloneVector(updates.position) }
                      : null),
                    ...(updates.rotation
                      ? { rotation: cloneVector(updates.rotation) }
                      : null),
                    ...(updates.scale
                      ? { scale: cloneVector(updates.scale) }
                      : null),
                    ...(updates.color ? { color: updates.color } : null),
                  }
                  : entity,
              ),
            })),
          updateMultipleEntityTransforms: (updatesMap) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                const updates = updatesMap[entity.id];
                if (!updates) return entity;
                return {
                  ...entity,
                  ...(updates.position ? { position: cloneVector(updates.position) } : null),
                  ...(updates.rotation ? { rotation: cloneVector(updates.rotation) } : null),
                  ...(updates.scale ? { scale: cloneVector(updates.scale) } : null),
                  ...(updates.color ? { color: updates.color } : null),
                };
              }),
            })),
          selectEntity: (id, multi = false) =>
            set((state) => {
              if (!id) return { selectedEntityIds: [] };
              if (multi) {
                const isSelected = state.selectedEntityIds.includes(id);
                return {
                  selectedEntityIds: isSelected
                    ? state.selectedEntityIds.filter(selId => selId !== id)
                    : [...state.selectedEntityIds, id]
                };
              }
              return { selectedEntityIds: [id] };
            }),
          selectEntities: (ids, mode = "replace") =>
            set((state) => {
              if (mode === "replace") {
                return { selectedEntityIds: [...new Set(ids)] };
              }
              if (mode === "add") {
                return { selectedEntityIds: [...new Set([...state.selectedEntityIds, ...ids])] };
              }
              // subtract
              const remove = new Set(ids);
              return { selectedEntityIds: state.selectedEntityIds.filter((id) => !remove.has(id)) };
            }),
          setCurrentPublishId: (id) =>
            set({
              currentPublishId: id,
            }),
          toggleVisibility: (id) =>
            set((state) => ({
              entities: state.entities.map((entity) =>
                entity.id === id ? { ...entity, visible: !entity.visible } : entity,
              ),
            })),
          toggleLock: (id) =>
            set((state) => ({
              entities: state.entities.map((entity) =>
                entity.id === id ? { ...entity, locked: !entity.locked } : entity,
              ),
              selectedEntityIds: state.selectedEntityIds.filter(selId => selId !== id),
            })),
          renameEntity: (id, newName) =>
            set((state) => ({
              entities: state.entities.map((entity) =>
                entity.id === id ? { ...entity, name: newName } : entity,
              ),
            })),
          // Batch rename in one set() so the whole operation is one undo step.
          renameEntities: (updates) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                const newName = updates[entity.id]?.trim();
                return newName ? { ...entity, name: newName } : entity;
              }),
            })),
          // Viewport / Projection
          activeTransformTool: "translate",
          projectionMode: "perspective",
          transformSpace: "world",

          sceneSettings: initialSceneDefaults,
          postProcessing: initialPostProcessingDefaults,

          // Frame
          hudOverlay: "None",
          viewportZoom: 100,
          frame: initialFrameDefaults,

          // Play Mode / Preview
          isPreviewMode: false,
          previewGlbUrl: null,
          setPreviewMode: (active, url) => set({ isPreviewMode: active, previewGlbUrl: url }),

          pendingImportCount: 0,
          adjustPendingImports: (delta) =>
            set((state) => ({ pendingImportCount: Math.max(0, state.pendingImportCount + delta) })),

          updatePostProcessing: (updates) =>
            set((state) => ({
              postProcessing: deepMerge(state.postProcessing, updates),
            })),
          updateSceneSettings: (updates) =>
            set((state) => ({
              sceneSettings: deepMerge(state.sceneSettings, updates),
            })),
          updateFrameSettings: (updates) =>
            set((state) => ({
              frame: deepMerge(state.frame, updates),
            })),
          addMaterialLayer: (entityId, layerType) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                if (entity.id !== entityId || !entity.materialLayers) return entity;
                if (entity.materialLayers.some((layer) => layer.type === layerType)) return entity;

                const colorLayer = entity.materialLayers.find((layer): layer is ColorLayer => layer.type === "color");
                const newLayer: MaterialLayer =
                  layerType === "color"
                    ? createColorLayer(colorLayer?.color ?? "#ffffff")
                    : createLightingLayer();

                return {
                  ...entity,
                  materialLayers: [...entity.materialLayers, newLayer],
                };
              }),
            })),
          removeMaterialLayer: (entityId, layerId) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                if (entity.id !== entityId || !entity.materialLayers) return entity;
                const layer = entity.materialLayers.find((l) => l.id === layerId);
                if (!layer || MANDATORY_LAYER_TYPES.includes(layer.type)) return entity;

                return {
                  ...entity,
                  materialLayers: entity.materialLayers.filter((l) => l.id !== layerId),
                };
              }),
            })),
          updateMaterialLayer: (entityId, layerId, updates) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                if (entity.id !== entityId || !entity.materialLayers) return entity;
                return {
                  ...entity,
                  materialLayers: entity.materialLayers.map((layer) =>
                    layer.id === layerId ? ({ ...layer, ...updates } as MaterialLayer) : layer,
                  ),
                };
              }),
            })),
          updateMultipleEntityMaterialLayers: (updatesMap) =>
            set((state) => ({
              entities: state.entities.map((entity) => {
                const change = updatesMap[entity.id];
                if (!change || !entity.materialLayers) return entity;
                return {
                  ...entity,
                  materialLayers: entity.materialLayers.map((layer) =>
                    layer.id === change.layerId ? ({ ...layer, ...change.updates } as MaterialLayer) : layer,
                  ),
                };
              }),
            })),
          // Replaces an entity's whole layer stack. Used by hydrate-time backfill
          // (ObjectManager) to write the layers derived from an imported mesh's
          // parsed glTF material — the one place layers can be built, since it
          // needs parsed texture/material data unavailable at migrate() time.
          setEntityMaterialLayers: (entityId, layers) =>
            set((state) => ({
              entities: state.entities.map((entity) =>
                entity.id === entityId
                  ? { ...entity, materialLayers: layers.map((layer) => ({ ...layer })) }
                  : entity,
              ),
            })),
          setEditorState: (updates) => set((state) => ({ ...state, ...updates })),
        }),
        {
          name: "libre3d-scene-state",
          version: 15,
          storage: createJSONStorage(() => localStorage),
          migrate: (persistedState: any, version: number) => {
            // v15: MaterialLayer gained an "image" variant so imported meshes
            // become editable. Existing color/lighting layers stay structurally
            // valid, so nothing is rewritten here — imported entities with
            // materialLayers: undefined are backfilled dynamically the first time
            // ObjectManager.hydrateImportedModel resolves them (setEntityMaterialLayers),
            // since deriving layers needs parsed glTF data unavailable at migrate() time.
            // The bump follows this store's convention of versioning any shape-relevant change.

            if (version < 14) {
              if (persistedState && Array.isArray(persistedState.entities)) {
                persistedState.entities = persistedState.entities.map((entity: any) => ({
                  ...entity,
                  parentId: entity.parentId ?? null,
                }));
              }
            }

            if (version < 12) {
              if (persistedState && Array.isArray(persistedState.entities)) {
                persistedState.entities = persistedState.entities.map((entity: any) => {
                  if (entity.type === "directionalLight") return entity;

                  const color = entity.color ?? "#ffffff";
                  const nextEntity = {
                    ...entity,
                    materialLayers: [
                      { id: createEntityId(), type: "color", enabled: true, opacity: 1, color },
                      {
                        id: createEntityId(),
                        type: "lighting",
                        enabled: true,
                        opacity: 1,
                        model: "physical",
                        roughness: 0.45,
                        metalness: 0.08,
                        shininess: 30,
                        emissive: "#000000",
                        emissiveIntensity: 1,
                      },
                    ],
                  };
                  delete nextEntity.color;
                  return nextEntity;
                });
              }
            }

            if (version < 11) {
              if (persistedState && persistedState.selectedEntityId !== undefined) {
                persistedState.selectedEntityIds = persistedState.selectedEntityId ? [persistedState.selectedEntityId] : [];
                delete persistedState.selectedEntityId;
              }
            }

            if (version < 10) {
              if (persistedState && Array.isArray(persistedState.entities)) {
                persistedState.entities = persistedState.entities.map((entity: any) => {
                  if (entity.type === "directionalLight" && entity.color === "#fde047") {
                    return { ...entity, color: "#ffffff" };
                  }
                  return entity;
                });
              }
            }

            if (version < 7) {
              // Safely initialize postProcessing with defaults
              const postProcessing = {
                enabled: persistedState.postProcessingEnabled !== undefined ? persistedState.postProcessingEnabled : true,
                toneMap: persistedState.toneMap !== undefined ? persistedState.toneMap : "ACES Filmic",
                exposure: persistedState.exposure !== undefined ? persistedState.exposure : 0.00,
                bloom: {
                  enabled: persistedState.bloomEnabled !== undefined ? persistedState.bloomEnabled : true,
                  intensity: persistedState.bloomIntensity !== undefined ? persistedState.bloomIntensity : 40,
                  threshold: persistedState.bloomThreshold !== undefined ? persistedState.bloomThreshold : 0.85,
                  radius: persistedState.bloomRadius !== undefined ? persistedState.bloomRadius : 0.4,
                },
                ssao: {
                  enabled: persistedState.ssaoEnabled !== undefined ? persistedState.ssaoEnabled : false,
                  intensity: persistedState.ssaoIntensity !== undefined ? persistedState.ssaoIntensity : 25,
                },
                dof: {
                  enabled: persistedState.dofEnabled !== undefined ? persistedState.dofEnabled : false,
                  focusDistance: persistedState.dofFocusDist !== undefined ? persistedState.dofFocusDist : 10.0,
                  bokeh: persistedState.dofBokeh !== undefined ? persistedState.dofBokeh : 0.30,
                },
                chromaticAberration: {
                  enabled: persistedState.chromaticAberrationEnabled !== undefined ? persistedState.chromaticAberrationEnabled : false,
                  intensity: persistedState.chromaticAberrationIntensity !== undefined ? persistedState.chromaticAberrationIntensity : 0,
                },
                motionBlur: {
                  enabled: persistedState.motionBlurEnabled !== undefined ? persistedState.motionBlurEnabled : false,
                  intensity: persistedState.motionBlurIntensity !== undefined ? persistedState.motionBlurIntensity : 0,
                },
                filmGrain: {
                  enabled: persistedState.filmGrainEnabled !== undefined ? persistedState.filmGrainEnabled : false,
                  intensity: persistedState.filmGrainIntensity !== undefined ? persistedState.filmGrainIntensity : 0,
                },
                vignette: {
                  enabled: persistedState.vignetteEnabled !== undefined ? persistedState.vignetteEnabled : true,
                  intensity: persistedState.vignetteIntensity !== undefined ? persistedState.vignetteIntensity : 15,
                },
                outline: {
                  enabled: persistedState.outlineEnabled !== undefined ? persistedState.outlineEnabled : false,
                  color: persistedState.outlineColor !== undefined ? persistedState.outlineColor : "5865F2",
                },
                colorGrading: {
                  enabled: persistedState.colorGradingEnabled !== undefined ? persistedState.colorGradingEnabled : false,
                  brightness: persistedState.colorGradingBrightness !== undefined ? persistedState.colorGradingBrightness : 0.00,
                  contrast: persistedState.colorGradingContrast !== undefined ? persistedState.colorGradingContrast : 0.00,
                  saturation: persistedState.colorGradingSaturation !== undefined ? persistedState.colorGradingSaturation : 0.00,
                },
              };

              // Safely initialize sceneSettings with defaults
              const sceneSettings = {
                bgColor: persistedState.bgColor !== undefined ? persistedState.bgColor : "#0b1020",
                bgAlpha: persistedState.bgAlpha !== undefined ? persistedState.bgAlpha : "100%",
                showGrid: persistedState.showGrid !== undefined ? persistedState.showGrid : true,
                wireframe: persistedState.wireframe !== undefined ? persistedState.wireframe : false,
                fogEnabled: persistedState.fogEnabled !== undefined ? persistedState.fogEnabled : false,
                lights: {
                  intensity: persistedState.lightIntensity !== undefined ? persistedState.lightIntensity : 0.75,
                  color: persistedState.lightColor !== undefined ? persistedState.lightColor : "#ffffff",
                  ambientEnabled: persistedState.lightAmbientEnabled !== undefined ? persistedState.lightAmbientEnabled : true,
                  directionalEnabled: persistedState.lightDirectionalEnabled !== undefined ? persistedState.lightDirectionalEnabled : true,
                  shadow: persistedState.lightShadow !== undefined ? persistedState.lightShadow : "Soft",
                },
                physics: {
                  enabled: persistedState.physicsEnabled !== undefined ? persistedState.physicsEnabled : false,
                  gravityY: persistedState.gravityY !== undefined ? persistedState.gravityY : -9.8,
                  collisionType: persistedState.collisionType !== undefined ? persistedState.collisionType : "Mesh",
                },
              };

              persistedState.postProcessing = postProcessing;
              persistedState.sceneSettings = sceneSettings;

              // Delete deprecated keys
              const keysToDelete = [
                "postProcessingEnabled", "toneMap", "exposure", "bloomEnabled", "bloomIntensity", "bloomThreshold", "bloomRadius",
                "ssaoEnabled", "ssaoIntensity", "dofEnabled", "dofFocusDist", "dofBokeh", "chromaticAberrationEnabled",
                "chromaticAberrationIntensity", "motionBlurEnabled", "motionBlurIntensity", "filmGrainEnabled", "filmGrainIntensity",
                "vignetteEnabled", "vignetteIntensity", "outlineEnabled", "outlineColor", "colorGradingEnabled", "colorGradingBrightness",
                "colorGradingContrast", "colorGradingSaturation", "bgColor", "bgAlpha", "gridPlane", "showGrid", "wireframe", "fogEnabled",
                "lightIntensity", "lightColor", "lightAmbientEnabled", "lightDirectionalEnabled", "lightShadow",
                "physicsEnabled", "gravityY", "collisionType"
              ];
              keysToDelete.forEach((key) => {
                delete persistedState[key];
              });
            }

            if (version < 7) {
              if (persistedState) {
                const legacyCameraEntities = Array.isArray(persistedState.entities)
                  ? persistedState.entities.filter((entity: any) => entity?.type === "camera")
                  : [];

                const legacyProfiles: Record<string, CameraProfile> = {};
                legacyCameraEntities.forEach((entity: any, index: number) => {
                  legacyProfiles[entity.id] = createCameraProfile(entity.id, {
                    id: entity.id,
                    name: entity.name ?? `Camera ${index + 1}`,
                    position: entity.position ?? [0, 5, 10],
                    target: [0, 0, 0],
                    fov: entity.cameraProperties?.fov ?? DEFAULT_CAMERA_PROFILE.fov,
                    near: entity.cameraProperties?.near ?? DEFAULT_CAMERA_PROFILE.near,
                    far: entity.cameraProperties?.far ?? DEFAULT_CAMERA_PROFILE.far,
                    zoom: entity.cameraProperties?.zoom ?? DEFAULT_CAMERA_PROFILE.zoom,
                  });
                });

                persistedState.entities = Array.isArray(persistedState.entities)
                  ? persistedState.entities.filter((entity: any) => entity?.type !== "camera")
                  : persistedState.entities;

                const persistedPersonalProperties = persistedState.personalCameraProperties ?? {};
                const personalProfile = createCameraProfile(DEFAULT_CAMERA_PROFILE_ID, {
                  ...DEFAULT_CAMERA_PROFILE,
                  ...persistedPersonalProperties,
                });

                persistedState.cameraProfiles = {
                  [DEFAULT_CAMERA_PROFILE_ID]: personalProfile,
                  ...legacyProfiles,
                  ...(persistedState.cameraProfiles ?? {}),
                };
                persistedState.activeProfileId = persistedState.activeProfileId ?? persistedState.activeCameraId ?? DEFAULT_CAMERA_PROFILE_ID;
              }
            }

            if (version < 8) {
              if (persistedState) {
                if (persistedState.activeProfileId === undefined) {
                  persistedState.activeProfileId = persistedState.activeCameraId ?? DEFAULT_CAMERA_PROFILE_ID;
                }

                delete persistedState.activeCameraId;
                delete persistedState.personalCameraProperties;

                if (Array.isArray(persistedState.entities)) {
                  persistedState.entities = persistedState.entities.filter((entity: any) => entity?.type !== "camera");
                }
              }
            }

            if (version < 9) {
              if (persistedState) {
                delete persistedState.bgColor;
                delete persistedState.gridPlane;  // legacy top-level key (pre-v6)

                delete persistedState.wireframe;
                delete persistedState.lightIntensity;
                delete persistedState.lightColor;
                delete persistedState.fogEnabled;
                delete persistedState.viewport;
                delete persistedState.resolution;
                delete persistedState.autoZoom;
                delete persistedState.bgAlpha;
                delete persistedState.environment;
                delete persistedState.lightAmbientEnabled;
                delete persistedState.lightDirectionalEnabled;
                delete persistedState.lightShadow;
                delete persistedState.physicsEnabled;
                delete persistedState.gravityY;
                delete persistedState.collisionType;
                delete persistedState.postProcessingEnabled;
                delete persistedState.toneMap;
                delete persistedState.exposure;
                delete persistedState.bloomEnabled;
                delete persistedState.bloomIntensity;
                delete persistedState.bloomThreshold;
                delete persistedState.bloomRadius;
                delete persistedState.ssaoEnabled;
                delete persistedState.ssaoIntensity;
                delete persistedState.dofEnabled;
                delete persistedState.dofFocusDist;
                delete persistedState.dofBokeh;
                delete persistedState.chromaticAberrationEnabled;
                delete persistedState.chromaticAberrationIntensity;
                delete persistedState.motionBlurEnabled;
                delete persistedState.motionBlurIntensity;
                delete persistedState.filmGrainEnabled;
                delete persistedState.filmGrainIntensity;
                delete persistedState.vignetteEnabled;
                delete persistedState.vignetteIntensity;
                delete persistedState.outlineEnabled;
                delete persistedState.outlineColor;
                delete persistedState.colorGradingEnabled;
                delete persistedState.colorGradingBrightness;
                delete persistedState.colorGradingContrast;
                delete persistedState.colorGradingSaturation;
                delete persistedState.snapping;
                delete persistedState.snapSize;
                delete persistedState.renderer;
                delete persistedState.materialName;
                delete persistedState.materialType;
                delete persistedState.materialBaseColor;
                delete persistedState.materialMetalness;
                delete persistedState.materialRoughness;
                delete persistedState.materialOpacity;
                delete persistedState.materialSide;
                delete persistedState.materialEmissiveColor;
                delete persistedState.materialEmissiveIntensity;
                delete persistedState.materialClearcoat;
                delete persistedState.materialTransmission;
                delete persistedState.materialIor;
                delete persistedState.materialIridescence;
                delete persistedState.materialLibraryTab;
                delete persistedState.activeMaterialCard;
              }
            }

            // v9: gridPlane → showGrid inside nested sceneSettings
            if (version < 9) {
              if (persistedState?.sceneSettings) {
                if (persistedState.sceneSettings.showGrid === undefined) {
                  // Convert old gridPlane string → boolean, default to true
                  const gp = persistedState.sceneSettings.gridPlane;
                  persistedState.sceneSettings.showGrid = gp !== "None";
                }
                // Remove the old string field — no longer used
                delete persistedState.sceneSettings.gridPlane;
              }
            }

            if (persistedState) {
              persistedState.frame = persistedState.frame ?? { ...initialFrameDefaults };
            }
            // DIAGNOSTIC — remove after grid bug is confirmed fixed
            console.log(
              `[Libre3D] migrate v${version}→9: showGrid=${persistedState?.sceneSettings?.showGrid}`,
              'sceneSettings:', persistedState?.sceneSettings
            );
            return persistedState;

          },
          partialize: (state) => ({
            activeProfileId: state.activeProfileId,
            cameraProfiles: state.cameraProfiles,
            entities: state.entities,
            selectedEntityIds: state.selectedEntityIds,
            currentPublishId: state.currentPublishId,

            activeTransformTool: state.activeTransformTool,
            projectionMode: state.projectionMode,
            transformSpace: state.transformSpace,

            sceneSettings: state.sceneSettings,
            postProcessing: state.postProcessing,
            frame: state.frame,

            hudOverlay: state.hudOverlay,
            viewportZoom: state.viewportZoom,
          }),
          // Deep-merge nested objects (sceneSettings, postProcessing, etc.) so that
          // new fields added to initialSceneDefaults always survive old saves that
          // are missing those keys.  Without this, Zustand's default shallow merge
          // replaces the entire sceneSettings object, dropping any key not present
          // in the persisted copy.
          merge: (persistedState: any, currentState: EditorState) => deepMerge(currentState, persistedState),
        }
      ),
      {
        partialize: (state) => ({
          entities: state.entities,
          sceneSettings: state.sceneSettings,
          postProcessing: state.postProcessing,
          frame: state.frame,
          cameraProfiles: state.cameraProfiles,
        }),
      }
    )
  )
);