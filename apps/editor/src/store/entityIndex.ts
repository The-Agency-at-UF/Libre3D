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

// Reduce a selection to its "move roots": drop any id whose ancestor is also
// in the selection. Moving a parent already moves its whole subtree, so
// including a descendant would double-move (and double-transform) it.
export function filterMoveRoots(entities: Entity[], ids: string[]): string[] {
  const { byId } = getEntityIndex(entities);
  const idSet = new Set(ids);
  const result: string[] = [];

  for (const id of ids) {
    if (!byId.has(id) || result.includes(id)) continue;
    if (getAncestorIds(entities, id).some((ancestorId) => idSet.has(ancestorId))) continue;
    result.push(id);
  }
  return result;
}

// Single source of truth for "is this reparent legal", shared by the store
// action (hard guard) and the drag-and-drop UI (blocked cursor). Rules:
// - target must exist (or be null = scene root) and not create a cycle;
// - an *internal* imported-model node (rootEntityId set, and not the model's
//   own synthetic root) must stay inside its model's subtree — its nodePath
//   only resolves against the original glTF scene graph during hydration, so
//   letting it leave the model would leave a dangling node after reload.
//   The model root itself (rootEntityId === id) moves freely.
export function canReparentEntities(entities: Entity[], ids: string[], newParentId: string | null): boolean {
  const { byId } = getEntityIndex(entities);
  const moveRoots = filterMoveRoots(entities, ids);
  if (moveRoots.length === 0) return false;

  const newParentChain = newParentId
    ? [newParentId, ...getAncestorIds(entities, newParentId)]
    : [];

  for (const id of moveRoots) {
    const entity = byId.get(id);
    if (!entity) return false;

    if (newParentId) {
      if (!byId.has(newParentId)) return false;
      if (newParentId === id || getDescendantIds(entities, id).includes(newParentId)) return false;
    }

    const isInternalImportedNode = !!entity.rootEntityId && entity.rootEntityId !== entity.id;
    if (isInternalImportedNode && !newParentChain.includes(entity.rootEntityId!)) {
      return false;
    }
  }
  return true;
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

// Resolves the entity a viewport click should actually select: the outermost
// container the hit entity belongs to, rather than the deepest node under the
// cursor. Imported-model internals resolve to their model's synthetic root, and
// anything sitting inside one or more groups resolves to the outermost enclosing
// group — so a group built from primitives behaves exactly like an imported
// model. A specific child is still reached by double-clicking (drill-in) or via
// the hierarchy panel. Guarded against cycles from corrupted persisted state.
export function getSelectionRootId(entities: Entity[], id: string): string {
  const { byId } = getEntityIndex(entities);
  let current = byId.get(id);
  if (!current) return id;

  if (current.rootEntityId && current.rootEntityId !== current.id) {
    current = byId.get(current.rootEntityId) ?? current;
  }

  const visited = new Set<string>([current.id]);
  while (current.parentId && !visited.has(current.parentId)) {
    const parent = byId.get(current.parentId);
    if (!parent || parent.type !== "group") break;
    visited.add(parent.id);
    current = parent;
  }

  return current.id;
}
