import type { Entity } from "./useEditorStore";

interface EntityIndex {
  byId: Map<string, Entity>;
  childrenByParentId: Map<string | null, string[]>;
}

let lastEntities: Entity[] | null = null;
let lastIndex: EntityIndex | null = null;

// Memoized on the `entities` array reference — every store action already
// replaces `entities` immutably, so `===` correctly detects "nothing changed".
export function getEntityIndex(entities: Entity[]): EntityIndex {
  if (lastEntities === entities && lastIndex) {
    return lastIndex;
  }

  const byId = new Map<string, Entity>();
  const childrenByParentId = new Map<string | null, string[]>();

  for (const entity of entities) {
    byId.set(entity.id, entity);
    const parentKey = entity.parentId ?? null;
    const bucket = childrenByParentId.get(parentKey);
    if (bucket) {
      bucket.push(entity.id);
    } else {
      childrenByParentId.set(parentKey, [entity.id]);
    }
  }

  const index: EntityIndex = { byId, childrenByParentId };
  lastEntities = entities;
  lastIndex = index;
  return index;
}

export function getChildren(entities: Entity[], parentId: string | null): Entity[] {
  const { byId, childrenByParentId } = getEntityIndex(entities);
  const ids = childrenByParentId.get(parentId) ?? [];
  return ids.map((id) => byId.get(id)).filter((entity): entity is Entity => !!entity);
}

// Pre-order DFS, guarded against cycles from corrupted persisted state.
export function getDescendantIds(entities: Entity[], rootId: string): string[] {
  const { childrenByParentId } = getEntityIndex(entities);
  const visited = new Set<string>([rootId]);
  const result: string[] = [];

  const walk = (id: string) => {
    const children = childrenByParentId.get(id) ?? [];
    for (const childId of children) {
      if (visited.has(childId)) continue;
      visited.add(childId);
      result.push(childId);
      walk(childId);
    }
  };

  walk(rootId);
  return result;
}

// Guarded against cycles from corrupted persisted state.
export function getAncestorIds(entities: Entity[], id: string): string[] {
  const { byId } = getEntityIndex(entities);
  const visited = new Set<string>();
  const result: string[] = [];
  let current = byId.get(id);

  while (current?.parentId) {
    if (visited.has(current.parentId)) break;
    visited.add(current.parentId);
    result.push(current.parentId);
    current = byId.get(current.parentId);
  }

  return result;
}
