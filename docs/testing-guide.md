# Testing & Verification Guide

Since Libre3D has no automated test suite, all testing is manual. This guide provides checklists for different types of changes to ensure you don't break existing features.

---

## Before You Start

1. Run `pnpm build` — ensures TypeScript has no errors
2. Run `pnpm dev` — start the dev server
3. Open Chrome DevTools (F12) — watch for console errors
4. Keep the browser refreshed during testing

---

## Smoke Test Checklist (All Changes)

Run this quick smoke test after ANY change to catch obvious regressions:

- [ ] **Dev server starts** (`pnpm dev` shows no build errors)
- [ ] **App loads** (page renders, no blank screen)
- [ ] **Scene loads** (cube and light visible in viewport)
- [ ] **No console errors** (DevTools console is clean)
- [ ] **Can click to select** (click cube, it highlights in hierarchy)
- [ ] **Can undo/redo** (Ctrl+Z and Ctrl+Shift+Z work)
- [ ] **Persistence works** (close tab, reopen — scene is restored)

**Time**: 2 minutes

---

## Feature-Specific Tests

### New Entity Type (Cube, Cone, Cylinder, etc.)

**In addition to smoke test**:

- [ ] **Can add shape** ("Add Shape" button works, shape appears)
- [ ] **Shape is selectable** (click it, appears in hierarchy)
- [ ] **Transform gizmo works** (drag to move, rotate, scale)
- [ ] **Color updates** (inspect panel shows correct color)
- [ ] **Can rename** (right-click in hierarchy, rename works)
- [ ] **Can delete** (select, press Delete, shape disappears)
- [ ] **Appears in hierarchy** (tree shows shape name)
- [ ] **Persists** (reload page, shape still there)
- [ ] **Exports correctly** (Export GLB includes shape)
- [ ] **Undo/redo work** (create shape → Ctrl+Z removes it → Ctrl+Shift+Z restores)
- [ ] **Material layers work** (can add/remove/edit layers in inspector)

**Time**: 5 minutes

---

### New Inspector Panel (Transform, Scene, Camera, etc.)

**In addition to smoke test**:

- [ ] **Panel appears** (visible in right sidebar)
- [ ] **Can open/close** (click to expand/collapse)
- [ ] **Can change values** (click input, type value, updates applied)
- [ ] **Multi-select works** (select 2 objects with different values → shows "mixed")
- [ ] **Changes persist** (reload page, panel state remembered)
- [ ] **Affects 3D scene** (change background color → viewport changes)
- [ ] **Undo/redo work** (change value → Ctrl+Z reverts → Ctrl+Shift+Z reapplies)
- [ ] **No conflicts** (other panels still work correctly)

**Time**: 3-5 minutes

---

### Viewport Changes (Gizmo, Camera, Selection)

**In addition to smoke test**:

- [ ] **Single selection works** (click object, only that one selected)
- [ ] **Multi-select works** (Shift+click adds to selection)
- [ ] **Gizmo appears** (when object selected, gizmo visible)
- [ ] **Move/rotate/scale work** (drag each gizmo mode)
- [ ] **World/local space toggle works** (E key or button, gizmo behavior changes)
- [ ] **Camera panning works** (middle mouse drag or space+drag)
- [ ] **Zoom works** (scroll wheel, +/- buttons)
- [ ] **Projection toggle works** (Perspective ↔ Orthographic)
- [ ] **Grid visibility toggle works** (Show/hide grid from Scene Panel)
- [ ] **Wireframe mode works** (toggle from Scene Panel)

**Time**: 5 minutes

---

### Store & Persistence Changes

**In addition to smoke test**:

- [ ] **State updates** (add entity → count increases)
- [ ] **Mutations don't cause errors** (TypeScript strict mode passes)
- [ ] **localStorage saves** (DevTools → Application → localStorage → "editor-store" exists)
- [ ] **Persistence survives reload** (close tab completely, reopen → state restored)
- [ ] **Undo/redo work** (every action creates a checkpoint)
- [ ] **No duplicate undo steps** (one action = one undo step)
- [ ] **Old state migrates** (if you bumped version, new fields have defaults)

**Time**: 3-5 minutes

---

### Model Import & Asset Storage

**In addition to smoke test**:

- [ ] **Import works** (toolbar → Add Shape → Import Model… → pick a `.glb`)
- [ ] **Hierarchy fills** (import root named after the file, child nodes beneath it)
- [ ] **Model is visible** (if the hierarchy filled but the viewport didn't change, it's scale — see [troubleshooting](troubleshooting.md))
- [ ] **Survives reload** (refresh; the model rehydrates from storage, not from memory)
- [ ] **Materials and textures rehydrate** (image layers still render after reload)
- [ ] **Delete then reload frees storage** (`listModelAssetIds()` shrinks — deletion is deferred to the next load's reconciliation sweep, so it will *not* shrink before the refresh)
- [ ] **Undo after delete restores a working model** (this is what deferred deletion protects)

Storage lives outside `localStorage`, so clearing the store doesn't reset it:

```javascript
const models = await import("/src/utils/modelAssetStore.ts");
await models.listModelAssetIds();
for (const id of await models.listModelAssetIds()) await models.deleteModelAsset(id);
```

**Time**: 5 minutes

---

### Export/Publish Features

**In addition to smoke test**:

- [ ] **Export button works** (Export Asset tab opens)
- [ ] **GLB export works** (download button → file downloads)
- [ ] **GLB contains all entities** (open in viewer, all objects present)
- [ ] **Transforms preserved** (positions, rotations, scales match)
- [ ] **Materials preserved** (colors, lighting layers visible)
- [ ] **Share button works** (Share Scene tab opens, publish happens)
- [ ] **Share link valid** (copy URL, visit /v/:id, scene loads in viewer)

**Time**: 5-10 minutes (requires AWS credentials)

---

## WebGL & Performance Checks

### Console Warnings

Open Chrome DevTools Console (F12). After loading the app, you should see:

**Expected**: Clean console (no errors, maybe some informational logs)

**Watch for**:
- ❌ Red error messages (something broke)
- ❌ "WebGL error" messages (rendering issue)
- ❌ "Material not found" (geometry missing material)
- ⚠️ Orange warnings (non-critical, but check if related to your change)

### Performance

- [ ] **FPS stable** (toggle HUD overlay, check FPS — should be 60 with no lag)
- [ ] **No stuttering** (smooth camera panning, no frame drops)
- [ ] **Large scene performant** (add 50+ entities, still interactive)
- [ ] **Memory doesn't leak** (open DevTools Performance, record for 30s, memory stable)

### Browser Compatibility

Test in:
- [ ] Chrome/Chromium (primary)
- [ ] Firefox (secondary)
- [ ] Safari — **required for any change touching asset storage or model import**

**Look for**: Rendering differences, WebGL errors, performance issues

**Safari runs a different storage path, not just a different renderer.** It exposes the OPFS directory API without `createWritable()`, so every asset write falls back to IndexedDB (see [architecture.md §7](architecture.md)). A change that works in Chrome can fail there outright.

Without a Mac, in rough order of fidelity:

1. **An iPhone or iPad** — same WebKit engine, same limitation, and Apple permits no other engine on iOS. Run `pnpm --filter editor dev --host` and open the printed Network URL on the device.
2. **Playwright's WebKit build** — runs on Windows and bundles real WebCore/JavaScriptCore. Faithful on API presence; it carries none of Safari's storage policies, so it can't tell you anything about quota or eviction.
3. **Simulate the capability gap in Chromium** — `delete FileSystemFileHandle.prototype.createWritable`, then import. Exercises the real fallback branch and is worth doing before reaching for a device, but proves nothing about WebKit's own IndexedDB behaviour.

---

## Regression Testing Checklist

After making ANY change, run these tests to ensure you didn't break existing features:

### Basic Operations
- [ ] Add cube, sphere, torus
- [ ] Add directional light
- [ ] Select, rename, delete entities
- [ ] Undo/redo work
- [ ] Scene persists after reload

### Transforms
- [ ] Translate entities (move with gizmo)
- [ ] Rotate entities (rotate with gizmo)
- [ ] Scale entities (scale with gizmo)
- [ ] World vs Local space toggle works
- [ ] Multi-select transform works

### Hierarchy
- [ ] Visibility toggle works (eye icon)
- [ ] Lock/unlock works (lock icon)
- [ ] Reparent via drag-and-drop (if implemented)
- [ ] Group entities (Ctrl+G)
- [ ] Ungroup entities (if implemented)
- [ ] Search/filter in hierarchy

### Settings
- [ ] Background color changes
- [ ] Grid visibility toggle
- [ ] Wireframe toggle
- [ ] Fog enable/disable
- [ ] Light intensity adjust
- [ ] All settings persist

### Camera
- [ ] Add/delete camera profiles
- [ ] Switch between profiles
- [ ] Adjust FOV (perspective)
- [ ] Adjust zoom (orthographic)
- [ ] Projection toggle works
- [ ] Pan/rotate camera

### Export
- [ ] Export GLB downloads
- [ ] Scene URL share works
- [ ] Play mode preview works

**Time**: 10-15 minutes (comprehensive)

---

## Debugging: What to Check

### "Nothing appears on screen"

Check in order:
1. DevTools console for errors
2. Is the scene empty? (Add a cube with "Add Shape")
3. Is the camera looking at the scene? (Press F to focus)
4. Is the renderer working? (HUD overlay shows FPS?)
5. Is WebGL supported? (Chrome → Settings → Privacy → Site Settings → JavaScript)

### "Undo/redo don't work"

1. Did you use a store action? (All mutations must go through store actions)
2. Did you call `set()` from store? (Direct mutations won't checkpoint)
3. Check DevTools console for errors
4. Reload page → test undo again

### "Changes don't persist"

1. Check localStorage: `JSON.parse(localStorage.getItem("editor-store"))`
2. Is the field in store's `partialize`? (Only persisted fields survive reload)
3. Is there a migration error? (Check console on load)
4. Is localStorage quota exceeded? (Clear other sites' data)

### "Transforms jump/scale weirdly"

1. Are vectors being cloned? (Check updateEntityTransform calls)
2. Is world-space transformation correct? (Check CameraManager & ObjectManager)
3. Are matrices being calculated? (Parent transforms affect children)

### "Materials look wrong"

1. Check material layers in inspector (color, lighting, image layers)
2. Is lighting enabled? (Check ScenePanel lights.intensity > 0)
3. Are textures loading? (DevTools → Network, check for 404s)
4. Check Three.js console output (WebGL errors)

---

## Performance Profiling

### Check Frame Rate

1. Open app
2. DevTools → Performance tab
3. Click record
4. Pan/rotate camera for 10 seconds
5. Stop recording
6. Look for frame rate dips below 60 FPS

**Expected**: Consistent 60 FPS, no stutters

### Check Memory Usage

1. DevTools → Memory tab
2. Take a heap snapshot
3. Interact with app for 1 minute
4. Take another snapshot
5. Compare — memory should be stable (not growing)

### Profile Renders

1. DevTools → React DevTools (extension required)
2. "Highlight updates when components render"
3. Interact with app
4. Watch which components re-render
5. Look for unnecessary re-renders (same component multiple times per action)

---

## Checklist Templates by Change Type

### Bug Fix

- [ ] Smoke test passes
- [ ] Bug no longer reproduces
- [ ] Related features still work
- [ ] No new console errors
- [ ] Regression tests pass (10 minutes)

**Confidence**: High ✅

---

### New Feature

- [ ] Smoke test passes
- [ ] Feature works end-to-end
- [ ] Can undo/redo feature
- [ ] Feature persists after reload
- [ ] Feature exports correctly
- [ ] No console errors
- [ ] Regression tests pass (10 minutes)
- [ ] Performance acceptable (FPS stable)

**Confidence**: High ✅

---

### Refactoring

- [ ] Smoke test passes
- [ ] Behavior unchanged (from user perspective)
- [ ] Performance same or better
- [ ] Regression tests pass (full 15 minutes)
- [ ] Code is clearer (from reviewer perspective)

**Confidence**: High ✅

---

### Documentation

- [ ] Links are valid
- [ ] Code examples run/compile
- [ ] Screenshots are current
- [ ] No typos

**Confidence**: N/A (not code)

---

## Tips for Efficient Testing

1. **Keep dev tools open** — catch console errors immediately
2. **Test on fresh load** — sometimes issues only appear on first load
3. **Test undo/redo often** — this catches state mutation bugs
4. **Test persistence** — close tab completely, not just refresh
5. **Test large scenes** — 50+ entities reveal performance issues
6. **Test all transform modes** — translate, rotate, scale each matter
7. **Check both projection modes** — perspective and orthographic
8. **Use HUD overlay** — quick FPS check

---

## Test Report Template

When you're done testing, create a brief report:

```
Feature: [Name of feature/fix]
Tester: [Your name]
Date: [Date]
Dev Server: Started at [version from package.json]

Smoke Test: ✅ Pass
[List results]

Feature Tests: ✅ Pass
[List results]

Regressions: ✅ No new issues
[List what you tested]

Console Errors: ✅ None
[Note any warnings]

Performance: ✅ Stable (60 FPS)
[FPS range]

Ready for PR: ✅ Yes
[Any caveats?]
```

---

## When to Ask for Help

If you get stuck:
1. Check [troubleshooting.md](troubleshooting.md)
2. Look at [architecture.md](architecture.md) for data flow
3. Re-read [architecture.md](architecture.md) for the layer your change touches
4. Search existing PRs/issues for similar problems
5. Comment on an issue if you're still stuck

---

## Summary

**Good testing = Confident PRs**

The more thorough you are, the faster code review goes and the more likely your PR is approved on the first pass. You're not trying to find every possible edge case — just ensuring:
1. Your change works
2. You didn't break existing features
3. The code is clean

That's it. You've got this! 🚀
