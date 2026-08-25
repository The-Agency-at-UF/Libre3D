# Template: Adding a New Inspector Panel

**Time estimate**: 20-40 minutes  
**Difficulty**: Easy-Medium  
**Files touched**: 2-3  
**Example**: Add a "Physics Panel" to control physics settings

---

## Overview

An inspector panel is a collapsible section in the right sidebar that displays and controls entity or scene properties. Examples: Transform Panel, Camera Panel, Scene Panel, Physics Panel (hypothetical).

This guide walks you through creating a simple **read-only display panel** (easiest), then extends to **interactive controls**.

---

## Step 1: Understand Panel Structure

All panels follow the same pattern:

```typescript
// src/components/inspector/ExamplePanel.tsx

import { PanelSection } from "../ui/PanelSection";
import { useEditorStore } from "../../store/useEditorStore";

export function ExamplePanel() {
  // 1. Read from store via selector
  const value = useEditorStore((state) => state.someField);
  
  // 2. Handle changes
  const handleChange = (newValue: any) => {
    useEditorStore.getState().updateSomeField(newValue);
  };
  
  // 3. Render with PanelSection wrapper
  return (
    <PanelSection title="Panel Title" defaultOpen={true}>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Controls go here */}
        <label>
          Value: {value}
        </label>
      </div>
    </PanelSection>
  );
}
```

---

## Step 2: Create the Panel Component

### Create file: `src/components/inspector/PhysicsPanel.tsx`

```typescript
import { PanelSection } from "../ui/PanelSection";
import { Switch } from "../ui/Switch";
import { Slider } from "../ui/Slider";
import { useEditorStore } from "../../store/useEditorStore";

export function PhysicsPanel() {
  // Read physics settings from store
  const physics = useEditorStore((state) => state.sceneSettings.physics);
  
  // Dispatch updates via store action
  const updateSceneSettings = useEditorStore((state) => state.updateSceneSettings);
  
  const handleTogglePhysics = (enabled: boolean) => {
    updateSceneSettings({ physics: { enabled } });
  };
  
  const handleGravityChange = (gravityY: number) => {
    updateSceneSettings({ physics: { gravityY } });
  };
  
  return (
    <PanelSection title="Physics" defaultOpen={false}>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <Switch
          label="Enable Physics"
          checked={physics.enabled}
          onChange={handleTogglePhysics}
        />
        
        {physics.enabled && (
          <>
            <Slider
              label="Gravity Y"
              value={physics.gravityY}
              min={-20}
              max={0}
              step={0.1}
              onChange={handleGravityChange}
            />
            
            <label style={{ fontSize: "12px", color: "#888" }}>
              Collision: {physics.collisionType}
            </label>
          </>
        )}
        
      </div>
    </PanelSection>
  );
}
```

**Key points**:
- `PanelSection` handles collapse/expand logic
- `defaultOpen={false}` means the panel starts collapsed
- Selectors read specific store fields
- Handlers dispatch store actions via `updateSceneSettings` (deep merge)
- Layout: `flex` column with `gap` for spacing

---

## Step 3: Compose Panel in RightSidebar

### Find: `src/components/RightSidebar.tsx`

**Looks like**:
```typescript
export function RightSidebar() {
  const selectedIds = useEditorStore((state) => state.selectedEntityIds);
  
  return (
    <div className="right-sidebar">
      <InspectorTopbar />
      
      <FramePanel />
      <ViewportSettingsPanel />
      <ScenePanel />
      
      {selectedIds.length > 0 ? (
        <TransformPanel />
      ) : (
        <CameraPanel />
      )}
    </div>
  );
}
```

### Add your panel:

```typescript
import { PhysicsPanel } from "./inspector/PhysicsPanel";

export function RightSidebar() {
  const selectedIds = useEditorStore((state) => state.selectedEntityIds);
  
  return (
    <div className="right-sidebar">
      <InspectorTopbar />
      
      <FramePanel />
      <ViewportSettingsPanel />
      <ScenePanel />
      <PhysicsPanel />  {/* Add here */}
      
      {selectedIds.length > 0 ? (
        <TransformPanel />
      ) : (
        <CameraPanel />
      )}
    </div>
  );
}
```

**Position**: Panels are ordered top-to-bottom in the sidebar. Place new panels logically (scene settings together, entity settings together, etc.).

---

## Step 4: Verify & Test

### 1. Build & check

```bash
pnpm build
```

**Expected**: No TypeScript errors.

**If errors**:
- Missing import? Add it to RightSidebar
- Typo in component name? Check the export in PhysicsPanel.tsx
- Store field doesn't exist? Make sure `sceneSettings.physics` is defined in useEditorStore

### 2. Dev server

```bash
pnpm dev
```

### 3. Test in browser

1. Open http://localhost:5173/
2. Scroll down in right sidebar
3. Find "Physics" panel
4. Click to expand/collapse
5. Toggle physics on/off
6. Drag gravity slider
7. ✅ Values should update in real-time
8. Reload page → physics settings should persist

---

## Advanced: Panel for Selected Entities

If your panel should only show when entities are selected (like TransformPanel):

```typescript
export function CustomPanel() {
  const selectedIds = useEditorStore((state) => state.selectedEntityIds);
  
  if (selectedIds.length === 0) {
    return null; // Don't show panel if nothing selected
  }
  
  // Panel content here
  return (
    <PanelSection title="Custom">
      {/* ... */}
    </PanelSection>
  );
}
```

Then in RightSidebar:

```typescript
{selectedIds.length > 0 && <CustomPanel />}
```

---

## Advanced: Multi-Select Handling

If your panel edits entity properties (like TransformPanel), handle multi-select:

```typescript
export function CustomPanel() {
  const selectedIds = useEditorStore((state) => state.selectedEntityIds);
  const entities = useEditorStore((state) => state.entities);
  
  const selectedEntities = entities.filter(e => selectedIds.includes(e.id));
  
  // Get first entity's value
  const firstValue = selectedEntities[0]?.someField;
  
  // Check if all selected have same value
  const allSame = selectedEntities.every(e => e.someField === firstValue);
  
  // Render "mixed" (blank) value if they differ
  const displayValue = allSame ? firstValue : "";
  const placeholder = allSame ? "" : "Multiple values";
  
  const handleChange = (newValue: any) => {
    // Update all selected entities
    const updates: Record<string, any> = {};
    selectedIds.forEach(id => {
      updates[id] = { someField: newValue };
    });
    useEditorStore.getState().updateMultipleEntities?.(updates);
  };
  
  return (
    <PanelSection title="Custom">
      <input
        value={displayValue}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
      />
    </PanelSection>
  );
}
```

**What this does**:
- If all selected entities have the same value, show it
- If they differ, show blank with "Multiple values" placeholder
- On change, update ALL selected entities at once

---

## Using UI Components

Libre3D provides reusable UI components in `src/components/ui/`:

### Switch (checkbox toggle)
```typescript
import { Switch } from "../ui/Switch";

<Switch
  label="Enable Something"
  checked={isEnabled}
  onChange={(checked) => handleChange(checked)}
/>
```

### Slider (number range)
```typescript
import { Slider } from "../ui/Slider";

<Slider
  label="Intensity"
  value={intensity}
  min={0}
  max={100}
  step={1}
  onChange={(value) => handleChange(value)}
/>
```

### Select (dropdown)
```typescript
import { Select } from "../ui/Select";

<Select
  label="Mode"
  value={mode}
  options={[
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
  ]}
  onChange={(value) => handleChange(value)}
/>
```

### Vector3Input (position/rotation/scale)
```typescript
import { Vector3Input } from "../ui/Vector3Input";

<Vector3Input
  label="Position"
  value={position}
  onChange={(newPos) => handleChange(newPos)}
/>
```

Use these components for consistent styling and UX across the app.

---

## Common Patterns

### Read-Only Display
```typescript
<label style={{ fontSize: "14px", fontWeight: "600" }}>
  Current Value: {value}
</label>
```

### Conditional Display
```typescript
{isAdvanced && (
  <Slider label="Advanced Setting" value={val} onChange={onChange} />
)}
```

### Grouped Controls
```typescript
<div style={{ display: "flex", gap: "10px" }}>
  <input type="number" value={x} onChange={(e) => setX(e.target.value)} />
  <input type="number" value={y} onChange={(e) => setY(e.target.value)} />
  <input type="number" value={z} onChange={(e) => setZ(e.target.value)} />
</div>
```

---

## Checklist

- [ ] Panel component created in `src/components/inspector/`
- [ ] Panel imported in RightSidebar.tsx
- [ ] Panel composed in RightSidebar JSX
- [ ] Store selectors read correct fields
- [ ] Store actions dispatch updates
- [ ] `pnpm build` passes
- [ ] Dev server starts
- [ ] Panel appears in right sidebar
- [ ] Panel can expand/collapse
- [ ] Controls update values
- [ ] Changes persist after reload
- [ ] Undo/redo work
- [ ] No console errors

---

## Debugging

### "Panel doesn't appear in sidebar"

1. Is it imported in RightSidebar? (Check imports)
2. Is it composed in JSX? (Check return statement)
3. Is the component exported? (Check export statement in panel file)
4. Rebuild and refresh browser

### "Changes don't update"

1. Is the selector reading the right field? (Console log it)
2. Is the action being called? (Add console.log in handler)
3. Does the store action exist? (Check useEditorStore)
4. Are you using deep merge for nested objects? (Check updateSceneSettings pattern)

### "Values don't persist"

1. Is the field in store's `partialize` config? (Only persisted fields survive reload)
2. Is the store action using `set()` correctly? (Must return new object)
3. Check localStorage: does "editor-store" exist and contain your field?

---

## Next Steps

- Create another panel using this template
- Read [conventions.md](../conventions.md) for naming and style rules
- Explore existing panels (TransformPanel, ScenePanel) for more complex examples
- Read [store-api-reference.md](../store-api-reference.md) for available store fields

---

## Files Modified

- `src/components/inspector/PhysicsPanel.tsx` (NEW)
- `src/components/RightSidebar.tsx` (ADD import, ADD JSX)

**Total lines added**: ~50-80 (varies by complexity)

**Pattern**: Create panel component → Subscribe to store → Handle changes via dispatch → Compose in RightSidebar → Test
