# ADR-006 — Modular entry points (`origam/core`, `origam/form`, `origam/chart`, …)

- **Status**: Proposed (2026-08-15) — **framing only, nothing implemented**.
  Awaiting arbitration on the open questions at the end of this document.
- **Deciders**: user (arnaudprioul), architect
- **Scope**: `packages/ds` packaging (`build.config.ts`, `package.json`
  `exports` / `sideEffects`, `origam.ts` install path), with downstream impact
  on `packages/docs`, `packages/marketing`, and every external consumer
- **Target release**: **v3.0.0** — the maintainer has explicitly reserved that
  number for this chantier
- **Related**: `ROADMAP.md` § *Modularisation du DS — entry-points par domaine*
  (this ADR is the specification that section asked for), ADR-005 (`variant` =
  props preset, same release), CHANGELOG 2.15.0 (public announcement that the
  `"./*"` wildcard export is removed in 3.0.0)

---

## Context

### The request

> « L'app n'importe (et ne paie) que les modules qu'elle utilise. »
> — `ROADMAP.md` l.286-310

The ROADMAP proposes splitting the published library into tree-shakable
sub-exports by domain (`origam/core`, `origam/form`, `origam/chart`, and a list
of candidate modules to validate), on the premise that the single massive entry
point is what makes consumer bundles heavy.

### What this ADR did before proposing anything

The premise was **measured, not assumed**. Three independent measurements:

1. **Static dependency graph** — every `import` in the 217 SFCs and 106
   composables parsed, barrel imports resolved back to the owning component
   family, type-only imports excluded (they erase at build time and create no
   runtime edge). Tarjan SCC for cycle detection.
2. **Dist inventory** — per-family byte weight of the actual published
   artefact (`dist/src`, ESM `.js` + `.vue`, excluding `.cjs`, `.d.ts`, maps).
3. **Real bundling probes** — a throwaway Vite 7.3.6 / Rollup project
   (terser, ESM lib mode, `cssCodeSplit: false`, Vue bundled in) that builds a
   minimal app per scenario and weighs the output. This is the only measurement
   that answers "what does a consumer actually pay".

All three are reproducible; the method is described so the numbers can be
challenged.

> **Measurement caveat, stated up front.** Every bundling number below comes
> from **Rollup via Vite**. Webpack was **not** measured. Webpack honours
> `package.json#sideEffects` differently, and origam currently declares
> `sideEffects: ["**/*.css", "**/*.scss", "**/*.vue"]` — i.e. *every SFC is
> declared impure*. Whether that defeats tree-shaking on webpack is an **open
> question**, not a finding (Q6).

---

## Finding 1 — the component graph is already a clean DAG

97 component families, 217 SFCs, 277 resolved inter-family edges.

- **Non-trivial strongly-connected components: 0.** There is no cycle between
  component families. Nothing in the current code structurally forbids a split.
- 69 of 97 families depend on at least one other family; 28 are leaves.
- Fan-in is concentrated, which is what makes a `core` module natural:

  | Family | Families depending on it |
  |---|---|
  | Icon | 36 |
  | Transition | 25 |
  | Btn | 22 |
  | Avatar | 17 |
  | DefaultsProvider | 12 |
  | Progress | 11 |
  | Input | 10 |

- The heaviest transitive closures are the composite fields and the table:
  `DataTable` pulls 29 families, `DatePickerField` 26, `Select` 25.
- Only **one** composable imports a component (`Icon/icon.composable.ts` →
  `Icon`), so the composable layer does not entangle the split.

**Consequence: the split is feasible.** The graph imposes constraints (Finding
5) but contains no blocker.

## Finding 2 — tree-shaking through the barrel *already works*

This is the finding that reframes the chantier.

| Scenario | JS raw | JS gzip | CSS raw |
|---|---|---|---|
| baseline — Vue only, no origam | 96.1 kB | 34.4 kB | 0 kB |
| `OrigamBtn` from `origam/components` (**217-component barrel**) | **208.3 kB** | 63.7 kB | 39.3 kB |
| `OrigamBtn` from `origam/components/Btn` (**subpath**) | **208.3 kB** | 63.9 kB | 39.3 kB |

**Identical to the byte.** Importing one component through the full barrel
costs exactly what importing it through a dedicated subpath costs. Rollup
resolves the re-export chain and drops the other 216 families.

Other single-component probes, same method (net cost = minus the 96.1 kB Vue
baseline):

| Import | JS raw | net origam cost | JS gzip |
|---|---|---|---|
| `OrigamIcon` | 131.9 kB | 35.8 kB | 44.2 kB |
| `OrigamBtn` | 208.3 kB | 112.2 kB | 63.7 kB |
| `OrigamCalendar` | 239.4 kB | 143.3 kB | 71.7 kB |
| `OrigamChart` | 506.5 kB | 410.4 kB | 120.1 kB |
| `OrigamDataTable` | 766.2 kB | 670.1 kB | 180.1 kB |
| realistic app, **15 common components** via barrel | 748.5 kB | 652.4 kB | 173.0 kB |

A realistic 15-component application pays 652 kB of origam — not 2.4 MB. The
per-module entry points the ROADMAP asks for would change **none** of these
numbers, because the granularity Rollup already achieves is the *file*, which
is finer than the *module*.

## Finding 3 — the real leak is `createOrigam()`, and it is not a packaging problem

| Scenario | JS raw | JS gzip | CSS raw |
|---|---|---|---|
| `createOrigam()` — **the documented install path** | **11 239.4 kB** | **2 187.5 kB** | 7 336.8 kB |
| `createOrigam({ components: { OrigamBtn }, directives: {} })` | **11 239.4 kB** | **2 187.5 kB** | 7 336.8 kB |

The two are **byte-identical**. Passing an explicit component map — the obvious
escape hatch, and the one a performance-minded user would reach for — buys
nothing. There is currently **no way** to call `createOrigam()` without
shipping all 217 components.

The cause is two lines in `packages/ds/src/origam.ts`:

```ts
import * as origamComponents from './components'     // l.1
import * as origamDirectives from './directives'     // l.18
…
const { components = origamComponents, directives = origamDirectives } = options
```

A namespace import used as a **default parameter value** is referenced
unconditionally at module scope. Rollup must retain the entire namespace object
— and therefore every component — regardless of what the caller passes.

**The mechanism was isolated,** so the conclusion does not rest on reading the
code. Two shims with an identical public signature, same consumer code, only
the eager namespace import differing:

| Shim | JS raw | JS gzip | CSS raw |
|---|---|---|---|
| `components = allComponents` (today's pattern) | **11 201.2 kB** | 2 175.9 kB | 621.0 kB |
| `components = {}` (catalogue not eagerly referenced) | **208.5 kB** | 63.7 kB | 39.3 kB |

**53.7× / −98.1 % JS**, from removing an eager namespace import. Nothing else
changed.

`packages/marketing/src/consts/installation.const.ts:78` documents
`const origam = createOrigam()` as *the* installation snippet. Every plain-Vue
consumer who followed the docs is on the 11.2 MB path today.

> Note the contrast: the **Nuxt module does the right thing already**. It uses
> `addComponentsDir` (`packages/ds/src/nuxt/module.ts:187`), so Nuxt resolves
> components lazily and bundles only what a page renders. The defect is
> specific to the plain-Vue `createOrigam()` path.

## Finding 4 — two unconditional payloads worth their own tickets

**a) The MDI webfont, always.** `origam.ts:27` does
`import '@mdi/font/css/materialdesignicons.css'` unconditionally. In the
`createOrigam()` probe this is **6.55 MB of the 7.34 MB CSS** — a single
`@font-face` rule with all four font formats base64-inlined (eot 1.31 MB, ttf
1.31 MB, woff 588 kB, woff2 403 kB), plus **301 kB of `.mdi-*` rules** (7 477
of them). A real app build emits the fonts as separate files rather than
inlining them, so the honest user-facing cost is *301 kB of icon CSS always,
plus a 403 kB woff2 fetched if any glyph renders* — paid even by an app that
ships its own icon set.

**b) `MDI_ICONS`.** `packages/ds/src/enums/Commons/mdi.enum.ts` is a runtime
`export enum` with **7 285 members** (360 kB of source, 93 % of the whole
`enums/` tree). Touching a single member costs **315.7 kB / 62.2 kB gzip** —
a TS runtime enum compiles to one object literal and cannot be shaken
per-member.

The good news, measured: importing an *unrelated* symbol from the enums barrel
(`import { DENSITY } from 'origam/enums'`) costs **0.1 kB**. The barrel does
not drag `MDI_ICONS` in. Only code that names `MDI_ICONS` pays.

Neither of these is fixed by modularization. Both are independent, cheap wins.

## Finding 5 — the taxonomy the data supports

The proposal below was **validated mechanically** against the measured graph:
every family assigned, module-level edges recomputed, Tarjan re-run on the
module graph.

**Result: 8 modules, dependency graph is a DAG, no cycles.**

```
chart    -> core
media    -> core, form, overlay
data     -> core, form, nav
form     -> core, overlay
feedback -> core, overlay
overlay  -> core
nav      -> core
core     -> (nothing)
```

| Module | Families | Dist weight | Share |
|---|---|---|---|
| `form` | 26 | 603 kB | 25.3 % |
| `core` | 39 | 568 kB | 23.8 % |
| `chart` | 1 | 533 kB | 22.3 % |
| `data` | 7 | 203 kB | 8.5 % |
| `media` | 5 | 164 kB | 6.9 % |
| `nav` | 6 | 122 kB | 5.1 % |
| `overlay` | 7 | 102 kB | 4.3 % |
| `feedback` | 6 | 92 kB | 3.9 % |
| **total** | **97** | **2 387 kB** | |

**`core`** (39) — App, Avatar, Blockquote, Btn, Card, Chip, ClientOnly,
DefaultsProvider, Divider, ExpansionPanel, Grid, Grids, Icon, Img, ItemGroup,
Kbd, Label, Layout, Lazy, List, Loader, Main, Masonry, NumberFormat, Progress,
Responsive, Section, Sheet, Skeleton, Slide, SystemBar, TextMask,
ThemeProvider, Title, Toolbar, Transition, VirtualScroll, Watermark, Window

**`nav`** (6) — BottomNav, Breadcrumb, Pagination, Stepper, Tabs, Timeline

**`overlay`** (7) — CommandPalette, ContextualMenu, Dialog, Drawer, Menu,
Overlay, Tooltip

**`feedback`** (6) — Alert, Badge, Clipboard, EmptyState, InfiniteScroll,
Snackbar

**`form`** (26) — Calendar, Checkbox, ColorPicker, ColorPickerField,
ConfirmWrapper, Counter, DatePicker, DatePickerField, Field, FileField, Form,
InlineEdit, Input, Messages, NumberField, OtpInputField, PasswordField, Picker,
Radio, RatingField, Select, SelectionControl, SliderField, Switch, TextField,
TextareaField

**`data`** (7) — Bracket, Code, DataList, DataTable, QrCode, Table, Treeview

**`media`** (5) — Audio, Carousel, Media, Parallax, Video

**`chart`** (1) — Chart (26 SFCs)

### The three edge cases that actually matter

**① `List` + `VirtualScroll` must sit in `core`, not in `data`.**
This is not an aesthetic call — it is load-bearing, and the counter-factual was
run. Leaving them in `data` produces a **module-level cycle**:

```
overlay -> data -> form -> overlay
```

because `Menu` (overlay) needs `List`, `Select` (form) needs `Menu` and
`VirtualScroll`, and `DataTable` (data) needs `Select`. The family graph stays
acyclic throughout — the cycle is created purely by the partition. Moving the
two collection primitives down to `core` breaks it (cost: +60 kB nominal in
`core`, which is *accounting only* — see Finding 2, membership does not change
what a consumer pays). The alternative is to lift `DataTable` into a top layer
above `form`; that is Q3.

**② `DataTable` is `data`, and `data` sits *above* `form`.**
It is tempting to read `DataTable` as a display component belonging near
`core`. The measurements forbid it: `DataTable` depends on 11 families
including `Select` and `Checkbox` (form) and `Pagination` (nav), and drags a
29-family closure — the largest in the library, 670 kB net in the probe. It is
the most composite component there is and belongs at the top of the stack, not
near the bottom.

**③ `Calendar` and `DatePicker` go to `form`, not to a `date` module.**
`Calendar` depends only on `Btn` and would sit happily anywhere; that is an
argument *against* a dedicated module, not for it. A `date` module would hold
3 families (Calendar, DatePicker, DatePickerField ≈ 102 kB), and
`DatePickerField` would still need `TextField` + `Menu`, so `date → form` and
`date → overlay` anyway. It buys a name, not a boundary. Same reasoning
retired a `viz` module for `Bracket`: it is 64 kB, has zero dependencies, and
grouping it with `Chart` would suggest a shared SVG/maths substrate that does
not exist (`Chart` depends only on `Btn`).

Two further placements worth flagging because they follow *behaviour*, not
name: **`Messages` is `form`** (it renders field-validation messages; its only
consumers are `Form` and `ConfirmWrapper`) rather than `feedback` — this also
removes the sole `form → feedback` edge. And **`Code` is `data`** rather than
`core`, because it drags the `shiki` peer dependency.

### Where the non-component layers go

- **The ~106 composables → `core`.** Only one touches a component. Splitting
  them per module would fragment the transversal contract (`useColor`,
  `useDimension`, `useDefaults`…) that `CLAUDE.md` designates as the single
  source of truth for cross-cutting prop surfaces, and the whole layer is
  287 kB in dist while an individual composable costs 26.8 kB in the probe.
  Keep `origam/composables` as-is and re-export from `origam/core`.
- **`interfaces` / `types`** are type-only: zero runtime weight, no module
  affinity. Keep flat.
- **`enums` / `consts` / `utils` / `directives`** stay flat too, with the
  `MDI_ICONS` caveat of Finding 4b handled separately.
- **`OrigamDefaultsProvider` belongs in `core`** — fan-in 12, and it is the
  anchor of the props-resolution chain. Flagged for the theming chantier (Q5).

---

## Decision

**Proposed, in this order — the sequence is the substance of this ADR:**

1. **Fix `createOrigam()` first, and independently of the split.** Stop
   referencing the component/directive catalogues as eager default parameter
   values. Measured effect on a 15-component app: **11 239 kB → 748 kB raw
   (−93.3 %)**, **2 188 kB → 173 kB gzip (−92.1 %)**. This is a change of a few
   lines with no packaging consequence, and it delivers essentially the entire
   benefit the ROADMAP attributes to the split.
2. **Make the MDI font and `MDI_ICONS` opt-in** (Finding 4). Independent,
   cheap, and larger than anything the split yields.
3. **Then ship the 8-module split — for API surface reasons, not for bundle
   size.** Its real justification is Finding 6 below: the `"./*"` wildcard has
   been publicly announced as removed in 3.0.0, and something must replace it.

The honest framing: **the split as specified in the ROADMAP would deliver ~0 kB
of measured bundle gain over what Rollup already achieves** (Finding 2). It
remains worth doing for packaging hygiene, discoverability, documentation
structure, and as the replacement surface for the wildcard — but it should not
be sold as the performance chantier. The performance chantier is item 1, and it
is small.

## Finding 6 — replacing the `"./*"` wildcard (already announced)

CHANGELOG 2.15.0 committed publicly to removing `"./*": "./dist/src/*"` in
3.0.0. What that wildcard uniquely permits today, beyond the named entries:

| Usage the wildcard enables | Covered after removal? |
|---|---|
| `origam/components/Btn` | yes — `./components/*` already exists |
| `origam/composables`, `/enums`, `/consts`, `/utils`, `/types`, `/interfaces`, `/themes`, `/directives`, `/services` | yes — all already named |
| deep file access: `origam/composables/Color/color.composable` | **no** — needs `./composables/*` |
| deep type access: `origam/interfaces/Btn/btn.interface` | **no** — needs `./interfaces/*` |
| `origam/themes/origam.theme` | **no** — needs `./themes/*` |
| arbitrary asset paths under `origam/assets/**` | **no** — needs an explicit `./assets/*` or named additions |

Audited across the monorepo's own consumers (`marketing`, `stories`, `docs`,
`tests`): **only the named entries are used** — `origam/interfaces` (15),
`origam/enums` (13), `origam/types` (4), `origam/composables` (4),
`origam/utils` (2). No internal code depends on the wildcard, and no SCSS
`@use` reaches through it. The risk is entirely on **external** consumers, who
are unmeasurable from here.

The proposed exports map therefore adds the 8 module entries **plus** explicit
`./composables/*`, `./interfaces/*`, `./types/*`, `./themes/*`, `./enums/*`,
`./assets/*` — which preserves every legitimate wildcard use while closing the
"any internal file is public API" hole the wildcard opens.

## Cost, risks, and what breaks

**Cost.**

- `build.config.ts`: today it is `mkdist` — file-to-file transpilation, not
  bundling; dist mirrors src 1:1. Module entry points are therefore **8 new
  barrel files** plus exports-map entries, *not* 8 rollup builds. Cheaper than
  the ROADMAP implies.
- 8 barrels to keep in sync with the catalogue. The `file-naming` CI guard
  should be extended to assert every family appears in exactly one module
  barrel — otherwise the split rots silently.
- Docs, migration guide, and the per-module bundle-size table the ROADMAP asks
  for.

**What breaks.**

- Removing `"./*"` is a **breaking change for external consumers** relying on
  deep paths not covered by the explicit list above. Mitigated, not eliminated,
  by the six `*` entries proposed.
- Fixing `createOrigam()`'s eager defaults **changes the default behaviour**:
  today `createOrigam()` globally registers all 217 components, so an app using
  `<origam-btn>` in a template without importing it works. Any fix that stops
  eagerly referencing the catalogue must decide what a bare `createOrigam()`
  does — and that is a genuine breaking change for template-only usage. This is
  Q1, and it is the single most consequential question in this document.

**Risks.**

- `sideEffects: ["**/*.vue"]` declares every SFC impure. Rollup shakes anyway
  (measured), webpack untested (Q6). If webpack is a target, this needs its own
  probe before any promise is made.
- CSS is **not** split by module today and the split does not change that. A
  consumer importing `origam/styles` gets `main.css` — 359 kB — whole. Per-module
  CSS bundles are a separate deliverable; do not fold the promise into this one.

## Interaction with the other 3.0.0 chantiers

- **ADR-005 (`variant` = props preset)** — no contradiction found. ADR-005
  changes component *internals* and the theme model; this ADR changes
  *packaging*. They touch disjoint files. Sequencing is free.
- **Theming PROPS-FIRST** — one interaction to flag: this ADR places
  `OrigamDefaultsProvider` in `core`, which is where a props-first resolution
  chain needs it (every module depends on `core`). If that chantier changes
  where defaults are injected, it should assume `core` as the anchor. Raised as
  Q5 rather than settled here, since that chantier is still being instructed.

---

## Open questions — for the maintainer to arbitrate

**Q1. What should a bare `createOrigam()` do in 3.0.0?** *(the consequential one)*
- **(a)** Register nothing; components must be imported and registered by the
  app. Maximum gain, breaks template-only usage.
- **(b)** Keep registering everything by default, but make the eager reference
  removable via an explicit opt-in (`createOrigam({ components: {…} })` actually
  working). Preserves today's DX, gain only for those who opt in.
- **(c)** Ship `createOrigam` (lean, registers nothing) and
  `createOrigamFull` (today's behaviour) as two exports. Explicit, greppable,
  breaking but obvious.

**Q2. Do you accept the reframing?** That the split delivers ~0 kB over
current Rollup behaviour, and the real win (−93 %) is the `createOrigam()` fix
— so item 1 should ship first, possibly even in a 2.x patch, rather than
waiting for 3.0.0.
- **(a)** Yes — fix `createOrigam` first, split later for API reasons.
- **(b)** No — keep them bundled in 3.0.0 as one chantier.

**Q3. `List` / `VirtualScroll` in `core`, or `DataTable` lifted above `form`?**
One of the two is required; the partition is cyclic otherwise.
- **(a)** `List` + `VirtualScroll` → `core` (proposed).
- **(b)** `DataTable` → its own top module above `form`, `List` stays in `data`.

**Q4. Do you validate the 8 modules and the assignment above** (`core`, `nav`,
`overlay`, `feedback`, `form`, `data`, `media`, `chart`), or do you want a
`date` module (Calendar/DatePicker/DatePickerField) and/or `Bracket` grouped
with `Chart`? Both were considered and rejected on measured grounds; say the
word and they come back.

**Q5. Is `OrigamDefaultsProvider` in `core` compatible with the theming
chantier?** Needs a yes/no from whoever owns that instruction.

**Q6. Is webpack a supported consumer?** If yes, a webpack probe must run
before 3.0.0 promises anything, because `sideEffects: ["**/*.vue"]` may defeat
there what Rollup does correctly here.

**Q7. MDI:** make the font import and `MDI_ICONS` opt-in in 3.0.0?
- **(a)** Yes, both — breaking, ~301 kB of CSS off every app that does not use
  MDI, and 316 kB off any that names an icon constant.
- **(b)** Font only.
- **(c)** Leave as-is.
