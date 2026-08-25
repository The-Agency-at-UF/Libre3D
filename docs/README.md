# Libre3D Documentation

**New here? Read these three, in order.** They take about an hour together and are enough to make a real contribution.

1. **[contributor-setup.md](contributor-setup.md)** — get it running on your machine
2. **[architecture.md](architecture.md)** — how the app works: store → managers → Three.js
3. **[templates/add-entity-type.md](templates/add-entity-type.md)** — add a new shape, your first change

Then **[CONTRIBUTING.md](../.github/CONTRIBUTING.md)** for branch naming, commits, and opening a PR.

---

## Reference — look things up as you need them

| Doc | Use it when |
|---|---|
| [troubleshooting.md](troubleshooting.md) | something is broken and you want the answer fast |
| [store-api-reference.md](store-api-reference.md) | you need to know what store action does what |
| [project_index.md](project_index.md) | you're hunting for the file that owns some behaviour |
| [conventions.md](conventions.md) | you're unsure how to name or structure something |
| [testing-guide.md](testing-guide.md) | you're about to open a PR and want to verify properly |
| [templates/add-inspector-panel.md](templates/add-inspector-panel.md) | you're adding controls to the right sidebar |
| [roadmap.md](roadmap.md) | you're looking for something to work on |

---

## Two things to know up front

**There is no test suite and no linter.** A clean `pnpm build` plus manually checking the feature in the dev server *is* the correctness bar. Check the DevTools console before you push.

**All editor state lives in one Zustand store.** Undo, autosave, and export all read from it, so a feature wired into the store gets those for free — and a feature that bypasses it gets none of them.
