# Setup: Zero to a Running Editor

Getting Libre3D running on your machine. Budget about 30 minutes, most of it waiting on installs.

When you're done here, go to [architecture.md](architecture.md) to learn how the app fits together, then [templates/add-entity-type.md](templates/add-entity-type.md) to make your first change. The commit and PR process is in [CONTRIBUTING.md](../.github/CONTRIBUTING.md).

---

## 1. Prerequisites

```bash
node --version    # v18.0.0 or higher
git --version     # any recent version
```

- **Node.js** — https://nodejs.org/, choose LTS
- **Git** — https://git-scm.com/

Then install pnpm, which is what this monorepo uses instead of npm:

```bash
npm install -g pnpm
```

```bash
pnpm --version
```

You want v11 or higher. If `pnpm` isn't found after installing, close and reopen your terminal.

---

## 2. Clone and install

```bash
git clone https://github.com/The-Agency-at-UF/Libre3D.git
```

```bash
cd Libre3D && pnpm install
```

This pulls down every dependency in the workspace and takes 2–5 minutes the first time.

If it fails on peer dependencies, try:

```bash
pnpm install --no-strict-peer-dependencies
```

---

## 3. Verify the build

```bash
pnpm build
```

This runs `tsc -b` (type-check) and then `vite build`. You should end with something like:

```
dist/index.html                   0.45 kB │ gzip: 0.34 kB
dist/index.[hash].js            123.45 kB │ gzip: 45.67 kB

✓ built in 15.23s
```

**A clean `pnpm build` is the correctness bar in this repo.** There is no test suite and no linter, so "it compiles and I checked it by hand" is what passes for green here. Get used to running it.

If it fails, check your Node version first (needs v18+), then see [troubleshooting.md](troubleshooting.md).

---

## 4. Run it

```bash
pnpm dev
```

```
  VITE v7.3.5  ready in 234 ms

  ➜  Local:   http://localhost:5173/
```

Open http://localhost:5173/. You should see:

- a 3D viewport with a blue cube sitting on a grid
- the scene tree on the left, with the cube and a light in it
- inspector panels on the right — frame size, scene settings, camera
- a floating toolbar at the top with the transform tools and an **Add Shape** menu
- **no errors in the DevTools console** — open it and check, this matters

Changes to source files hot-reload automatically; you don't need to restart the server.

### Try the loop once

Before you read any more documentation, spend five minutes doing this. It'll make [architecture.md](architecture.md) land much faster:

1. **Add Shape → Sphere.** It appears in the viewport *and* in the left sidebar tree.
2. **Click the sphere in the viewport.** A gizmo appears, and the right sidebar fills in with its position, rotation and scale.
3. **Drag the gizmo.** Watch the numbers in the right sidebar change as you drag.
4. **Ctrl+Z.** It goes back.
5. **Reload the page.** The sphere is still there.

Nobody wrote per-feature code for steps 4 and 5. Undo and persistence come from store middleware and apply to every feature automatically — including whatever you build. That's the single most useful thing to know about this codebase.

---

## Setup troubleshooting

### `pnpm: command not found`

```bash
npm install -g pnpm
```

Then restart your terminal.

### Port 5173 already in use

**Windows (PowerShell):**

```powershell
Get-NetTCPConnection -LocalPort 5173 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**macOS / Linux:**

```bash
lsof -ti:5173 | xargs kill -9
```

Or just let Vite pick the next free port — it does that automatically and prints the new URL.

### Build fails with TypeScript errors after pulling

Stale build artifacts. Clear and reinstall:

**Windows (PowerShell):**

```powershell
Remove-Item -Recurse -Force node_modules; pnpm install; pnpm build
```

**macOS / Linux:**

```bash
rm -rf node_modules && pnpm install && pnpm build
```

### Dev server starts but the page is blank

Open DevTools and read the console. A corrupted saved scene in `localStorage` is the usual cause — reset it:

```javascript
localStorage.removeItem("editor-store"); location.reload();
```

Anything else, see [troubleshooting.md](troubleshooting.md).

---

## Command reference

| Task | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Start the dev server | `pnpm dev` |
| Type-check and build | `pnpm build` |
| Preview the production build | `pnpm --filter editor preview` |

---

## Next

1. **[architecture.md](architecture.md)** — how the app works. Read this before you change anything.
2. **[templates/add-entity-type.md](templates/add-entity-type.md)** — add a new shape. This is the best first contribution.
3. **[CONTRIBUTING.md](../.github/CONTRIBUTING.md)** — branch naming, commits, and opening a PR.
