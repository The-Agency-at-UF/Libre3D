# Libre3D

Libre3D is an open-source, code-free browser tool for building interactive 3D elements for websites. It is positioned as an open alternative to Spline and is being developed as a pnpm + Turborepo monorepo with a Vite + React + TypeScript editor, Three.js rendering, and Zustand state management.

The current "walking skeleton" focuses on a minimal but real editor surface:

- a left sidebar for scene controls
- a Three.js viewport that renders primitive objects
- a Zustand store that owns the editor scene state
- a path toward exporting scenes for future `<model-viewer>` integration

## Repository Layout

- `apps/editor` - the main editor app
- `pnpm-workspace.yaml` - workspace package definition
- `pnpm-lock.yaml` - lockfile for reproducible installs

## Prerequisites

- Node.js 18+ recommended
- pnpm 11+

## Install

From the repository root:

```bash
pnpm install
```

This installs the workspace dependencies and prepares the editor app for local development.

## Run In Development

Start the editor from the repository root:

```bash
pnpm dev
```

This runs the Vite dev server for the editor app and serves it locally at `http://localhost:5173/`.

If you want to run the app package directly, you can also use:

```bash
pnpm --filter editor dev
```

## Build

Create a production build from the repository root:

```bash
pnpm build
```

You can also build the app package directly with:

```bash
pnpm --filter editor build
```

## Testing And Verification

Automated tests have not been added yet. For now, the project is verified with the following checks:

```bash
pnpm build
```

The build runs TypeScript compilation and Vite production bundling for the editor app, which is the current best end-to-end check for regressions in the walking skeleton.

When a formal test suite is added, this section should be updated to include the test command and any component or integration test workflow.

## What The Editor Does Today

- **Scene Hierarchy Panel**: Manage entities with capabilities to rename, toggle visibility (show/hide), toggle lock, and delete entities.
- **Viewport Raycasting Selection**: Select objects directly inside the 3D canvas viewport using mouse/pointer clicks, with smart raycasting that ignores transform gizmo interactions.
- **Interactive Transform Gizmo**: Move, rotate, and scale selected entities using an interactive Three.js transform controls gizmo.
- **Zustand State Persistence**: Keeps editor state synced, fully persisted, and versioned in `localStorage` with state-migration support.
- **Scene Customization**: Adjust viewport settings such as background color, grid plane orientation (Floor XZ, Wall XY, Side YZ, or None), wireframe rendering mode, light color/intensity, and fog settings.

## Next Milestones

- Scene export pipeline for web embedding and later `<model-viewer>` support.
- Import pipeline for GLTF and other common assets.
- Advanced multi-selection and layout organization tools.

## Notes

- The repository is currently focused on the editor app and does not yet include a full test runner.
- The editor app is intentionally minimal so the architecture can be expanded without a large refactor later.