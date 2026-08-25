# Contributing to Libre3D

Everything you need to get a change merged. If you haven't run the editor locally yet, start with [docs/contributor-setup.md](../docs/contributor-setup.md) and come back here.

---

## Code of conduct

Be respectful and constructive, welcome perspectives different from your own, and raise concerns with the maintainers.

---

## What to work on

**Good first contributions** — a new primitive (cylinder, plane, torus knot), a new scene setting, a UI glitch, or a documentation fix. Anything in [docs/roadmap.md](../docs/roadmap.md) is fair game.

**Before starting a feature**, open an issue and describe what you're planning. This is less about approval than about not having two people build the same thing in the same week.

**For anything large** — an import pipeline, a materials system — break it into PRs that can each be reviewed in under 30 minutes, and agree the overall approach in an issue first.

---

## Workflow

### 1. Branch

```bash
git checkout main && git pull origin main
```

```bash
git checkout -b em/add-cone-primitive
```

Naming is `[initials]/[kebab-case-name]` — `em/add-cone-primitive`, `ja/fix-gizmo-alignment`, `rk/docs-store-api`.

### 2. Commit

[Conventional Commits](https://www.conventionalcommits.org/), imperative mood, one logical change per commit:

```
feat: add cone primitive entity type

Adds ConeGeometry to ObjectManager and a defaults entry to
ENTITY_DEFAULTS, so "Cone" appears in the Add Shape dropdown.
```

Types: `feat:` `fix:` `docs:` `refactor:` `perf:` `chore:`

Keep the first line under 50 characters, blank line before the body, and use the body to explain **why** — the diff already shows what.

### 3. Verify before you push

There is no test suite and no linter, so this part is on you:

```bash
pnpm build
```

Then run `pnpm dev` and check, by hand:

- the thing you built actually works
- **the DevTools console is clean** — WebGL and GLTF warnings count
- `Ctrl+Z` / `Ctrl+Shift+Z` undo and redo your change correctly
- reloading the page preserves it
- the features next to yours still work

[docs/testing-guide.md](../docs/testing-guide.md) has fuller checklists per change type.

### 4. Open the PR

```bash
git push origin em/add-cone-primitive
```

Open it against `main`, title it like your first commit, and cover three things in the description: **what** changed, **why**, and **how to test it**. Link the issue if there is one.

`main` is protected — PRs need at least one approval.

---

## Review

### As an author

Keep the PR to one feature or fix. Respond to every comment, even just to acknowledge it. Push new commits rather than force-pushing, so reviewers can see what changed since they last looked. Re-request review when you're ready.

### As a reviewer

Pull the branch and actually run it — don't review from the diff alone. Then check:

**Correctness** — does it do what the PR claims? Are the edges handled? Does undo/redo still behave? Does export still work?

**Architecture** — this is where most real problems hide:

- Vectors cloned on read and write, never handed out live
- `sceneSettings` / `postProcessing` / `frame` updated through their actions, not replaced wholesale
- Store shape changed → persist `version` bumped **and** a matching migration added
- No new Context providers or parallel stores; durable state belongs in `useEditorStore`
- New entity type → `ObjectManager.createGeometry` has a case for it

**Style** — matches [docs/conventions.md](../docs/conventions.md) and the surrounding code. No leftover `console.log`, no dead code, comments that say why rather than what.

### The five things caught most often

1. A vector mutated in place, quietly corrupting the store
2. A config object replaced instead of deep-merged, wiping unrelated settings
3. A store field added without bumping the persist `version` — breaks every existing user's saved scene
4. Component state used where store state was needed, so the feature has no undo
5. A new entity type with no `createGeometry` case, silently rendering as a cube

---

## AWS setup (publish / share only)

The publish and share features talk to S3 and DynamoDB through Vite dev middleware. Everything else in the editor works without this. To enable them, put a `.env` in the repo root:

```
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket
DYNAMODB_TABLE_NAME=your-table
```

---

## Reporting a bug

Include steps to reproduce, what you expected, what actually happened, your browser and OS, any console errors, and a screenshot if it's visual.

---

## Where to look things up

| | |
|---|---|
| How the app works | [docs/architecture.md](../docs/architecture.md) |
| Every store action | [docs/store-api-reference.md](../docs/store-api-reference.md) |
| Naming and patterns | [docs/conventions.md](../docs/conventions.md) |
| Which file owns what | [docs/project_index.md](../docs/project_index.md) |
| Something's broken | [docs/troubleshooting.md](../docs/troubleshooting.md) |

**Stuck?** Open an issue with the `question` label, or comment on the issue you're working from. Asking early is cheaper than a rewrite.
