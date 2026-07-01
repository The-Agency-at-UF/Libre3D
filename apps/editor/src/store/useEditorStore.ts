import { create } from "zustand";
import { persist, createJSONStorage, subscribeWithSelector } from "zustand/middleware";

export type EntityType = "cube" | "sphere" | "torus" | "directionalLight" | "camera";

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  visible: boolean;
  locked: boolean;
  cameraProperties?: {
    fov: number;
    near: number;
    far: number;
    zoom: number;
  };
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
  cameraProperties?: Partial<Required<Entity>["cameraProperties"]>;
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
  gridPlane: string;
  wireframe: boolean;
  fogEnabled: boolean;
  environment: string;
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
  gridPlane: "Floor (XZ)",
  wireframe: false,
  fogEnabled: false,
  environment: "Studio",
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

export interface EditorState {
  entities: Entity[];
  selectedEntityId: string | null;
  currentPublishId: string | null;
  activeCameraId: string;
  setActiveCameraId: (id: string) => void;
  activeProfileId: string;
  cameraProfiles: Record<string, CameraProfile>;
  setActiveProfile: (id: string) => void;
  addCameraProfile: (id: string, data?: Partial<CameraProfile>) => string;
  updateProfileData: (id: string, updates: Partial<CameraProfile>) => void;
  addEntity: (type: EntityType) => string;
  removeEntity: (id: string) => void;
  updateEntityTransform: (id: string, updates: EntityTransformUpdates) => void;
  selectEntity: (id: string | null) => void;
  setCurrentPublishId: (id: string | null) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  renameEntity: (id: string, newName: string) => void;
  bgColor: string;
  gridPlane: string;
  wireframe: boolean;
  lightIntensity: number;
  lightColor: string;
  fogEnabled: boolean;
  setBgColor: (color: string) => void;
  setGridPlane: (plane: string) => void;
  setWireframe: (wireframe: boolean) => void;
  setLightIntensity: (intensity: number) => void;
  setLightColor: (color: string) => void;
  setFogEnabled: (enabled: boolean) => void;

  // Viewport / Projection
  activeTransformTool: "translate" | "rotate" | "scale";
  projectionMode: "perspective" | "orthographic";
  transformSpace: "world" | "local";

  sceneSettings: SceneSettingsConfig;
  postProcessing: PostProcessingConfig;
  personalCameraProperties: {
    fov: number;
    near: number;
    far: number;
    zoom: number;
  };

  // Frame
  viewport: string;
  resolution: string;
  autoZoom: boolean;
  hudOverlay: string;
  viewportZoom: number;

  // Scene
  bgAlpha: string;
  environment: string;
  lightAmbientEnabled: boolean;
  lightDirectionalEnabled: boolean;
  lightShadow: string;
  physicsEnabled: boolean;
  gravityY: number;
  collisionType: string;

  // Post Processing
  postProcessingEnabled: boolean;
  toneMap: string;
  exposure: number;
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  bloomRadius: number;
  ssaoEnabled: boolean;
  ssaoIntensity: number;
  dofEnabled: boolean;
  dofFocusDist: number;
  dofBokeh: number;
  chromaticAberrationEnabled: boolean;
  chromaticAberrationIntensity: number;
  motionBlurEnabled: boolean;
  motionBlurIntensity: number;
  filmGrainEnabled: boolean;
  filmGrainIntensity: number;
  vignetteEnabled: boolean;
  vignetteIntensity: number;
  outlineEnabled: boolean;
  outlineColor: string;
  colorGradingEnabled: boolean;
  colorGradingBrightness: number;
  colorGradingContrast: number;
  colorGradingSaturation: number;

  // Global Settings
  snapping: string;
  snapSize: number;
  renderer: string;

  // Material Builder
  materialName: string;
  materialType: string;
  materialBaseColor: string;
  materialMetalness: number;
  materialRoughness: number;
  materialOpacity: number;
  materialSide: string;
  materialEmissiveColor: string;
  materialEmissiveIntensity: number;
  materialClearcoat: number;
  materialTransmission: number;
  materialIor: number;
  materialIridescence: number;
  materialLibraryTab: string;
  activeMaterialCard: string;

  // Play Mode / Preview
  isPreviewMode: boolean;
  previewGlbUrl: string | null;
  setPreviewMode: (active: boolean, url: string | null) => void;

  updatePostProcessing: (updates: DeepPartial<PostProcessingConfig>) => void;
  updateSceneSettings: (updates: DeepPartial<SceneSettingsConfig>) => void;
  updatePersonalCameraProperties: (updates: Partial<{ fov: number; near: number; far: number; zoom: number }>) => void;
  setEditorState: (updates: Partial<Omit<EditorState, "entities" | "selectedEntityId" | "currentPublishId" | "addEntity" | "removeEntity" | "updateEntityTransform" | "selectEntity" | "setCurrentPublishId" | "toggleVisibility" | "toggleLock" | "renameEntity" | "setBgColor" | "setGridPlane" | "setWireframe" | "setLightIntensity" | "setLightColor" | "setFogEnabled" | "updatePostProcessing" | "updateSceneSettings" | "setEditorState" | "setActiveCameraId" | "setActiveProfile" | "addCameraProfile" | "updateProfileData" | "setPreviewMode" | "updatePersonalCameraProperties">>) => void;
}

const ENTITY_DEFAULTS: Record<EntityType, Pick<Entity, "name" | "color">> = {
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
    color: "#fde047",
  },
  camera: {
    name: "Camera",
    color: "#60a5fa",
  },
};

const ZERO_VECTOR: [number, number, number] = [0, 0, 0];
const UNIT_VECTOR: [number, number, number] = [1, 1, 1];
const DEFAULT_CAMERA_PROFILE_ID = "personal";

const DEFAULT_CAMERA_PROFILE: CameraProfile = {
  id: DEFAULT_CAMERA_PROFILE_ID,
  name: "Personal Camera",
  position: [0, 5, 10],
  target: [0, 0, 0],
  fov: 45,
  near: 0.1,
  far: 100,
  zoom: 1,
};

const createEntityId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `entity-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createEntity = (type: EntityType): Entity => ({
  id: createEntityId(),
  type,
  name: ENTITY_DEFAULTS[type].name,
  position: (type === "directionalLight" ? [5, 8, 4] : (type === "camera" ? [5, 5, 5] : [...ZERO_VECTOR])) as [number, number, number],
  rotation: (type === "camera" ? [-Math.PI / 6, Math.PI / 4, 0] : [...ZERO_VECTOR]) as [number, number, number],
  scale: [...UNIT_VECTOR] as [number, number, number],
  color: ENTITY_DEFAULTS[type].color,
  visible: true,
  locked: false,
  ...(type === "camera" ? {
    cameraProperties: {
      fov: 45,
      near: 0.5,
      far: 1000,
      zoom: 1,
    }
  } : {}),
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
    persist(
      (set) => ({
        entities: initialEntities.map(cloneEntity),
        selectedEntityId: null,
        currentPublishId: null,
        activeCameraId: DEFAULT_CAMERA_PROFILE_ID,
        setActiveCameraId: (id) => set({ activeCameraId: id, activeProfileId: id }),
        activeProfileId: DEFAULT_CAMERA_PROFILE_ID,
        cameraProfiles: {
          [DEFAULT_CAMERA_PROFILE_ID]: cloneCameraProfile(DEFAULT_CAMERA_PROFILE),
        },
        setActiveProfile: (id) => set({ activeProfileId: id, activeCameraId: id }),
        addCameraProfile: (id, data = {}) => {
          set((state) => {
            const nextProfile = createCameraProfile(id, data);
            return {
              cameraProfiles: {
                ...state.cameraProfiles,
                [id]: nextProfile,
              },
              activeProfileId: id,
              activeCameraId: id,
            };
          });

          return id;
        },
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
              personalCameraProperties:
                id === DEFAULT_CAMERA_PROFILE_ID
                  ? {
                      fov: nextProfile.fov,
                      near: nextProfile.near,
                      far: nextProfile.far,
                      zoom: nextProfile.zoom,
                    }
                  : state.personalCameraProperties,
            };
          }),
        addEntity: (type) => {
          let newId = "";
          set((state) => {
            if (type === "camera") {
              const cameraCount = Object.keys(state.cameraProfiles).filter((profileId) => profileId !== DEFAULT_CAMERA_PROFILE_ID).length + 1;
              const profileId = `camera_${cameraCount}`;
              const nextProfile = createCameraProfile(profileId, {
                name: `Camera ${cameraCount}`,
                position: [5, 5, 5],
                target: [0, 0, 0],
                fov: 45,
                near: 0.5,
                far: 1000,
                zoom: 1,
              });

              newId = profileId;

              return {
                cameraProfiles: {
                  ...state.cameraProfiles,
                  [profileId]: nextProfile,
                },
                activeProfileId: profileId,
                activeCameraId: profileId,
              };
            }

            const entity = createEntity(type);
            newId = entity.id;

            return {
              entities: [...state.entities, entity],
              selectedEntityId: entity.id,
            };
          });
          return newId;
        },
        removeEntity: (id) =>
          set((state) => ({
            entities: state.entities.filter((entity) => entity.id !== id),
            selectedEntityId:
              state.selectedEntityId === id ? null : state.selectedEntityId,
          })),
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
                  cameraProperties: updates.cameraProperties
                    ? {
                      ...entity.cameraProperties,
                      ...updates.cameraProperties,
                    } as any
                    : entity.cameraProperties,
                }
                : entity,
            ),
          })),
        selectEntity: (id) =>
          set({
            selectedEntityId: id,
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
            selectedEntityId:
              state.selectedEntityId === id ? null : state.selectedEntityId,
          })),
        renameEntity: (id, newName) =>
          set((state) => ({
            entities: state.entities.map((entity) =>
              entity.id === id ? { ...entity, name: newName } : entity,
            ),
          })),
        bgColor: "#0b1020",
        gridPlane: "Floor (XZ)",
        wireframe: false,
        lightIntensity: 0.75,
        lightColor: "#ffffff",
        fogEnabled: false,
        setBgColor: (color) => set({ bgColor: color }),
        setGridPlane: (plane) => set({ gridPlane: plane }),
        setWireframe: (wireframe) => set({ wireframe }),
        setLightIntensity: (intensity) => set({ lightIntensity: intensity }),
        setLightColor: (color) => set({ lightColor: color }),
        setFogEnabled: (enabled) => set({ fogEnabled: enabled }),

        // Viewport / Projection
        activeTransformTool: "translate",
        projectionMode: "perspective",
        transformSpace: "world",
        personalCameraProperties: {
          fov: DEFAULT_CAMERA_PROFILE.fov,
          near: DEFAULT_CAMERA_PROFILE.near,
          far: DEFAULT_CAMERA_PROFILE.far,
          zoom: DEFAULT_CAMERA_PROFILE.zoom,
        },

        sceneSettings: initialSceneDefaults,
        postProcessing: initialPostProcessingDefaults,

        // Frame
        viewport: "Personal Camera",
        resolution: "Responsive",
        autoZoom: false,
        hudOverlay: "None",
        viewportZoom: 100,

        // Scene
        bgAlpha: "100%",
        environment: "Studio",
        lightAmbientEnabled: true,
        lightDirectionalEnabled: true,
        lightShadow: "Soft",
        physicsEnabled: false,
        gravityY: -9.8,
        collisionType: "Mesh",

        // Post Processing
        postProcessingEnabled: true,
        toneMap: "ACES Filmic",
        exposure: 0.00,
        bloomEnabled: true,
        bloomIntensity: 40,
        bloomThreshold: 0.85,
        bloomRadius: 0.4,
        ssaoEnabled: false,
        ssaoIntensity: 25,
        dofEnabled: false,
        dofFocusDist: 10.0,
        dofBokeh: 0.30,
        chromaticAberrationEnabled: false,
        chromaticAberrationIntensity: 0,
        motionBlurEnabled: false,
        motionBlurIntensity: 0,
        filmGrainEnabled: false,
        filmGrainIntensity: 0,
        vignetteEnabled: true,
        vignetteIntensity: 15,
        outlineEnabled: false,
        outlineColor: "5865F2",
        colorGradingEnabled: false,
        colorGradingBrightness: 0.00,
        colorGradingContrast: 0.00,
        colorGradingSaturation: 0.00,

        // Global Settings
        snapping: "Object",
        snapSize: 1.0,
        renderer: "WebGL 2",

        // Material Builder
        materialName: "New Material",
        materialType: "Standard (PBR)",
        materialBaseColor: "888888",
        materialMetalness: 0.00,
        materialRoughness: 0.50,
        materialOpacity: 1.00,
        materialSide: "Front",
        materialEmissiveColor: "000000",
        materialEmissiveIntensity: 0.0,
        materialClearcoat: 0.00,
        materialTransmission: 0.00,
        materialIor: 1.50,
        materialIridescence: 0.00,
        materialLibraryTab: "materials",
        activeMaterialCard: "rough",

        // Play Mode / Preview
        isPreviewMode: false,
        previewGlbUrl: null,
        setPreviewMode: (active, url) => set({ isPreviewMode: active, previewGlbUrl: url }),

        updatePostProcessing: (updates) =>
          set((state) => ({
            postProcessing: deepMerge(state.postProcessing, updates),
          })),
        updateSceneSettings: (updates) =>
          set((state) => ({
            sceneSettings: deepMerge(state.sceneSettings, updates),
          })),
        updatePersonalCameraProperties: (updates) =>
          set((state) => ({
            personalCameraProperties: {
              ...state.personalCameraProperties,
              ...updates,
            },
            cameraProfiles: {
              ...state.cameraProfiles,
              [DEFAULT_CAMERA_PROFILE_ID]: {
                ...state.cameraProfiles[DEFAULT_CAMERA_PROFILE_ID],
                ...updates,
                position: cloneVector(state.cameraProfiles[DEFAULT_CAMERA_PROFILE_ID].position),
                target: cloneVector(state.cameraProfiles[DEFAULT_CAMERA_PROFILE_ID].target),
              },
            },
          })),
        setEditorState: (updates) => set((state) => ({ ...state, ...updates })),
      }),
      {
        name: "libre3d-scene-state",
        version: 7,
        storage: createJSONStorage(() => localStorage),
        migrate: (persistedState: any, version: number) => {
          if (version < 4) {
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
              gridPlane: persistedState.gridPlane !== undefined ? persistedState.gridPlane : "Floor (XZ)",
              wireframe: persistedState.wireframe !== undefined ? persistedState.wireframe : false,
              fogEnabled: persistedState.fogEnabled !== undefined ? persistedState.fogEnabled : false,
              environment: persistedState.environment !== undefined ? persistedState.environment : "Studio",
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
              "colorGradingContrast", "colorGradingSaturation", "bgColor", "bgAlpha", "gridPlane", "wireframe", "fogEnabled",
              "environment", "lightIntensity", "lightColor", "lightAmbientEnabled", "lightDirectionalEnabled", "lightShadow",
              "physicsEnabled", "gravityY", "collisionType"
            ];
            keysToDelete.forEach((key) => {
              delete persistedState[key];
            });
          }

          if (version < 5) {
            if (persistedState && persistedState.entities) {
              const hasLight = persistedState.entities.some((e: any) => e.type === "directionalLight");
              if (!hasLight) {
                persistedState.entities.push({
                  id: "directional-light-1",
                  type: "directionalLight",
                  name: "Directional Light",
                  position: [5, 8, 4],
                  rotation: [0, 0, 0],
                  scale: [1, 1, 1],
                  color: "#ffffff",
                  visible: true,
                  locked: false,
                });
              }
            }
          }

          if (version < 6) {
            if (persistedState) {
              if (persistedState.activeCameraId === undefined) {
                persistedState.activeCameraId = DEFAULT_CAMERA_PROFILE_ID;
              }
            }
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
              persistedState.activeCameraId = persistedState.activeProfileId;
            }
          }
          return persistedState;
        },
        partialize: (state) => ({
          activeCameraId: state.activeCameraId,
          activeProfileId: state.activeProfileId,
          cameraProfiles: state.cameraProfiles,
          entities: state.entities,
          selectedEntityId: state.selectedEntityId,
          currentPublishId: state.currentPublishId,
          bgColor: state.bgColor,
          gridPlane: state.gridPlane,
          wireframe: state.wireframe,
          lightIntensity: state.lightIntensity,
          lightColor: state.lightColor,
          fogEnabled: state.fogEnabled,

          activeTransformTool: state.activeTransformTool,
          projectionMode: state.projectionMode,
          transformSpace: state.transformSpace,
          personalCameraProperties: state.personalCameraProperties,

          sceneSettings: state.sceneSettings,
          postProcessing: state.postProcessing,

          viewport: state.viewport,
          resolution: state.resolution,
          autoZoom: state.autoZoom,
          hudOverlay: state.hudOverlay,
          viewportZoom: state.viewportZoom,

          bgAlpha: state.bgAlpha,
          environment: state.environment,
          lightAmbientEnabled: state.lightAmbientEnabled,
          lightDirectionalEnabled: state.lightDirectionalEnabled,
          lightShadow: state.lightShadow,
          physicsEnabled: state.physicsEnabled,
          gravityY: state.gravityY,
          collisionType: state.collisionType,

          postProcessingEnabled: state.postProcessingEnabled,
          toneMap: state.toneMap,
          exposure: state.exposure,
          bloomEnabled: state.bloomEnabled,
          bloomIntensity: state.bloomIntensity,
          bloomThreshold: state.bloomThreshold,
          bloomRadius: state.bloomRadius,
          ssaoEnabled: state.ssaoEnabled,
          ssaoIntensity: state.ssaoIntensity,
          dofEnabled: state.dofEnabled,
          dofFocusDist: state.dofFocusDist,
          dofBokeh: state.dofBokeh,
          chromaticAberrationEnabled: state.chromaticAberrationEnabled,
          chromaticAberrationIntensity: state.chromaticAberrationIntensity,
          motionBlurEnabled: state.motionBlurEnabled,
          motionBlurIntensity: state.motionBlurIntensity,
          filmGrainEnabled: state.filmGrainEnabled,
          filmGrainIntensity: state.filmGrainIntensity,
          vignetteEnabled: state.vignetteEnabled,
          vignetteIntensity: state.vignetteIntensity,
          outlineEnabled: state.outlineEnabled,
          outlineColor: state.outlineColor,
          colorGradingEnabled: state.colorGradingEnabled,
          colorGradingBrightness: state.colorGradingBrightness,
          colorGradingContrast: state.colorGradingContrast,
          colorGradingSaturation: state.colorGradingSaturation,

          snapping: state.snapping,
          snapSize: state.snapSize,
          renderer: state.renderer,

          materialName: state.materialName,
          materialType: state.materialType,
          materialBaseColor: state.materialBaseColor,
          materialMetalness: state.materialMetalness,
          materialRoughness: state.materialRoughness,
          materialOpacity: state.materialOpacity,
          materialSide: state.materialSide,
          materialEmissiveColor: state.materialEmissiveColor,
          materialEmissiveIntensity: state.materialEmissiveIntensity,
          materialClearcoat: state.materialClearcoat,
          materialTransmission: state.materialTransmission,
          materialIor: state.materialIor,
          materialIridescence: state.materialIridescence,
          materialLibraryTab: state.materialLibraryTab,
          activeMaterialCard: state.activeMaterialCard,
        }),
      },
    ),
  ),
);