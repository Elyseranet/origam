# origam — Engineering Principles

This document is the canonical reference for AI agents and humans working on
the origam design system. It complements the global CLAUDE.md instructions
by capturing project-specific conventions.

---

## ⛔ Reuse existing interfaces / composables — never duplicate (mandatory)

**Before declaring a new prop on a component interface, audit
`packages/ds/src/interfaces/Commons/*` for an existing one that already
covers the surface. If one exists, `extends` it.**

Concretely:

- **Dimensions** (`height`, `width`, `minHeight`, `minWidth`,
  `maxHeight`, `maxWidth`) → `extends IDimensionProps` and
  consume the values via `useDimension(props).dimensionStyles`.
- **Spacing** (`margin*`, `padding*`) → `extends IMarginProps`
  / `IPaddingProps`, consumed via `useMargin` / `usePadding`.
- **Color** → `extends IColorProps`, consumed via `useColor` /
  `useBackgroundColor` / `useTextColor` / `useColorEffect`.
- **Border / rounded / elevation** → `IBorderProps`,
  `IRoundedProps`, `IElevationProps` (each with its own composable).
- **Density / size** → `IDensityProps`, `ISizeProps`.
- **Location / position** → `ILocationProps`, `IPositionProps`.

The same rule applies to **composables** and **utilities** —
if `useFoo` already does the job, don't roll your own `useBar`
with the same body. Import the existing one.

Two avoidable bugs come from violating this rule:

1. **Half-implemented surfaces** — a component declares
   `height` but ignores `width` / `maxHeight` / etc., so a
   consumer's `maxHeight="50vh"` silently does nothing.
2. **Drift** — the standard `convertToUnit` from
   `useDimension` accepts numbers (`→ "Npx"`), CSS lengths,
   custom-property refs, `aspect-ratio` shortcuts. A
   hand-rolled height parser will inevitably miss one of
   these cases over time.

Pre-commit audit (every new / modified component):

```bash
# 1. Are any of the standard prop names declared inline?
grep -nE "height\??:|width\??:|margin\??:|padding\??:" \
     packages/ds/src/interfaces/<area>/<name>.interface.ts

# 2. If so, does the interface already extend the matching
#    Commons interface? If not, refactor.
```

The interfaces under `packages/ds/src/interfaces/Commons/*.interface.ts`
are the **single source of truth** for cross-cutting prop
surfaces. Treat them as building blocks, not as references.

---

## ⛔ "Test-as-you-build" rule for stories (mandatory)

**Every new story MUST ship with a matching Playwright spec that asserts
every prop / Variant produces a distinct runtime behaviour.** Don't write
the doc + story and call it done — write the doc, the story, AND
`packages/tests/e2e/{component}.spec.ts` together. The spec must:

1. Navigate to each `<Variant>` (via the dedicated Variant titles, not
   via the HstSelect picker dropdown which is custom DOM and brittle).
2. For each prop exposed in the variant's controls, programmatically
   exercise the prop (mouse, scroll, value swap, …) and assert the
   computed style / class actually changes between values.
3. Catch silently-ignored props (component types `IXxxProps` but the
   `<style>` block is empty, or a class is emitted without a matching
   SCSS rule). If the SCSS is missing, **fix it in the same PR**, don't
   defer to a remediation ticket — that's how the user ends up clicking
   through 10 broken Variants.

If a prop can't be tested headlessly (audio, deviceorientation on
desktop without sensor support), document that in the spec with a
diagnostic block AND mention the limitation explicitly when reporting
to the user.

---

## ⛔ "Don't claim it's fixed" rule (mandatory)

**Never tell the user "it's fixed" / "ça devrait marcher" / "fait" without
having actually verified the runtime behaviour.** Type-check passing or
file-edit success is NOT verification.

Before claiming a fix:

1. **Component logic / pure functions** — write a Vitest unit test (or
   re-run an existing one) and confirm green.
2. **SCSS / CSS rules** — grep the rendered class output OR ask the user
   for a screenshot of the DOM-inspected element with computed styles.
3. **Stories / Histoire interactions (mouse, scroll, focus, drag, …)** —
   you cannot test these in CLI. Acknowledge the limitation explicitly:
   *"I can't verify interactive behaviour from here — please reload and
   confirm X, Y, Z. If it still fails, paste the console errors or a
   screenshot."* Do **not** say "it's fixed" — say "I changed X, please
   verify it works."
4. **Fixes that touched composables consumed by many components** —
   surface the blast radius and ask the user to spot-check at least one
   component besides the one originally reported.

When in doubt, **stop and ask** rather than claim correctness. A wrong
"it's fixed" wastes the user's testing cycle and erodes trust.

## ⛔ `withDefaults()` — inline literals only (mandatory)

Vue 3 SFC compiler statically analyses `withDefaults(defineProps<T>(), {…})`
at compile time to extract the runtime props options descriptor. Values
on the right side of each key **must be inline literals** (strings,
numbers, booleans, `() => ({})` for objects). Property accesses on
imported `as const` objects are NOT statically resolvable — the compiler
emits a descriptor with `undefined` defaults and the props object itself
becomes undefined at any reactive access.

```ts
// ❌ Broken — compiler can't resolve XXX_DEFAULTS.tag statically
const props = withDefaults(defineProps<IXxxProps>(), {
    tag: XXX_DEFAULTS.tag,
    variant: XXX_DEFAULTS.variant
})

// ✅ Working — literal values inlined
const props = withDefaults(defineProps<IXxxProps>(), {
    tag: 'div',
    variant: 'default'
})
```

The shared `XXX_DEFAULTS` constant stays exported (for story-side
iteration and consumer reference) but is **never** referenced inside
`withDefaults`. The crash propagates through the import graph and
breaks unrelated specs — failures look like
`TypeError: Cannot read properties of undefined (reading '<key>')`
sourced at the component file, even though the crashing spec doesn't
import the component directly.

This rule applies to **every** component using `withDefaults`. Audit
your delivery once before commit.

## ⛔ Story + doc sync on every component change (mandatory)

**Every PR that adds, renames, or removes a prop / slot / emit on a
component MUST update the matching `.story.vue` and `.md` in the
same commit.** A Variant that doesn't reflect the live API is a
documentation lie; a doc table missing the latest prop wastes the
user's debugging cycle.

### Story file structure (canonical)

Every `packages/stories/components/stories/{Name}/Origam{Name}.story.vue`
MUST follow this exact section order. The reference implementation is
`Btn/OrigamBtn.story.vue` — mirror it. Props are grouped **by type**,
and the story is organised so a user can test the component's design,
then its state, then its behaviour, then its events and slots.

1. **DESIGN** — a single `<Variant title="Design">` whose `#default`
   renders the component driven by its **visual** props (variant,
   color/bgColor, size, density, rounded, elevation, border(+color/
   style), dimension, status, icons, align/justify/position…). The
   `#controls` block is split into labelled **parts** via the shared
   `<StoryGroup title="…">` (fieldset/legend) so linked props sit
   together (e.g. Color, Sizing, Shape, Border, Status, Icons,
   Dimension).
2. **ÉTAT (design + functional)** — a `<Variant title="State">` for
   `hover` / `active` (and the surface they paint), when the component
   exposes them. Parts: Surface / Interaction. Omit if absent.
3. **FONCTIONNEL** — a `<Variant title="Functional">` driven by the
   **behaviour** props (disabled, loading, readonly, modelValue/value,
   block/slim/stacked, tag/href/to, data…), `#controls` split into
   `<StoryGroup>` parts (States, Layout, Loading, Link, Data…).
4. **EMITS** — one Variant per emit, title `Events - {name}`, wiring
   `@{name}="logEvent('{name}', $event)"`.
5. **SLOTS** — one Variant per slot, title `Slots - {Name}`, with a
   custom snippet that visibly differs from the default render.
6. **PLAYGROUND** — `<Variant title="Default">` **LAST**: `v-bind="state"`
   plus a full `#controls` panel (parts: Content / Design / Functional).

Rules that hold for every story:
- Every prop Variant types its state: `:init-state="() => useStoryInitState<IXxxProps>({…})"`
  with the matching Commons interface.
- Controls use `HstSelect :options="XXX_OPTIONS"` (SCREAMING_SNAKE sets
  from `@stories/const`), `HstText` (string), `HstNumber` (number),
  `HstCheckbox` (boolean). For an enum/union prop without an existing
  `*_OPTIONS`, build the options inline from the **real** enum
  (`@origam/enums`) — never invent values.
- Use the real component API only (read the interface); never fabricate
  props/emits/slots. Omit a section the component doesn't have.
- `group="components"` on `<Story>`, and keep `<docs lang="md" src="@docs/…">`.

### Doc file structure (canonical)

`packages/docs/components/{Name}/Origam{Name}.md` exposes:
- Description + quick-start snippet
- **Props** table — sub-tabled by group if the surface is large
  (mirror the story groups)
- **Emits** table
- **Slots** table or list
- Behaviour notes (animations, focus, a11y, SSR, browser support)
- Composable reference (`use{Name}`) if the component ships one
- 2-3 runnable usage examples

### Pre-commit sanity

Before committing, eyeball:
- every prop in the `.vue` has a control somewhere (Design / State /
  Functional / Default) AND a row in the doc's Props table
- every emit in the `.vue` has an `Events - {name}` Variant
- every slot in the `.vue` has a `Slots - {Name}` Variant

If you're spawning an agent on a component, **the agent prompt
MUST include this rule explicitly** so the deliverable lands
story + doc + implementation together — not as a follow-up.

## ⛔ NEVER `git stash` — commit instead (mandatory)

**`refs/stash` is a SINGLE ref shared by every worktree of this
repository. There are 53 of them. A `git stash push` from one worktree
lands on the same stack a `git stash pop` in another worktree will pull
from. Two agents have already swapped their work this way.**

They caught it themselves, and labelled the entries:

```
stash@{0}: FOUND-NOT-MINE: OrigamChip.vue keydown guard fix — belongs to
           another concurrent agent, accidentally picked up via shared
           stash ref during my own stash pop
stash@{1}: RECOVERED-NOT-MINE: emits/slots WIP (33 files) — accidental
           stash collision, belongs to another agent
```

A third entry — the architect's `INoEmits`/`INoSlots` convention, a
scanner and 3 reactivity probes, 464 insertions — sat there for weeks.
Nobody knew: a shared ref belongs to no branch, so no `git log`, no
`git status`, no review ever surfaces it. Recovered on
`recover/no-emits-convention`.

⛔ **The previous version of this rule MANDATED stashing.** It caused the
exact disaster it claimed to prevent. Stash is a single-worktree tool;
this repository has not been a single-worktree repository for a long
time.

### The mandatory flow

```bash
# Step 1 — commit, even a half-finished state
git commit -am "wip: <what you were doing>"

# Step 2 — do the risky operation
git checkout <branch>          # or merge, reset, flow op, …

# Step 3 — nothing to restore. The WIP stayed on ITS branch,
#          in YOUR worktree, reachable by name.
```

A commit is attached to a branch, and a branch is checked out by exactly
one worktree. It cannot migrate to a neighbour. That is the whole
argument.

A WIP commit is not a promise: reword it, squash it, or `git reset
--soft HEAD~1` later. None of that costs anything. Losing someone
else's afternoon does.

### When to commit

- Before `git checkout <branch>` on a dirty tree.
- Before `git flow feature start | finish | rebase`.
- Before `git reset` / `git pull` on a dirty tree.
- Before handing back control at the end of a turn — sessions are cut
  without warning, and **an uncommitted worktree has survived nothing.**
- Before any "let me just check the other branch real quick" move.

### Destructive operations

Before a force-push, a branch deletion carrying unpushed commits, or a
`git clean -fd`, commit AND tag:

```bash
git commit -am "wip: before <op>"
git tag -a backup/<date>-<topic> -m "safety net"
# … do the risky thing …
# to recover: git checkout backup/<date>-<topic>
```

### If you find entries in `git stash list`

They are not yours to pop. Popping is how the collisions above happened.
Check whether the content already landed (`git stash show -p`, then grep
the target files on `develop`); if it did, the entry is redundant. If it
did not, promote it to a real branch — never into your working tree:

```bash
git stash branch recover/<topic> stash@{N}
```

## Tech stack (snapshot)

- **Vue 3** (Composition API + `<script setup lang="ts">`), strict TS.
- **Vite + Histoire + VitePress** for dev, stories, and docs.
- **unbuild** for the published library (consumed by external apps).
- **Playwright** (e2e + a11y), **Vitest** (unit tests, jsdom).
- **No design-token build step.** The token stylesheets are plain
  hand-maintained CSS/SCSS committed under `packages/ds/src/assets/` — see
  "Design tokens" below.
- **pnpm workspaces** — monorepo, 5 packages under `packages/`.

The project requires **Node >= 22** (see `.nvmrc`). The unit tests do not
run on Node 18 because `@vitejs/plugin-vue` calls `crypto.hash()` (Node 21+).

---

## Project structure (monorepo)

The repo is a **pnpm workspace** with 5 packages. The only package
published to npm is `packages/ds/` (as `origam`). Everything else stays
private and supports the lib (docs, stories, tests, marketing).

```
packages/
  ds/                — Published Vue 3 library (npm: origam)
    src/
      assets/css/    — main.css + hand-maintained token sheets
      assets/scss/   — main.scss + tokens (_primitive.scss, _light.scss, …)
      components/    — Origam{PascalCase}.vue (~80 families)
      composables/   — use{CamelCase}.ts (~80 transversal hooks)
      consts/        — kebab-case.const.ts (SCREAMING_SNAKE values)
      directives/    — v-{kebab-case}.directive.ts
      enums/         — kebab-case.enum.ts
      interfaces/    — kebab-case.interface.ts (I prefix)
      services/      — kebab-case.service.ts
      types/         — kebab-case.type.ts (T prefix)
      utils/         — kebab-case.util.ts
      nuxt/          — official Nuxt module sub-export
    scripts/         — guards/ (architecture guards), token-name.mjs, analysis/
    build.config.ts  — unbuild entry
  marketing/         — Nuxt 4 marketing site (landing + showcase + docs hub)
    pages/, components/, scripts/
  stories/           — Histoire stories (~208 specs)
    components/, foundations/
    histoire.config.js
  docs/              — VitePress documentation (component refs, integrations)
    components/, integrations/, .vitepress/
  tests/             — Centralised test runner
    TU/              — Vitest unit specs
    e2e/             — Playwright e2e + a11y specs
    vitest.config.ts, playwright.config.ts, playwright.a11y.config.ts
```

The root holds only:
- `package.json` (workspace manager, root scripts delegating via `pnpm -F`)
- `pnpm-workspace.yaml` (lists `packages/*`)
- `pnpm-lock.yaml`
- Top-level docs (`README.md`, `CLAUDE.md`, `ROADMAP.md`, `CHANGELOG.md`)
- `docker/` (Dockerfile.docs, Dockerfile.stories, nginx.conf)
- `.github/workflows/`, `.husky/`, `.nvmrc`, `eslint.config.js`

---

## Monorepo workflow

### Install

```bash
corepack enable          # makes pnpm@9.15.0 the active package manager
pnpm install             # installs every workspace + hoists shared deps
```

### Running scripts

Always go through `pnpm -F <name>` (filter) — never `cd packages/x && npm run …`.
Root scripts already delegate, so the most common entries are:

> ⛔ **Never run `npm install` / `yarn install` here, and never invoke a
> package's binary from the repo root.** pnpm's isolated layout makes every
> `node_modules/` entry a symlink into `.pnpm/`; npm writes real directories
> *beside* those links instead of replacing them, and nothing reports the
> collision. Issue #382: 676 stray directories from one `npm install`, among
> them a second physical copy of playwright **1.59.1** — same version,
> different realpath, therefore a different module to Node and a different
> `test.describe` registry. The runner then rejected every spec with *"two
> different versions of @playwright/test"* while the lockfile and `pnpm ls`
> both showed exactly one. CI was never affected because it always goes
> through `pnpm -F @origam/tests exec playwright`; only root-level
> invocations (`npx playwright`) hit the stray copy. The
> `pnpm-tree-integrity` guard now fails on any physical copy; the fix is
> `rm -rf <that node_modules> && pnpm install --frozen-lockfile`.

| Goal | Command |
|---|---|
| Build the lib | `pnpm -F origam build` *(or root `pnpm run build:lib`)* |
| Build everything | `pnpm -r build` *(or root `pnpm run build:all`)* |
| Run stories locally | `pnpm -F @origam/stories dev` *(`http://localhost:6006`)* |
| Run docs locally | `pnpm -F @origam/docs dev` |
| Run marketing locally | `pnpm -F @origam/marketing dev` *(`http://localhost:3000`)* |
| Unit tests (watch) | `pnpm -F @origam/tests test:unit` |
| Unit tests (CI) | `pnpm -F @origam/tests test:unit:run` |
| E2E tests | `pnpm -F @origam/tests test:e2e` |
| A11y tests | `pnpm -F @origam/tests test:a11y` |
| Lint (root) | `pnpm run lint:fix` |

### Adding dependencies

- **Shared dev tools** (eslint, husky, …) — root `package.json` only.
- **Runtime deps of a package** — `pnpm -F <pkg> add <dep>` (lands in the
  package's own `package.json`, hoisted via the workspace store).
- **Cross-package deps** — declare `"<dep>": "workspace:*"` in the
  consumer's `package.json`. pnpm rewrites the protocol on publish.

### Versioning convention (decision β)

- `packages/ds/` follows the historical `origam` semver
  (`2.5.x → 2.6.x → 3.0.0`). It is the single npm publish.
- `@origam/marketing`, `@origam/stories`, `@origam/docs`,
  and `@origam/tests` are all `private: true`,
  versioned independently (`0.x.y`). They never publish to npm; tags
  reference the lib version only.

The `release.yml` workflow asserts `git tag == packages/ds/package.json
version` and publishes from `packages/ds/` exclusively.

---

## Core principle — **CSS-first, JS-fallback**

Modern CSS is powerful. Use it.

| Need | First choice (CSS) | Fallback only if unsupported |
|---|---|---|
| Layout | `display: grid` + `grid-template-areas` | flex + JS positioning |
| Subdividing | `grid-template-columns: subgrid` | re-implement nested grid |
| Fluid sizing | `min()` / `max()` / `clamp()` | JS `ResizeObserver` + style mutations |
| Component-level breakpoints | `@container (...)` | JS `ResizeObserver` |
| Parent-aware styling | `:has()` selector | JS class toggling |
| Aspect-locked elements | `aspect-ratio: 16 / 9` | JS padding-bottom hack |
| Color blending | `color-mix(in srgb, …)` | JS color math |
| Form controls | `accent-color` | JS-painted custom controls |
| Smooth transitions | `view-transition-name` | JS animation libs |

Concretely, every component that previously needed JS for one of those tasks
should:
1. Implement the CSS-only path first.
2. Branch via the `useCssSupport()` composable to a JS fallback ONLY when
   `CSS.supports()` returns false.

### `useCssSupport()` — the single feature-detection layer

Located at `packages/ds/src/composables/CssSupport/cssSupport.composable.ts`.

```ts
import { useCssSupport } from '@/composables'

const { css, supports, supportsAny, has } = useCssSupport()

// Reactive named flag (preferred when the feature is part of the public matrix)
if (css.value.containerQueries) { /* CSS path */ }
else { /* JS resize-observer path */ }

// Free-form query (cached after the first call)
if (supports('selector(:has(*))')) { … }

// Logical combinators
if (supportsAny('display: grid', 'display: -ms-grid')) { … }
```

Rules:
- **Never call `CSS.supports()` directly in a component**. Always go through
  the composable so the matrix stays auditable in one place.
- **Never gate hydration-sensitive markup** on `css.value.*` — during SSR
  every flag is `false`. Wrap branches with `<ClientOnly>` or `onMounted`
  if the difference would cause hydration mismatch.
- **Add a new feature** by editing `FEATURE_QUERIES` in
  `cssSupport.composable.ts`. The map is the single source of truth for
  what we monitor.

When in doubt, ask: "can I express this with CSS today?". If yes, do it
with CSS. If a target browser cannot, branch via `useCssSupport`. This
keeps bundles smaller, performance better, and theming free.

---

## Design tokens

⛔ **There is no token build step, and no token source format.** The
Style Dictionary v4 + Tokens Studio pipeline (`packages/ds/tokens/`,
`scripts/build-tokens.mjs`, `scripts/tokens.config.mjs`, the `tokens:build`
/ `tokens:watch` / `tokens:lint` scripts, the `tokens` CI job and the
`tokens-sync` workflow) was **removed on 2026-08-31**, along with the Figma
sync plugin. Do not reintroduce any of it without an explicit decision — a
pipeline may be rebuilt later, once the DS is stable.

**Source of truth is now the committed stylesheets themselves**, which are
plain hand-editable files:

```
packages/ds/src/assets/css/tokens/primitive.css          — raw values (:root)
packages/ds/src/assets/css/tokens/light.css              — light theme
packages/ds/src/assets/css/tokens/dark.css               — dark theme
packages/ds/src/assets/css/tokens/origam-utilities.css   — utility classes
packages/ds/src/assets/scss/tokens/_*.scss               — SCSS twins of the above
packages/ds/src/types/tokens.type.ts                     — TTokenName union
```

Each carries a header explaining its provenance. They were last generated
from `packages/ds/tokens/` at commit `d87842c9`; their content is byte-for-byte
that output. **Edit them directly** — there is no regeneration step and the
old "do not edit" rule no longer applies. The SCSS twin and the CSS file are
identical in content, so a change to one must be mirrored in the other; the
same goes for adding a name to `tokens.type.ts`.

The CSS variable naming grammar is unchanged and still lives in
`packages/ds/scripts/token-name.mjs`, kept as the build-time twin of
`src/utils/Theme/token-name.util.ts` with a parity unit test
(`packages/tests/TU/utils/Theme/token-name.util.spec.ts`) pinning the two
together:

| Layer | CSS variable |
|---|---|
| Primitive | `--origam-color__neutral---500` |
| Semantic | `--origam-color__surface---default` |
| Component | `--origam-btn---background-color` |
| Component (state) | `--origam-btn--primary---background-color` |
| Component (BEM child) | `--origam-card__overlay---bg` |

The `token-var-channels` guard still checks both directions — every
`var(--origam-…)` a component reads must be declared in one of the
stylesheets above, and every declared token should be read by someone.

When migrating a component:
1. Audit every `--origam-{cmp}---*` var the SCSS uses.
2. Make sure each is declared in `light.css` / `dark.css` / `primitive.css`
   (and the matching `_*.scss`), with full property names — e.g.
   `background-color`, not `bg`.
3. Replace any hardcoded hex/rgb in the SCSS by `var(--origam-color-…)`
   references (or `var(--origam-shadow-{rung})` for elevation).
4. Remove the global `<style>:root{}` block — defaults come from the
   `:root, [data-theme="light"] { … }` rules in `light.css`.
5. Keep calc-based vars that depend on instance-level state (size variant,
   density modifier, …) inside the scoped `<style>` block.

---

## Multi-theme

`<html data-theme="light|dark|brand-x">` switches the active token set.
`prefers-color-scheme: dark` is honoured when no `data-theme` attribute
is present (auto mode).

Runtime helpers:
- `useTheme()` (composable) — singleton ref + persistence + toggle.
- `<OrigamThemeProvider theme="dark">…</OrigamThemeProvider>` — sub-tree
  override (e.g. a brand-X Card inside a neutral page).

To add a brand theme, prefer the runtime route — an `IOrigamTheme` object
registered through `createOrigam()`, props first (`components` block), CSS
vars only for what props cannot express. See `packages/ds/src/themes/`.

If a brand genuinely needs its own stylesheet, hand-write a
`[data-theme="brand-{name}"] { … }` block: there is no longer a generator
that emits one from JSON.

---

## ⛔ How `theme.components` props actually resolve — invisible machinery (ADR-005)

A theme's `components` block (`{ global: {...}, 'origam-btn': {...} }`) is
**not** read because a component calls `useDefaults()`. It is resolved by
**one single mechanism**, for the whole 217-component catalogue at once:
`createOrigam()` installs a global Vue `app.mixin({ beforeCreate() {...} })`
(`installThemePropsResolver` in
`packages/ds/src/composables/Commons/theme-props-resolver.composable.ts`)
that patches the exact prop slots any REGISTERED theme names directly onto
`instance.props` — the same object a compiled `<script setup>` template
reads (`__props.x`). No component code, anywhere, opts into this.

**Why this exists.** Before ADR-005: only 39 of 217 components called
`useDefaults()` (178 silently ignored `theme.components` — no warning, no
error). Worse, even those 39 were broken for any prop their TEMPLATE reads
by its bare name, because `useDefaults()` returns a NEW object the compiled
template never sees (verified repro: `OrigamSelectionControl`'s
`:type="type"` binding rendered `<input>` with NO `type` attribute at all
under a theme setting `type: 'checkbox'` — no checkbox semantics, no
`update:modelValue`, ever). Full writeup:
`packages/docs/internal/adr-005-theme-props-resolution.md`.

**What this means when you read or write a component:**

- **If a prop's resolved value doesn't match what you see in `withDefaults()`
  or a `useDefaults()` call, check the active theme's `components` block
  BEFORE assuming a bug.** The value did not necessarily come from either
  place in the `.vue` file you're reading.
- **You do NOT need to call `useDefaults()` for a new component to be
  themeable.** Every prop on every component is already reachable by
  `theme.components` — the resolver intercepts based on what a theme NAMES,
  not on what the component opted into.
- **No component calls `useDefaults()` any more, and none should again.**
  The 40 remaining calls were removed under issue #363, which is the batched
  migration ADR-005 sketched. The call bought nothing the resolver does not
  already do, and cost roughly +0.07 ms per mount on Btn / Card / Chip
  (paired interleaved measurement, negative control at +0.10 %).
  `useDefaults` and `provideDefaults` themselves stay: `provideDefaults` is
  what `<OrigamDefaultsProvider>` is built on.
- **⛔ A prop read EAGERLY in the `setup()` body never sees the theme.**
  Vue runs `setup()` BEFORE the `beforeCreate` hook where the resolver
  writes, so a value captured into a plain local, an object literal, or a
  composable that reads it eagerly is a snapshot taken too early — the theme
  value never lands and nothing warns. Reads deferred into a `computed`,
  `watch`, or event handler are evaluated at render and are safe.
  `node packages/ds/scripts/guards/lib/setup-reads.mjs` lists the offenders;
  it is an AST detector pinned by 20 fixtures covering precision and recall.
  This bites hardest through shared composables — `useLink` froze `tag` into
  a string and `useVModel` seeded its internal ref at setup, which between
  them broke themed props on 16 components until both were made lazy.
- **Do not reintroduce a per-prop `computed()` pass-through "for clarity."**
  It was measured at +42.6% mount cost when applied across a realistic prop
  surface and was explicitly rejected on those grounds — see ADR-005.
- This relies on mutating `instance.props` via `Object.defineProperty`, which
  is **not** documented public Vue API. It is pinned by tests
  (`packages/tests/TU/origam/theme-props-resolver.spec.ts`) that must fail
  loudly, not silently, if a future Vue upgrade changes the relevant
  internals — see the long comment at the top of
  `theme-props-resolver.composable.ts` for exactly what to check.

---

## Color / intent props

The legacy `color="#ff0080"` API is **deprecated since v0.4** (warns once
per value via `useColorEffect`). The migration path is:
- Pass a `TIntent` value (`'primary' | 'success' | 'danger' | …`).
- For one-off custom colors, use `:style="{'--origam-btn---background-color': myColor}"`.

`TIntent` is defined in `packages/ds/src/types/Commons/intent.type.ts`.

---

## Classes-first conventions (since v2.1)

Transversal composables (`useColor`, `useBackgroundColor`, `useTextColor`,
`useColorEffect`, `useElevation`, `useRounded`, `useBorder`, `useMargin`,
`usePadding`, `useSize`) emit utility classes when the consumer passes a
**tokenised** value, and fall back to inline styles only for **custom**
values. The 66 utility classes live in `packages/ds/src/assets/css/tokens/origam-utilities.css`
(generated by Style Dictionary). Naming convention: `.origam--{group}-{value}`
with **double-tiret** as the utility-root separator
(e.g. `.origam--color-primary`, `.origam--shadow-md`, `.origam--rounded-lg`).

### Rules for component authors

1. **Tokenised → class. Custom → inline style.**
   `color="primary"` → `:class="[..., colorClasses]"` (utility resolves the var).
   `color="#ff00aa"` → `:style="[..., colorStyles]"` (raw value preserved).
   Bind both — the empty side is harmless.

2. **Surface BEM child, never the teleport root.** Floating components
   (Menu, Tooltip, Picker, Snackbar, Badge) carry the utility class on the
   element that owns the visible surface (`__content`, `__pill`, `__wrapper`),
   not on the overlay/teleport root — otherwise the bg paints the entire
   teleport target.

3. **Don't double-apply.** If `roundedClasses` lives on the root, do NOT
   re-inject it on a child via `mergeProps` — only the channel that's
   missing on that level (e.g. `colorClasses` on `__wrapper`) should be
   added. Pre-fix Snackbar duplicated all classes on `__wrapper`, polluting
   the cascade. Read the full template before deciding what to merge.

4. **State-dependent styling stays inline.** `useColorEffect` returns
   `colorClasses=[]` when `isHover` / `isActive` / `isDisabled` is true —
   utility classes are static by design. Components that bind
   `useActive(props, 'modelValue')` (Alert, Badge, BottomNav) therefore
   never expose a utility class while visible. The inline `colorStyles`
   keeps the surface painted. Do **not** assert on the utility class in
   tests for these components — assert on `getComputedStyle` instead.

5. **Extracting a sub-component? Audit the inline-style contract.**
   When a parent emitted a `:style="..."` declaration that an SCSS rule
   relied on (selectors like `[style*="color:"]`, `:has(…)`, attribute
   selectors), and you extract that markup into a child component, verify
   the contract still holds. Either preserve the inline path or migrate
   the SCSS rule to a class-based selector. The Switch-thumb regression
   in v2.0 → v2.1 came from breaking exactly this rule when `OrigamSwitchTrack`
   was extracted.

### Strategy A — classes AND styles in parallel (transition)

For one major cycle (v2.x), every refactored composable returns BOTH
`*Classes` and `*Styles`. When the value is tokenised, `*Styles` is
empty and the class does the work; when it's custom, `*Classes` is
empty and the style does. This is intentional — it lets components
migrate at their own pace without breaking external consumers. v3.0.0
will retire the `*Styles` returns.

---

## Component conventions (origam-specific)

- Files: `Origam{PascalCase}.vue` per component dir under
  `packages/ds/src/components/{Name}/`. The matching story lives in
  `packages/stories/components/stories/{Name}/Origam{Name}.story.vue`;
  the doc in `packages/docs/components/{Name}/Origam{Name}.md`; the
  e2e spec in `packages/tests/e2e/{component}.spec.ts`.
- Composables: `packages/ds/src/composables/{Domain}/{kebabCase}.composable.ts`.
- Types: `T` prefix, files under `packages/ds/src/types/{Domain}/{kebab-case}.type.ts`.
- Interfaces: `I` prefix, files under `packages/ds/src/interfaces/{Domain}/{kebab-case}.interface.ts`.
- CSS variables (component-local): `--origam-{component}---{property}`
  with **triple-tiret** as the block/property separator. State variants
  use `--origam-{component}--{state}---{property}` (double-tiret).

---

## Work priorities and versioning

Which work is picked up first, and how a release number is chosen, live in
**`docs/work-priorities.md`**. The short form:

1. **Fixes** — a bug costs a user something now.
2. **Refactoring** — *a refactor is a bug seen from the developer's side*.
   Misfiled code does not break at runtime; it breaks whoever has to find
   something in it next. That cost is invisible, which is why it gets
   postponed — and why it ranks second rather than last.
3. **Features**, simplest first.

Version: **major** for a large user-facing feature or a breaking change,
**minor** for a medium feature with limited impact, **patch** for a bug fix.
A dependency upgrade is judged by its size and impact, not by the file it
touches — a test-runner major is a *medium feature*, not a patch.

## Pre-delivery (project-specific overlay)

The global pre-delivery policy (TU + e2e + security) applies. Specific to
origam:
- Run tests on **Node 22** (`.nvmrc`); Node 18 produces unrelated
  `crypto.hash` failures.
- `pnpm -F origam guards` must stay at 17/17. If a change touches the token
  stylesheets, `token-var-channels` is the guard that will catch a variable
  read but never declared (or the reverse).
- `pnpm audit --prod` should be clean to ship; dev tree contains
  pre-existing histoire-alpha vulns documented as accepted risk.
