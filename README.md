# Libre3D

An open-source, code-free browser tool for building interactive 3D elements for websites.

## Table of Contents

- [Libre3D](#libre3d)
  - [Table of Contents](#table-of-contents)
  - [What is the Libre3D project?](#what-is-the-libre3d-project)
  - [Tech Stack](#tech-stack)
    - [Frontend \& Monorepo Infrastructure](#frontend--monorepo-infrastructure)
  - [Prerequisites](#prerequisites)
  - [How to get started](#how-to-get-started)
  - [How to contribute](#how-to-contribute)
  - [How to review code](#how-to-review-code)

## What is the Libre3D project?

Libre3D is an open-source, code-free browser tool designed for building interactive 3D elements for websites. Positioned as an open-source alternative to Spline, it allows creators to assemble, customize, and view 3D canvas coordinates directly from a web interface without touching code.

The project is set up as a "monorepo." This means all of Libre3D's code lives in this one repository, even though it will eventually consist of several distinct parts (like a viewer widget or shared UI components). Right now, the core focus is the main 3D editor app located in the `apps/editor` folder. The current code provides a basic, working foundation—a structural starting point with the core architecture in place so we can easily add new features without having to reorganize everything later.

**The problem:** Building 3D content for the web usually means writing custom code, setting up complex asset pipelines, or relying on closed-source tools that limit how you can use your own creations.

**The solution:** Libre3D is a fast, browser-based 3D workspace. Your work is automatically saved as you go, you can move the camera around freely, and each scene stays self-contained. This means non-technical creators can build 3D scenes, preview them at their real output size, and (eventually) export them for use with `<model-viewer>`, a simple way to display 3D models on any webpage.

**What the editor does today:**

- **Scene Hierarchy Panel** — A list of everything in your scene. Rename items, show/hide them, lock them so they can't be moved by accident, or delete them.
- **Click-to-Select in the 3D View** — Click directly on an object in the 3D canvas to select it. The tool is smart enough to ignore the selection handles themselves, so clicking near an object won't accidentally grab the wrong thing.
- **Move, Rotate, and Scale Tool (Gizmo)** — An on-screen handle you drag to move, rotate, or resize objects, built on top of the Three.js 3D engine.
- **Frame Sandbox & Auto-Scaling** — Test how your scene looks at common screen sizes (like `1920x1080` or a `1080x1080` square) or set a custom size. The preview automatically shrinks to fit your sidebar (e.g., scaling down to 83%) while keeping the correct proportions, similar to how Spline's preview frame works.
- **Local Play Mode / Scene Preview** — Instantly switch to a clean, distraction-free view of your scene as your end users would see it, without losing any of your editing progress.
- **Scene Background & Grid Settings** — Customize the canvas background and choose which grid to show (Floor, Wall, or Side view). Each direction has its own color for clarity: X = Red, Y = Green, Z = Blue.
- **Cleaner Selection Handles** — Extra guideline clutter is automatically removed from the move/rotate/scale handles, so your workspace stays tidy.

## Tech Stack

### Frontend & Monorepo Infrastructure

- [pnpm workspaces](https://pnpm.io/workspaces) + [Turborepo](https://turbo.build/) for lightning-fast caching and monorepo task management
- [Vite](https://vite.dev/) as the build tool and development bundling engine
- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) for highly structured UI components
- [Three.js](https://threejs.org/) for rendering the underlying WebGL graphics context
- [Zustand](https://github.com/pmndrs/zustand) for reactive, versioned, and local-storage-persisted editor scene state

## Prerequisites

Before getting started, make sure you have:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/installation) (v11 or higher recommended)
- [VSCode](https://code.visualstudio.com/) or your preferred IDE

## How to get started

1. Clone this repository to your local machine.
2. Open the project root directory in your code editor or terminal.
3. Install the workspace-wide dependencies from the root directory:

```bash
pnpm install
```

4. Fire up the local Vite development server for the editor app:

```bash
pnpm dev
```

*Alternatively, you can boot the editor application package explicitly using:*

```bash
pnpm --filter editor dev
```

5. Open your browser and navigate to [http://localhost:5173/](http://localhost:5173/) to see Libre3D running locally!

## How to contribute

1. Make sure your local `main` branch is up to date, so you're not working from outdated code (this helps avoid merge conflicts later):

```bash
git checkout main
git pull
```

2. Create a new branch for your feature. Name it `[your-initials]/[feature-name]`, for example:

```bash
git checkout -b em/add-sandbox-viewport
```

3. Double check you're on the right branch (most terminals and git tools show this).
4. Push your new branch to GitHub, then make your changes in VSCode.
5. Commit your work in small, logical chunks using the [Conventional Commits](https://gist.github.com/Zekfad/f51cb06ac76e2457f11c80ed705c95a3) style (a `type: short description` format that keeps commit history easy to scan):

- Example: `feat: prune guideline lines from transform controls initialization`
- Example: `fix: correct calc sizing for asymmetric sidebar centering`

6. Push your commits and open a Pull Request (PR) on GitHub. Assign reviewers so they're notified to look at your changes.

## How to review code

1. Pull down the branch you're reviewing onto your own machine.
2. Run a full build to check for TypeScript errors or other warnings:

```bash
pnpm build
```

*Or, to build just the editor app instead of the whole project:*

```bash
pnpm --filter editor build
```

3. Start the app locally (`pnpm dev`) and try it out:

- Confirm the feature actually does what the PR describes.
- Open your browser's developer console and check for errors, like WebGL memory leaks, unexpected warnings, or styling glitches.
- Make sure existing features and the 3D scene still work correctly and nothing else broke.

4. Go to the **Files changed** tab on the GitHub PR to leave comments on specific lines of code.
5. Submit your review as **Approve**, **Request changes**, or **Comment**.