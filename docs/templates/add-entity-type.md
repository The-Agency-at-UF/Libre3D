# Template: Adding a New Entity Type

**Time estimate**: 15-30 minutes  
**Difficulty**: Easy  
**Files touched**: 3  
**Example**: Add a Cone primitive to the "Add Shape" menu

---

## Overview

An entity type is a kind of 3D object you can add to the scene: cube, sphere, torus, directional light, group, or imported model. This guide walks you through adding a new type (e.g., a cone).

### What You'll Do
1. Add the type to the store's `EntityType` union
2. Add default name/color to `ENTITY_DEFAULTS`
3. Add geometry creation to `ObjectManager`
4. Add UI button to the "Add Shape" menu

---

## Step 1: Update the Store (`src/store/useEditorStore.ts`)

### 1a. Add to EntityType union (line ~15)

**Find this**:
```typescript
export type EntityType = "cube" | "sphere" | "torus" | "directionalLight" | "importedModel" | "group";
```

**Change to**:
```typescript
export type EntityType = "cube" | "sphere" | "torus" | "cone" | "directionalLight" | "importedModel" | "group";
```

### 1b. Add to ENTITY_DEFAULTS (line ~340)

**Find this**:
```typescript
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
    // ...
  },
  // ... other types
};
```

**Add this entry** (alphabetically after "cube" or at end of geometries, before lights):
```typescript
  cone: {
    name: "Cone",
    color: "#FFD700",  // Choose a unique color
  },
```

**Why**: When you add a new cone, it gets this default name and color. If you don't add this, the app will crash with a TypeScript error.

---

## Step 2: Add Geometry to ObjectManager (`src/viewport/ObjectManager.ts`)

### Find the `createGeometry` method (line ~65)

**Looks like**:
```typescript
createGeometry(entity: Entity): THREE.BufferGeometry {
  switch (entity.type) {
    case "cube":
      return new THREE.BoxGeometry(1, 1, 1);
    case "sphere":
      return new THREE.SphereGeometry(0.5, 32, 32);
    case "torus":
      return new THREE.TorusGeometry(0.5, 0.2, 32, 100);
    case "directionalLight":
      return new THREE.BoxGeometry(0.1, 0.1, 0.1); // Invisible helper
    case "group":
      return new THREE.BoxGeometry(0.1, 0.1, 0.1); // Invisible helper
    case "importedModel":
      // Handled separately
      return new THREE.BoxGeometry(0.1, 0.1, 0.1);
    default:
      return new THREE.BoxGeometry(1, 1, 1); // Fallback
  }
}
```

### Add your case:

**Add this**:
```typescript
    case "cone":
      return new THREE.ConeGeometry(0.5, 1, 32);
```

**Between sphere and torus**, or in alphabetical order:
```typescript
    case "cube":
      return new THREE.BoxGeometry(1, 1, 1);
    case "cone":
      return new THREE.ConeGeometry(0.5, 1, 32);
    case "sphere":
      return new THREE.SphereGeometry(0.5, 32, 32);
    // ...
```

**What these numbers mean**:
- `0.5`: radius at the base
- `1`: height of the cone
- `32`: number of segments (more = smoother, but slower)
- Check [Three.js ConeGeometry docs](https://threejs.org/docs/#api/en/geometries/ConeGeometry) for other parameters

**TypeScript safety**: If you forget this, you'll get a TypeScript error because the switch doesn't handle all entity types anymore. This is good — it catches the mistake before you test.

---

## Step 3: Add UI Button (`src/components/FloatingToolbar.tsx`)

### Find the shape dropdown (line ~100-210)

**Looks like** (approximate structure):
```typescript
<button onClick={() => setShapeDropdownOpen(!shapeDropdownOpen)}>
  ➕ Add Shape
</button>

{shapeDropdownOpen && (
  <div className="shape-dropdown">
    <button onClick={() => {
      addEntity("cube");
      setShapeDropdownOpen(false);
    }}>
      Cube
    </button>
    <button onClick={() => {
      addEntity("sphere");
      setShapeDropdownOpen(false);
    }}>
      Sphere
    </button>
    <button onClick={() => {
      addEntity("torus");
      setShapeDropdownOpen(false);
    }}>
      Torus
    </button>
    {/* ... more shapes */}
  </div>
)}
```

### Add your button:

**Add this** (in alphabetical order or logical grouping):
```typescript
    <button onClick={() => {
      addEntity("cone");
      setShapeDropdownOpen(false);
    }}>
      Cone
    </button>
```

**Complete example**:
```typescript
    <button onClick={() => {
      addEntity("cube");
      setShapeDropdownOpen(false);
    }}>
      Cube
    </button>
    <button onClick={() => {
      addEntity("cone");
      setShapeDropdownOpen(false);
    }}>
      Cone
    </button>
    <button onClick={() => {
      addEntity("sphere");
      setShapeDropdownOpen(false);
    }}>
      Sphere
    </button>
```

---

## Step 4: Verify Your Changes

### 1. Build and check for errors

```bash
pnpm build
```

**Expected**: No TypeScript errors.

**If you see errors**:
- Missing ENTITY_DEFAULTS entry → Add it in Step 1b
- Missing createGeometry case → Add it in Step 2
- Typo in entity type name → Check spelling matches exactly

### 2. Start dev server

```bash
pnpm dev
```

### 3. Test in browser

1. Open http://localhost:5173/
2. Click "Add Shape" button
3. Click "Cone" (or your new shape name)
4. ✅ A new cone should appear in the viewport
5. Verify you can:
   - Click to select it (highlight in hierarchy)
   - Drag the gizmo to move it
   - Rotate and scale it
   - Change its color in the inspector
   - Delete it (select and press Delete)
   - Undo (Ctrl+Z) and redo (Ctrl+Shift+Z)

### 4. Test undo/redo

1. Add a cone
2. Move it with the gizmo
3. Press Ctrl+Z → Cone should return to original position
4. Press Ctrl+Shift+Z → Cone should move again
5. Reload page → Cone and all changes should persist

### 5. Export test (optional)

1. Add a cone
2. Press Share button → "Export Asset" tab
3. Download GLB file
4. Cone should be included in the file

---

## Checklist

- [ ] EntityType union includes new type
- [ ] ENTITY_DEFAULTS has entry for new type
- [ ] createGeometry switch case handles new type
- [ ] FloatingToolbar has button for new type
- [ ] `pnpm build` passes with no errors
- [ ] Dev server starts (`pnpm dev`)
- [ ] Can add new shape from "Add Shape" menu
- [ ] New shape appears in viewport
- [ ] Can select, move, rotate, scale new shape
- [ ] New shape appears in Hierarchy Panel
- [ ] Can delete new shape
- [ ] Undo/Redo works
- [ ] Changes persist after page reload
- [ ] No console errors in DevTools

---

## Common Mistakes

### ❌ "I added the button but the shape doesn't appear"

**Check**:
- Did you add the EntityType to the union? (TypeScript should have caught this)
- Did you add the ENTITY_DEFAULTS entry? (Otherwise `createEntity` fails)
- Did you add the createGeometry case? (Otherwise mesh doesn't render)

**Fix**: Run `pnpm build` to see which step you missed.

### ❌ "I get a Three.js error about geometry parameters"

**Check**: ConeGeometry expects `(radius, height, radialSegments, heightSegments, openEnded)`

**Common parameters**:
```typescript
new THREE.ConeGeometry(0.5, 1, 32); // radius, height, segments
```

See [Three.js docs](https://threejs.org/docs/#api/en/geometries/ConeGeometry) for details.

### ❌ "Colors don't look right"

**Solution**: Adjust the hex color in ENTITY_DEFAULTS. The color also depends on lighting and materials, so it may not look exactly like the hex value.

### ❌ "TypeScript errors after adding the type"

**Cause**: All code paths must handle the new type.

**Check**:
- EntityType union includes it?
- ENTITY_DEFAULTS has entry?
- createGeometry switch includes it?
- Any other switch statements on entity type? (Unlikely in practice)

---

## Appendix: The cone, start to finish

If you'd rather see every edit in one place before you start, here is the complete cone implementation. Three files, about 15 lines total.

### 1. `src/store/useEditorStore.ts`

Add the type to the union (line ~15):

```diff
- export type EntityType = "cube" | "sphere" | "torus" | "directionalLight" | "importedModel" | "group";
+ export type EntityType = "cube" | "sphere" | "torus" | "cone" | "directionalLight" | "importedModel" | "group";
```

Add a defaults entry to `ENTITY_DEFAULTS` (line ~340). Order doesn't matter — it's a `Record`, keyed by type — but keep the primitives grouped together:

```diff
  torus: {
    name: "Torus",
    color: "#FF7AE0",
  },
+ cone: {
+   name: "Cone",
+   color: "#FFD700",
+ },
  directionalLight: {
```

`addEntity("cone")` reads the name and colour from here. `ENTITY_DEFAULTS` is typed `Record<EntityType, ...>`, so if you add to the union and forget this, `pnpm build` fails and tells you exactly what's missing. That's deliberate.

### 2. `src/viewport/ObjectManager.ts`

Add a case to `createGeometry` (line ~65):

```diff
  private createGeometry(entity: Entity): THREE.BufferGeometry {
    switch (entity.type) {
      case "sphere":
        return new THREE.SphereGeometry(0.5, 32, 16);
      case "torus":
        return new THREE.TorusGeometry(0.55, 0.2, 16, 48);
+     case "cone":
+       return new THREE.ConeGeometry(0.5, 1, 32);
      case "cube":
      default:
        return new THREE.BoxGeometry(1, 1, 1);
    }
  }
```

`ConeGeometry(radius, height, radialSegments)` — 0.5 radius and 1 height matches the scale of the existing primitives. 32 radial segments is smooth enough without being wasteful. See the [Three.js ConeGeometry docs](https://threejs.org/docs/#api/en/geometries/ConeGeometry) for the remaining parameters.

Note the `default` case: without your `case "cone"`, a cone entity silently renders as a **cube** rather than throwing. If your new shape looks like a box, this is why.

### 3. `src/components/FloatingToolbar.tsx`

Add a button inside the Add Shape dropdown (line ~90–210). Copy the Sphere button and change two things — the label and the `addEntity` argument:

```tsx
<button
  style={{
    background: "transparent",
    border: "none",
    color: "var(--text-primary)",
    padding: "6px 10px",
    borderRadius: "3px",
    textAlign: "left",
    fontSize: "11px",
    cursor: "pointer",
    fontFamily: "var(--font)",
  }}
  type="button"
  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
  onClick={() => {
    addEntity("cone");
    setIsShapeDropdownOpen(false);
  }}
>
  + Cone
</button>
```

The state setter is `setIsShapeDropdownOpen`, not `setShapeDropdownOpen`. Closing the dropdown after the click is what every other button does — match it.

### What you did *not* have to write

No undo handling. No save/load code. No hierarchy-panel entry. No export logic. All of that reads from `entities` in the store, so the moment `addEntity("cone")` puts a cone there, every one of those features covers it. That's the payoff of the architecture described in [architecture.md](../architecture.md) — and it's why "just add it to the store" is almost always the right instinct in this codebase.

---

## Next Steps

- Add another shape type (pyramid, cylinder, torus knot) using the same pattern
- Read [docs/conventions.md](../conventions.md) to understand the naming and pattern rules
- Explore ObjectManager.ts to understand how geometries become meshes
- Read [store-api-reference.md](../store-api-reference.md) to understand `addEntity` action

---

## Reference

**Files modified**: 3
- `src/store/useEditorStore.ts` (2 additions)
- `src/viewport/ObjectManager.ts` (1 addition)
- `src/components/FloatingToolbar.tsx` (1 addition)

**Total lines added**: ~15

**Pattern**: Add entity type → Add defaults → Add geometry → Add UI button → Test
