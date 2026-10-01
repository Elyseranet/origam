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

## ⛔ `getComputedStyle` under jsdom NEVER resolves `var()` (mandatory) — #398

**Under Vitest/jsdom, `getComputedStyle(el).someProperty` resolves LITERAL
CSS values but never a `var(--x)` reference — the declaration is silently
ignored and jsdom falls back to a fabricated UA default.** Measured,
reproduced:

```
div NU              border-top-width = 16px
div .avec-var       border-top-width = 16px    (règle : border-width: var(--tok), --tok = 3px)
div .en-dur         border-top-width = 7px     (règle : border-width: 7px)
--tok lue directement                = 3px
```

The default jsdom returns is **`16px`** — not `0`, not an empty string. It
*looks* like a real measurement, which is what makes this trap dangerous in
both directions:

- **False "conforme"**: a test asserting `border-top-width === '16px'`
  passes on an element that has **no border at all**.
- **False "défaut"**: a test comparing two `var()`-driven values (e.g. two
  `rounded` rungs) gets `16px` on both sides and concludes "the prop does
  nothing" — on a prop that works correctly in a real browser.

The custom property ITSELF stays readable
(`getComputedStyle(el).getPropertyValue('--tok')` → `'3px'`), which is what
completes the illusion: you can confirm the token is set correctly and
wrongly conclude the property consuming it is too.

Since this DS consumes tokens almost exclusively via `var(--origam-…)`,
`getComputedStyle` under Vitest is **structurally blind** to most of the
component style surface — not a rare edge case.

**Plain literal declarations DO resolve correctly** (`border-width: 3px`, no
`var()`) — this trap is specific to the `var()` indirection, not to
`getComputedStyle` in general. It is also specific to styles that come from
a **stylesheet rule**: an INLINE style set directly on the element
(`el.style.x = '3px'` / a Vue `:style` binding with a literal value) resolves
fine, because there is no cascade/custom-property resolution involved — only
`var()` references inside a `<style>` block's declarations are affected.
`<style scoped>` itself is ALSO never injected into jsdom's `document.head`
at all — `document.head` after mounting a component only carries token
sheets and `useStyle()`-generated rules, never the SFC's own scoped CSS.

| Question | Reliable tool |
|---|---|
| Is a class emitted? | `wrapper.classes()` |
| Does a `useStyle()`-generated rule contain the declaration? | Read the text of the `<style>` tag(s) `useStyle()` injects into `<head>` |
| Does the **computed** property actually change? | **Playwright against Histoire — real browser, the only valid verdict** (`E2E_STATIC=1`, see "Running the full e2e suite" above) |

This is the technical reason behind the existing "Don't claim it's fixed"
rule above (§2, "grep the rendered class output OR ask for a screenshot") —
it isn't a preference for rigor, it's that `getComputedStyle` under jsdom
**measures something else** whenever `var()` is involved.

A pre-existing internal harness already documents and works around this at
length: `packages/tests/TU/probe/props-harness.ts` (search "jsdom does not
implement CSS Custom Property resolution"). No blanket static-analysis guard
enforces this repo-wide — most `getComputedStyle` calls in `TU/` assert on
literal/inline values (legitimate), and distinguishing those from a
`var()`-driven stylesheet assertion is not reliably inferable by grep alone
without a high false-positive rate. Treat this section as the check to run
by eye before trusting any `getComputedStyle` assertion on a CSS property
this DS themes via a token.

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

### ⛔ `refs/stash` is not the only shared ref — `origin/*` moves under you too

`refs/remotes/origin/*` is **just as shared as `refs/stash`**: any worktree's
fetch or push updates it for all the others, with nothing in your own session
to tell you. So `origin/develop` is not a snapshot of the develop you branched
from — it is wherever develop is **right now**.

Measured 2026-09-30, and it nearly committed a reversion of someone else's
release. A branch was cut from `origin/develop` @ `2517bcbaf`. While the work
ran, another agent pushed `714c716a0 chore(release): origam 2.18.20`. A later
`git reset --soft origin/develop` — intended only to reword two commits —
silently **re-based them onto that new tip**. The commits were fine; the
WORKING TREE was not, because it still held the pre-release copies of the three
files the release touched:

```
 M CHANGELOG.md
 M packages/ds/package.json                             ← 2.18.20 -> 2.18.19
 M packages/marketing/src/consts/changelog-versions.const.ts
```

A `git commit -am` at that moment would have **un-released 2.18.20** inside a
`fix(deps)` PR, and the diff would have read like a deliberate downgrade.

Two habits that catch it:

- **`git reset --soft origin/<branch>` is not a reword tool.** It moves HEAD to
  a ref you do not control. To rewrite only your own commits, reset to a
  concrete SHA (`git reset --soft <sha>`) or to `HEAD~N`, never to a remote ref.
- ⛔ **Read `git status --porcelain` before every commit, and account for every
  line.** A file you never opened appearing dirty is not noise — it means a ref
  moved under you. `git checkout -- <files>` restores them from HEAD; never
  stage them to "clean up the tree".

## Tech stack (snapshot)

- **Vue 3** (Composition API + `<script setup lang="ts">`), strict TS.
- **Vite + Histoire + VitePress** for dev, stories, and docs.
- **unbuild** for the published library (consumed by external apps).
- **Playwright** (e2e + a11y), **Vitest** (unit tests, jsdom).
- **No design-token build step.** The token stylesheets are plain
  hand-maintained CSS/SCSS committed under `packages/ds/src/assets/` — see
  "Design tokens" below.
- **pnpm workspaces** — monorepo, 5 packages under `packages/`.

The published package declares `engines.node >= 22` — that is the
CONSUMER contract and it has not moved. Development and CI run on the
version `.nvmrc` pins, **Node 24** since 2026-09-03. The unit tests do not
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
| E2E — one spec, while iterating | `pnpm -F @origam/tests exec playwright test <spec>` |
| E2E — the full suite | see **Running the full e2e suite** below |
| A11y tests | `pnpm -F @origam/tests test:a11y` |
| Lint (root) | `pnpm run lint:fix` |

### ⛔ Running the full e2e suite — measured, 2026-08-31

**Build the static Histoire first and run against it, exactly like CI:**

```sh
pnpm -F @origam/stories build
cd packages/tests
E2E_STATIC=1 pnpm exec playwright test --project=chromium
```

Same commit, same machine, chromium, full suite — the only variable is which
server the specs hit:

| | live `histoire dev` | prebuilt `histoire preview` |
|---|---|---|
| duration | **53.9 min** | **15.7 min** |
| failures | **7** | **2** |

**3.4× faster, and most "flaky" specs stop being flaky.** Against the dev
server every spec pays a per-story Vite cold compile, so parallel workers
starve each other; the failures that follow are uniform `toBeVisible` /
`page.goto` timeouts that look exactly like product defects and are not.
`playwright.config.ts` already says this in its `webServer` comment — CI has
always done it right, and only local runs went the slow way.

⛔ **Two traps that cost a full day of triage:**

- **Timeout whack-a-mole moves the flake, it does not fix it.** Raising
  `textarea-richtext`'s timeout from 5 s to 12 s made those tests hold their
  worker twice as long; the run went 37 → 54 min and `carousel.spec.ts` — green
  in the three previous runs — took its place with 7 failures. Re-run alone,
  carousel was **33/33**. Under `E2E_STATIC=1` all 7 vanish.
- ⛔ **Before any measurement that matters, run `uptime`. The "contention" this
  file has treated as a fact of life had a concrete, removable cause.**
  Measured 2026-09-22: **nine dev servers belonging to agents that had died
  five and six days earlier** were still running inside `.claude/worktrees`,
  holding ports and burning CPU. Load average **82.93**. Same commit, same
  unit suite, the only variable being those corpses:

  | | zombies alive | after `pkill -9 -f 'claude/worktrees'` |
  |---|---|---|
  | load average | **82.93** | **3.28** |
  | failures | **7** | **0** |
  | tests run | 7 094 | **7 120** |
  | duration | **560 s** | **112 s** |
  | real `$?` | 1 | **0** |

  **Zero assertion failures in either run** — every red was `Test timed out`
  or `Failed to start forks worker`, i.e. workers that never got to run. The
  26-test gap is the files whose worker never started at all.

  **An agent's dev server outlives the agent.** Nothing reaps them, they
  accumulate across sessions, and each one makes the next measurement worse.
  So: `uptime` first — above ~10, do not measure, clean up. `pgrep -fl
  'claude/worktrees'` lists them. And **kill your own servers before handing
  back control**; a forgotten server also holds a port the next agent will
  believe is free.

- **Never measure suite stability while other work loads the machine.** Three
  agents building packages and running Nuxt/Postgres servers were enough to
  manufacture failures. That measures your own load, not your code.

⛔ **YOU MAY BE MEASURING ANOTHER WORKTREE'S BUILD. Check the port owner first.**
Measured 2026-09-05, three false diagnoses in one session, in both directions:
a correct fix looked broken, and a stale bundle looked green. `histoire preview`
binds :6006 from *whichever* worktree started it, and there are ~55 of them.
Playwright's `reuseExistingServer` then happily attaches to the neighbour's
build. The manifest guard in `e2e-global-setup.ts` catches the case **and aborts
the run with `exit 1`** — the claim that stood here, that it "returns `exit 0`",
is false. Remeasured 2026-09-16: from this worktree, pointed at a neighbour's
:6006, real `$?` captured outside any pipe:

```
✗ Histoire server on this port does NOT serve this worktree's stories — run aborted.
  • [variant drift] components/stories/Dialog/OrigamDialog.story.vue
  • [variant drift] components/stories/SliderField/OrigamSliderFieldTrack.story.vue
REAL_EXIT=1
```

The guard `throw`s from `globalSetup`, and a throwing `globalSetup` fails the
Playwright run. Checking the port owner is still worth doing — it tells you
*which* worktree you hit, which the abort message cannot — but the exit code
alone will not lie to you here.

```sh
lsof -ti :6006                              # is anyone there?
lsof -p <pid> -a -d cwd -Fn | grep '^n'     # WHICH worktree is serving
E2E_HISTOIRE_PORT=6009 E2E_STATIC=1 pnpm exec playwright test …   # or just isolate
```

Same session, same cause, two more ways to fool yourself:

- **A stories build whose `$?` you did not capture may have left a stale
  bundle.** `pnpm -F @origam/stories build >/dev/null 2>&1` without `echo $?`
  is how a fix "fails" three runs in a row on correct code.
- **Before concluding a CSS fix does not take, look at what is actually
  served**: `curl` the `style-*.css` the page links and `grep` the token name
  in it. If the corrected name is there, the fix is not the problem.

⛔ **You edited a marketing THEME and the page renders the old values — the
Nuxt dev server does not reload themes.** Symptom: you change
`packages/marketing/src/themes/<x>.theme.ts`, re-measure, and every number is
identical to before. It reads exactly like a dead prop or a theme the resolver
ignores, and it is neither. Measured twice in one session (#944): a correct
`rounded: 'lg' → 'xs'` reported "no change" until the server was restarted.

The themes are imported by `nuxt.config.ts` (`origam: { themes: [...] }`), so
they are **config dependencies, not application modules** — Vite's HMR graph
never sees them, and the restart-on-config-change watcher did not fire either.
Nothing is logged. **Kill and restart the dev server after every theme edit**,
and do not trust a measurement taken across one:

```sh
lsof -ti :<your-port> | xargs -r kill -9
PORT=<your-port> pnpm -F @origam/marketing dev --port <your-port>
```

⛔ **A probe that clicks blind in the app bar measures the OPPOSITE colour
mode, and the numbers look right.** Symptom: light and dark come back swapped —
internally consistent, plausible, and wrong. `.appbar-actions` holds the mode
toggle (`@click="toggleMode"` in `layouts/default.vue`) next to the menu
triggers, so a probe that iterates over the buttons until a menu opens flips
the mode on the way. Measured (#944): `glass light` reported the dark radius
and vice-versa, on four surfaces, before anyone noticed.

**Name every target, and re-read `data-mode` / `data-theme` INSIDE the same
`evaluate` that reads the value** — then fail loudly when they disagree with
what you asked for, rather than returning the number:

```js
if (r.modeAtRead !== mode || r.themeAtRead !== theme) {
    return { error: `CONTAMINE — asked ${theme}/${mode}, read ${r.themeAtRead}/${r.modeAtRead}` }
}
```

Same family as the stale-bundle trap above: the harness answered a question you
did not ask, and its answer was well-formed.

⛔ **The `alert.spec.ts` pattern — set a class in the DOM, then assert with
`toHaveCSS` — breaks whenever that class is bound to a `computed`.** Vue
re-patches the class list between the `evaluate` and the assertion, and
`toHaveCSS` polls for 5 s, so it ends up measuring Vue's element, not yours.
On `OrigamSwitch`'s density (#553) that returned `40px` on correct code. **Do
the mutation AND the measurement inside a single `evaluate`.** Verified: the
same sequence fails in two steps and passes in one, on identical code. See
`packages/tests/e2e/switch-density.spec.ts` for the working shape.

⛔ **But the single-`evaluate` rule does NOT generalise to a DESCENDANT after an
inline-style mutation — measured 2026-09-09, and it nearly produced a false
"dead prop" report on correct code.** Chromium had not re-invalidated the
`currentColor` a child substitutes through `var()` within the same turn:

```
same evaluate  : button rgb(255,0,128)  /  icon rgb(10,10,10)   ← false "dead prop"
two steps      : button rgb(255,0,128)  /  icon rgb(255,0,128)  ← the truth
```

The two rules answer different questions, and the distinction is what matters:

| what you are measuring | correct shape |
|---|---|
| a class bound to a `computed`, on the mutated element | one `evaluate` — Vue re-patches between two steps |
| a **descendant** inheriting through `var()` / `currentColor` | **two steps** — let style recalculation land |

A third variant of the same family: `.origam-main` carries
`transition-property: all` over `0.2s`, so a synchronous read after the mutation
returns the value **mid-animation** — identical on broken and on correct code
(measured: sync `rgb(255,255,255)`, at +1200 ms `rgb(3,3,3)`). Derive the wait
from `transitionDuration` rather than guessing.

Common root: **before concluding "the prop does nothing", prove your harness can
actuate it.** Three separate lots of the blockers campaign lost time to a
measurement artefact that looked exactly like a product defect.

⛔ **Third qualification, measured 2026-09-09: inside Histoire's `__sandbox`
iframe the single-`evaluate` rule produces FALSE NEGATIVES.** An element **already
rendered by Vue** does not recalc after a mutation there — `getComputedStyle`
returns the stale value even for a `background-color` written **inline** — while a
`<div>` created in the same document responds correctly. Negative control, same
`evaluate`:

```
fresh div, inline background-color   → rgb(9, 9, 9)      ✅ responds
rendered <nav>, same write           → rgba(0, 0, 0, 0)  ❌ stale
rendered <nav>, inline outline       → ignored too
```

This cost four consecutive diagnoses of "my fix does not take" on a fix that took.
**Inject the theme with `addInitScript` before the document loads** — which is
also the real-world scenario for a theme — instead of mutating after render.

⛔ **`getPropertyValue()` on a CSS shorthand returns `""` whenever the value
contains `var()`** (deferred substitution). Querying `background`, `border`,
`transition`, `font` therefore reads empty on this DS's own tokens, and an audit
that interrogates shorthands **silently misses nearly everything**. Query the
longhand (`background-color`, `border-top-width`, …).

⛔ **`sheet.cssRules` does not traverse `@media` / `@layer` groups.** A rule living
inside one never appears in the enumeration, so a cascade probe that lists
`cssRules` under-counts grouped rules and can name the wrong winner.

⛔ **A probe element you build yourself is not the element Vue rendered.** A
hand-made `<span class="origam-breadcrumb-item">` carries no `data-v-<hash>`, so
the scoped selector never matches it: the probe measures a world where the defect
does not exist, and **passes against pre-fix code**. Caught only by running the
spec against `HEAD~1`. **Always A/B a new spec against the parent commit** — a
green that also passes before the fix proves nothing.

✅ **`pnpm -F @origam/tests test:e2e` is usable again** — the prohibition that
stood here was obsolete. The `pretest:e2e` hook (`run-guards.mjs`) aggregates
its guards' exit codes and propagates a failure; it never returns `exit 0` on a
red guard. Fixed by `7034f429` (2026-08-17), tracked as **#534** then **#574**.
Remeasured 2026-09-16 on `develop` @ `16607e69`, real `$?` captured outside any
pipe:

| invocation | `$?` | Playwright |
|---|---|---|
| hook red (a guard exits 1) | **1** | never starts — 0 spec run |
| hook green, `… test:e2e e2e/btn.spec.ts --project=chromium` | **0** | starts — **30 tests executed, 30 passed** |

⛔ **But the pattern this warning was about is real and is NOT fixed by that** —
it is a property of **pnpm itself**, not of any one script. Measured on pnpm
9.15.0: **a FILTERED invocation of a script that does not exist prints a notice
and returns `exit 0`**, so `set -euo pipefail` cannot catch it. `pnpm run <x>`
unfiltered correctly exits 1; only the `pnpm -F` form — the one this file
mandates everywhere — swallows it. That is how `vrt-docker.sh` went on calling
`tokens:build` for weeks after the script was deleted (#606). Guard 24,
`pnpm-script-exists.mjs`, now fails on any such dead call.

⛔ Do NOT cite `#46` for this — that is a *merged pull request* about a CSS
typo, unrelated, and the wrong number circulated in this repo's docs for
months. Same family: a piped `pnpm build | tail -30` returns `exit 0` while the
build fails. **Capture the real `$?`.**

⛔ **A green e2e run still needs the static Histoire and an unowned port.** The
gate only checks Variant navigation drift — it says nothing about the server
you are about to hit. Build first, and isolate the port if `lsof -ti :6006`
answers (it usually does — there are ~150 worktrees):

```sh
pnpm -F @origam/stories build; echo $?          # capture it, a stale bundle reads green
E2E_STATIC=1 E2E_HISTOIRE_PORT=6031 pnpm -F @origam/tests test:e2e <spec> --project=chromium
```

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
| Cascade priority | `@layer` (a later layer wins at any specificity) | specificity bumps, `!important` |
| Custom-property semantics | `@property` (`syntax` / `inherits` / `initial-value`) | naming conventions + hope |
| Zero-specificity defaults | `:where(…)` | `:not(#a)` and other hacks |
| Light/dark pairs | `light-dark(l, d)` | duplicated `[data-theme]` blocks |
| Derived colours | relative colour syntax `rgb(from … r g b / .5)` | pre-computed variants |
| Anchored overlays | `anchor()` / `position-anchor` | JS position calculation |
| Entry transitions | `@starting-style` (+ `overlay`, `transition-behavior`) | JS mount-then-animate |
| Animating to `auto` | `interpolate-size` / `calc-size()` | JS measure-then-set-px |
| Scroll-linked motion | `animation-timeline: scroll()` / `view()` | JS scroll listeners |
| Style-conditional children | `@container style(--x: y)` | prop drilling + class toggling |
| Style isolation | `@scope` | BEM discipline alone |

⛔ **This table is a floor, not a ceiling.** The rule (user directive,
2026-08-31) is: *use every CSS feature the target browsers actually support* —
do not stop at what is listed here. The single criterion is **does it make the
code simpler**, never "is it new". Two entries above exist because they answer
open architecture problems in this repo:

- **`@layer`** dissolves the "classes-first loses to Vue's scoped selector"
  problem (#391) — a later layer beats an earlier one regardless of
  specificity, so utilities can win without a single specificity bump.
- **`@property` with `inherits: false`** restores the difference between *"no
  ancestor set this"* and *"an ancestor set it to 0"*. That distinction is
  currently lost: a token declared on `:root, [data-theme="light"]` inherits
  onto every element, so `var(--token, fallback)` **never** reaches its
  fallback. Verified on `--origam-btn-group---border-width`
  (`light.css:122`) — the direct cause of the dead `border` prop on Btn.

⛔ Whatever you use, **declare it in `FEATURE_QUERIES`** (see below) in the
same delivery. Never call `CSS.supports()` from a component.

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

⛔ **`token-var-channels` reads SHEETS. It evaluates no TypeScript**, and a
reference concatenated at runtime appears in no sheet — the name is often not
even grep-able (`var(${SHADOW_TOKEN_PREFIX}${rung})`). That is how #813 shipped
`var(--origam-shadow---2xl)` on a token no sheet declares while every guard
stayed green. Guard 28, `ts-token-refs.mjs` (#823), closes that half: it
enumerates the concrete environments around each template and replays it one
execution path at a time, then checks every produced name against the sheets —
and requires a fallback whenever the name cannot be bounded statically. **A
`var()` built in TS without a fallback is the shape to avoid**;
`useRounded`'s `var(--origam-radius---md, 8px)` is the shape to copy.

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
`<html data-mode="light|dark">` **alone** (no `data-theme`) also switches it,
since **#807** — see below.

`prefers-color-scheme: dark` is honoured **only when the page has pinned
nothing on either axis** — no `data-theme` AND no `data-mode`. The rule
shipped in `dark.css` / `_dark.scss` is:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme]):not([data-mode]) { /* the dark token set */ }
}
```

Both guards are load-bearing. `useTheme()`'s `applyModeToDocument()` ALWAYS
writes a concrete `data-mode`, and the Nuxt plugin OMITS `data-theme` when the
brand resolves to `'auto'` — so a page that pinned light looks like
`<html data-mode="light">`, with no `data-theme` at all. Guarding on
`data-theme` alone would repaint that page dark against an explicit choice
(measured in Chromium, #794).

⚠️ Until **#794** this block existed in `dark.css` but NOT in its SCSS twin,
and `main.css` — what the `./styles` export resolves to — is compiled from the
SCSS. The published bundle therefore had no automatic dark mode while this
paragraph claimed it did. That is the reason guard 27 (`token-twins`) exists.

⚠️ **#807 — fixed.** Until then, `data-mode="dark"` **alone** (no
`data-theme`) painted nothing: `[data-mode="…"]` rules used to be emitted only
by the runtime theme matrix (`apply-theme.util.ts`, injected by
`createOrigam()`), and `origam/styles` had zero occurrence of `data-mode`. The
fix widened the SELECTOR LIST of the existing explicit `[data-theme="dark"]`
block instead of duplicating its ~2731 declarations a third time. **#871
widened it further** — see below.

⚠️ **#871 — the token sets now attach to any element, not only `:root`.**
The current selectors are:

```css
/* light.css */
:root,
[data-theme="light"],
[data-mode="light"]                          { /* the light token set */ }

/* dark.css */
[data-theme="dark"],
[data-mode="dark"]:not([data-theme="light"]) { /* the dark token set  */ }
```

**Why the root anchor had to go.** ~1 761 of the dark sheet's declarations are
DERIVED — `--origam-title---color: var(--origam-color__text---primary)`. A
custom property is substituted **on the element that declares it**; a
descendant inherits the already-substituted value. So a derived token
re-resolves **only on an element the declaring selector matches**. With the
block anchored to `:root`, an `<OrigamThemeProvider mode="dark">` sub-tree
switched the ~60 SEMANTIC tokens (the runtime block does emit `[data-mode]`)
while the 1 761 derived ones stayed FROZEN on the root's light values. Measured
motif: `rgb(10,10,10)` on `rgb(10,10,10)`. Replayed over 30 components × 8
identities × 2 modes × 2 scopes (1 664 instances), the widening takes the whole
contrast surface from **185 violations to 7**, light unchanged at 3.

⚠️ Those endpoints read **189 → 11** when #871 shipped. Both were inflated by
the SAME 4 fabricated violations: the harness's colour parser did not know
`color(srgb …)`, which the `apple` palette emits, so it treated the tooltip's
translucent background as *unpainted*, skipped to the opaque ancestor and
reported black-on-black at 1.00. Corrected in a follow-up under #871 (spotted
alongside PR #882) — the **delta of 178 was never wrong**, only the two
endpoints. `under 2:1` also drops from 4 to **0**:
nothing that remains is anywhere near invisible.

**The specificities are load-bearing in both directions**, and this is the part
to re-read before touching either selector:

| selector | spec. | must beat | must lose to |
|---|---|---|---|
| `[data-mode="light"]` | (0,1,0) | `:root` only by source order | a brand's `[data-theme="X"]` (0,1,0), injected later |
| `[data-mode="dark"]:not([data-theme="light"])` | (0,2,0) | every light selector | a brand's `[data-theme="X"][data-mode="dark"]` (0,2,0), injected later |

Raising the light one to (0,2,0) (the tempting `:not([data-theme="dark"])`
symmetry) makes the sheet outrank **every light brand block** — the brand's own
component vars stop painting. The `:not([data-theme="light"])` on the dark side
is not decoration either: it is what keeps `data-theme="light" data-mode="dark"`
light, i.e. the #807 rule that the brand axis governs when the two axes
contradict. Both are pinned —
`packages/tests/e2e/tokens-prefers-color-scheme.spec.ts` and
`packages/tests/e2e/derived-tokens-subtree.spec.ts`, the latter verified RED on
the parent commit (6 failed / 2 passed, the 2 being the negative controls).

⛔ **Breaking change, deliberate.** A consumer that re-declared a component var
inside a `[data-mode]` sub-tree to work around the freeze now has the sheet
declaring it too — at (0,1,0) / (0,2,0). `packages/marketing`'s
`ORIGAM_COMPONENT_RESET_LIGHT/DARK` (a GENERATED re-declaration of ~2 700
component vars, `themes/origam-reset.generated.ts`) is exactly such a
workaround and is now redundant; it has NOT been removed here.

⚠️ A previous version of this section claimed the AUTO-mode media block carried
only **11** declarations. **False** — recounted 2026-09-22 by parsing the sheet:
both blocks carry **2 731** each. The note described a state nobody had
re-measured since #794.

⛔ Still NOT covered by the static sheets: a brand's *component* vars in a
sub-tree come only from the runtime matrix, so a page that never calls
`createOrigam()` gets the neutral identity in a `[data-theme="X"]` sub-tree.
That is unchanged by #871.

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
  themeable.** Any prop a component already declares is reachable by
  `theme.components`. "Opting in" here means *calling `useDefaults()`* — that
  is what became unnecessary. **Declaring the prop is still required**, and
  is the subject of the next point.
- **⛔ This is an INTERSECTION, not a union.** The resolver only patches a
  key that is BOTH named by a theme (or an ancestor `<OrigamDefaultsProvider>`)
  AND declared as one of the component's own props — guarded by the
  `if (!(key in rawProps))` check inside `installThemePropsResolver`'s
  per-key loop, in `theme-props-resolver.composable.ts`. A theme naming a
  prop the target component does not declare is skipped: not written to
  `instance.attrs`, not a crash. Since #515, this mismatch also logs a
  dev-only, once-per-(component, prop) `console.warn` (via
  `warnUnsupportedProp`, reused from `utils/Commons/color.util.ts`) — silent
  in production. This is what let a test theme name `activeBgColor` on
  `Radio` (a prop `Radio` never declares) go unnoticed in #496.
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

## ⛔ `variant` = a props PRESET — the pattern, frozen after the Kbd pilot (ADR-005 D7)

**Read the section above first.** This one adds one rung *below* the theme
ranks it describes, inside the same getter, and contradicts none of it.

ADR: `packages/docs/internal/adr-005-variant-as-props-preset.md`. The campaign
landed as: **lot 1** (PR #1001) the mechanism alone, no component touched;
**lot 2** (PR #1008, commit `4630927ca`, published as v2.19.0) **the pilot
`OrigamKbd`**; lot 3 (#1007) `IOpacityProps` + backdrop surfaces; lot 5
(#1009) `BORDER_REGEX` accepts a `var()` width.

D7 step 2 reads, textually: *"Pilot — `OrigamKbd`. Validate, then freeze the
pattern in `CLAUDE.md`."* **This section is that freeze**, and it is derived
from the pilot as MERGED, not from the ADR's intent — where the two disagree,
the merged code is what the next conversion must copy.

### Where a preset table lives, and how it reaches the resolver

| Link in the chain | File (`packages/ds/src/`) |
|---|---|
| The authoring type | `types/Commons/variant-preset.type.ts` — `TVariantPresets<V, P> = Record<V, Partial<P>>` |
| The pilot's table | `consts/Kbd/kbd.const.ts` → `KBD_VARIANT_PRESETS: TVariantPresets<TKbdVariant, IKbdProps>`, re-exported by `consts/index.ts` |
| What the DS ships | `consts/Commons/variant-preset.const.ts` → `VARIANT_PRESETS: TVariantPresetRegistry`, keyed by **kebab component name** (`'origam-kbd'`) |
| What a theme may override | `IOrigamTheme.variants` — `interfaces/Commons/theme.interface.ts:173`, same `TVariantPresetRegistry` shape |
| Where the two collapse | `resolveVariantPresetRegistry` (`composables/Commons/theme-props-resolver.composable.ts:490`), called once from `origam.ts:102-104` |
| Where it is consumed | `installThemePropsResolver(app, themedKeysUnion, variantPresets)` — `origam.ts:159` |

Annotate the table with `TVariantPresets<TXxxVariant, IXxxProps>` and the
compiler refuses both an unknown variant value and a prop the component does
not declare. The RESOLVER sees the same table through `TVariantPresetTable`
(`Record<string, Record<string, unknown>>`) — type erased **on purpose**: it is
generic over the whole catalogue and cannot be parameterised by one
`IXxxProps`. The strong typing lives at the point of writing, where it helps.

`variants` is a **sibling** of `components` in `IOrigamTheme`, never a key
inside it: `components` is `IDefault` (component → props), so nesting a variant
level would make `{ 'origam-btn': { outlined: … } }` ambiguous with a prop
literally named `outlined`. The merge is `mergeDeep` — the same one
`provideDefaults` uses — so a theme wins **prop by prop**, and a state preset
(`active: { … }`) is merged rather than replaced.

⛔ **A preset table lives in the component's EXISTING consts file** —
`consts/{Component}/{component}.const.ts`, which is exactly what the pilot did
with `consts/Kbd/kbd.const.ts`. Decided by the owner, 2026-10-01. **Do not
create a second consts file per component** for it.

The reason is the global `CLAUDE.md`'s anti-duplication rule: *before writing a
const, look for whether it already exists; if the file exists, reuse it, never
redefine it.* A component already owns one consts file; a variant table is one
more const in it, not grounds for a parallel one.

⚠️ A previous version of this convention prescribed
`consts/{Component}/{component}-variant.const.ts`, in two places — the header
of `TVariantPresets` and the `fixHint` of the `no-variant-css` guard. **Both
were wrong and are corrected in the same lot as this section**; the pilot was
right. If you meet that spelling in an older comment or in a stale checkout,
**this paragraph is what holds.**

### Precedence — and there is NO new merge logic

Decided by the maintainer in ADR-005's Q2 arbitration of 2026-08-12, which
**inverted** D2's original proposal. Strongest to weakest:

| Rank | Source | Branch in `patchThemedPropSlot`'s getter |
|---|---|---|
| 1 | prop written at the call site | `if (wasPassed) return fallback` |
| 2 | theme / provider default for the component | `defaults.value?.[name]?.[key]` |
| 3 | theme / provider `global` default | `defaults.value?.global?.[key]` |
| 4 | **the variant preset** | `readVariantPreset(presetTable, rawProps, key)` |
| 5 | the component's own `withDefaults` | the trailing `return fallback` |

The maintainer's reason, verbatim in the code: *« rien n'oblige l'utilisateur à
garder le bgColor en ghost, il peut le transformer en primary »*. A variant is
a **convenience**, not an identity the DS defends; what the DS must guarantee
belongs to a token or a prop, never to a preset.

⛔ **The preset is one more branch in the EXISTING getter, and nothing else.**
ADR-005's implementation directive is explicit: *"if the implementation ends up
writing new merge logic for presets, it took a wrong turn."* Four traps, each
one measured during lot 1 and each one silent when violated:

1. **One mixin, never two.** Two `Object.defineProperty` calls on the same key
   **replace each other silently** — the second accessor wins and the rank the
   first carried disappears with no error and no warning. A second mixin for
   presets would therefore lose either the theme or the preset, depending on
   install order. **The preset channel lives in that one getter or nowhere.**
2. **`readVariantPreset` must stay called SYNCHRONOUSLY from the getter.** Its
   read of `rawProps[VARIANT_PROP_KEY]` goes through the `shallowReactive`
   proxy, and that read is what SUBSCRIBES the calling effect to the `variant`
   key — which is why swapping variant re-resolves the dependent props with no
   explicit watcher. Hoisting it into a `computed` built at install time breaks
   the subscription in silence and freezes the prop on the starting variant.
3. **A preset never sets `variant`.** `VARIANT_PROP_KEY`
   (`consts/Commons/variant-preset.const.ts:20`) is the anti-recursion guard:
   without the `key !== VARIANT_PROP_KEY` test, `variant`'s own getter would
   read `variant` to resolve itself.
4. **The preset table must widen the per-instance early-out**
   (`addPresetKeys` → `collectTargetKeys`). This is the only point the ADR was
   silent on. `createOrigam()` registers only the themes it is handed, so with
   **no theme at all** `themedKeysUnion` is empty and `defaults.value` is `{}`:
   every other condition is false, `collectTargetKeys` returns `null`, and no
   slot is patched. D1 requires a working `outlined` with no theme installed —
   so a component carrying a preset table must never reach that early-out, or
   the preset is a perfectly silent no-op.

Non-regression for all four: `packages/tests/TU/origam/variant-preset-resolver.spec.ts`
(cases *« sans aucun theme »*, *« basculement »*, *« table pathologique »*).

### How this combines with the `withDefaults()` inline-literals rule

The rule above (*"`withDefaults()` — inline literals only"*) and a preset table
are **compatible without an exception**, because they answer different
questions, and the pilot shows the shape:

- `withDefaults` supplies **the variant VALUE** — `variant: 'outlined'`, an
  inline literal (`OrigamKbd.vue:58`). Never
  `variant: KBD_VARIANT_DEFAULTS.variant`; the compiler cannot resolve that and
  the whole props object becomes `undefined` at any reactive access.
- The table supplies **the props that value implies**, one rank above
  `withDefaults` in the chain. It is read by the resolver at render, never by
  the SFC compiler.

⛔ So **the `.vue` never imports its own preset table** — `OrigamKbd.vue` has
zero reference to `KBD_VARIANT_PRESETS`. The only import path is
`consts/Commons/variant-preset.const.ts` → `VARIANT_PRESETS` → `createOrigam()`.
If you find yourself reaching for the table inside a component, the rank you
want is already resolved on `props`.

Corollary worth stating because it is easy to get backwards: a `withDefaults`
value for a prop the preset also sets is **the rank the preset beats**, not the
reverse. Give a prop a `withDefaults` value only as the no-variant floor.

### Preset VALUES: carry the `var()` string, never a semantic rung

⛔ **Each value must carry the exact `var()` chain the deleted CSS rule
carried, never its translation into a semantic rung.** Two independent
constraints ask for the same thing:

1. **Fidelity / theme channel.** Measured 2026-09-30: the 8 brand themes
   (`packages/marketing/src/themes/*.theme.ts`) dress their buttons *through*
   the component tokens the variant rules read — `cartoon` sets
   `--origam-btn---box-shadow-elevated: 4px 4px 0 #171717`, `glass` a
   four-layer glass shadow. A preset written `elevation: 'md'` emits
   `var(--origam-shadow---md)` and so silently discards the brand's shadow
   across 8 identities × 2 modes.
2. **Cascade.** A tokenised value (`bgColor: 'primary'`) takes the utility-CLASS
   channel at (0,1,0) and therefore loses to the component's own scoped rule at
   (0,2,0) — see *"Classes-first conventions"* below. A `var(…)` string is
   routed by `isCssColor` to the **custom-value** channel, i.e. the INLINE
   declaration, which outranks the scoped rule.

⛔ **What the table does NOT set matters as much as what it sets.** The pilot
deliberately omits a border colour from `outlined` and `filled`, although both
rules declared one: in each case the value was IDENTICAL to the component
default already carried by `--origam-kbd---border-color`. Writing it into the
table would not have been neutral — a preset emits an INLINE declaration, which
outranks the token, so a brand redeclaring that token would stop reaching those
two variants. **A table that restates a component default confiscates the very
channel it exists to serve.**

⛔ **Copy the token NAME from the sheet, not from the naming grammar.** The
three Kbd background tokens are spelled inconsistently in `light.css` /
`dark.css` (and their SCSS twins): `--origam-kbd--outlined---background-color`
in the double-tiret *state* form, but `--origam-kbd__filled---background-color`
and `--origam-kbd__tonal---background-color` in the BEM-child form. The preset
table mirrors that inconsistency exactly, and must — fidelity is the job, not
correction. Grep the sheet before writing the string.

Keep each value's **fallback**. They are unreachable today (the sheets declare
the tokens on `:root`, and a custom property declared there inherits
everywhere, so a `var()`'s second argument is never reached) but guard 28
`ts-token-refs` requires a fallback whenever a name cannot be bounded
statically, and they are the real backstop if a sheet ever stops declaring the
token.

⚠️ **The pilot's one measured value delta, reported rather than hidden.**
`tonal` carried `box-shadow: none`, the KEYWORD. `elevation: 'none'` emits
`var(--origam-shadow---none)`, which `primitive.css` declares as
`0px 0px 0px 0px rgba(0,0,0,0)`. The computed style therefore changes from
`none` to that quadruple value — a shadow of zero extent and zero alpha, which
cannot paint a pixel. `isOrigamRung` intercepts `'none'` before anything else,
so the `elevation` channel has no way to emit the keyword. Expect the same
class of gap on the next conversion, and measure it rather than assuming zero.

⚠️ **The prop surface a preset can draw on WIDENS in the lot that precedes
`OrigamBlockquote`.** Decided by the owner, 2026-10-01: the 20 missing
per-side logical props are added upstream, before any further conversion —
measured the same day at **0 occurrence out of 20** across
`packages/ds/src/interfaces/Commons`, while the physical-per-side and
logical-per-axis grids are both complete. The rule behind it is
`adr-007-directional-props.md`'s directive: *if a format exists, it exists
everywhere; we do not do half of one.* Not detailed here because it is not
written yet — check that interface surface before concluding a variant's effect
is inexpressible as a prop.

### Per-component definition of done — as the pilot ACTUALLY satisfied it

D7 lists four requirements. Here is the file that discharges each, in commit
`4630927ca` (all in one commit, which is itself the first requirement):

| D7 requirement | Where the pilot satisfies it |
|---|---|
| `.vue` + `.story.vue` + `.md` in the **same commit** | `4630927ca` — 26 files, +1271 / −107 |
| the story exposes the **resolved preset** AND an **override** of it | `packages/stories/components/stories/Kbd/OrigamKbd.story.vue:91` — `<Variant title="Prop — variant (preset matrix)">`, rendering the 3 variants in SIMPLE and COMBINATION form plus two `variant` + competing-`bg-color` cases, each on a stable `data-cy` |
| the doc gains a **"preset by variant"** column, or renders the table verbatim | `packages/docs/components/Kbd/OrigamKbd.md:44-70` — § *"A variant is a props preset, not CSS"*: the precedence chain, then the whole table verbatim (`bgColor` / `border` / `borderColor` / `elevation` per variant), with a dash meaning *the preset sets nothing* |
| e2e asserts (a) the preset applies, (b) an explicit prop beats it, (c) the emitted class carries no DS style | `packages/tests/e2e/kbd.spec.ts` — `describe('Preset de variant')` at `:313` holds (a) ×2 (simple form `:316`, combination `:336`) and (b) ×2 (`:357`, `:372`); **(c)** is `:258` — *« echanger la classe de variant ne change RIEN — le DS n'y attache aucune regle »* |

Two things the pilot added beyond D7, and both are worth copying:

- **A unit spec on the TABLE itself** —
  `packages/tests/TU/components/Kbd/OrigamKbdVariantPreset.spec.ts`, 12 cases,
  including *"never sets the `variant` key"* and *"carries a `var()` string with
  a fallback, never a semantic rung"*. These pin the rules above as tests, not
  as prose.
- **An acceptance harness for the zero-change claim** —
  `pnpm -F @origam/tests audit:kbd-preset -- --json <file>`, then
  `-- --compare <before> <after>`. It mounts the component under **8 identities
  × 2 modes** and reads 11 longhands on every painted surface, each `__key`
  included. Histoire cannot answer this question (it is pinned
  `data-theme="light"` and its `createOrigam` registers only `origamTheme`), and
  a static `file://` page cannot either (the preset is resolved **at runtime** by
  the props resolver, so a page that never mounts Vue shows tokens and never a
  resolution). **Reading only the root would declare "nothing changed" on a
  combination whose every key moved.**

### What the `no-variant-css` guard refuses

`packages/ds/scripts/guards/no-variant-css.mjs` — formalises decision **D3**:
the `--variant-{value}` class that `useVariant()` emits **survives**, and the
DS ships **no rule that targets it**. The class belongs to the consumer, as an
override hook.

It flags two things inside every `<style>` block of every non-story `.vue` (and
any `.scss`) under `packages/ds/src`, comments stripped first:

- a **selector** matching `--variant-*`, **`--chrome-*`** or
  **`--has-quote-mark`**;
- any **`!important`** inside such a block.

The aliases are watched deliberately. A variant's CSS does not always reduce to
root props — Field styles BEM children, Blockquote draws a decorative glyph —
and both moved that residue onto a differently named class. That is a
defensible separation of concerns *and*, unwatched, an unbounded escape hatch:
`chromeClasses` in `OrigamField.vue` resolves to
`origam-field--chrome-${props.variant}`, the variant class under another name.
**Existing aliases are grandfathered; a NEW one fails the build.** Coining a
legitimate alias stays possible — it just becomes a reviewed act.

```sh
pnpm -F origam guards:variant-css          # this guard alone
pnpm -F origam guards                      # all of them
```

⛔ **The baseline shrinks only.** Measured **2026-10-01**, this worktree, on
`develop` @ `e63a87ba1`:

```sh
node -e "console.log(require('./packages/ds/scripts/guards/baseline/no-variant-css.json').length)"
# -> 32
grep -c Kbd packages/ds/scripts/guards/baseline/no-variant-css.json
# -> 0
```

**32 grandfathered entries, and ZERO of them is a Kbd entry** — the pilot's 4
baseline lines were deleted by `4630927ca`, which is the mechanical proof the
conversion happened rather than a claim that it did. What remains: Btn 16,
BtnGroup 10, Blockquote 5, SliderField 1. **Recount, never quote** — the whole
point of the number is that it only ever goes down.

### The VRT prerequisite — the harness EXISTS (and the ADR says otherwise)

ADR-005 D7 makes a per-Variant screenshot harness a **hard prerequisite for
step 3 (`OrigamBtn`)**, not a nice-to-have, while allowing the pilot to proceed
on computed-style assertions alone. That prerequisite **has been delivered**,
and the ADR was never updated — remeasured **2026-10-01**, this worktree, on
`develop` @ `e63a87ba1`:

| What ADR-005 D7 asserts | Measured 2026-10-01 | Command |
|---|---|---|
| "of 175 e2e specs" | **262** | `ls packages/tests/e2e/*.spec.ts \| wc -l` |
| "8 e2e specs assert directly on a `--variant-*` class" | **14** | `git grep -l -- '--variant-' packages/tests/e2e \| wc -l` |
| "**There is no VRT suite today**" | **there is one** | `git ls-files packages/tests/vrt/` |
| "no baseline `*-snapshots` directory is committed" | **7 PNG committed** | `git ls-files \| grep -c snapshots` |

The reason both the ADR and a first re-check missed it: the suite lives under
`packages/tests/vrt/`, **not** under `e2e/`. It landed in `876d675d9`
(2026-08-12), with `48cc80e49` (2026-08-17) fixing the Variant guards that were
ignoring the whole directory.

- `packages/tests/vrt/btn-variant.spec.ts` — `BTN_VARIANTS` = the 7 Btn values
  (`text` / `flat` / `elevated` / `tonal` / `outlined` / `plain` / `ghost`), one
  `toHaveScreenshot` each, at rest only.
- `packages/tests/vrt/btn-variant.spec.ts-snapshots/` — the 7
  `btn-variant-{value}-chromium-linux.png` baselines.
- `packages/tests/playwright.vrt.config.ts` — its own config, `retries: 0`.
- `packages/tests/vrt/VRT.md` — the manual, including § *"Les 4 pièges
  traités"* and § *"Preuve que le filet détecte"*.
- `packages/tests/vrt/vrt-docker.sh`, plus `test:vrt`, `test:vrt:update`,
  `test:vrt:report`, `test:vrt:docker`, `test:vrt:docker:update` in
  `packages/tests/package.json:33-37`.

⛔ **`-chromium-linux` is BY DESIGN, not a portability bug.** Per VRT.md § 1,
baselines are generated AND compared inside the same pinned Docker image
(`mcr.microsoft.com/playwright:v<@playwright/test version>-jammy`, resolved from
the lockfile, never retyped), so `process.platform` is `linux` on both sides.
The reason is concrete: the DS's `Inter` is **not** shipped as a `@font-face`
(no `.woff`/`.woff2` anywhere in `packages/ds` or `packages/stories`), so the
browser falls back to the system font, which differs between macOS and Ubuntu in
both metrics and antialiasing. A pixel tolerance wide enough to absorb that
would also absorb a real padding or colour regression. **So never run
`test:vrt` natively for a verdict** — use `pnpm -F @origam/tests test:vrt:docker`.
Guard `vrt-lockstep` (#606) keeps `vrt-docker.sh` and the CI `vrt` job on the
same recipe, because the CI job runs *inside* the container and so can never
execute the script itself.

⚠️ **The suite's current pass/fail state was NOT re-measured on 2026-10-01.**
It was not run in this lot: `origam-vrt-pnpm-store` is a **named Docker volume
shared by every worktree** (`vrt-docker.sh:80`) and another agent was working
concurrently. Its existence is measured; its green is not. Run it yourself
before relying on it.

⛔ **ARBITRATION ALREADY RENDERED BY THE OWNER — do not re-open it.**
**`OrigamBlockquote` converts WITHOUT VRT.** Its risk is STRUCTURAL, not
visual: `quoted` also toggles a rendered element
(`showQuoteMark`, `OrigamBlockquote.vue:136`) and `pull` changes the default
`align` to `center` (`:161`) — i.e. it is already half family B, which a pixel
diff does not speak to. (⚠️ ADR-005 cites `:128` and `:146-153` for these two;
both are stale on `develop` @ `e63a87ba1` — `:128` is now `effectiveLang`.
Re-grep, never quote a line number.) The
harness was the lot immediately preceding Btn, and it has already shipped; with
Btn's prerequisite met, nothing pushes a harness ahead of Blockquote either.

### D5 taxonomy — only one family converts

| Family | What `variant` does | Components | Action |
|---|---|---|---|
| **A — stylistic** | changes only how the surface is painted | `OrigamBtn` (7 values), `OrigamBtnGroup` (7), **`OrigamKbd` (3 — DONE, lot 2)**, `OrigamBlockquote` (5, with the D6 caveat) | **convert** to a preset table |
| **B — structural / discriminant** | selects a template branch or an algorithm | `OrigamSkeleton`, `OrigamBracket`, `OrigamTab`, `OrigamSliderField`, `OrigamAudio`, chart series `fill`/`stroke` | **exempt** — keep the discriminant prop, but the exemption must be **documented ON the prop**, never implicit |
| **C — internal layout** | restyles BEM children, toggles `display:none`, drives floating-label geometry | `OrigamField` (5 values) + its 6 descendant interfaces | **partial** — asymmetric radius converts (`IRoundedProps` takes a shorthand), hiding `__outlines` does not. Hardest case; explicitly must not be the pilot, and is scheduled **last** |

⚠️ **Family A is OPTIMISTIC on three of its four members, measured 2026-09-30**
and recorded in `consts/Commons/variant-preset.const.ts` — read it before
budgeting a conversion. `OrigamBtnGroup` copies
`--origam-btn-group---border-width` into a custom property feeding a `calc()`
of inner radius (inexpressible as a root prop). `OrigamBlockquote` has
`padding-inline-start: calc(var(…) + var(…))` and nested rules on `__body` /
`__attribution`. Only `OrigamBtn` paints root properties exclusively — and it
depends on `IOpacityProps` / `IBackdropProps` (lot 3) and its `ghost` carries a
`@supports not (backdrop-filter)` branch swapping the fill from 12 % to 18 %,
which **no prop expresses**, a value conditioned on a feature query.

**`OrigamKbd` was the pilot for a reason D7 does not give**: no brand theme
touches a single `origam-kbd` token (verified, zero occurrence across the 8
themes), so zero-change was provable in isolation. **No component converts
mechanically** — each gets its own lot.

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

### Strategy A — classes AND styles in parallel

Every refactored composable returns BOTH `*Classes` and `*Styles`. On the
**background** channel, a tokenised value fills `*Classes` and leaves
`*Styles` empty; a custom value does the reverse.

⛔ **The foreground (`color`) channel does NOT work that way, and cannot.**
The previous version of this section claimed *"when the value is tokenised,
`*Styles` is empty and the class does the work"* — universally. That was
false, and issue #514 measured why it is not merely unimplemented but
**unreachable with the current architecture**:

1. **The class and the inline declaration do not emit the same token.**
   `.origam--color-{intent}` resolves `…--{intent}---fg` — the white-on-
   saturated pair. `tokenForegroundForIntent()` resolves **`fgSubtle`** — the
   intent's own hue, meant for a neutral surface. Measured in Chromium across
   the DS's real stylesheet, **7 of 8 intents render a different colour**
   (`primary`: `rgb(255,255,255)` vs `rgb(109,40,217)`). Only `secondary`
   matches. They are opposite roles, not two spellings of one colour.
2. **The utility class loses the cascade, by design.** A Vue scoped rule is
   `.class[data-v-hash]` = specificity (0,2,0); a utility is (0,1,0). The
   utility loses even though it is loaded later — that is specificity, not
   order. The header of `origam-utilities.css` states the intent plainly:
   utilities are *"intended to be loaded BEFORE component-scoped SCSS so
   that `.origam-btn--variant-flat` can override `.origam--bg-primary`"*.
   **73 of the 101 affected components declare a `color:` in their scoped
   SCSS.** Only the inline declaration outranks them.

So `fgDecl` is pushed into `styles` on the tokenised path **on purpose**:
remove it and the `color` prop stops painting. Verified by applying the
change and photographing the result — `OrigamSwitch`'s thumb turns white on
a light track (invisible), `OrigamAlert` renders `rgb(10,10,10)` for all 8
intents.

**Blast radius, previously listed as "unknown" in the ticket: 101 of 216
components.** `fgDecl` exists in **three copies** —
`colorEffect.composable.ts:235` (2 consumers), `stateEffect.composable.ts:215`
(30), `color.composable.ts:152` (74, reached via `useTextColor` /
`useBackgroundColor` / `useBothColor`).

**Consequence: the "v3.0.0 retires `*Styles`" plan does not hold for the
foreground channel** as long as utilities sit in the weakest cascade
position. Making the class able to win is a real option — CSS `@layer` beats
any specificity from a later layer, and would settle #391 at the same time —
but it changes the cascade of the entire DS and needs its own decision, not
a drive-by edit.

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

## ⛔ Un ticket OUVERT n'est pas un ticket VIVANT — verifie avant de deleguer

**Mesure, 2026-09-30 : un agent a ete lance sur #371, dont les CINQ points
etaient deja corriges sur `develop`.** Les quatre commits porteurs y etaient
depuis un moment — `08c30693a` (#548), `8545aaaa6`, `3f063d727`, `d3930ff2c` —
et personne n'avait ferme le ticket.

Le pendant de la regle « merge != ferme » est donc vrai aussi, et il coute cher
dans l'autre sens : **un ticket dont le travail a atterri mais qui reste ouvert
consomme un agent entier.** Le tableau ne mentait pas sur le travail restant, il
mentait sur le travail fait.

**Avant de confier un ticket a quiconque, etablis qu'il est encore vivant** — et
par la mesure, pas en lisant sa date :

```sh
gh issue view <n> --json title,body                     # quels sont ses constats ?
git log --oneline --all --grep "#<n>"                    # quelque chose les cite-t-il deja ?
git log --oneline origin/develop --grep "#<n>"           # est-ce sur develop ?
```

Puis reproduis UN de ses constats. S'il ne se reproduit pas, le ticket est a
fermer avec la mesure, pas a confier.

⚠️ Le lot lance par erreur n'a pas ete perdu pour autant, et c'est instructif :
il a ETABLI que les trois constats etaient reels (verdict navigateur, jamais
pris avant), trouve une **seconde fuite non rapportee** (`isexpanded`, a cote de
`isgroupopen`), et surtout decouvert POURQUOI le defaut avait survecu — aucune
des 30 Variants de la story ne rendait de ligne de groupe, `groupBy` n'ayant
aucun controle. **Un defaut qu'aucune Variant n'expose ne peut etre attrape par
personne**, et c'est la vraie lecon du lot.

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

### ⛔ `3.0.0` IS RESERVED FOR THE SPLIT INTO MODULES — decided, not open

**`3.0.0` is the module-separation release. Nothing else ships under that
number.** This is a standing product decision by the repository owner. It is
not a preference to be weighed against SemVer purity, and it is **not a
question to re-open** — it has been raised more than once and the answer has
not changed.

Concretely, for anyone (human or agent) preparing a release:

- **Never propose `3.0.0`** for a bug-fix lot, a contrast campaign, a
  dependency bump, or "because SemVer says a breaking change needs a major".
  The number is taken.
- A breaking change that lands before the module split ships in a **minor**,
  documented **explicitly and honestly** in `CHANGELOG.md` — that is the
  agreed trade-off, and the retrospective note covering the 2.17.0 breaks is
  the precedent to follow.
- ⛔ **The module split owns the NUMBER `3.0.0`, not a monopoly on breaking.**
  Deprecations already posted "for the next major" — #577 `IAdjacentEmits`,
  #360 bare `createOrigam()` — are harvested **as soon as someone gets to
  them, in a minor**, like any other break. Waiting buys nothing while the
  consumer set is empty, and a deprecation kept "just in case" is dead weight.

  *(An earlier version of this line said these two were "harvested by the
  module split". That was written before the no-consumer rule below was
  recorded, and it contradicted it. An agent stopped mid-task on the
  contradiction rather than guess — correctly. The line is fixed; if you find
  another like it, stop and say so.)*

⚠️ If you believe a release genuinely cannot ship as a minor, that is a
question for the owner about **the release**, never a proposal to spend the
`3.0.0` number. Say what breaks and ask; do not offer `3.0.0` as an option.

### ⛔ The `2.x` number is historical — this project is de facto PRE-1.0

**Read this before reasoning about any version number.** The package has
carried a `2.x` number for historical reasons, but there is **no client
application depending on it**, and the owner's own framing is explicit:

> *"là on est sur un tag 2.18 mais réellement on est sur une 1.0… donc on s'en
> fout des ruptures, la première vraie rupture sera la séparation en modules et
> donc la 3.0"*

Three consequences, and they are not negotiable:

1. **The minor/patch numbers below `3.0.0` are bookkeeping, not a contract.**
   Nobody is pinned against them. Do not reason about them as if a consumer
   were watching.
2. **The FIRST real breaking change is the module split, and it is `3.0.0`.**
   Everything before it is pre-1.0 churn wearing a 2.x label.
3. **Therefore: breaking changes are free. Take them.**

### ⛔ Corollary — take the breaking changes NOW, and never ask about them

**`origam` has no client application depending on it today.** A breaking
change therefore costs **nothing** right now, and will cost a migration guide,
a deprecation cycle and someone else's afternoon later. The owner's standing
instruction is explicit: *"c'est maintenant qu'il faut faire les ruptures"*.

What this means in practice, and it is the opposite of the usual reflex:

- **Do NOT gate work on "that would be a breaking change."** It is not a
  blocker, it is not a reason to ask, and it is not a reason to postpone.
  Removing a dead export, narrowing an enum, dropping a prop nobody consumes
  — take it.
- **Do NOT open an arbitration for a break alone.** Ask only about the
  *substance* (is this the right design?), never about the *breakage*.
  ⛔ This has been re-asked several times and the answer has never changed;
  asking again wastes the owner's time.
- **Breaks ship in a MINOR** and are documented honestly in `CHANGELOG.md` —
  the "dérogation assumée" recorded in the title of **#717** is the standing
  precedent, and the retrospective note covering the 2.17.0 breaks is the
  shape to copy.
- **Prefer the clean break to the compatibility shim.** A deprecation kept
  "just in case" is dead weight while the consumer set is empty, and it is
  exactly what `#577` / `#360` became.

⚠️ This rule has an expiry the moment a real consumer ships against the
package. Whoever notices that happen should come back and rewrite this
section — it will then be wrong, loudly and expensively.

## ⛔ One ticket = one merge = one patch tag `2.18.X`

**Standing instruction from the owner (2026-09-22): every ticket that lands gets
its own patch release.** Not a weekly batch, not "when enough has piled up" —
merge, bump, tag, push.

```sh
# after the PR is merged and develop is pulled
#   1. bump the PATCH in packages/ds/package.json   (2.18.3 -> 2.18.4)
#   2. commit that bump on develop
#   3. tag it and push
git tag -a v2.18.4 -m "origam 2.18.4"
git push origin v2.18.4
```

⛔ **`release.yml` asserts the tag equals `packages/ds/package.json`.** A tag that
does not match fails the workflow at its first step — so the bump commit must be
on `develop` *before* the tag is pushed, and the tag must point at it.

⚠️ **The tag is what publishes to npm.** It is irreversible: a published version
is never removed, only superseded. Verify before tagging — CI green, real `$?`
outside a pipe, and ideally an install from the registry afterwards
(`npm i origam@<version>` in an empty directory) rather than trusting the
workflow's own "success".

### ⛔ A change that does not touch `packages/ds/` is NOT tagged — decided

**Marketing, docs, tests, tooling and CI changes ship without a tag and
without a release.** Standing instruction from the owner (2026-09-25):
*« lorsque c'est le marketing, il n'y a pas besoin de tagger »*.

The reason is mechanical: `release.yml` publishes from `packages/ds/`
exclusively, so a change outside it produces a **byte-identical tarball**.
The version number would move while the artefact does not — a consumer who
diffs two versions finds nothing, and the changelog gains an entry that
describes a package that did not change.

Concretely, before opening a release PR:

```sh
gh pr diff <n> --name-only | grep -c '^packages/ds/'   # 0 → NO tag
```

- **Merge, close the ticket, stop there.** No version bump, no release PR,
  no tag.
- ⛔ Do NOT ask the owner whether to tag a marketing lot. This question was
  posed once and answered; asking again wastes his time.
- A lot that touches **both** `packages/ds/` and marketing is tagged — the
  published package really moves.

⚠️ The previous version of this paragraph said the opposite — *« when in
doubt, tag: a redundant patch costs nothing »*. It was wrong: a redundant
patch costs a version number that means nothing, on a registry where a
published version is never removed.

## Pre-delivery (project-specific overlay)

The global pre-delivery policy (TU + e2e + security) applies. Specific to
origam:
- Run tests on **Node 24** (`.nvmrc`); Node 18 produces unrelated
  `crypto.hash` failures.
- `pnpm -F origam guards` must stay at **31/31** (measured 2026-09-29, this
  worktree, real exit code hors pipe; it read `30/30` on 2026-09-25, `29/29` on
  2026-09-24, `28/28` on 2026-09-17, `27/27` an hour before that, `25/25` and
  `17/17` earlier still — **recount, never quote**. This line has been stale SIX
  times; an agent caught it again on 2026-09-29 while the paragraph still said
  30/30).

  ### ⛔ Recounting is not enough — **name the tree and the file**

  **Before citing a number, name the TREE and the FILE it was taken from.**
  "Recount, never quote" says to re-measure; it does not say *where*, and a
  re-measurement taken on the wrong tree or the wrong file is a fresh number
  that is still false. A well-formed command answering a question you did not
  ask is the single most expensive failure mode in this repo, because its
  output looks exactly like an answer.

  Measured 2026-10-01, during #1013 — **four occurrences in one lot, two from
  the developer and two from the coordinator reviewing him**:

  | measurement | what it aimed at | what it actually answered |
  |---|---|---|
  | `grep -c 'useBorder\|useStateEffect' <component>.vue` | real call sites | **comment prose** — including a comment the author had just added himself |
  | `grep -c 'bracket-match---border' <baseline>.json` | 14 pre-existing sibling entries | **18**, because it was run on the author's own tree *after* his 4 additions |
  | `grep Omit bracket.interface.ts` | "is this interface restricted?" | **0**, on a file that IS restricted — the wrong question entirely |
  | `jq 'conclusion != "SUCCESS"'` over CI checks | failing checks | **8 "failures"** that were checks *not yet concluded* |

  Each was reproducible, each was well-formed, and each produced a confident
  wrong conclusion. Two nearly cost real work: the first made the author write
  a test asserting a component consumed a composable it never calls, and the
  fourth nearly blocked a green PR.

  ⛔ **`grep Omit` on an interface file does NOT answer "is this interface
  restricted".** The restriction can live in a *named type declared somewhere
  else*, which is exactly the case for `IBracketProps` — its
  `Omit<IBorderProps, …>` sits in `types/Bracket/bracket.type.ts` as
  `TBracketBorderProps`, so the interface file contains zero occurrences of
  `Omit` while being fully restricted. Generalised: **a grep over source text
  cannot answer a question about a RESOLVED type.**

  What to do instead, in order of preference:

  - **Prefer an observation of the resolved artefact over a grep of the
    source.** For a prop surface, the Vue SFC compiler emits a runtime props
    descriptor whose keys are the interface's resolved set with the `extends`
    chain flattened — so `Component.props` observes the real answer, immune to
    the type's name, the file the `Omit` lives in, and the number of files it
    crosses. Pinned in
    `packages/tests/TU/components/Bracket/bracket-logical-side-restriction.spec.ts`.
  - **State the tree in the sentence**: `git show origin/develop:<path>` and
    `git show origin/<branch>:<path>` make the tree explicit and
    unfalsifiable. A bare `grep` in a worktree measures whatever is on your
    disk right now, including your own uncommitted work.
  - **Exclude comments when counting code**, or count call sites with an AST
    pass rather than a line match.
  - **Enumerate every terminal state**, never `!= SUCCESS` — "pending" is not
    "failed".

  The cheap habit that catches all four: **say the tree out loud.** "14 on
  `origin/develop`" cannot be confused with "18 on my branch after my own
  additions"; "14" alone can.

  ✅ **#966 — CORRIGÉ.** Guard 30 (`token-var-channels-marketing`) énumérait le
  DISQUE et balayait donc des artefacts de build qu'aucun checkout de CI ne
  porte. `walkSources` passe désormais par **l'index git** (`listRepoFiles`,
  `lib/git-files.mjs`) — vérifié 2026-09-29 : les 35 Mo de
  `packages/marketing/public/stories/` sont présents dans ce worktree et le
  garde ne scanne que **216 fichiers suivis**, vert. L'historique reste ici
  parce que la forme du piège se reproduira ailleurs — mesure d'origine,
  2026-09-25, même arbre, seule variable la présence de l'artefact :

  | | `guards` | violations | stale baseline entries |
  |---|---|---|---|
  | artefact present | **29/30**, exit 1 | hundreds | **8** |
  | artefact set aside | **30/30**, exit 0 | **0** | **0** |

  ⚠️ The pollution runs BOTH WAYS, which is what makes the symptom dangerous:
  the stories bundle *declares* thousands of `--origam-*`, so it also joins the
  EMITTER set, and legitimately dead reads turn up as "already fixed". A
  maintainer following the guard's own message would delete 8 baseline lines
  describing real defects, believing they were making progress.

  ⛔ La leçon qui SURVIT au correctif : **une garde qui énumère le disque
  mesure ta machine, pas le dépôt.** Toute nouvelle garde qui parcourt un arbre
  doit passer par `listRepoFiles`, jamais par `readdirSync`.
- `pnpm -F origam guards:self` must stay at **25/25** (measured 2026-09-29, this
  worktree, real exit code hors pipe ; ce fichier lisait `17/17` le 2026-09-25,
  `16/16` le 2026-09-24, puis `15/15`, `14/14` et `13/13` — **recount, never
  quote**).

  ⛔ Le 17 → 25 n'est pas un saut de huit nouveaux self-tests : c'est un
  **undercount corrige**. `ls lib/*.selftest.mjs` en denombre 19 et rate les 6
  autres, que `run-all-selftests.mjs` decouvre ailleurs — 5 a la racine
  `scripts/guards/` (`comment-format`, `layer-folders`,
  `no-usedefaults-in-components`, `pnpm-tree-integrity`, `token-var-channels`)
  et 1 sous `scripts/analysis/` (`inspection-harness`). 19 + 5 + 1 = 25.
  **Ne pas denombrer les self-tests avec un glob sur `lib/` seul.**

  ✅ **#964 — CORRIGÉ, et ce paragraphe disait le contraire.** Il affirmait que
  `run-all-selftests.mjs` ne découvre que `lib/*.selftest.mjs` et que cinq
  self-tests à la racine `guards/` n'étaient invoqués par rien. Le runner appelle
  désormais `discoverSelftests()` (`lib/selftest-discovery.mjs`, niveaux
  déclarés dans `DISCOVERED_LEVELS`) **et** `findOrphanSelftests()`, qui ROUGIT
  sur tout `*.selftest.mjs` rangé hors des niveaux couverts — l'orphelin ne peut
  plus passer inaperçu. Vérifié 2026-09-29 : les cinq sont exécutés et comptés.

  ⚠️ L'en-tête de `run-all-selftests.mjs` porte encore la même phrase périmée
  (« Execute TOUS les `lib/*.selftest.mjs` »). Corrigé dans le même lot.

  Pourquoi ce compteur existe : it runs the guards' own
  detectors. A guard whose
  extractor has regressed goes QUIET, and a silent detector and a clean repo
  produce the same green — so a green `guards` means nothing without this. Both
  run in the `architecture-guards` CI job. If a change touches the token
  stylesheets, `token-var-channels` is the guard that will catch a variable
  read but never declared (or the reverse).
- **`pnpm audit` must be clean to ship — the full tree, not only `--prod`.**
  Both return `No known vulnerabilities found` with exit code `0` — remeasured
  **2026-09-30**, this worktree, real `$?` outside a pipe — and **no advisory is
  waived**: `pnpm.auditConfig.ignoreGhsas` is absent from the root
  `package.json`. ⛔ Capture the real `$?` outside a pipe — `pnpm audit | tail`
  returns `tail`'s exit code, not the audit's.

  ⛔ **An `overrides` entry FREEZES a floor; it does not follow the line.** This
  is how the 2026-09-30 lot arrived — `0 critical, 7 high, 7 moderate, 3 low`,
  `$?` = 1 on `develop` @ `2517bcbaf`, and **every one of the 17 advisories came
  from a module an override was already pinning or from one nobody pinned**:

  | module | pinned at | needed | advisories cleared |
  |---|---|---|---|
  | `brace-expansion@2` | `^2.1.4` | `^2.1.7` | 2 high, 1 moderate |
  | `brace-expansion@5` | `^5.0.9` | `^5.0.12` | 2 high, 1 moderate |
  | `undici@8` | *(unpinned, 8.10.0)* | `^8.10.2` | 3 high, 5 moderate, 3 low |

  The caret ranges would *allow* the fixed versions — pnpm simply never
  re-resolves a lockfile entry whose range is still satisfied, so `^2.1.4`
  stayed on 2.1.4 for as long as nobody edited the string. **An override posted
  to fix advisory N therefore becomes the reason advisory N+1 survives**, and it
  does so silently: no warning, no outdated notice, `pnpm install` green. When
  an advisory names a module the root `package.json` already overrides, the fix
  is to *raise that entry*, never to add a second one.

  `undici` looked like the dangerous half (it arrives through
  `@nuxtjs/seo → … → nuxt → undici`) and was not: `nuxt@4.5.2` declares
  `undici: ^8.10.0` and `jsdom@30.0.1` declares `^8.9.0`, so `^8.10.2` sits
  **inside both declared ranges** — it raises a floor, it does not cross a
  major. `pnpm -F @origam/marketing build` exits `0` on the resolved 8.11.2.
  Check the consumers' declared ranges before assuming an override is risky;
  that check is two `npm view` calls.

  ⚠️ **`packages/ds` carries zero audit paths — anything you see under it is
  your disk, not the project.** Paths through `style-dictionary` /
  `@tokens-studio/sd-transforms` are survivors of the pipeline deleted on
  2026-08-31: no `package.json` declares them, they have **0 occurrence in
  `pnpm-lock.yaml`**, and only stale symlinks in a long-lived
  `packages/ds/node_modules` keep them alive. A freshly installed worktree, and
  CI under `--frozen-lockfile`, never see them. Do not post an override for
  them — `rm -rf` that `node_modules` and reinstall.

  ⚠️ **This line is perishable, and it has already been false once.** It read
  "clean since #718 and #796 (2026-09-16)" while the tree carried a moderate:
  the dependabot bump `84ae0347` brought in `devalue 5.9.0`
  (GHSA-9rgm-9g3h-6x36, DoS, 45 paths via `@nuxtjs/i18n` and `@nuxtjs/seo`) and
  nobody re-measured. Fixed under #248 by a third override, `"devalue@5":
  "^5.9.2"` — scoped to the 5.x line on purpose, so the unrelated `devalue@2`
  in the tree is not dragged across two majors. **A clean audit is a
  measurement, never a quotation: re-run it, don't cite this paragraph.**

  ⚠️ **And verify the audit still measures.** "0 vulnerability" and "my command
  stopped seeing anything" are indistinguishable without a positive control.
  The method that gave #718 its authority, replayed for `devalue` under #248:
  re-pin the override to the vulnerable version, confirm the advisory comes
  back (`exit 1`, same GHSA), then restore and confirm `exit 0`.

  The former note here — *"dev tree contains pre-existing histoire-alpha vulns
  documented as accepted risk"* — is retired, and it is worth knowing how it
  was wrong, because the shape of the error is easy to repeat. It was right
  about the **origin**: 7 of those 10 advisories did arrive through
  `histoire@1.0.0-beta.1` (`js-yaml@3` via `gray-matter`, plus `markdown-it`
  and its `linkify-it`). It was wrong about the **conclusion**. Every one of
  the 10 had a published fix reachable by a minor bump, and the three
  remaining ones did not come from histoire at all (`js-cookie` via
  `@vue/test-utils` → `js-beautify`, and `vitest` itself). "Accepted risk"
  described a state nobody had re-measured — an alert that stops being
  checked because a document says it is fine.

  If a future advisory genuinely has no published fix, it goes through
  `docs/security-waivers.md` — maintainer approval, written justification,
  dependency chain, review date — never a silent entry in `ignoreGhsas`.
  A waiver also has an **exit**: `image-size` sat under one for a month
  after its fix shipped, because nothing re-checked the premise.
