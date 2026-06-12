import { create } from "zustand";

import {
  createInitialSceneObjects,
  createSceneObject,
  type CreateSceneObjectInput,
  type SceneObject,
} from "../types/editor";

export interface EditorState {
  objects: SceneObject[];
  addObject: (input: CreateSceneObjectInput) => void;
  updateObject: (
    id: string,
    patch: Partial<Omit<SceneObject, "id">>,
  ) => void;
  removeObject: (id: string) => void;
  setObjects: (objects: SceneObject[]) => void;
  resetObjects: () => void;
}

const initialObjects = createInitialSceneObjects();

const cloneObjects = (objects: SceneObject[]): SceneObject[] =>
  objects.map((object) => ({
    ...object,
    position: [...object.position] as SceneObject["position"],
    scale: [...object.scale] as SceneObject["scale"],
  }));

export const useEditorStore = create<EditorState>((set) => ({
  objects: cloneObjects(initialObjects),
  addObject: (input) =>
    set((state) => ({
      objects: [...state.objects, createSceneObject(input)],
    })),
  updateObject: (id, patch) =>
    set((state) => ({
      objects: state.objects.map((object) =>
        object.id === id ? { ...object, ...patch } : object,
      ),
    })),
  removeObject: (id) =>
    set((state) => ({
      objects: state.objects.filter((object) => object.id !== id),
    })),
  setObjects: (objects) =>
    set({
      objects: cloneObjects(objects),
    }),
  resetObjects: () =>
    set({
      objects: cloneObjects(initialObjects),
    }),
}));