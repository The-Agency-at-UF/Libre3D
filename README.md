# Libre3D
An open-source, code-free browser tool for building interactive 3D elements for websites.

# Table of Contents
- [What is the Libre3D project?](#what-is-the-libre3d-project)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [How to get started](#how-to-get-started)
- [How to contribute](#how-to-contribute)
- [How to review code](#how-to-review-code)

# What is the Libre3D project?

Libre3D is an open-source, code-free browser tool designed for building interactive 3D elements for websites. Positioned as an open-source alternative to Spline, it allows creators to assemble, customize, and view 3D canvas coordinates directly from a web interface without touching code.

The project is structured as a robust "walking skeleton" monorepo designed to grow without requiring massive architectural overrides down the line.

**The problem:** Traditional web-based 3D content generation usually requires heavy engineering overhead, complex asset setup, or lock-in to closed-source ecosystems with restrictive embedding models.

**The solution:** A high-performance, full-bleed 3D workspace powered by state persistence, dynamic camera constraints, and isolated spatial environments. It enables non-technical creators to compose 3D scenes and instantly verify production boundaries, mapping towards seamless downstream `<model-viewer>` integrations.

**What the editor does today:**
- **Scene Hierarchy Panel** — Full CRUD control over entities with options to rename, toggle visibility (show/hide), toggle lock state, and delete elements cleanly from the tree.
- **Viewport Raycasting Selection** — Intuitive object selection directly on the 3D canvas utilizing smart raycasting that automatically ignores active transformation handles.
- **Interactive Transform Gizmo** — Precise manipulation of translated, rotated, and scaled entities using a streamlined Three.js engine.
- **Spline-Style Frame Sandbox & Auto-Scaling** — Hard-bounded resolution layout testing (e.g., `1920x1080`, `1080x1080 Square`, or `Custom`) centered within the sidebar void space. Uses a `ResizeObserver` matrix to scale frames down proportionally via CSS transforms (e.g., `83%`) to maintain a clean letterbox crop.
- **Local Play Mode / Scene Preview** — Instant layout locking and panel dimming to preview pristine user perspectives using local GLB exporters while preserving active WebGL contexts.
- **Scene Customization & Fixed Grid Alignment** — Absolute canvas background matching and grid orientations (Floor XZ, Wall XY, Side YZ) mapped directly to matching spatial coordinate axis color tokens (X = Red, Y = Green, Z = Blue).
- **Streamlined Gizmo Interactors** — Clutter-free workspaces achieved by physically pruning structural line guideline vectors out of the helper object graph upon initialization.

# Tech Stack

**Frontend & Monorepo Infrastructure**
- [pnpm workspaces](https://pnpm.io/workspaces) + [Turborepo](https://turbo.build/) for lightning-fast caching and monorepo task management
- [Vite](https://vite.dev/) as the build tool and development bundling engine
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) for highly structured UI components
- [Three.js](https://threejs.org/) for rendering the underlying WebGL graphics context
- [Zustand](https://github.com/pmndrs/zustand) for reactive, versioned, and local-storage-persisted editor scene state

# Prerequisites
Before getting started, make sure you have:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/installation) (v11 or higher recommended)
- [VSCode](https://code.visualstudio.com/) or your preferred IDE

# How to get started
1. Clone this repository to your local machine.
2. Open the project root directory in your code editor or terminal.
3. Install the workspace-wide dependencies from the root directory:
```bash
pnpm install