import * as THREE from "three";
import { describe, expect, it } from "vitest";
import type { Entity } from "../store/useEditorStore";
import {
  getEntityWorldMatrix,
  getWorldPosition,
  makeTranslationMatrix,
  solveLocalFromWorld,
  type EntityTRS,
} from "./entityTransforms";

type Vector3Tuple = [number, number, number];

const EPSILON = 1e-6;

const makeEntity = (id: string, overrides: Partial<Entity> = {}): Entity => ({
  id,
  type: "cube",
  name: id,
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  visible: true,
  locked: false,
  parentId: null,
  ...overrides,
});

const composeTRS = ({ position, rotation, scale }: EntityTRS): THREE.Matrix4 =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(...position),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation, "XYZ")),
    new THREE.Vector3(...scale),
  );

const maxElementDifference = (a: THREE.Matrix4, b: THREE.Matrix4): number =>
  Math.max(...a.elements.map((value, index) => Math.abs(value - b.elements[index])));

const expectMatricesClose = (actual: THREE.Matrix4, expected: THREE.Matrix4) => {
  expect(maxElementDifference(actual, expected)).toBeLessThan(EPSILON);
};

const expectTuplesClose = (actual: Vector3Tuple, expected: Vector3Tuple) => {
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index], 6));
};

// Mirrors what the store's reparent action does: capture the world matrix,
// solve a local TRS under the new parent, and write it back onto the entity.
const reparentPreservingWorld = (entities: Entity[], id: string, newParentId: string | null): Entity[] => {
  const world = getEntityWorldMatrix(entities, id);
  const parentWorld = newParentId ? getEntityWorldMatrix(entities, newParentId) : null;
  const local = solveLocalFromWorld(world, parentWorld);
  return entities.map((entity) => (entity.id === id ? { ...entity, parentId: newParentId, ...local } : entity));
};

// Deterministic PRNG so the randomized round-trip is reproducible.
const createRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

describe("getEntityWorldMatrix", () => {
  it("equals the entity's own TRS when it sits at the scene root", () => {
    const trs: EntityTRS = { position: [1, -2, 3], rotation: [0.4, -1.1, 2.2], scale: [2, 0.5, 1.5] };
    const entities = [makeEntity("solo", trs)];
    expectMatricesClose(getEntityWorldMatrix(entities, "solo"), composeTRS(trs));
  });

  it("applies the parent's rotation to the child's local offset", () => {
    const entities = [
      makeEntity("parent", { position: [10, 0, 0], rotation: [0, Math.PI / 2, 0] }),
      makeEntity("child", { parentId: "parent", position: [1, 0, 0] }),
    ];
    // +90° about Y maps local +X onto world -Z.
    expectTuplesClose(getWorldPosition(getEntityWorldMatrix(entities, "child")), [10, 0, -1]);
  });

  it("composes ancestors root-down, not leaf-up", () => {
    const entities = [
      makeEntity("grandparent", { scale: [2, 2, 2] }),
      makeEntity("parent", { parentId: "grandparent", position: [1, 0, 0] }),
      makeEntity("child", { parentId: "parent", position: [1, 0, 0] }),
    ];
    // Root-down: 2 * (1 + 1) = 4. Leaf-up would give 1 + 1 = 2.
    expectTuplesClose(getWorldPosition(getEntityWorldMatrix(entities, "child")), [4, 0, 0]);
  });

  it("returns identity for an unknown id", () => {
    expectMatricesClose(getEntityWorldMatrix([makeEntity("a")], "ghost"), new THREE.Matrix4());
  });
});

describe("makeTranslationMatrix / getWorldPosition", () => {
  it("round-trips a position through a translation matrix", () => {
    expectTuplesClose(getWorldPosition(makeTranslationMatrix([3, -4, 5.5])), [3, -4, 5.5]);
  });
});

describe("solveLocalFromWorld", () => {
  it("decomposes the world matrix unchanged when there is no parent", () => {
    const trs: EntityTRS = { position: [5, 6, -7], rotation: [0.25, 0.5, -0.75], scale: [1, 2, 3] };
    const solved = solveLocalFromWorld(composeTRS(trs), null);
    expectTuplesClose(solved.position, trs.position);
    expectTuplesClose(solved.rotation, trs.rotation);
    expectTuplesClose(solved.scale, trs.scale);
  });

  it("treats an identity parent the same as no parent", () => {
    const world = composeTRS({ position: [1, 2, 3], rotation: [0.1, 0.2, 0.3], scale: [1, 1, 1] });
    expectMatricesClose(
      composeTRS(solveLocalFromWorld(world, new THREE.Matrix4())),
      composeTRS(solveLocalFromWorld(world, null)),
    );
  });

  it("recovers the stored local transform when solved against the entity's current parent", () => {
    const entities = [
      makeEntity("parent", { position: [3, 1, -2], rotation: [0.6, -0.2, 0.9], scale: [1.5, 1.5, 1.5] }),
      makeEntity("child", { parentId: "parent", position: [-1, 4, 2], rotation: [-0.3, 1.2, 0.1], scale: [2, 1, 0.5] }),
    ];
    const child = entities[1];
    const solved = solveLocalFromWorld(getEntityWorldMatrix(entities, "child"), getEntityWorldMatrix(entities, "parent"));
    expectMatricesClose(composeTRS(solved), composeTRS(child));
  });

  describe("round-trip: reparenting preserves world transform", () => {
    const buildNestedScene = (): Entity[] => [
      makeEntity("grandparent", { position: [2, -1, 3], rotation: [0.3, -0.7, 1.1], scale: [1.5, 1.5, 1.5] }),
      makeEntity("parent", { parentId: "grandparent", position: [-4, 0.5, 2], rotation: [1.2, 0.4, -0.2], scale: [0.5, 0.5, 0.5] }),
      makeEntity("child", { parentId: "parent", position: [1, 2, 3], rotation: [-0.9, 0.35, 2.4], scale: [1, 2, 3] }),
      makeEntity("otherGroup", { position: [-6, 8, 1], rotation: [2.1, -1.3, 0.05], scale: [3, 3, 3] }),
      makeEntity("otherNested", { parentId: "otherGroup", position: [0.5, -0.5, 4], rotation: [0, 0.8, -2.6], scale: [0.25, 0.25, 0.25] }),
      makeEntity("stretched", { position: [0, 3, 0], scale: [4, 1, 0.5] }),
    ];

    it.each([
      ["a nested entity into an unrelated rotated/scaled group", "child", "otherGroup"],
      ["a nested entity into a deeper unrelated branch", "child", "otherNested"],
      ["a nested entity out to the scene root", "child", null],
      ["a nested entity up to its grandparent", "child", "grandparent"],
      ["a root entity into a nested transformed parent", "otherGroup", "parent"],
    ] as const)("moves %s", (_label, id, newParentId) => {
      const entities = buildNestedScene();
      const before = getEntityWorldMatrix(entities, id);
      const after = reparentPreservingWorld(entities, id, newParentId);
      expect(after.find((entity) => entity.id === id)?.parentId).toBe(newParentId);
      expectMatricesClose(getEntityWorldMatrix(after, id), before);
    });

    it("preserves world transform under a non-uniformly scaled parent when the child is unrotated", () => {
      const entities = [...buildNestedScene(), makeEntity("box", { position: [7, -2, 1], scale: [2, 2, 2] })];
      const before = getEntityWorldMatrix(entities, "box");
      const after = reparentPreservingWorld(entities, "box", "stretched");
      expectMatricesClose(getEntityWorldMatrix(after, "box"), before);
    });

    it("preserves world transform across 200 randomized uniform-scale parent chains", () => {
      const random = createRandom(0x11b3d);
      const angle = () => (random() * 2 - 1) * Math.PI;
      const offset = () => (random() * 2 - 1) * 20;
      const uniform = () => 0.1 + random() * 4.9;
      const randomTRS = (isUniform: boolean): Partial<Entity> => {
        const s = uniform();
        return {
          position: [offset(), offset(), offset()],
          rotation: [angle(), angle(), angle()],
          scale: isUniform ? [s, s, s] : [uniform(), uniform(), uniform()],
        };
      };

      for (let trial = 0; trial < 200; trial++) {
        // Two independent chains of random depth; the leaf of chain A moves
        // under the leaf of chain B. Parents use uniform scale (see the
        // shear limitation below); the moved entity itself may be non-uniform.
        const entities: Entity[] = [];
        const depthA = 1 + Math.floor(random() * 4);
        const depthB = 1 + Math.floor(random() * 4);
        for (let i = 0; i < depthA; i++) {
          entities.push(makeEntity(`a${i}`, { parentId: i === 0 ? null : `a${i - 1}`, ...randomTRS(true) }));
        }
        for (let i = 0; i < depthB; i++) {
          entities.push(makeEntity(`b${i}`, { parentId: i === 0 ? null : `b${i - 1}`, ...randomTRS(true) }));
        }
        entities.push(makeEntity("moved", { parentId: `a${depthA - 1}`, ...randomTRS(false) }));

        const before = getEntityWorldMatrix(entities, "moved");
        const after = reparentPreservingWorld(entities, "moved", `b${depthB - 1}`);
        const difference = maxElementDifference(getEntityWorldMatrix(after, "moved"), before);
        expect(difference, `trial ${trial}`).toBeLessThan(1e-5);
      }
    });

    // Documented limitation (see the comment on solveLocalFromWorld): a local
    // TRS can't express shear, so a rotated child under a non-uniformly scaled
    // parent drifts. Marked `fails` so this flips to a failure — prompting its
    // removal — if the limitation is ever lifted.
    it.fails("known limitation: cannot preserve a rotated child under a non-uniformly scaled parent", () => {
      const entities = [
        makeEntity("stretched", { scale: [3, 1, 1] }),
        makeEntity("tilted", { rotation: [0, 0, Math.PI / 4] }),
      ];
      const before = getEntityWorldMatrix(entities, "tilted");
      const after = reparentPreservingWorld(entities, "tilted", "stretched");
      expectMatricesClose(getEntityWorldMatrix(after, "tilted"), before);
    });
  });
});
