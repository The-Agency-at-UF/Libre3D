# Store API Reference

Complete reference for the Libre3D Zustand store (`useEditorStore`). This guide explains all available actions, state fields, and important patterns for working with the store.

## Quick Links
- [State Fields](#state-fields)
- [Entity Management](#entity-management)
- [Viewport & Transform](#viewport--transform)
- [Settings & Config](#settings--config)
- [Material Layers](#material-layers)
- [Camera Profiles](#camera-profiles)
- [Important Patterns](#important-patterns)

---

## State Fields

### Scene Data
```typescript
entities: Entity[]
```
The complete list of entities in the scene. Each entity has position, rotation, scale, visibility, and lock state. **Always read via selector**, never mutate directly.

```typescript
selectedEntityIds: string[]
```
IDs of currently selected entities. Use `selectEntity()` or `selectEntities()` to modify.

### Selection & Publishing
```typescript
currentPublishId: string | null
```
ID of the most recently published scene (for sharing links). Set via `setCurrentPublishId()`.

### Viewport State
```typescript
activeTransformTool: "translate" | "rotate" | "scale"
```
Current transform gizmo mode. Set via `useViewportControls` hook; you typically don't set this directly.

```typescript
projectionMode: "perspective" | "orthographic"
transformSpace: "world" | "local"
```
Rendering mode and gizmo coordinate space. Managed by the viewport layer.

```typescript
hudOverlay: string
viewportZoom: number
```
HUD settings (FPS overlay, grid, axis guides, etc.). Zoom level is managed by controls and stored for persistence.

### Scene Configuration (Persisted)
```typescript
sceneSettings: SceneSettingsConfig
postProcessing: PostProcessingConfig
frame: FrameSettingsConfig
```
Three nested config objects. **These are updated via deep merge, not replacement** — see [Deep Merge Pattern](#deep-merge-pattern).

### Preview & Play Mode
```typescript
isPreviewMode: boolean
previewGlbUrl: string | null
```
Play mode state. Set via `setPreviewMode(active, url)`. Not persisted (session-scoped).

```typescript
pendingImportCount: number
```
Tracks how many GLB imports are in-flight (picked but not yet parsed). Adjusted via `adjustPendingImports(delta)`.

### Camera Profiles
```typescript
activeProfileId: string
cameraProfiles: Record<string, CameraProfile>
```
Named camera positions (viewport bookmarks). Default profile is always "personal".

---

## Entity Management

### Adding Entities

#### `addEntity(type: EntityType) → string`
Creates a single primitive entity (cube, sphere, torus, directional light, or group).
- **Signature**: `(type: "cube" | "sphere" | "torus" | "directionalLight" | "group") => string`
- **Returns**: New entity ID
- **Auto-selects**: The new entity becomes selected
- **Example**:
  ```typescript
  const newCubeId = useEditorStore((state) => state.addEntity)("cube");
  ```

#### `addImportedModelHierarchy(assetId: string, nodes: ImportNodeSpec[]) → string`
Imports a GLB model hierarchy (preserves parent-child relationships).
- **Signature**: `(assetId: string, nodes: ImportNodeSpec[]) => string`
- **Returns**: ID of the root imported entity
- **Nodes format**: Array of `ImportNodeSpec` with tempId, parentTempId, name, position, rotation, scale, nodePath
- **Behavior**: Remaps temp IDs to real IDs internally; all nodes get type "importedModel"

### Selecting Entities

#### `selectEntity(id: string | null, multi?: boolean) → void`
Select a single entity or clear selection.
- **multi=false** (default): Replace current selection
- **multi=true**: Add to selection (shift+click behavior)
- **id=null**: Clear selection

#### `selectEntities(ids: string[], mode?: "replace" | "add" | "subtract") → void`
Batch select entities.
- **"replace"** (default): Replace current selection
- **"add"**: Union with current selection
- **"subtract"**: Remove these IDs from current selection

### Modifying Entities

#### `updateEntityTransform(id: string, updates: EntityTransformUpdates) → void`
Update position, rotation, or scale of a single entity.
- **Updates shape**: `{ position?: [...], rotation?: [...], scale?: [...] }`
- **Note**: Transforms are [x, y, z] tuples; always pass new tuples, never reuse
- **Triggers** Undo/redo: Yes (full history checkpoint)

#### `updateMultipleEntityTransforms(updates: Record<string, EntityTransformUpdates>) → void`
Update transforms for multiple entities in a single action.
- **Efficiency**: One undo/redo checkpoint for the whole batch
- **Example**:
  ```typescript
  updateMultipleEntityTransforms({
    "entity-1": { position: [0, 5, 0] },
    "entity-2": { rotation: [0, Math.PI / 2, 0] },
  })
  ```

#### `renameEntity(id: string, newName: string) → void`
Rename a single entity. Shows in hierarchy panel.

#### `renameEntities(updates: Record<string, string>) → void`
Batch rename multiple entities.

#### `toggleVisibility(id: string) → void`
Toggle visibility (eye icon in hierarchy). Hides/shows in viewport.

#### `toggleLock(id: string) → void`
Toggle locked state (lock icon in hierarchy). Prevents transform via gizmo.

### Removing & Duplicating

#### `removeEntity(ids: string[]) → void`
Delete one or more entities and all descendants.
- **OPFS cleanup**: Deferred until next app load (so undo works)
- **Selection**: Auto-clears deleted entities from selection

#### `duplicateEntity(ids: string[]) → void`
Clone selected entities with all descendants.
- **Naming**: Cloned root gets " (Copy)" suffix
- **Position offset**: Cloned roots shift by +0.5 on X and Z axes
- **New selection**: Cloned roots become selected; children keep their relative structure
- **Handles descendants**: Automatically includes all children and remaps parent pointers

### Hierarchy Operations

#### `reparentEntities(ids: string[], newParentId: string | null, index?: number) → void`
Move entities to a new parent, preserving their world-space position.
- **newParentId=null**: Move to scene root
- **index**: Insert position among siblings of new parent (optional, appends if omitted)
- **World preservation**: Local transforms are automatically recomputed so object doesn't jump
- **Validation**: Refuses to create cycles or cross imported-model boundaries
- **One step**: Entire reparent is a single undo/redo checkpoint

#### `groupEntities(ids: string[]) → string`
Group selected entities under a new parent.
- **Returns**: ID of new group
- **Group behavior**: Empty "group" entity with no material, serves as transform pivot
- **Centroid**: Group pivots at the centroid of grouped entities' world positions
- **Parent**: New group's parent is the common parent of grouped entities
- **Selection**: Grouped entities become deselected; group becomes selected

#### `ungroupEntity(id: string) → void`
Dissolve a group, promoting children to its parent level.
- **World preservation**: Children keep their world positions (local transforms recomputed)
- **Safety**: Only works on groups; silently fails on primitives

#### `applyHierarchyPrune(removedIds: Set<string>, updates: Map<string, {...}>) → void`
Internal action used during GLB import cleanup. Removes orphaned nodes and applies transform updates. (Rarely called directly.)

---

## Viewport & Transform

#### `updateFrameSettings(updates: DeepPartial<FrameSettingsConfig>) → void`
Update canvas frame size/preset.
- **Mode options**: "responsive" | "1920x1080" | "1080x1080" | "custom"
- **Width/height**: Only used when mode="custom"
- **Deep merge**: Only provided fields are updated

#### `setPreviewMode(active: boolean, url: string | null) → void`
Enter/exit play mode.
- **active=true, url=...**: Switch to play mode with a generated GLB preview
- **active=false**: Exit play mode, return to editing

#### `adjustPendingImports(delta: number) → void`
Increment/decrement pending import counter (file picked but not parsed).
- **Internal use**: Called by import pipeline to track async GLB loading
- **Usage**: `adjustPendingImports(1)` when user picks file; `adjustPendingImports(-1)` when parsed

---

## Settings & Config

All settings follow the **deep merge pattern** — see [Deep Merge Pattern](#deep-merge-pattern).

### Scene Settings

#### `updateSceneSettings(updates: DeepPartial<SceneSettingsConfig>) → void`
Update background color, grid, fog, lighting, physics, etc.

**Available fields**:
- `bgColor`: Hex color string (e.g., "#0b1020")
- `bgAlpha`: Opacity percentage (e.g., "100%")
- `showGrid`: Show floor grid
- `wireframe`: Render all objects in wireframe mode
- `fogEnabled`: Enable atmospheric fog
- `showAxisGuides`: Show red/green/blue axis highlights
- **lights** (nested):
  - `intensity`: Ambient light strength (0-2)
  - `color`: Hex color
  - `ambientEnabled`: Enable ambient light
  - `directionalEnabled`: Enable default directional light
  - `shadow`: "Off" | "Soft" | "Hard"
- **physics** (nested):
  - `enabled`: Enable physics simulation
  - `gravityY`: Gravity vector Y component
  - `collisionType`: "Mesh" | "Convex" | "Sphere"

**Example**:
```typescript
updateSceneSettings({
  bgColor: "#ff0000",
  showGrid: true,
  lights: { intensity: 1.2 }
})
```

### Post-Processing

#### `updatePostProcessing(updates: DeepPartial<PostProcessingConfig>) → void`
Update visual effects: bloom, SSAO, depth of field, motion blur, color grading, etc.

**Major categories**:
- **tone mapping**: "ACES Filmic" | others
- **exposure**: Number (-2 to +2)
- **bloom**: `{ enabled, intensity, threshold, radius }`
- **ssao** (screen-space ambient occlusion): `{ enabled, intensity }`
- **dof** (depth of field): `{ enabled, focusDistance, bokeh }`
- **motionBlur**: `{ enabled, intensity }`
- **filmGrain**: `{ enabled, intensity }`
- **vignette**: `{ enabled, intensity }`
- **colorGrading**: `{ enabled, brightness, contrast, saturation }`

**Example**:
```typescript
updatePostProcessing({
  bloom: { intensity: 50 },
  exposure: 0.1
})
```

---

## Material Layers

Each entity can have multiple material layers (color, lighting, textures) stacked on top of each other.

### Adding Layers

#### `addMaterialLayer(entityId: string, layerType: MaterialLayerType) → void`
Add a color, lighting, or image layer to an entity.
- **Types**: "color" | "lighting" | "image"
- **Defaults**: New layers created with sensible defaults

### Removing Layers

#### `removeMaterialLayer(entityId: string, layerId: string) → void`
Remove a layer from an entity.

### Updating Layers

#### `updateMaterialLayer(entityId: string, layerId: string, updates: Partial<MaterialLayer>) → void`
Update a single layer's properties.
- **Partial updates**: Only changed fields are merged

#### `updateMultipleEntityMaterialLayers(updates: Record<string, { layerId: string; updates: Partial<MaterialLayer> }>) → void`
Batch update layers across multiple entities.

### Replacing All Layers

#### `setEntityMaterialLayers(entityId: string, layers: MaterialLayer[]) → void`
Replace an entity's entire layer stack.
- **Full replacement**: Old layers are discarded
- **Validation**: System enforces at least one color and one lighting layer

**Layer interfaces**:

**ColorLayer**:
```typescript
{
  id: string;
  type: "color";
  enabled: boolean;
  opacity: number; // 0-1
  color: string; // hex color
  alphaMode?: "OPAQUE" | "MASK" | "BLEND"; // from imported material
  alphaCutoff?: number; // for MASK mode
  doubleSided?: boolean; // from imported material
}
```

**LightingLayer**:
```typescript
{
  id: string;
  type: "lighting";
  enabled: boolean;
  opacity: number; // 0-1
  model: "none" | "lambert" | "phong" | "physical" | "toon";
  roughness: number; // 0-1, for physical
  metalness: number; // 0-1, for physical
  shininess: number; // for phong
  emissive: string; // hex color
  emissiveIntensity: number;
}
```

**ImageLayer** (texture):
```typescript
{
  id: string;
  type: "image";
  enabled: boolean;
  opacity: number; // 0-1
  textureAssetId: string; // reference to OPFS asset
  slot: "color" | "normal" | "metallicRoughness" | "emissive" | "ao";
  wrapS: number; // THREE.js wrap constant
  wrapT: number; // THREE.js wrap constant
}
```

---

## Camera Profiles

Camera profiles are named bookmarks of camera position, target, and FOV.

### Selecting Profiles

#### `setActiveProfile(id: string) → void`
Switch to a camera profile by ID. Instantly updates viewport camera.

### Creating Profiles

#### `addCameraProfile(id: string, data?: Partial<CameraProfile>) → string`
Create a new named camera profile.
- **Returns**: The ID passed in
- **Auto-select**: New profile becomes active
- **Data**: Optional override for position, target, FOV, zoom, near, far
- **Naming**: Auto-generated as "Personal Camera" if name not provided

**CameraProfile shape**:
```typescript
{
  id: string;
  name: string;
  position: [x, y, z]; // camera world position
  target: [x, y, z]; // look-at point
  fov: number; // field of view (perspective only)
  near: number; // near clip plane
  far: number; // far clip plane
  zoom: number; // zoom level (orthographic only)
}
```

### Deleting Profiles

#### `deleteCameraProfile(id: string) → void`
Delete a profile by ID.
- **Cannot delete "personal"**: Default profile is protected
- **Active profile deleted**: Automatically switches to "personal"

### Updating Profiles

#### `updateProfileData(id: string, updates: Partial<CameraProfile>) → void`
Update an existing profile's data.
- **Clones vectors**: Position and target are cloned (never hand out references)
- **Partial updates**: Only provided fields are changed

---

## Important Patterns

### Vector Cloning Pattern

**Problem**: Entities store position, rotation, scale as tuples `[x, y, z]`. Never hand out a live reference to these — if mutated in place, it corrupts the store's immutability.

**Solution**: Always clone on read/write:
```typescript
// ✅ Correct: Always pass new tuples
updateEntityTransform(id, { position: [0, 5, 0] });
updateEntityTransform(id, { position: [...entity.position] }); // spreads into new array

// ❌ Wrong: Never reuse/mutate
const pos = entity.position;
pos[1] += 5; // CORRUPTS STORE
updateEntityTransform(id, { position: pos });
```

Helper function in store:
```typescript
// Available for internal use
cloneVector(v: [number, number, number]): [number, number, number]
```

### Deep Merge Pattern

Config objects (`sceneSettings`, `postProcessing`, `frame`) are updated with **deep merge**, not replacement. This means:
- Old fields you don't touch are preserved
- Nested objects are merged, not replaced
- Safe for schema evolution: new fields in defaults survive old persisted state

**Usage**:
```typescript
// ✅ Correct: Only provide what you're changing
updateSceneSettings({ bgColor: "#ff0000" });
// Result: bgColor changed, all other fields preserved

// ❌ Wrong: Replacing the whole object
// This would lose all other settings
set({ sceneSettings: { bgColor: "#ff0000" } });
```

**Deep merge pseudocode**:
```typescript
deepMerge(oldSettings, newSettings) {
  for each key in newSettings:
    if value is object (not array):
      recursively merge
    else:
      replace with new value
  return merged
}
```

### Versioned Persistence

The store uses `zundo` for undo/redo and `persist` middleware to save to localStorage.

**Versioning**: If you change the store schema (add/rename a field), **bump the `version` number** and add a migration:
```typescript
// In persist config
version: 3,
migrate: (state, oldVersion) => {
  if (oldVersion < 3) {
    state.newField = defaultValue;
  }
  return state;
}
```

Without migrations, old persisted state causes type errors or silent bugs.

### Using Selectors

**For performance and clarity, always use selectors**:
```typescript
// ✅ Correct: Component only re-renders when this specific field changes
const entities = useEditorStore((state) => state.entities);
const selected = useEditorStore((state) => state.selectedEntityIds);

// ❌ Inefficient: Component re-renders on ANY store change
const store = useEditorStore();
```

### Mutation Rules (Zustand)

- **Never mutate state directly** — always return a new object from set()
- **Immutability required**: Zustand relies on reference equality to detect changes
- **Arrays**: Use spread operator `[...old, newItem]`, not `array.push()`
- **Objects**: Use spread `{ ...old, changedField: value }`

---

## Common Usage Examples

### Add a cube and update its position
```typescript
const addCube = () => {
  const id = useEditorStore((state) => state.addEntity)("cube");
  useEditorStore((state) => state.updateEntityTransform)(id, {
    position: [0, 5, 0]
  });
};
```

### Select multiple entities
```typescript
const selectAll = () => {
  const allIds = useEditorStore((state) => state.entities.map(e => e.id));
  useEditorStore((state) => state.selectEntities)(allIds);
};
```

### Update scene background color
```typescript
const changeBg = () => {
  useEditorStore((state) => state.updateSceneSettings)({
    bgColor: "#ff0000"
  });
};
```

### Group selected entities
```typescript
const group = () => {
  const selectedIds = useEditorStore((state) => state.selectedEntityIds);
  const groupId = useEditorStore((state) => state.groupEntities)(selectedIds);
  console.log("Created group:", groupId);
};
```

### Subscribe to entity list changes
```typescript
useEditorStore.subscribe(
  (state) => state.entities.length,
  (count) => console.log(`Scene now has ${count} entities`)
);
```

---

## Quick Reference: Persistence Rules

**Persisted (localStorage)**:
- entities, selectedEntityIds, activeProfileId, cameraProfiles
- sceneSettings, postProcessing, frame
- activeTransformTool, projectionMode, transformSpace
- hudOverlay, viewportZoom

**NOT Persisted** (session-scoped):
- currentPublishId, isPreviewMode, previewGlbUrl
- pendingImportCount

---

## Debugging Tips

### Inspect store state
```typescript
// In browser console
useEditorStore.getState()
```

### Watch specific selector
```typescript
// Log whenever entities change
useEditorStore.subscribe(
  (state) => state.entities,
  (entities) => console.log("Entities updated:", entities)
);
```

### Check localStorage
```typescript
// Browser console
JSON.parse(localStorage.getItem("editor-store")) // JSON persisted state
```

### Undo/Redo
The store uses `zundo` middleware. Undo/redo is automatic for all actions; no manual history management needed. Use keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z) or call through the hotkey handler.
