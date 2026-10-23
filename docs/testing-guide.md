# Testing & Verification Guide

Libre3D has a Vitest unit suite for its scene-graph and transform logic and for the accounts → gallery → cloud-scenes pipeline (sign-in, the scene API, saving, loading, migrations). The UI, the Three.js viewport, and export are still tested manually. This guide covers how to run the unit suite, plus checklists for different types of changes to ensure you don't break existing features.

---

## Automated Unit Tests

Run from the repo root:

```bash
pnpm test
```

That runs `vitest run` in `apps/editor` once and exits non-zero on any failure. Other useful invocations:

```bash
pnpm --filter editor exec vitest
```

Watch mode — re-runs affected tests as you save.

```bash
pnpm --filter editor exec vitest run src/utils/entityTransforms.test.ts
```

Runs a single test file.

**What's covered** (test files sit next to the module, named `<module>.test.ts`):

| Module | What the tests check |
| --- | --- |
| `store/entityIndex.ts` | `getChildren`, `getDescendantIds`, `getAncestorIds` (including cycle guards); `filterMoveRoots` drops descendants of already-selected nodes; `canReparentEntities` rejects moving a node into itself or its own subtree and enforces the imported-model boundary |
| `utils/entityTransforms.ts` | `getEntityWorldMatrix` composes the parent chain root-down; `solveLocalFromWorld` round-trips — reparenting under a different transformed parent leaves the world matrix unchanged (hand-picked cases plus 200 seeded random chains) |
| `utils/pruneImportHierarchy.ts` | `pruneImportNodes` drops dead leaves, collapses single-child wrappers into their child without moving it in world space, and never removes the root, mesh nodes, bones, or multi-child groups |
| `utils/authSession.ts` | `sanitizeReturnTo` keeps sign-in redirects same-site (`//evil`, `/evil`, the callback); the PKCE redirect (S256 challenge of the stored verifier); code redemption (state check, Cognito errors, once under StrictMode); token refresh shared between callers, signing out only on a rejected refresh; sign-out clearing the session and unsaved scene edits |
| `utils/navigation.ts` | `getPostSignInPath` keeps a deep link through sign-in and sends anything else to the gallery; `landingPathFor`; `shareUrlFor`; `navigate` / `subscribeToLocation` |
| `utils/apiFetch.ts`, `utils/verifyAuth.ts` | Bearer token on `/api/*` only, `ApiAuthError` when signed out or rejected; the server takes the user ID from the verified token's `sub`, 401s bad tokens, fails closed (503) without config, and caches one verifier per pool/client |
| `utils/awsConfig.ts` | `getAwsClients` reuses its clients while the settings stay the same and makes new ones for another region, role, or key; local keys never start a role session; S3 and DynamoDB share one role session (fake OIDC → STS exchange); every URL presigned over three hours still has at least 15 minutes of session left; a failed exchange is tried again |
| `utils/awsSceneHandler.ts` | Every `/api/scenes` route against in-memory DynamoDB/S3 (`testing/fakeAws.ts`): validation, revisions, 409 on a stale save, one document object per scene, delete sweeping its prefix, and one user never reaching another's scene. The editing lock: claiming a free, own, or lapsed lock (60 s lease), 423 while another session holds it, take-over, release only by the holder, a save refused (423) unless its session holds the lock and renewing the lease, 409 for a save from a tab older than the lock. Imported assets: uploads signed only for the lock holder and only for hashes S3 lacks (size, type, and checksum as signed headers; an object not matching its address counts as missing), malformed requests and files over 100 MB refused, downloads limited to the scene's recorded `assetHashes`, a save naming a missing asset refused (422) and checked only for new assets, assets kept when a scene is deleted. Thumbnails: lock holder only (renews the lease, leaves the revision), JPEG only and up to 256 kB, listed as presigned GETs, not left behind by a scene deleted meanwhile, swept with the scene |
| `utils/publishedSceneStyle.ts` | `normalizePublishedBgColor` accepts 3/4/6/8-digit hex (adding a missing `#`, lowercased, trimmed) and rejects everything else, including CSS-injection attempts and non-strings |
| `utils/awsPublishHandler.ts` | `POST /api/publish` against in-memory DynamoDB/S3: sign-in required; a publish ID made on the first publish, kept on the scene's row, and reused after; the published row's owner and source scene; a client-sent publish ID ignored; the background colour stored on the published row (and dropped unless it's a hex colour); another user's or a missing scene 404; a published row someone else owns refused (409); no editing lock needed. The public `GET /api/scene/:id`: a presigned GET for the GLB with `Cache-Control: no-store`, rows from before ownership still served, the background colour checked again on the way out (null without one), bad IDs 404. Deleting a published scene takes its row and GLB down (never someone else's), and a failed takedown keeps the scene to retry |
| `utils/sceneDocument.ts` | The document round-trips through JSON (states and events included), never shares vectors with the store, opens a v1 document as a scene without states and a v2 document as it was, keeps a state's trim, puts damaged events into shape, saves only shown states that still exist, refuses newer schema versions, rejects malformed documents |
| `animation/easing.ts` | The curves start at 0 and end at 1, match known values of CSS's ease, ease-in, ease-out, ease-in-out, and never go backwards; out-of-range times clamp; an unknown easing is linear |
| `animation/transitions.ts` | `sampleTransition`: steps in order with their own durations and easings, the delay, loop counts and infinite loops (the same an hour in), restart and ping-pong (the way back, each way counting as a run), every Delay Repeat option with both cycles, zero-length loops not hanging, bad numbers as zero; `previewTiming` |
| `animation/events.ts` | New events and transitions (Base to the first state, or none picked), `transitionProblem` (missing target, foreign or missing state, Current only in row 1), the events using a state, dropping removed objects' events and actions (keeping emptied events), copies for duplicates (the copy moved through its own states, new IDs, nothing shared), `normalizeEvents` dropping and filling in damaged data |
| `animation/sceneRuntime.ts` | Start puts row 1 on before the first frame; an infinite ping-pong bob; holding where a transition ended; Base filling in what a state doesn't set; rotation per Euler angle (+360° spins once, +270° goes three quarters); clicks reaching the nearest ancestor with a Mouse Down event; a second click mid-move not jumping (whatever row 1 is), and replaying after it finished; Current; `place`; skipping missing targets, states, and owners and damaged events without throwing; a path writing itself on (hidden before the first frame, its trim interpolated), and no trim for objects without one |
| `animation/objectStates.ts`, `animation/reparentStates.ts` | `resolveState` (Base, a state's values on top, copies out); "State N" naming and order; `unwrapRotation` (past 180°, whole turns, past 90° on Y without the X/Z flip); dropping removed objects' states; copies for duplicates (new IDs, moved with the copy); which state an object is shown in (`getViewedState`, Base for a gone or foreign state, pruning); `reparentStates` keeping a state in place in the world, setting only what it set, keeping a whole turn; a path's trim in its pose (the state's over its own, none for other objects) and kept through copying (0 included), duplicating, and reparenting |
| `utils/sceneAutosave.ts` | The 2 s debounce and 10 s cap, one save in flight (also across two autosavers of one scene), backoff retries, stopping on conflict/deletion/lost session/lost lock (423), offline waiting, `flush`, `dispose`; saving only after the document's uploads land, upload progress, a refused uploads request, retrying a failed upload, re-uploading after a 422, not retrying a missing or damaged asset (fake timers) |
| `utils/sceneAssets.ts` | SHA-256 test vectors, the base64 form S3 takes, telling hashes from older IDs, finding a scene's assets in malformed input |
| `utils/assetTransfers.ts` | `AssetUploader`: only unconfirmed hashes, once; batches of 100; at most 3 at once; progress; retrying only what failed; an asset missing everywhere. `AssetDownloader`: only what's missing, hash-checked, unavailable or failed ones reported, one download per hash for concurrent callers, progress |
| `utils/sceneLock.ts` | Renewing every 20 s while held and retrying every 10 s while held elsewhere, new revisions reported, failed requests changing nothing, stopping on a deleted scene or lost session, checking when the tab is shown again or restored from the back/forward cache, take-over (after a claim still out), a refused save counting as lost; releasing on `pagehide` only when nothing is unsaved; `releaseWhenSaved` waiting for the last saves (even one queued behind another), called off by `cancelRelease` (fake timers) |
| `utils/sceneThumbnails.ts` | `ThumbnailScheduler`: a picture right after the first save, later saves within the minute folded into one more, another after an upload a save overtook, none during preview, retrying on the next save after a failure, stopping on 423/404, nothing after `dispose` (fake timers) |
| `utils/editorSession.ts` | One random session ID per page |
| `utils/guestScene.ts` | Nothing kept → the default scene; what's kept comes back as a versioned scene document; only the latest is kept; unreadable data starts over; a newer build's document is refused; a full or blocked storage is reported, not thrown |
| `utils/sceneCache.ts`, `utils/sceneLibrary.ts` | Unsaved edits per user and scene, another user's never loaded; `resolveSceneToOpen`; the client's requests (saves carry the session ID; claiming, taking over, and releasing the lock; thumbnails sent as base64) and `SceneApiError`; the gallery's list waiting for a save in flight |
| `store/useEditorStore.ts` | The persist v17 migration (only the preferences kept from an older blob, its scene and stray keys dropped, written back on load); `loadScene` (defaults deep-merged, personal camera kept, undo history cleared); a scene coming back unchanged from store → document → JSON → store; read-only mode (every content-changing action dropped whole, selection/camera/preferences and viewing a state still allowed, `loadScene` still works, undo history cleared, not persisted); undo steps recorded only for changes undo restores; object states (add/rename/remove/set/reset to Base, undo, each object kept in its state when deselected, Base for an undone or removed state, `loadScene` opening a scene in its saved states, transform edits sent to each object's state or Base in one step, and states kept right through removing, duplicating, grouping, and ungrouping objects); events (add/update/remove with undo, blocked in view only, other objects' actions dropped and restored with a deleted object in one step, copies for duplicates, a group's dropped on ungroup, kept through save and reload, the ▶ preview flag cleared by Play and `loadScene`); paths (the Add menu's sample path, `updatePathStroke` with undo and ignoring a radius of 0, stroke and trim blocked in view only, trim edits sent to the shown state or Base, a duplicate's own copy of the path, a path and its Hidden state kept through save and reload) |
| `utils/exportScene.ts` | The editor's userData left out of the GLB and given back afterwards (also when the export fails); a path shown in a state exported in Base (whole tube and both caps) and left in its state; a path trimmed in Base exported as only its drawn part, its tube put back; a path that draws nothing in Base left out |
| `paths/pathGeometry.ts` | `buildPathCurve` (handles relative to their points, closing back to the first point, nothing to draw for fewer than two points or no length, the sample path's two half circles); `clonePath`; segment counts and their limits; `trimToRings` (snapping, clamping, a start past the end drawing nothing); `drawRangeFor` matching how `TubeGeometry` lays out its index buffer; `hasCaps`; round and flat caps' rims landing exactly on the tube's ring vertices at both ends and mid-path, pointing out of the tube, with the tube's normals |
| `paths/PathMesh.ts` | Drawn in full with both caps; `setTrim` changing only the draw range and the caps; nothing drawn or clickable at zero length; raycasts hitting only the drawn part; `rebuild` disposing the old geometry and keeping the trim; the caps sharing a replaced material; an empty path; `createTrimmedGeometry` |

**What's not covered**: React components and hooks (including `useSceneAutosave`'s local-copy writes, `useOpenScene`'s loading and asset downloads, and `useSceneLock`'s switching between editing and viewing; see the two-tab and imported-assets checklists below), the browser transfers themselves (`putAsset`'s XHR, `fetchAssetBlob`) and OPFS/IndexedDB, `SceneManager`/`CameraManager`/`ObjectManager`, most store actions, export/publish, and anything that needs a DOM or WebGL. Keep using the checklists below for those.

**Tests marked "expected fail"** in the output are intentional. They use `it.fails` to pin down a known limitation (a TRS transform can't represent shear, so a rotated child under a non-uniformly scaled parent drifts slightly). If one of them starts *failing*, the limitation has been fixed — remove the `.fails`.

**Writing a new test**: the suite runs in Node, with no DOM library. Build fixture data with a local factory (see `makeEntity` in `entityIndex.test.ts`), and compare transforms as matrices within a tolerance rather than exact Euler values.

- **Browser modules** (anything using `localStorage`, `sessionStorage`, `window`, `document`, `navigator`): install `stubBrowserGlobals()` from `src/testing/browserStubs.ts` in `beforeEach` and `vi.unstubAllGlobals()` in `afterEach`. Modules that read storage as they load (`authSession.ts`, the store) must be imported after that: `vi.resetModules()` then `await import(...)`.
- **Server handlers**: mock `./awsConfig.js` so `getAwsClients` hands out `FakeDynamoDB` / `FakeS3` from `src/testing/fakeAws.ts`, and `./verifyAuth.js` to choose the caller. The fakes evaluate condition and update expressions, so add support there when a handler starts using a new one.
- **The store**: allowed for persistence and `loadScene` (see `useEditorStore.test.ts`), loaded fresh per test as above. Keep the viewport (WebGL) out.
- **Timers**: `vi.useFakeTimers()` and `vi.advanceTimersByTimeAsync` (see `sceneAutosave.test.ts`).

---

## Before You Start

1. Run `pnpm build` — ensures TypeScript has no errors (this also type-checks the test files)
2. Run `pnpm test` — the unit suite should pass
3. Run `pnpm dev` — start the dev server
4. Open Chrome DevTools (F12) — watch for console errors
5. Keep the browser refreshed during testing

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
- [ ] **Autosave runs** (the header under the scene name goes Saving… → Saved about 2 s after an edit)
- [ ] **Persistence survives reload** (close tab completely, reopen the scene → state restored)
- [ ] **Undo/redo work** (every action creates a checkpoint)
- [ ] **No duplicate undo steps** (one action = one undo step)
- [ ] **Old state migrates** (if you bumped version, new fields have defaults)

**Time**: 3-5 minutes

---

### Guest Mode (`/try`)

Signed out (or in a private window).

- [ ] **Landing page** has "Try it without an account" under Sign in, and it opens `/try`
- [ ] **Header** says "Guest scene · Saved in this browser · Sign in"; the back button goes to `/`
- [ ] **No Share anywhere** (top-right buttons are Play and Export; the Export dialog has only Export Asset) and no account or Sign Out in the menu
- [ ] **Kept in this browser** (edit, reload: the edit is still there; DevTools → Network shows no `/api/` requests)
- [ ] **Imported models** (import a .glb: it appears, survives a reload, nothing uploads)
- [ ] **Play and Export** work (preview, Download .glb / .json)
- [ ] **New Scene** asks, then starts over from the default scene
- [ ] **Signed in**, `/try` still works and its link says "Your scenes"

**Time**: 5 minutes

---

### Scene Lock (Two Tabs)

Open the same scene in two tabs of one browser (or two browsers signed in as the same user).

**In addition to smoke test**:

- [ ] **Second tab is view only** (banner "View only" with Take over editing, header says View only, Frame/Scene/Transform/Materials panels disabled, no gizmo, hierarchy toggles and context-menu edits disabled)
- [ ] **Edits are refused there** (Delete, Ctrl+D, Ctrl+Z, dropping a .glb do nothing; selecting and orbiting still work)
- [ ] **View follows the editing tab** (edit in the first tab; the second shows it within ~10 s, keeping its camera and selection)
- [ ] **Back to the gallery releases it** (the second tab can edit within ~10 s)
- [ ] **Closing the tab releases it** (within ~10 s; at worst ~60 s when the release can't be sent)
- [ ] **Reloading the editing tab keeps editing** (it releases on the way out and claims again; with unsaved edits it opens View only until Take over or ≤60 s)
- [ ] **Take over editing** (the second tab can edit at once; the first shows View only as soon as it's looked at, or within 20 s)
- [ ] **A forced save from the view-only tab is refused** (from the console: `(await import("/src/utils/sceneLibrary.ts")).saveScene(id, doc, revision)` rejects with status 423)

**Time**: 5 minutes

---

### Imported Assets (Cloud)

Use a GLB with textures. "Clean storage" means another browser or profile, or deleting the scene's assets in the console: `(await import("/src/utils/modelAssetStore.ts")).deleteModelAsset(id)` (and `textureAssetStore`'s `deleteTextureAsset`).

**In addition to smoke test**:

- [ ] **Import uploads before saving** (the header goes Uploading… N% → Saved; the objects appear under `users/<sub>/assets/<hash>` in S3)
- [ ] **Opens elsewhere** (clean storage: "Downloading the scene's models and textures…", then the model and textures appear)
- [ ] **Nothing uploads twice** (the same GLB again, here or in another scene: no `assets/uploads` request, or one answered with no uploads)
- [ ] **A failed download offers a way out** (block `amazonaws.com` in DevTools → Network: Try again works once unblocked; Open without them shows the scene with the model empty, and saving keeps it)
- [ ] **View only never uploads** (second tab: no `assets/uploads` requests while it follows the first tab's import; a forced `requestAssetUploads` from the console is refused with 423)
- [ ] **Too large is refused at import** (a .glb over 100 MB)
- [ ] **Offline during an upload** (the header says offline; the save resumes when back online)

**Time**: 10 minutes

---

### Export/Publish Features

**In addition to smoke test**:

- [ ] **Export button works** (Export Asset tab opens)
- [ ] **GLB export works** (download button → file downloads)
- [ ] **GLB contains all entities** (open in viewer, all objects present)
- [ ] **Transforms preserved** (positions, rotations, scales match)
- [ ] **Materials preserved** (colors, lighting layers visible)
- [ ] **Share button works** (Share Scene tab opens, publish happens)
- [ ] **Share link valid** (copy URL, visit /v/:id signed out, scene loads in viewer)
- [ ] **Republishing keeps the link** (reopen the scene: the share link is shown and the button says Update Published Scene; publish again, same link, new content)
- [ ] **Gallery** shows the scene's thumbnail (taken after a save, at most once a minute) and a Published badge; its menu's Copy share link copies the `/v/` link
- [ ] **Deleting a published scene** warns that its link stops working, then the link shows an error

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
- [ ] Safari (if accessible)

**Look for**: Rendering differences, WebGL errors, performance issues

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
- [ ] Play mode preview works: no grid, gizmos, light helpers or selection outline; objects shown in a state appear in Base; orbit works; Delete and Ctrl+Z do nothing; Stop brings back the selection, gizmo, and picked states

### Events
- [ ] A cube with a state "Up" and a Start event (Base → Up, 1 s, Ease In Out, Loop Infinite, Ping Pong) bobs in Play
- [ ] A sphere with a state "Big" and a Mouse Down event (Current → Big, 0.3 s) grows when clicked in Play; a second click mid-grow carries on without a jump; the cursor is a pointer over it
- [ ] Stop puts every object back where it was; reload keeps the events
- [ ] The Edit Event panel: changing the trigger, target, a row's state, a duration (Enter), an easing, adding and removing rows, Delay, Delay Repeat, Loop (None, Infinite, Count), and Cycle; each change is one Ctrl+Z
- [ ] ▶ plays one transition in the viewport (no gizmo meanwhile) and puts the object back; an edit stops it
- [ ] Deleting an object another object's event moves removes just that action; Play still runs; one Ctrl+Z brings both back
- [ ] Deleting a state an event uses asks first; the event then shows "Pick a state" and a warning
- [ ] In a view-only tab: events and the panel show but can't be changed; ▶ and Play work

### Paths
- [ ] Add Shape → + Path adds a round tube in a wave, with round ends, the path icon in the hierarchy, and a Path panel (Radius, Caps, Trim Start, Trim End)
- [ ] Dragging Trim End shortens it from its end with a round tip and no visible seam; the selection outline stays the whole path's box; one Ctrl+Z puts it back
- [ ] Radius and Caps (Flat) change the tube at once; clicking a trimmed-away part doesn't select it
- [ ] With a dark physical material, a state "Hidden" set to Trim End 0 (marker and "Reset to Base" show), and a Start event Hidden → Base, 2 s, Ease In Out: Play shows nothing at first, then writes the path on with a round tip; Stop puts it back in the state it's shown in; reload keeps all of it
- [ ] Export GLB with the path shown in Hidden gives the whole tube

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

1. Scene content: does the save status under the scene name say Saved? If not, it says why (offline, conflict, signed out). A new top-level scene field must be in `SceneContent`, `selectSceneContent`, and `loadScene` (see architecture.md §5).
2. Editor preferences: is the field in the store's `partialize`? Check `JSON.parse(localStorage.getItem("libre3d-scene-state"))`
3. Is there a migration error? (Check console on load)

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
