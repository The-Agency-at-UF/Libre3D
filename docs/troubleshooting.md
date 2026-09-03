# Troubleshooting Guide

Common issues contributors encounter and how to fix them.

> **On Windows?** Shell commands below are written for macOS/Linux. In **PowerShell**, substitute:
>
> | macOS / Linux | PowerShell |
> |---|---|
> | `rm -rf node_modules` | `Remove-Item -Recurse -Force node_modules` |
> | `rm -rf .vite` | `Remove-Item -Recurse -Force .vite` |
> | `a && b` | `a; if ($?) { b }` |
> | `lsof -ti:5173 \| xargs kill -9` | `Get-NetTCPConnection -LocalPort 5173 \| Select-Object -ExpandProperty OwningProcess \| ForEach-Object { Stop-Process -Id $_ -Force }` |
>
> Git Bash (installed with Git for Windows) accepts the macOS/Linux forms as written, so that's the easier option if you have it.

---

## Setup & Environment

### "pnpm install fails"

**Error**: `ERR! ERR! code ERESOLVE` or `npm ERR! peer dep missing`

**Solutions** (try in order):
1. Upgrade pnpm: `npm install -g pnpm@latest`
2. Clear cache: `pnpm store prune`
3. Delete node_modules: `rm -rf node_modules`
4. Reinstall: `pnpm install`
5. Force resolution: `pnpm install --no-strict-peer-dependencies`

**If still broken**:
- Check Node version: `node --version` (should be v18+)
- Try Node LTS: download from https://nodejs.org/

---

### "Port 5173 already in use"

**Error**: `error: listen EADDRINUSE: address already in use :::5173`

**Solutions**:
1. Stop other Libre3D dev server (you may have another tab open)
2. Kill the process:
   ```bash
   # macOS/Linux
   lsof -ti:5173 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   ```
3. Use a different port: `pnpm dev -- --port 5174`

---

### "Cannot find module 'three'"

**Error**: `Module not found: Can't resolve 'three'`

**Solutions**:
1. Reinstall dependencies: `pnpm install`
2. Check tsconfig has Three.js in override: `pnpm root` shows override
3. Clear Vite cache: `rm -rf .vite`
4. Restart dev server

---

### "Environment variables not loading (AWS)"

**Error**: Publish fails, AWS S3 errors in console

**Solutions**:
1. Create `.env` in repo root (not in `apps/editor/`):
   ```
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   S3_BUCKET_NAME=your-bucket
   DYNAMODB_TABLE_NAME=your-table
   ```
2. Verify Vite loads env: `pnpm dev` should start without AWS errors
3. Restart dev server after changing `.env`
4. **Don't commit `.env`** — add to `.gitignore` if not already

---

## TypeScript & Build Errors

### "Property does not exist on type..."

**Error**: `Property 'newField' does not exist on type 'Entity'`

**Cause**: You're accessing a field that doesn't exist on a type.

**Solutions**:
1. Check the type definition: `src/store/useEditorStore.ts` → `interface Entity`
2. If you added a field, did you update the interface?
3. Did you use the correct field name? (TypeScript is case-sensitive)
4. If editing store, remember to add to `EditorState` interface AND `persist`'s `partialize`

**Example**:
```typescript
// ❌ WRONG (Entity doesn't have 'customField')
const value = entity.customField;

// ✅ CORRECT (Add to Entity interface first)
interface Entity {
  // ... existing fields
  customField?: string;
}
```

---

### "No overload matches this call..."

**Error**: `No overload matches this call. Overload 1 of X...`

**Cause**: You're calling a function with wrong arguments.

**Solutions**:
1. Check function signature in code or IDE autocomplete
2. Match the argument types exactly
3. Common mistakes:
   - Missing required argument
   - Wrong type (string vs number, array vs single value)
   - Passing object when function expects primitives

**Example**:
```typescript
// ❌ WRONG (selectEntity expects id: string, not number)
selectEntity(123);

// ✅ CORRECT
selectEntity("entity-123");
```

---

### "Cannot find name 'createId'"

**Error**: `Cannot find name 'createId'`

**Cause**: Forgot to import the function.

**Solution**: Add import at top of file:
```typescript
import { createId } from "../utils/createId";
```

---

### "Type 'X' is not assignable to type 'Y'"

**Error**: `Type 'string[]' is not assignable to type 'number[]'`

**Cause**: You're assigning the wrong type to a variable.

**Solutions**:
1. Check what type the variable expects
2. Convert if needed:
   ```typescript
   // ❌ WRONG (string isn't [number, number, number])
   const pos: [number, number, number] = "0,0,0";
   
   // ✅ CORRECT
   const pos: [number, number, number] = [0, 0, 0];
   ```

---

## Runtime Errors

### "Cannot read property 'position' of undefined"

**Error**: `TypeError: Cannot read property 'position' of undefined`

**Cause**: Trying to access a property on `undefined` (object doesn't exist).

**Solutions**:
1. Check if object exists before accessing:
   ```typescript
   // ❌ WRONG
   const pos = entity.position;
   
   // ✅ CORRECT (if entity might be undefined)
   const pos = entity?.position ?? [0, 0, 0];
   ```
2. Console log to check: `console.log(entity)` — is it undefined?
3. Check selector: are you reading the right store field?

---

### "updateEntityTransform is not a function"

**Error**: `TypeError: updateEntityTransform is not a function`

**Cause**: Forgot to get the action from the store.

**Solution**:
```typescript
// ❌ WRONG
updateEntityTransform(id, updates);

// ✅ CORRECT (get from store)
const updateTransform = useEditorStore((state) => state.updateEntityTransform);
updateTransform(id, updates);

// OR sync access
useEditorStore.getState().updateEntityTransform(id, updates);
```

---

### "Object is possibly 'undefined'"

**Error**: `Object is possibly 'undefined'` (TypeScript strict mode)

**Solutions**:
1. Add null check:
   ```typescript
   if (entity === undefined) return;
   ```
2. Use optional chaining:
   ```typescript
   const name = entity?.name ?? "Unknown";
   ```
3. Use non-null assertion (if you're certain):
   ```typescript
   const name = entity!.name;
   ```

---

## Rendering Issues

### "Nothing shows up in viewport"

**Diagnosis**:
1. Open DevTools Console (F12) — any errors?
2. Check if scene loads: add a cube with "Add Shape"
3. Check HUD overlay (toggle via Scene Panel) — does it show FPS?

**Solutions** (try in order):
1. **Check camera** — press F to focus on scene
2. **Check lighting** — go to Scene Panel, ensure lights.intensity > 0
3. **Check entity visibility** — click eye icon in Hierarchy
4. **Check renderer** — restart dev server
5. **Check WebGL** — try different browser or clear GPU cache

---

### "Imported .glb doesn't appear, but its nodes are in the Hierarchy"

**Cause**: Almost always scale, not a failed import. If the hierarchy filled up and the console has no `[Libre3D] Failed to import model` or `was not found in storage` error, the model imported correctly and is simply too small or too large to see. glTF declares metres, but exporters routinely bake a unit conversion in instead — a Sketchfab download of a 4.7 m car authored in centimetres arrives with a `RootNode` scaled to `0.01`, measuring 0.047 units end to end, which is an invisible speck beside the 1-unit default cube.

**Diagnosis**: measure what was actually parsed.

```javascript
const { createConfiguredGltfLoader } = await import("/src/utils/createGltfLoader.ts");
const buf = await fetch("/your-model.glb").then(r => r.arrayBuffer());
const gltf = await new Promise((res, rej) =>
  createConfiguredGltfLoader().then(l => l.parse(buf, "", res, rej)));
gltf.scene.updateMatrixWorld(true);
new THREE.Box3().setFromObject(gltf.scene).getSize(new THREE.Vector3());
```

**Solutions**:
1. **Select the import root and set Scale** in the inspector — the whole hierarchy scales with it.
2. Imports whose longest axis falls outside 0.5–100 units are auto-normalized to 2 units (see `importModel.ts`). If a model lands unscaled and invisible, it measured *inside* that band, so check the box above rather than assuming normalization is broken.
3. **Check it isn't inside the default cube** — both sit at the origin on import.

**Not the cause**: storage. A genuine storage failure logs `[Libre3D] Imported model asset "…" was not found in storage` and renders an error placeholder, not nothing.

---

### "Gizmo doesn't appear or is not draggable"

**Cause**: Gizmo (transform tool) isn't attached to selected entity.

**Solutions**:
1. Select the entity (click it, should highlight in hierarchy)
2. Check that transform tool is active (button in floating toolbar)
3. Check Console for errors (DevTools F12)
4. Try selecting another entity
5. Restart dev server

---

### "Object looks wrong color or material"

**Cause**: Material isn't rendering correctly.

**Solutions**:
1. Check material layers in inspector (Transform Panel)
2. Verify lighting is enabled (Scene Panel → lights.intensity)
3. Check color value (correct hex? opacity?)
4. Try changing color in inspector and see if it updates
5. Open DevTools Console — any WebGL errors?

---

### "Viewport looks blurry or pixelated"

**Cause**: Renderer resolution issue or antialiasing disabled.

**Solutions**:
1. Check canvas size (FramePanel → preset or custom)
2. Try different preset (1920x1080)
3. Restart browser
4. Check GPU acceleration (Chrome → Settings → Advanced → Graphs)

---

### "Export GLB is black/empty"

**Cause**: Scene not exporting correctly, or viewer doesn't support format.

**Solutions**:
1. Check scene has entities (Scene Panel shows entity count)
2. Check export doesn't have errors (DevTools console during export)
3. Try downloading as JSON instead (Export Asset → JSON)
4. Verify entities are visible (eye icon in hierarchy)
5. Try opening GLB in different viewer (babylonjs.com/sandbox or Three.js viewer)

---

## State & Persistence Issues

### "Changes don't persist after reload"

**Cause**: Store field not in `persist` config's `partialize`.

**Diagnosis**:
1. Check localStorage: `JSON.parse(localStorage.getItem("editor-store"))`
2. Look for your field in the JSON

**Solutions**:
1. If field is missing from localStorage, it's not in `partialize` → add it
2. Check store version — if you added new field, bump `version` and add migration
3. Clear localStorage and retry: `localStorage.removeItem("editor-store")`

---

### "Undo/redo don't work"

**Cause**: Action didn't go through store, or zundo isn't tracking it.

**Diagnosis**:
1. Add console.log to action: `console.log("Action called")`
2. Check if action uses `set()`: all mutations must
3. Test undo: Ctrl+Z (should revert last action)

**Solutions**:
1. Ensure mutation goes through store action, not direct `setState`
2. Verify action signature in store interface
3. Don't use async in actions (zundo can't checkpoint async)
4. Test with simple action first (e.g., `addEntity`)

---

### "Undo steps happen twice or not at all"

**Cause**: Action is dispatched multiple times or not using `set()`.

**Solutions**:
1. Check for multiple calls in event handlers
2. Avoid useEffect that calls action on mount (creates duplicate)
3. Ensure action uses store's `set()`, not `setState`
4. Remove `useCallback` dependency issues that re-run effects

---

### "localStorage quota exceeded"

**Error**: `QuotaExceededError: DOM Exception 22`

**Cause**: Scene too large (many entities, textures, etc.)

**Solutions**:
1. Delete unused entities
2. Clear other browser data (other sites' localStorage)
3. Export scene to file instead of relying on persistence
4. Create a new browser profile (separate localStorage quota)

---

## Selection & Interaction Issues

### "Click-to-select doesn't work"

**Cause**: Raycaster isn't detecting clicks or is picking wrong object.

**Diagnosis**:
1. Add console.log to raycaster: `console.log("Raycast hit:", hit)`
2. Check if you're clicking on a mesh or gizmo handle
3. Check object is visible (eye icon)

**Solutions**:
1. Click directly on mesh, not near it
2. If clicking on gizmo handles, try clicking on the mesh instead
3. Check object.visible = true in Three.js
4. Restart dev server if click events not firing

---

### "Multi-select (Shift+Click) doesn't work"

**Cause**: Shift+click event not being captured.

**Solutions**:
1. Hold Shift and click (not just click+shift)
2. Check browser isn't intercepting Shift+click
3. Try using Ctrl+Click as alternative
4. Check that selectEntity is called with `multi: true`

---

### "Transform gizmo is stuck or weird"

**Cause**: Gizmo attach/detach issue or bad transform state.

**Solutions**:
1. Deselect and reselect entity
2. Restart dev server
3. Check vectors are being cloned (not referenced)
4. Try different transform mode (translate, rotate, scale)

---

## Performance Issues

### "App is slow or stutters"

**Cause**: Too many entities, complex scene, or browser issue.

**Diagnosis**:
1. Open DevTools Performance tab
2. Record 10 seconds of interaction
3. Check for frame rate drops below 60 FPS
4. Look for long-running tasks

**Solutions** (try in order):
1. Reduce entity count (delete unnecessary objects)
2. Disable expensive features (fog, shadows, post-processing)
3. Use simpler geometries (fewer segments)
4. Close other browser tabs
5. Restart browser and dev server
6. Try different browser (Chrome, Firefox)

---

### "Dev server is slow to start or refresh"

**Cause**: Large number of files or TypeScript compilation.

**Solutions**:
1. Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
2. Clear Vite cache: `rm -rf .vite`
3. Upgrade Node: `node --version` (try LTS)
4. Check disk space (full disk slows everything)
5. Disable browser extensions (can interfere with dev server)

---

## Git & Branching Issues

### "Git merge conflict"

**Error**: `conflict (content): Merge conflict in file.ts`

**Solutions**:
1. Open file with conflicts
2. Look for `<<<<<<`, `======`, `>>>>>>` markers
3. Keep the section you want, delete the other
4. Remove conflict markers
5. `git add file.ts && git commit -m "resolve: merge conflict"`

---

### "Accidentally committed to main"

**Error**: Committed changes directly to `main` instead of feature branch

**Solutions**:
1. Don't panic, just undo:
   ```bash
   git reset HEAD~1 --soft  # Undo commit, keep changes
   git checkout -b [new-branch-name]
   git commit -m "..."
   ```
2. Or force push (careful!):
   ```bash
   git reset HEAD~1  # Undo on main
   git push origin main --force-with-lease
   ```

---

### "Stashed changes"

**Lost changes** in working directory after switching branches

**Recovery**:
```bash
git stash list  # See stashed changes
git stash pop stash@{0}  # Restore most recent
```

---

## Getting Help

If you're stuck:

1. **Check this guide** — Ctrl+F to search for your error
2. **Check testing-guide.md** — "Debugging" section
3. **Check [architecture.md](architecture.md)** — understand the data flow
4. **Re-read [architecture.md](architecture.md)** — understand the layer involved
5. **Search existing issues** on GitHub — your problem likely exists
6. **Comment on issue** if you need help from maintainers

---

## Common Debugging Commands

### Inspect store state
```typescript
// In browser console
useEditorStore.getState()
```

### Watch for store changes
```typescript
useEditorStore.subscribe(
  (state) => state.entities,
  (entities) => console.log("Entities changed:", entities)
);
```

### Check Three.js scene
```typescript
// In browser console
window.__libre3dScene  // Live THREE.Scene
window.__libre3dScene.children  // All objects in scene
```

### Inspect Three.js object
```typescript
// In browser console
const mesh = window.__libre3dScene.getObjectByName("Cube");
console.log(mesh.position, mesh.rotation, mesh.scale);
```

### Check localStorage
```typescript
// In browser console
JSON.parse(localStorage.getItem("editor-store"))
```

### Monitor performance
```typescript
// In browser console, in DevTools
performance.mark("start");
// ... do something ...
performance.mark("end");
performance.measure("duration", "start", "end");
console.log(performance.getEntriesByName("duration")[0].duration, "ms");
```

---

## When All Else Fails

1. **Close everything**: Close browser, restart dev server, clear cache
2. **Fresh install**: `rm -rf node_modules && pnpm install && pnpm build`
3. **Check environment**: Node version, pnpm version, browser version
4. **Try different browser**: Chrome, Firefox, Safari
5. **Revert recent changes**: `git diff` to see what changed, revert if unsure
6. **Ask for help**: Comment on GitHub issue with error message, what you tried, and output of `pnpm build`

---

## Common Error Messages

| Error | Most Likely Cause |
|-------|------------------|
| "Cannot read property X of undefined" | Missing null check |
| "Type X not assignable to type Y" | Wrong type passed to function |
| "Module not found" | Missing import or typo |
| "Property does not exist" | Field not in interface or typo |
| "Not a function" | Forgot to get action from store |
| "Merge conflict" | Git merge needed |
| "Port already in use" | Another server on same port |
| "localStorage quota exceeded" | Scene too big |
| "WebGL context lost" | GPU driver issue or browser restart needed |

---

Good luck! You've got this. 🚀

If you find an issue not covered here, please submit a PR to add it so future developers don't get stuck!
