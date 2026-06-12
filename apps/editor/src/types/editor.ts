export type SceneObjectType = "box" | "sphere" | "cylinder";

export type Vector3Tuple = readonly [number, number, number];

export interface SceneObject {
  id: string;
  type: SceneObjectType;
  position: Vector3Tuple;
  color: string;
  scale: Vector3Tuple;
}

export interface CreateSceneObjectInput {
  type: SceneObjectType;
  position?: Vector3Tuple;
  color?: string;
  scale?: Vector3Tuple;
}

let sceneObjectIdCounter = 0;

export const createSceneObject = (
  input: CreateSceneObjectInput,
): SceneObject => ({
  id: `scene-object-${++sceneObjectIdCounter}`,
  type: input.type,
  position: input.position ?? [0, 0, 0],
  color: input.color ?? "#4f8cff",
  scale: input.scale ?? [1, 1, 1],
});

export const createInitialSceneObjects = (): SceneObject[] => [
  createSceneObject({
    type: "box",
    position: [0, 0, 0],
    color: "#4f8cff",
    scale: [1, 1, 1],
  }),
];