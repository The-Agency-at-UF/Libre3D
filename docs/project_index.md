# Project Index

A complete file-by-file map of the Libre3D repository. Generated to help orient new contributors and future Claude Code sessions — see [CLAUDE.md](../CLAUDE.md) for higher-level architecture notes.

## Root

- **`.env`** — Local environment variables, at the repo root (not `apps/editor/.env`): the dev stack's AWS settings for the API (`AWS_REGION`, the `libre3d-dev-local` `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `PUBLISHED_SCENES_TABLE_NAME`, `USER_SCENES_TABLE_NAME`) and the public sign-in config the browser gets (`VITE_COGNITO_USER_POOL_ID`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_DOMAIN`). Vite reads it with `loadEnv` for the server and `envDir` for the browser; only `VITE_` values reach the bundle.
- **`.gitignore`** — Ignores `node_modules` and `CLAUDE.md` (the latter is treated as a local/generated file, not checked in).
- **`CLAUDE.md`** — Guidance document for Claude Code instances working in this repo: commands, architecture, and conventions.
- **`README.md`** — Project overview, feature list, tech stack, setup instructions, and contribution/review workflow.
- **`package.json`** — Root workspace manifest. Defines `dev`/`build` scripts that delegate to the `editor` package via pnpm filters, and pins the `three` dependency version across the workspace via a pnpm override.
- **`pnpm-lock.yaml`** — pnpm's lockfile recording exact resolved dependency versions for the whole workspace.
- **`pnpm-workspace.yaml`** — Declares `apps/*` as the set of workspace packages, plus an `allowBuilds` entry permitting `esbuild`'s install script to run.

## `apps/editor/` — root

- **`index.html`** — The Vite HTML entry point. Loads the Tabler Icons webfont and the `<model-viewer>` custom element script from CDNs, and mounts the app at `#root` via `src/main.tsx`.
- **`package.json`** — The editor app's manifest: React 19, Three.js, `three-viewport-gizmo` (navigation gizmo), Zustand/zundo, and AWS SDK v3 clients (S3, DynamoDB, presigner) as dependencies; Vite, TypeScript, and type packages as dev dependencies. Scripts: `dev`, `build` (`tsc -b && vite build`), `preview`.
- **`package-lock.json`** — An npm lockfile present alongside the pnpm lockfile (likely stale/unused given the repo standardizes on pnpm).
- **`tsconfig.json`** — Main TypeScript config for the app source (`src/`): strict mode, ES2022 target, bundler module resolution, no emit (Vite handles bundling). References `tsconfig.node.json` as a project reference.
- **`tsconfig.node.json`** — A separate composite TypeScript project covering Node-context files (`vite.config.ts` and `src/utils/awsPublishHandler.ts`), which run under Vite's dev server rather than the browser. Its compiled output goes to `node_modules/.tmp/tsconfig.node/` so no `.js` lands beside the source.
- **`node_modules/.tmp/`** — `tsc -b` output: incremental build caches (`*.tsbuildinfo`) and the compiled `tsconfig.node.json` project; not hand-maintained.
- **`vercel.json`** — Rewrites every client route (`/scenes`, `/edit/:sceneId`, `/v/:sceneId`, `/auth/callback`) to `index.html`, so a hard refresh or shared link works on Vercel. A new route needs a line here.
- **`vite.config.ts`** — Vite configuration: aliases `three` to a single resolved copy (avoiding duplicate-instance issues), splits Three.js core into its own build chunk (with the chunk-size warning raised just above it), and installs `awsPublishRoutePlugin`, a dev-server middleware that implements `POST /api/publish` and `GET /api/scene/:id` by calling into `awsPublishHandler.ts`. This is the app's only "backend."

## `apps/editor/src/` — entry & state

- **`main.tsx`** — Application bootstrap: applies the saved theme (`utils/theme.ts`), imports global styles, and renders `<App />` inside `React.StrictMode`. Deliberately imports nothing that pulls in the store or Three.js.
- **`App.tsx`** — The hand-rolled router (no router library). `/` → `LandingPage` (signed-in visitors go on to `?next` or `/scenes`), `/scenes` → `GalleryPage`, `/edit/:sceneId` → `EditorApp` (lazy-loaded), `/v/:sceneId` → `PublicViewer` (public), `/auth/callback` → `AuthCallback`; unknown paths redirect to `/`, and signed-out visits to a signed-in-only path redirect to `/?next=<path>`. Re-renders on navigation via `usePathname`.
- **`store/useEditorStore.ts`** — The single Zustand store for all editor state: scene entities, camera profiles, selection, scene/post-processing/frame settings, and preview mode. Wrapped in `subscribeWithSelector` + `zundo` (undo/redo) + `persist` (localStorage), with a versioned `migrate` function and custom deep-merge logic so old saved scenes upgrade cleanly as the schema evolves.

## `apps/editor/src/components/` — top-level UI

- **`EditorApp.tsx`** — The editor shell (the `/edit/:sceneId` page), loaded with `React.lazy` so other pages never download Three.js: composes the sidebars and viewport, wires up New File/Duplicate/Reset Camera/hotkey handlers, ends any Play preview when the editor is left, and orchestrates the export/publish flows by calling into `utils/exportScene.ts` and `utils/publishScene.ts`. Also sets the dev-only `__libre3dStore` handle.
- **`ExportModal.tsx`** — Modal dialog with "Export Asset" (download `.glb`/`.json`) and "Share Scene" (publish to cloud, copy share link) tabs; purely presentational, driven by props/callbacks from `EditorApp.tsx`.
- **`GalleryPage.tsx`** — The signed-in home at `/scenes`, laid out like a file browser (`SidebarLayout`): a sidebar with the account menu (theme, sign-out), a name search, and section nav; a header bar with New scene; a sort (last modified / name) and grid/list toolbar; and scene cards (each a link to `/edit/:sceneId`, "Edited 11 hours ago"), or an empty state. Reads scenes only through `utils/sceneLibrary.ts`.
- **`LandingPage.tsx`** — The signed-out home at `/`. Its only action hands off to Cognito's hosted login (managed login), which owns passwords, MFA setup, and resets, then returns to the `?next` path (default `/scenes`). Also shown, with the reason, when `/auth/callback` fails.
- **`FloatingToolbar.tsx`** — The floating toolbar centered over the viewport: transform tool buttons (translate/rotate/scale), a local/world space toggle, and an "Add Shape" dropdown that creates new entities (cube, sphere, torus, directional light).
- **`HamburgerMenu.tsx`** — The dropdown menu triggered from the left sidebar header, exposing New File, Duplicate, Undo/Redo, Reset Camera, Toggle Theme, and Axis Guidelines actions with their keyboard shortcuts shown.
- **`AuthCallback.tsx`** — The `/auth/callback` page Cognito's hosted login returns to: redeems the one-time code for tokens, then replaces the URL with where the user was headed; falls back to `LandingPage` with the reason on a forged, expired, or cancelled callback.
- **`HierarchyPanel.tsx`** — Renders the scene's entity list (via an internal `HierarchyItem`) with inline rename, visibility toggle, lock toggle, delete, and click/shift-click select; filters entities by an incoming search query.
- **`PreviewControls.tsx`** — The floating Stop chip rendered over the viewport during preview (plus an Escape binding). Preview hides the whole inspector, so this is the only way back to the editor.
- **`PublicViewer.tsx`** — The read-only `/v/:sceneId` route component: fetches the published scene's asset URL from `/api/scene/:id` and displays it in a `<model-viewer>` element, handling loading and error states. Also declares the `model-viewer` custom element's JSX typing.
- **`RightSidebar.tsx`** — Composes the inspector column: `InspectorTopbar`, `FramePanel`, `ViewportSettingsPanel`, `ScenePanel`, and either `TransformPanel` (when entities are selected) or `CameraPanel` (when none are).
- **`ViewportCanvas.tsx`** — The core Three.js integration component: constructs `SceneManager`/`CameraManager`/`ObjectManager`, wires up the viewport hooks (renderer, controls, raycaster), handles single- and multi-selection transform proxying, syncs store state (entities, scene settings, camera profile) into the live Three.js scene each render, manages fixed-frame auto-scaling, and listens for custom "center on selected"/"orient to selected" events.
- **`ViewportOverlays.tsx`** — Small fixed UI overlaid on the viewport: the perspective/orthographic projection toggle capsule. (Used to also render a decorative, non-interactive 3D axis orb graphic; that's been replaced by the real navigation gizmo mounted via `viewport/hooks/useViewportGizmo.ts` — see that file's note.)

## `apps/editor/src/components/inspector/` — right-sidebar panels

- **`CameraDropdown.tsx`** — A reusable dropdown listing camera profiles, letting the user select, delete (except the default "personal" profile), or add a new one; closes on outside click.
- **`CameraPanel.tsx`** — Inspector panel (shown when nothing is selected) exposing sliders for the active camera profile's FOV (perspective only), near/far clip planes, and zoom (orthographic only).
- **`FramePanel.tsx`** — Inspector panel for the output "frame" (canvas) size: a preset selector (Responsive/1920×1080/1080×1080/Custom) plus manual width/height number inputs.
- **`InspectorTopbar.tsx`** — The sticky top bar of the right sidebar: viewport zoom display/dropdown (presets, zoom in/out, center-on/orient-to-object), and the Play/Stop, Share, and Export buttons. Owns the Play Mode toggle, which generates a temporary in-memory GLB blob for `<model-viewer>` preview.
- **`ScenePanel.tsx`** — Inspector panel for scene settings: background color (color picker + validated hex text input, with reset-to-default), and Show Grid/Wireframe/Fog toggles.
- **`TransformPanel.tsx`** — Inspector panel showing position/rotation/scale for the current selection; supports multi-selection by computing a "mixed" (blank) value per axis when selected entities disagree, and batch-updates all selected entities on change.
- **`ViewportSettingsPanel.tsx`** — Inspector panel wrapping `CameraDropdown` to select/add/delete camera profiles, auto-numbering new profiles as `camera_N`.

## `apps/editor/src/components/ui/` — generic UI primitives

The pages outside the editor (landing, gallery, status screens) are built only from these primitives (`Avatar`, `Button`, `Link`, `Menu`, `NavItem`, `PageLayout`, `PageStatus`, `SearchField`, `SidebarLayout`) plus `styles/pages.css`, so a design system can replace their styling without touching page logic.

- **`Avatar.tsx`** — A round initial standing in for a person (no profile pictures).
- **`Button.tsx`** — Button primitive for the pages outside the editor, with `primary`/`secondary`/`ghost` variants styled by `ui-button` classes in `pages.css`.
- **`Link.tsx`** — An `<a href>` for in-app paths: a plain left click navigates without a reload (`utils/navigation.ts`); modified clicks keep the browser's default (new tab, copy link).
- **`Menu.tsx`** — A trigger button with a dropdown of actions (`items: { label, icon?, onSelect }[]` plus an optional header line); closes on select, outside click, or Escape.
- **`NavItem.tsx`** — A sidebar navigation entry (icon + label, `aria-current` when active).
- **`PageLayout.tsx`** — Frame for the pages outside the editor: a header with the product name (linking home) and optional actions, then the page content.
- **`PageStatus.tsx`** — Full-screen spinner with a label (finishing sign-in, loading the editor).
- **`SearchField.tsx`** — Search input with a leading magnifier icon.
- **`SidebarLayout.tsx`** — File-browser frame for signed-in pages (the gallery): fixed left sidebar, header bar with title and actions, scrolling content. Stacks vertically on narrow screens.
- **`Icons.tsx`** — Hand-authored inline SVG icon components: `TranslateIcon`, `RotateIcon`, `ScaleIcon`, `PlusIcon`, `EyeIcon` (visible/hidden), `LockIcon` (locked/unlocked).
- **`PanelSection.tsx`** — A collapsible `<details>`-based section wrapper (chevron + title + body) used to group each inspector panel's contents.
- **`Select.tsx`** — A labeled `<select>` dropdown wrapper taking a list of `{label, value}` options.
- **`Slider.tsx`** — A labeled range-input slider that keeps a `--value-percent` CSS variable in sync for a gradient-fill track effect, plus a numeric value readout.
- **`Switch.tsx`** — A labeled toggle switch (styled checkbox) component.
- **`Vector3Input.tsx`** — A labeled X/Y/Z (color-coded) numeric input row, used for position/rotation/scale editing; supports a "mixed values" blank/placeholder state for multi-selection.

## `apps/editor/src/hooks/` — app-level React hooks

- **`useHotkeys.ts`** — Global `keydown` listener implementing keyboard shortcuts (ignoring text-input focus): Ctrl/Cmd+D duplicate, Ctrl/Cmd+N new file, Ctrl/Cmd+Z/Shift+Z undo/redo, Ctrl/Cmd+G group selection (2+ entities), Ctrl/Cmd +/- zoom, and unmodified W/E/R (transform tool), Delete/Backspace (remove selection), F (center/orient on selection).
- **`usePreviewSession.ts`** — Owns the Play/Stop preview session: exports the live scene to a GLB blob URL on start and revokes it on stop. Shared by `InspectorTopbar` and `PreviewControls` so the object URL has a single lifecycle.
- **`usePathname.ts`** — `useSyncExternalStore` over `window.location.pathname`; re-renders on `navigate` and Back/Forward. How `App.tsx` routes.
- **`useAuthSession.ts`** — `useSyncExternalStore` over `utils/authSession.ts`: whether someone is signed in and their email (display only). Re-renders on sign-in/out, including in another tab.
- **`useRightSidebarState.ts`** — Centralizes local (non-persisted) right-sidebar/editor-shell UI state: export/publish in-flight flags, modal open/tab state, copy-link feedback, share URL, active left-sidebar tab, search query, shape-dropdown open state, and collapsible-section states.

## `apps/editor/src/viewport/` — imperative Three.js layer

- **`CameraManager.ts`** — Owns both a `THREE.PerspectiveCamera` and `THREE.OrthographicCamera` in parallel, switches which is "active" based on projection mode, keeps both in sync with the active `CameraProfile`, and recomputes projection matrices/ortho bounds on container resize.
- **`gizmoTheme.ts`** — Builds the `three-viewport-gizmo` options object (colors, font, axis styling) for the top-right navigation gizmo by reading the app's own CSS custom properties (`styles/tokens.css`) live via `getComputedStyle`, so the WebGL-rendered gizmo stays visually in sync with the rest of the UI (including dark/light theme) instead of hard-coding a second palette. Axis colors (X/Y/Z) are carried over from the retired `.axis-orb-gizmo` placeholder for continuity. Used by `hooks/useViewportGizmo.ts`.
- **`ObjectManager.ts`** — Reconciles the store's plain-data `Entity[]` against a `Map<id, THREE.Object3D>`: creates geometries/materials per entity type (cube/sphere/torus/directional light, the latter with an attached `DirectionalLightHelper` and light target), updates transforms/visuals in place (skipping objects mid-drag), and disposes stale objects (geometry/material/helpers) when entities are removed.
- **`SceneManager.ts`** — Owns the `THREE.Scene`, an ambient light, and a custom axis-colored `GridHelper` (red X-axis, blue Z-axis lines highlighted against a neutral grid); exposes methods to update background color, fog, light intensity, and grid visibility from store settings.

## `apps/editor/src/viewport/hooks/`

- **`useViewportControls.ts`** — Creates and owns `OrbitControls` and `TransformControls` for the viewport: configures gizmo hitbox sizing, alt/space-modifier-driven orbit vs. pan behavior, writes live camera changes back into the active `CameraProfile` (and derived zoom %) on orbit "change" events, handles undo/redo pausing during drags, and subscribes to store changes (transform tool, transform space, axis-guide visibility, zoom) to keep the controls in sync.
- **`useViewportGizmo.ts`** — Creates and owns the top-right navigation gizmo (`three-viewport-gizmo`'s `ViewportGizmo`, a Blender-style clickable/draggable orientation widget): themes it via `gizmoTheme.ts`, offsets its placement to clear the fixed-width right inspector sidebar, attaches it to the shared `OrbitControls` instance, re-themes it on dark/light toggle (via a `MutationObserver` on `<html>`'s class), keeps it sized via a `ResizeObserver`, and hides/disables it during preview mode. Its `render()` call is threaded into `useViewportRenderer.ts`'s new `onAfterRender` hook so it draws after (not before) the main scene each frame.
- **`useViewportRaycaster.ts`** — Implements click-to-select: on pointer up (if not a drag and not a gizmo-handle click), raycasts against the live mesh map using the current active camera and dispatches `selectEntity` (supporting shift-click multi-select) based on the hit entity's `userData.entityId`.
- **`useViewportRenderer.ts`** — Creates and owns the `THREE.WebGLRenderer` and its `requestAnimationFrame` render loop (skipping renders while in preview/play mode), plus a `Stats` FPS overlay whose visibility is driven by the `hudOverlay` store setting. Also pins the renderer's tone mapping to `NeutralToneMapping` at exposure 1.3, matching what `<model-viewer>` applies to the published GLB so the editor shows the published tone curve rather than raw colour. Takes an optional `onAfterRender` callback, fired immediately after the main `renderer.render(scene, camera)` call each frame — used by `useViewportGizmo.ts` to draw the nav gizmo on top of (not under) the just-rendered scene.

## `apps/editor/src/utils/` — export & publish

- **`apiFetch.ts`** — `fetch` for our own `/api/*` routes only: adds `Authorization: Bearer <access token>` (refreshing it first if needed) and raises `ApiAuthError` when signed out or the server rejects the session. Never used for presigned S3 URLs.
- **`authSession.ts`** — Browser sign-in session for Cognito managed login: authorization-code + PKCE redirect (`startSignIn`/`completeSignIn`), tokens in localStorage, `getAccessToken` with shared auto-refresh, and `signOut` (revoke + hosted logout). Deliberately not in `useEditorStore`. `sanitizeReturnTo` keeps post-sign-in paths same-site (parsed with `URL`, so `/\evil.com` is rejected).
- **`navigation.ts`** — Client-side navigation for the router: `navigate(path)` (pushState + a `libre3d-navigate` event), the location subscription behind `usePathname`, and the `?next` helpers (`landingPathFor`, `getPostSignInPath`).
- **`sceneLibrary.ts`** — The gallery's data source (`listScenes`, `createScene`, `SceneSummary`). A stub until PR 3 swaps the bodies for the cloud API.
- **`theme.ts`** — App-wide dark/light theme: `initTheme` (called in `main.tsx`; saved choice, else follows the OS live) and `toggleTheme` (the editor menu). The theme is the `light-theme` class on `<html>`; no React state.
- **`awsPublishHandler.ts`** — Server-side (Node) logic shared by the Vercel functions in `api/` and the Vite dev middleware: creates a "publish session" (presigned S3 PUT URL + a DynamoDB record keyed by scene id) and looks up a previously published scene's asset URL by id. AWS credentials come from Vercel OIDC (`AWS_ROLE_ARN`), else the local dev key, else the SDK default chain.
- **`exportScene.ts`** — Client-side scene export utilities: reads the live scene off `window.__libre3dScene`, serializes it to a `.glb` (falling back to `.gltf` on failure) via Three.js's `GLTFExporter`, and provides a generic `createDownload` helper for triggering browser file downloads (used for both asset and JSON scene-config exports). Objects tagged `userData.editorOnly` (grid, directional-light helpers, selection outlines, the multi-select proxy, the transform gizmo) are hidden for the duration of the parse so viewport furniture never lands in an exported or published GLB.
- **`previewCamera.ts`** — Converts the active camera profile into `<model-viewer>`'s spherical camera attributes (`camera-orbit`/`camera-target`/`field-of-view`), so preview tracks the editor's exact camera instead of model-viewer's auto-fit framing. Preview keeps the `<model-viewer>` on top but `pointer-events: none` (with an inert slotted poster), so orbit/pan/zoom fall through to the still-mounted viewport canvas and the editor's own OrbitControls keep handling them; this conversion just follows the resulting camera profile. It must stay on top: model-viewer stops rendering while its element is occluded.
- **`verifyAuth.ts`** — Server-side (Node) check for `/api/*`: verifies the Bearer access token against the Cognito user pool's public keys (`aws-jwt-verify`) and returns the token's `sub` as the user ID, or a 401. The user ID never comes from the request body.
- **`sceneColor.ts`** — `getSafeColor`: normalizes a stored scene colour (which may lack the leading `#`) to a CSS/Three-safe hex. Shared by `SceneManager` (scene background, fog) and the preview surface so they can't drift on the same stored value.
- **`publishScene.ts`** — Client-side publish flow: exports the live scene to a GLB blob, POSTs to `/api/publish` to obtain a presigned upload URL and scene id, then PUTs the blob directly to S3, returning the resulting share URL.

## `apps/editor/src/styles/`

- **`components.css`** — The bulk of the app's hand-written CSS (~2,000 lines): styling for the editor shell, sidebars, inspector panels, modals, toolbars, hierarchy tree, form controls, and other UI components.
- **`index.css`** — The global stylesheet entry point, imported by `main.tsx`; pulls in `tokens.css`, `reset.css`, `layout.css`, `components.css`, and `pages.css`.
- **`pages.css`** — Placeholder styling for the pages outside the editor (landing, gallery, status screens), meant to be replaced by a design system: every value comes from `tokens.css`; `ui-` classes style the primitives, `page-` the shared frame, `landing-`/`gallery-` one page each.
- **`layout.css`** — High-level page/grid layout rules for arranging the three-pane editor shell (sidebars + viewport).
- **`reset.css`** — A small CSS reset normalizing default browser element styling.
- **`tokens.css`** — CSS custom-property (variable) definitions for colors, spacing, radii, and fonts used throughout `components.css`, `pages.css`, and inline component styles, including light/dark theme values and the `--space-*`/`--font-size-*` scale used by `pages.css`.
