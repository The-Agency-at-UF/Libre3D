# Store API Reference

Complete reference for the Libre3D Zustand store (`useEditorStore`). This guide explains all available actions, state fields, and important patterns for working with the store.

## Quick Links
- [State Fields](#state-fields)
- [Loading a Scene](#loading-a-scene)
- [Entity Management](#entity-management)
- [Viewport & Transform](#viewport--transform)
- [Settings & Config](#settings--config)
- [Material Layers](#material-layers)
- [Object States](#object-states)
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

### Scene Configuration (Saved with the scene)
```typescript
sceneSettings: SceneSettingsConfig
postProcessing: PostProcessingConfig
frame: FrameSettingsConfig
```
Three nested config objects. **These are updated via deep merge, not replacement** — see [Deep Merge Pattern](#deep-merge-pattern).

```typescript
animation: SceneAnimation   // { states: Record<string, ObjectState>, events: Record<string, SceneEvent> }
viewedStates: Record<string, string>   // entity ID → the state it's shown in while editing
```
Object states and events, and the state each object is shown in; all saved with the scene. See [Object States](#object-states) and [Events](#events).

### Preview & Play Mode
```typescript
isPreviewMode: boolean
```
Play mode state. Set via `setPreviewMode(active)`. Not persisted (session-scoped). Play draws in the editor viewport: every object starts in its Base State, without the `editorOnly` objects, events run (`useViewportPlay`), and editing hotkeys are off.

```typescript
previewingActionId: string | null
```
The transition the Edit Event panel's ▶ is playing in the editor viewport (an action ID), or `null`. Set via `setPreviewingAction`. Not saved, not undoable, and allowed while read-only (it's looking). Play and `loadScene` clear it.

```typescript
penTool: PenToolState | null   // { mode: "draw" | "edit", pathId: string | null, selectedPoint: number | null, contour?: number, draws?: "shape" | "path" }
```
The pen tool (`viewport/hooks/useViewportPenTool.ts`): drawing filled shapes, or tube paths when `draws` is `"path"` (the toolbar's Pen menu picks which; `pathId` is the one being drawn, or `null` between them) or editing one path's points (`selectedPoint` is the picked point's index). Set via `setPenTool`. Not saved and not undoable. Play, a ▶ preview, entering view only, and `loadScene` turn it off.

```typescript
depthEdit: string | null
setDepthEdit(entityId: string | null)
```
The object whose Depth layer is being edited in the viewport (`useViewportDepthGizmo.ts`): its handles show and the transform gizmo moves the layer's origin. Not saved and not undoable. Refused and ended by Play, a ▶ preview and view only; `loadScene` ends it; the pen and it end each other.

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

## Loading a Scene

#### `loadScene(content: StoredSceneContent | null) → void`
Replaces the whole scene with a saved one, or with a new scene's starting content (a cube and the default light) when `content` is `null`. Called by `useOpenScene` when `/edit/:sceneId` opens.
- **Deep merge**: `sceneSettings`, `postProcessing`, and `frame` are merged over the current defaults, so settings added since the scene was saved keep their defaults
- **Camera profiles**: the "personal" profile is always present; an unknown `activeProfileId` falls back to it
- **Resets** selection and preview mode
- **Clears undo history**: the editor no longer reloads the page between scenes, so Ctrl+Z must not reach into the previous one, and the load itself isn't an undoable step
- **Works while read-only**: it writes past the read-only guard, so a view-only tab can show the latest saved scene. It leaves `readOnlyReason` as it is

#### `readOnlyReason: ReadOnlyReason | null` and `setReadOnly(reason: ReadOnlyReason | null) → void`
Why the open scene can't be edited here, or `null` when it can. `"openElsewhere"`: another tab or device holds the scene's editing lock. Set by `useOpenScene` when a scene opens and by `useSceneLock` as the lock moves.
- **While set**, any update that would change `entities`, `sceneSettings`, `postProcessing`, `frame`, or `animation` is dropped whole, whichever action sends it. Selection, which state objects are shown in (`viewedStates`), cameras (`cameraProfiles`, `activeProfileId`), and editor preferences still change
- **Entering it clears undo history** (undo writes from outside the guard, and there's nothing to undo into)
- Not persisted and not undoable

#### `selectSceneContent(state) → SceneContent`
Not an action: a selector (exported from the store module) returning the parts of the state that are saved as the scene: `entities`, `sceneSettings`, `postProcessing`, `frame`, `cameraProfiles`, `activeProfileId`, `animation`, `viewedStates`. Autosave subscribes to it (with `shallow` equality) and passes it to `toSceneDocument`.

---

## Entity Management

### Adding Entities

#### `addEntity(type: EntityType) → string`
Creates a single primitive entity (cube, sphere, torus, plane, path, directional light, or group). A plane is a 1×1 square in its own XY plane, facing +Z (the default camera), unlit (Lighting `none`) and shown from both sides (`doubleSided: true` on its Lighting layer), like the other flat objects; the 3D primitives start with Phong lighting over a white Color layer. A path from here is a sample curve, radius 0.12 with round caps, drawn in full (trim 0–1).
- **Signature**: `(type: "cube" | "sphere" | "torus" | "plane" | "path" | "directionalLight" | "group") => string`
- **Returns**: New entity ID
- **Auto-selects**: The new entity becomes selected
- **Example**:
  ```typescript
  const newCubeId = useEditorStore((state) => state.addEntity)("cube");
  ```

#### `addShape(origin: [number, number, number], rotation: [number, number, number], outline: PathData) → string`
Adds a shape the pen tool drew: one region with `outline` (in the shape's own XY plane, copied in and flattened) and no holes, at `origin`, turned by `rotation` so that plane lies on the one it was drawn on. The default shape colour, filled from both sides like an imported shape. One undo step; refused in view only.
- **Returns**: New entity ID
- **Auto-selects**: The new shape becomes selected

#### `addPath(origin: [number, number, number], path: PathData) → string`
Adds a path the Path pen drew, at `origin` with its points (copied in) relative to it, with the default stroke, drawn in full. One undo step; refused in view only.
- **Returns**: New entity ID
- **Auto-selects**: The new path becomes selected

#### `addImportedSvg(name: string, items: ImportedSvgItem[]) → string`
Adds the shapes and paths of an imported SVG (made by `svgShapesToItems` in `paths/svgImport.ts`: each with its origin and its outlines or points), copied in. A shape gets its fill colour, shown from both sides; a path its stroke, drawn in full with the default material. One item is named `name`; several go in a group named `name` at the origin (the drawing's centre), as "Shape 1", "Path 1", … (numbered per kind). One undo step; refused in view only; puts the pen down.
- **Returns**: ID of the item, or of the group (`""` when `items` is empty)
- **Auto-selects**: The item or the group becomes selected

#### `addImagePlane(name: string, textureAssetId: string, aspect: number, transparent: boolean) → string`
Adds an imported picture (`importImageFile` in `utils/importImage.ts`) as an `"image"` entity named `name` at the origin: a flat plane `aspect` (width / height) wide, its longer side 2 units (`utils/imagePlane.ts`), stored as `imageAspect`. Its layers are an unlit Lighting layer (`model: "none"`) shown from both sides (`alphaMode: "BLEND"` when `transparent`, the picture having see-through pixels), a white Color layer, and a Base Color Image layer pointing at `textureAssetId` (the file's SHA-256 in the texture store), clamped at the edges. One undo step; refused in view only; puts the pen down.
- **Returns**: New entity ID
- **Auto-selects**: The new plane becomes selected

#### `updateShapeSolids(ids: string[], updates: Partial<ShapeSolid>) → void`
Sets the `extrusion` (depth) or `bevel` of every shape among `ids`, one undo step. Other entity types are skipped; a negative value is ignored.

#### `updateShape(id: string, shape: ShapeData) → void`
Replaces a shape's outlines (copied in, every Z set to 0), one undo step; the pen tool's edits. Ignored for other entity types.

#### `centerOrigin(id: string) → void`
Moves a path's or shape's origin to the middle of the box round its curves (`pathsCenter` in `paths/pathGeometry.ts`) without moving it on screen: its points shift by minus the centre, and its position by the centre through its own scale and rotation. Its states keep their transforms, so it's meant for one that has none yet: the pen tool calls it as it finishes drawing a path or shape. Ignored for other entity types and for a path that draws nothing.

#### `convertShapesToPaths(ids: string[]) → number`
Convert to Path: every shape among `ids` and among their descendants becomes a path along the middle of its strokes (`shapeCenterLines` in `paths/centerLine.ts`), with round caps and the strokes' half-width as radius (at least 0.01), drawn in full. The shape keeps its ID, name, parent, transform and material, so its states and events stay; extra strokes become paths right after it ("Shape 1 (2)", …) with the same place and a copy of the material. One undo step; does nothing in view only or Play, or for a shape with no strokes; ends the pen if it was editing a converted shape.
- **Returns**: How many shapes were converted

#### `addImportedModelHierarchy(assetId: string, nodes: ImportNodeSpec[]) → string`
Imports a GLB model hierarchy (preserves parent-child relationships).
- **Signature**: `(assetId: string, nodes: ImportNodeSpec[]) => string`
- **`assetId`**: the SHA-256 of the GLB's bytes, as `prepareModelImport` stores it (`utils/sceneAssets.ts`)
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

#### `updatePathStrokes(ids: string[], updates: Partial<PathStroke>) → void`
Change the radius or cap style (`"round"` | `"flat"`) of every path among `ids`, one undo step for all of them (the Path panel with several paths selected). Other entity types are skipped; a radius that isn't above 0 is ignored. These belong to the path in every state; its trim (`trimStart`/`trimEnd`, 0–1) is a state value instead and goes through `updateShownTransforms`.

#### `updatePath(id: string, path: PathData) → void`
Replaces a path's points (copied in), one undo step; the pen tool's edits, made with the pure functions in `paths/pathEditing.ts`. Ignored for other entity types. The points belong to the path, so this changes them in every state.

```typescript
// Entity fields used when type === "path" (types in paths/pathGeometry.ts)
path?: { points: PathPoint[]; closed: boolean };  // each point: position, handleIn/handleOut (relative), mode
stroke?: { radius: number; caps: "round" | "flat" };
trimStart?: number; // 0–1 of the path's length, Base State value
trimEnd?: number;
```

#### `toggleVisibility(id: string) → void`
Toggle visibility (eye icon in hierarchy). Hides/shows in viewport.

#### `toggleLock(id: string) → void`
Toggle locked state (lock icon in hierarchy). Prevents transform via gizmo.

### Removing & Duplicating

#### `removeEntity(ids: string[]) → void`
Delete one or more entities and all descendants.
- **Imported assets**: Never deleted here, so undo always works. Local copies are a cache of the cloud ones (a missing one is downloaded when needed); cleaning them up is not wired up yet
- **Selection**: Auto-clears deleted entities from selection
- **States**: The removed entities' states go in the same step, so one undo brings both back

#### `duplicateEntity(ids: string[]) → void`
Clone selected entities with all descendants.
- **Naming**: Cloned root gets " (Copy)" suffix
- **Position offset**: Cloned roots shift by +0.5 on X and Z axes (their states' positions too)
- **New selection**: Cloned roots become selected; children keep their relative structure
- **Handles descendants**: Automatically includes all children and remaps parent pointers
- **States**: Each copy gets its own copies of its original's states, with new IDs

### Hierarchy Operations

#### `reparentEntities(ids: string[], newParentId: string | null, index?: number) → void`
Move entities to a new parent, preserving their world-space position.
- **newParentId=null**: Move to scene root
- **index**: Insert position among siblings of new parent (optional, appends if omitted)
- **World preservation**: Local transforms are automatically recomputed so object doesn't jump, and so are the moved entities' states (`reparentStates`). `groupEntities` and `ungroupEntity` do the same
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
- **States**: The group's own states go with it
- **Safety**: Only works on groups; silently fails on primitives

---

## Viewport & Transform

#### `updateFrameSettings(updates: DeepPartial<FrameSettingsConfig>) → void`
Update canvas frame size/preset.
- **Mode options**: "responsive" | "1920x1080" | "1080x1080" | "custom"
- **Width/height**: Only used when mode="custom"
- **Deep merge**: Only provided fields are updated

#### `setPreviewMode(active: boolean) → void`
Enter/exit play mode.
- **active=true**: Switch to play mode (nothing is exported; the viewport keeps rendering and runs the events). Stops a ▶ preview.
- **active=false**: Exit play mode, return to editing (objects go back to the states picked for them)

#### `setPreviewingAction(actionId: string | null) → void`
Play one transition in the editor viewport (the Edit Event panel's ▶), or stop it (`null`). `useViewportPlay` sets it back to `null` when the preview has played through, or when an edit or another selection interrupts it. Starting one turns the pen tool off.

#### `setPenTool(penTool: PenToolState | null) → void`
Turns the pen tool on (drawing or editing a path's points) or off. Refuses to turn it on while view only, in Play, or during a ▶ preview; turning it off always works. A transform tool (`setEditorState({ activeTransformTool, penTool: null })`) puts it down too.

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
- **environment** (nested): image-based light from a generated room (`viewport/sceneEnvironment.ts`), for Physical materials. Replaces the ambient light while on. New scenes start with it on; scenes saved before scene document v4 open with it off.
  - `enabled`: Light the scene with the environment
  - `intensity`: Its strength (0-2, default 1), `scene.environmentIntensity`
- **lights** (nested):
  - `intensity`: Ambient light strength (0-2); the ambient light is off while the environment is on
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

An object's material is a stack of layers, **top first** (`materialLayers[0]` is the top, as the Materials panel lists it), plus the object's own `opacity`. The stack's rules live in `scene/layerStack.ts`:

- **Drawn bottom to top.** Each layer goes over what's under it with its `blendMode` (`"normal" | "multiply" | "screen" | "overlay"`, the W3C compositing formulas on sRGB values) and its `opacity` (0–1, how strongly it shows). Its `enabled` is the row's eye. Every layer is drawn per pixel (`viewport/layerSources.ts`); a stack of Color layers under Lighting is just the material's colour.
- **Lighting** shades the layers under it; the layers over it are drawn on the shaded colour as they are (a Fresnel there glows, as in Spline). Its opacity is how much shading shows (0 looks unlit, as with its eye off); its blend mode stays `"normal"`. It can't be removed, so it also holds the surface settings (`alphaMode`, `alphaCutoff`, `doubleSided`) and the maps.
- **Colour layers** are Color, Image, Depth, Gradient, Noise, Fresnel, Normal, Matcap, Rainbow and Glass; a row's type dropdown switches among them and Displace, and any layer moves anywhere in the stack. An object keeps one that paints: a layer that paints can be removed, or switched to Displace, only while another one stays.
- **Displace** paints nothing: it moves the surface (`planStack`'s `displace`). Its row's number is its intensity and it has no blend mode or Mask mode. Only primitives offer it (`DISPLACEABLE_ENTITY_TYPES`: cube, sphere, torus, plane), and they're built finer while they have one.
- **Glass** paints what's behind the object (`planStack`'s `glass`), so the object is drawn after the solid ones. Under Lighting it still gets highlights, but what's behind isn't shaded again.
- **Mask mode** (`mask: true`, on Image, Matcap, Rainbow, Depth, Gradient, Noise and Fresnel; Spline's Layer Masking): the layer paints nothing and shows the one painting layer right under it only where it's light (`maskTarget`). Over Lighting, another mask or nothing, it masks nothing.
- **Image layers** (an image plane's picture, an imported model's colour map, or one picked in the drawer) are colour layers like the others since PR 4b.
- New 3D objects start with Lighting (Phong) over a white Color layer; flat ones (`FLAT_ENTITY_TYPES`: plane, shape, image) start unlit and shown from both sides (`createFlatMaterialLayers`).

Every action below edits one object (or, in a batch, several), records one undo step, and records none when the rules refuse it. Refused in view only.

The first argument of each layer action names **whose stack it edits** (`ownerId`): an object's, or a material asset's. An object that uses an asset has its asset's stack edited, so every object using it changes; a batch that names several users of one asset changes the asset once.

### Adding Layers

#### `addMaterialLayer(entityId: string, layerType: MaterialLayerType, depthFar?: number) → void`
Adds a colour layer just under Lighting (a new Color layer starts in the colour of the top Color layer), a Fresnel layer over Lighting (where it glows), or a Lighting layer on top when the object has none. Each starts with Spline's defaults (`createPaintLayer`). An Image layer and a second Lighting layer are refused.
- **Depth**: radial from the object's origin in its own space, near 0; its far is `depthFar` when given (above 0), else 2. The Materials panel passes the object's reach (`depthReach` in `utils/depthColors.ts`, its mesh's farthest vertex from its origin), so the ramp ends on the object rather than past it.

### Removing Layers

#### `removeMaterialLayer(entityId: string, layerId: string) → void`
Removes a layer the rules allow removing (`canRemoveLayer`): never Lighting or an Image layer; a painting layer while another stays; a mask always.

### Changing a Layer's Type or Place

#### `switchMaterialLayerType(entityId: string, layerId: string, type: PaintLayerType, depthFar?: number) → void`
Turns a colour layer into another colour type (the row's type dropdown), keeping its ID, eye, opacity, blend mode and Mode (Color has no Mask mode, so it drops it); the rest is the new type's defaults (a Color layer takes the colour of the next Color layer in the stack). Refused for Lighting and Image layers.

#### `moveMaterialLayer(entityId: string, layerId: string, toIndex: number) → void`
Moves a layer to `toIndex` (0 = top), anywhere above the Image layers (`movableRange`): over or under Lighting, and Lighting itself. Image layers don't move.

### Updating Layers

#### `updateMaterialLayer(entityId: string, layerId: string, updates: Partial<MaterialLayer>) → void`
Update a single layer's properties.
- **Partial updates**: Only changed fields are merged (a field that is an object, like `maps` or `colors`, is replaced whole).

#### `updateMultipleEntityMaterialLayers(updates: Record<string, { layerId: string; updates: Partial<MaterialLayer> }>) → void`
Batch update layers across multiple entities.

#### `setEntityOpacity(opacities: Record<string, number>) → void`
Sets how see-through objects are (entity ID → 0–1, clamped), one undo step for all. At 1 the field is left off the entity.

### Replacing All Layers

#### `setEntityMaterialLayers(entityId: string, layers: MaterialLayer[], opacity?: number) → void`
Replaces an entity's whole layer stack (copied), and sets its opacity when `opacity` isn't 1. Used for the layers derived from an imported mesh's own material (`deriveMaterialLayers`, through the `SceneSource`).

### Material Assets

#### `materials: Record<string, MaterialAsset>`
Reusable materials by ID (`{ id, name, layers }`, layers top first), saved with the scene as the document's `materials` section and undoable. An entity that uses one names it in `materialAssetId` and is drawn with its layers (`layersOf` in `scene/materialAssets.ts`); its own `materialLayers` is then an empty list. A missing asset falls back to the object's own list (a plain default material) and never throws. `selectDrawnEntities` gives the entities with each user's layers filled in, which is what the viewport syncs.

Every action below is one `set` and one undo step, and changes nothing in view only.

#### `createMaterialAsset(fromEntityId?: string) → string`
Makes an asset and returns its ID, named Material, Material 2, … in turn. With no object, Lighting over a white Color layer. With an object, a copy of its layers (new layer IDs), and the object then uses it. Groups, lights and imported models' meshes make nothing.

#### `renameMaterialAsset(assetId: string, name: string) → void`
Ignores an empty or unchanged name.

#### `removeMaterialAsset(assetId: string) → void`
Deletes the asset and detaches every object using it in the same step, so each keeps its look as layers of its own; one undo restores the asset and the links.

#### `applyMaterialAsset(assetId: string, entityIds: string[]) → void`
Makes the objects use the asset. Their own layers are **discarded** (detaching copies the asset's back). Groups, lights and imported models' meshes are skipped (`canUseMaterialAsset`). `entity.opacity` stays per object.

#### `detachMaterialAsset(entityIds: string[]) → void`
Gives each object a copy of its asset's layers under new layer IDs (sharing nothing with the asset) and clears `materialAssetId`.

Duplicating an object keeps its `materialAssetId`; deleting every user keeps the asset.

**Layer interfaces** (every layer also has `id`, `enabled`, `opacity`, `blendMode`, and the maskable ones `mask?`). Colours are `"#rrggbb"`, sRGB as picked; a `PaintColor` is `{ color, alpha? }` (alpha missing = 1) and a ramp stop a `PaintColor` with a `position` (0–1).

**ColorLayer**:
```typescript
{
  type: "color";
  color: string;
}
```

**LightingLayer**:
```typescript
{
  type: "lighting";
  model: "none" | "lambert" | "phong" | "physical" | "toon";
  roughness: number; // 0-1, physical
  metalness: number; // 0-1, physical
  reflectivity?: number; // 0-1, physical (three's specularIntensity)
  clearcoat?: number; // 0-1, physical
  clearcoatRoughness?: number; // 0-1
  sheen?: number; // 0-1, physical
  iridescence?: number; // 0-1, physical
  ior?: number; // 1-2.333, physical
  // Off their defaults (0, or 1.5 for ior, 1 for reflectivity), the physical values build a MeshPhysicalMaterial.
  shininess: number; // phong
  specular?: string; // phong's highlight colour (#111111 when missing)
  emissive: string;
  emissiveIntensity: number;
  maps?: Partial<Record<"roughness" | "metalness" | "normal" | "ao" | "emissive" | "bump", TextureRef>>;
  bumpScale?: number; // the bump map's strength (1 when missing)
  alphaMode?: "OPAQUE" | "MASK" | "BLEND"; // the surface
  alphaCutoff?: number; // for MASK mode
  doubleSided?: boolean;
}
// TextureRef: { textureAssetId: string; name?: string; wrapS: number; wrapT: number; flipY?: boolean }
// (a picture in the texture store; flipY for one uploaded in the editor)
```

**ImageLayer** (a picture, Spline's Texture layer):
```typescript
{
  type: "image";
  textureAssetId: string; // SHA-256 of the stored picture (local storage and S3); "" paints nothing
  name?: string;
  wrapS: number; // THREE.js wrap constant: 1000 Repeat, 1001 Clamp, 1002 Mirror
  wrapT: number;
  flipY?: boolean; // true for a picture uploaded or picked in the editor
  projection: "uv" | "planar" | "spherical" | "cylindrical" | "triplanar";
  axis: "x" | "y" | "z"; // for planar and cylindrical
  sharpness: "smooth" | "pixelated";
  crop: boolean; // keep the picture's shape instead of stretching it
  scale: [number, number]; // repeats
  offset: [number, number];
  rotation: number; // degrees
}
```
Before PR 4b an Image layer only filled the colour map (with a `slot`): on load it gets its placing, and a white Color layer over it goes (a tinted one turns Multiply). Its other slots became Lighting's maps (PR 4).

**NormalLayer** (colours by the way the surface faces, in the scene's space): `{ type: "normal"; axes: [boolean, boolean, boolean] }` (X, Y, Z as red, green, blue).

**MatcapLayer** (a lit-sphere picture looked up by the camera-space normal): `{ type: "matcap"; preset: string; textureAssetId?: string; name?: string; rotation: number }`. `preset` is one of Libre3D's own (`viewport/matcaps.ts`); `textureAssetId`, when set, is a picture of one's own instead.

**RainbowLayer** (a soap-bubble shimmer): `{ type: "rainbow"; frequency: number; movement: number; color: [r, g, b]; noise: number; noiseScale: number; offset: [x, y, z] }` (defaults 30, 0, 0s, 0, 1, 0s, as Spline's).

**GlassLayer** (what's behind the object, bent and blurred, as Spline's Glass / Transmission): `{ type: "glass"; blur: number; thickness: number; ior: number; absorption: string; absorbDistance: number }` (defaults 5, 10, 1.5, `#ffffff`, 0: Spline's, with half its Blur). Blur is 0–10 (Spline's roughness × 10); thickness and absorbDistance are in hundredths of the object's own units, as Spline's sizes are a hundred times Libre3D's; absorbDistance 0 = no tint.

**DisplaceLayer** (moves the surface along its normals): `{ type: "displace"; displaceType: NoiseType | "image"; scale; movement; offset: [x, y, z]; intensity; voronoiStyle; smoothness; seed; lowCut; highCut; quality: "low" | "medium" | "high"; textureAssetId?; name? }` (defaults simplex, 10, 1, 0s, 8, as Spline's; quality medium). The noise fields are the Noise layer's; `"image"` takes a picture's lightness at the UV. Intensity is in hundredths of the object's own units.

**DepthLayer** (colour by distance, as Spline's Depth layer):
```typescript
{
  type: "depth";
  gradientType: "radial" | "linear"; // distance from the origin, or along direction
  originType?: "vector" | "camera"; // missing = vector
  space?: "local" | "world"; // missing = local; for a vector origin
  origin: [number, number, number];
  direction: [number, number, number]; // for linear
  near: number; // distance at the ramp's start
  far: number; // distance at its end
  stops: RampStop[]; // 2-10
  smooth: boolean; // eased blends between stops
}
```

**GradientLayer** (a ramp over the UVs, Spline's maths: `gradientPosition`):
```typescript
{
  type: "gradient";
  gradientType: "linear" | "radial" | "polar";
  stops: RampStop[]; // 2-10
  smooth: boolean;
  angle: number; // degrees
  offset: [number, number];
  morph: [number, number];
}
```

**NoiseLayer** (warped 3D noise in object space between four colours):
```typescript
{
  type: "noise";
  noiseType: "simplex" | "simplexFractal" | "perlin" | "fbm" | "voronoi";
  size: [number, number, number]; // stretch per axis
  scale: number;
  movement: number; // 0 = still
  colors: [PaintColor, PaintColor, PaintColor, PaintColor];
  distortion: [number, number]; // how far each of the two warps pushes
  factorA: [number, number]; // the warps' offsets (Spline's defaults 1.7, 9.2 and 8.3, 2.8)
  factorB: [number, number];
  voronoiStyle: "f1" | "f2" | "f2MinusF1" | "smoothBlend" | "edge";
  smoothness: number; // voronoi
  seed: number;
  lowCut: number; // 0-1: the noise's value remapped from low to high
  highCut: number;
}
```

**FresnelLayer** (a glow where the surface turns from the camera):
```typescript
{
  type: "fresnel";
  color: string;
  alpha?: number;
  bias: number; // clamp(bias + scale * (1 - |N·V|)^intensity) * factor
  scale: number;
  intensity: number;
  factor: number;
}
```
Copy layers with `cloneMaterialLayer`, which copies their arrays and objects.

---

## Object States

The first part of state-based animation (no keyframes or timeline). Every object has a **Base State**: its own values on the entity. A state holds the values it sets (`position`, `rotation`, `scale`, and for paths `trimStart`/`trimEnd`), absolute and in the same parent space as the entity's own; a value it doesn't set follows Base. A new state starts as a snapshot of the pose on screen and sets all of them, so later Base changes reach it only in a value set back to Base. States live in `animation.states`, keyed by ID, and point at their entity by `targetId`. The logic (`resolveState`, naming, the rotation unwrap, keeping states right through removal, duplication, and reparenting) is in `animation/objectStates.ts`, which has no store, React, or DOM dependency.

```typescript
interface ObjectState {
  id: string;
  targetId: string; // entity ID
  name: string;     // "State", "State 2", …
  order: number;    // position in the States list
  values: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    trimStart?: number; // paths: 0–1
    trimEnd?: number;
  };
}
```

#### `addState(entityId: string) → string`
Add "State" (then "State 2", …) to an object, starting as a snapshot of the pose on screen (the state it's shown in, or Base), and view it (like `addEntity` selects). Returns its ID.

#### `renameState(stateId: string, name: string) → void`
Rename a state. A blank name is ignored.

#### `removeState(stateId: string) → void`
Delete a state. If it was being viewed, the object goes back to Base.

#### `setStateValues(stateId: string, values: StateValues) → void`
Set values in a state; the ones not passed stay as they are. Vectors are copied in.

#### `updateShownTransforms(updates: Record<string, StateValues>) → void`
Transform (and trim) edits by entity ID, as the Transform and Path panels and the gizmo (multi-select included) make them: each object's go to the state it's shown in, or to its own values in Base. One undo step for all of them. The gizmo passes only what its tool moved (a multi-select drag: only what changed), so a state never starts setting values it left to Base.

#### `clearStateValue(stateId: string, key: keyof StateValues) → void`
"Reset to Base": the state stops setting that value, so it follows the object's own again.

#### `setViewedState(entityId: string, stateId: string | null) → void`
Show an object in one of its states (`null` = Base). It stays that way when the object is deselected, until Base State is picked again, and is saved with the scene (`viewedStates`), so a scene reopens as it was left. Not undoable, and allowed while read-only.

#### `selectViewedObjectState(state, entityId) → ObjectState | null`
Not an action: the state an object is shown in, or `null` for Base. Read it through this rather than `viewedStates`: an entry whose state was deleted (or undone) means Base, and shows that state again if an undo brings it back. Saving drops such entries.

---

## Events

The second part of state-based animation. An event is a trigger on an object (its owner: `start` when Play begins, `mouseDown` when the owner or one of its descendants is clicked in Play) and the transitions it runs. Events live in `animation.events`, keyed by ID. A transition's actions and steps are small ordered lists inside the event, always replaced whole. The logic is in `animation/events.ts`, `animation/transitions.ts`, and `animation/sceneRuntime.ts` (what Play runs), none of which depend on the store, React, or the DOM.

```typescript
interface SceneEvent {
  id: string;
  ownerId: string;                  // entity ID
  trigger: "start" | "mouseDown";
  order: number;                    // position in the object's Events list
  actions: TransitionAction[];
}

interface TransitionAction {
  id: string;
  type: "transition";
  targetId: string;                 // the object it moves
  from: "base" | "current" | string; // row 1: Base, wherever the target is, or a state ID
  steps: { to: "base" | string; duration: number; easing: "linear" | "ease" | "easeIn" | "easeOut" | "easeInOut" }[];
  delay: number;                    // seconds
  delayRepeat: "none" | "start" | "end" | "startEnd"; // which repeats wait for the delay too
  loop: number | "infinite";        // runs after the first; 0 = play once
  cycle: "restart" | "pingPong";
}
```

A row naming no state of the target (a deleted state, another object's, or `""` for none picked) or a missing target makes Play skip that transition, and the inspector says "Pick a state" / "Pick a target".

#### `addEvent(ownerId: string, trigger: "start" | "mouseDown") → string`
Add an event to an object, last in its list, with one transition of the object from Base to its first state (none picked yet if it has none), 1 s, Ease In Out. Returns its ID (`""` if the object isn't there).

#### `updateEvent(eventId: string, updates: { trigger?, actions? }) → void`
Change an event's trigger, or replace its actions (copied in). One undo step.

#### `removeEvent(eventId: string) → void`
Delete an event.

`removeEntity` and `ungroupEntity` also drop the removed objects' events and the actions (on any object's events) that move them, in the same undo step; `duplicateEntity` gives the copies copies of their originals' events, moving the copy through its own states.

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
  play?: { // how Play moves the camera (viewport/PlayCamera.ts); missing fields are defaults (Orbit)
    mode: "fixed" | "softOrbit" | "orbit" | "autoRotate";
    range: number; // Soft Orbit: degrees at the canvas's edge, 1-45
    smoothness: number; // Soft Orbit and Orbit: 0-1, how slowly it eases
    speed: number; // Auto-Rotate: degrees a second, 1-90
  };
}
```
Play reads the active profile once when it starts and never writes it: it looks through a camera of its own. Profiles aren't in undo history, so changing `play` isn't undoable.

### Deleting Profiles

#### `deleteCameraProfile(id: string) → void`
Delete a profile by ID.
- **Cannot delete "personal"**: Default profile is protected
- **Active profile deleted**: Automatically switches to "personal"

### Updating Profiles

#### `updateProfileData(id: string, updates: Partial<CameraProfile>) → void`
Update an existing profile's data.
- **Clones vectors**: Position and target are cloned (never hand out references)
- **Partial updates**: Only provided fields are changed; `play` is replaced as a whole, so pass it merged (`PlayCameraPanel` does)

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

The helper, in `scene/vec3.ts`:
```typescript
cloneVector(v: Vec3): Vec3 // Vec3 = [number, number, number]
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

**Deep merge pseudocode** (`scene/deepMerge.ts`):
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

The store uses `zundo` for undo/redo and `persist` middleware to save editor preferences to localStorage. The scene itself is saved as a versioned scene document (`utils/sceneDocument.ts`) with its own `CURRENT_SCENE_SCHEMA_VERSION` and migrations; see [architecture.md](architecture.md#6-four-rules-you-have-to-follow), rule 3.

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

**Saved with the scene (cloud, per scene, via autosave)**:
- entities, activeProfileId, cameraProfiles
- sceneSettings, postProcessing, frame
- animation (object states and events), viewedStates
- materials (material assets)

**Persisted (localStorage, `persist` v18)** — editor preferences:
- activeTransformTool, projectionMode, transformSpace
- hudOverlay, viewportZoom

**NOT saved** (while the editor is open only):
- selectedEntityIds, isPreviewMode, previewingActionId
- pendingImportCount, readOnlyReason, undo history

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
JSON.parse(localStorage.getItem("libre3d-scene-state")) // persisted editor preferences
Object.keys(localStorage).filter((k) => k.startsWith("libre3d-scene-cache:")) // scenes with unsaved edits
```

### Undo/Redo
The store uses `zundo` middleware. Undo/redo is automatic for all actions; no manual history management needed. Use keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z) or call through the hotkey handler. A step is recorded only when something undo restores (`entities`, the settings, `animation`) changed, compared by reference: selecting or viewing a state records nothing. The cameras (`cameraProfiles`) aren't in undo: moving the view, camera settings, and adding or deleting a camera record nothing, and undo never moves the view.
