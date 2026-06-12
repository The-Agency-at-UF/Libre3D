import { create } from "zustand";
import { persist, createJSONStorage, subscribeWithSelector } from "zustand/middleware";

export type EntityType = "cube" | "sphere" | "torus";

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
}

type EntityTransformUpdates = Partial<Pick<Entity, "position" | "rotation" | "scale" | "color">>;

export interface EditorState {
  entities: Entity[];
  selectedEntityId: string | null;
  currentPublishId: string | null;
  addEntity: (type: EntityType) => void;
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
};

const ZERO_VECTOR: [number, number, number] = [0, 0, 0];
const UNIT_VECTOR: [number, number, number] = [1, 1, 1];

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
  position: [...ZERO_VECTOR] as [number, number, number],
  rotation: [...ZERO_VECTOR] as [number, number, number],
  scale: [...UNIT_VECTOR] as [number, number, number],
  color: ENTITY_DEFAULTS[type].color,
  visible: true,
  locked: false,
});

const initialEntities: Entity[] = [createEntity("cube")];

const cloneVector = (vector: [number, number, number]): [number, number, number] => [
  vector[0],
  vector[1],
  vector[2],
];

const cloneEntity = (entity: Entity): Entity => ({
  ...entity,
  position: cloneVector(entity.position),
  rotation: cloneVector(entity.rotation),
  scale: cloneVector(entity.scale),
  visible: entity.visible ?? true,
  locked: entity.locked ?? false,
});

export const useEditorStore = create<EditorState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        entities: initialEntities.map(cloneEntity),
        selectedEntityId: null,
        currentPublishId: null,
        addEntity: (type) =>
          set((state) => {
            const entity = createEntity(type);

            return {
              entities: [...state.entities, entity],
              selectedEntityId: entity.id,
            };
          }),
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
      }),
      {
        name: "libre3d-scene-state",
        version: 2,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          entities: state.entities,
          selectedEntityId: state.selectedEntityId,
          currentPublishId: state.currentPublishId,
          bgColor: state.bgColor,
          gridPlane: state.gridPlane,
          wireframe: state.wireframe,
          lightIntensity: state.lightIntensity,
          lightColor: state.lightColor,
          fogEnabled: state.fogEnabled,
        }),
        migrate: (persistedState) => {
          const legacyState = persistedState as any;
          const legacyObjects = legacyState && "objects" in legacyState ? legacyState.objects : undefined;
          const legacyEntities = Array.isArray(legacyObjects) ? (legacyObjects as Entity[]) : [];

          const nextEntities =
            legacyState && "entities" in legacyState && Array.isArray(legacyState.entities)
              ? (legacyState.entities as Entity[])
              : legacyEntities;

          return {
            entities:
              nextEntities.length > 0
                ? nextEntities.map(cloneEntity)
                : initialEntities.map(cloneEntity),
            selectedEntityId: legacyState?.selectedEntityId ?? null,
            currentPublishId: legacyState?.currentPublishId ?? null,
            bgColor: legacyState?.bgColor ?? "#0b1020",
            gridPlane: legacyState?.gridPlane ?? "Floor (XZ)",
            wireframe: legacyState?.wireframe ?? false,
            lightIntensity: legacyState?.lightIntensity ?? 0.75,
            lightColor: legacyState?.lightColor ?? "#ffffff",
            fogEnabled: legacyState?.fogEnabled ?? false,
          };
        },
        merge: (persistedState, currentState) => {
          const nextState = persistedState as Partial<EditorState> | undefined;
          const entities = Array.isArray(nextState?.entities)
            ? (nextState.entities as Entity[])
            : currentState.entities;

          return {
            ...currentState,
            ...nextState,
            entities:
              entities.length > 0
                ? entities.map(cloneEntity)
                : initialEntities.map(cloneEntity),
            selectedEntityId:
              nextState?.selectedEntityId ?? currentState.selectedEntityId ?? null,
            currentPublishId:
              nextState?.currentPublishId ?? currentState.currentPublishId ?? null,
            bgColor: nextState?.bgColor ?? currentState.bgColor,
            gridPlane: nextState?.gridPlane ?? currentState.gridPlane,
            wireframe: nextState?.wireframe ?? currentState.wireframe,
            lightIntensity: nextState?.lightIntensity ?? currentState.lightIntensity,
            lightColor: nextState?.lightColor ?? currentState.lightColor,
            fogEnabled: nextState?.fogEnabled ?? currentState.fogEnabled,
          };
        },
      },
    ),
  ),
);