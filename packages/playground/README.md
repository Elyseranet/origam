# `@origam/playground`

Private package (`private: true`, `0.x` independent, never published — the
monorepo's only npm publish remains `packages/ds`).

It will eventually replace `packages/stories` (Histoire). **Nothing has been
removed** from Histoire. Lots A–D (#1141–#1144) ship the embeddable component:
inspector, editable controls, Code panel, events log, scene tree and snippets.

## What it will be

**One embeddable component, not an application.** The theme arrives as a
**prop**; slots extend the toolbar, the area around the preview, the inspector
panels and the rendering of a single prop row; emits report selections. Two
hosts are planned: a standalone app in light/dark, and `packages/marketing`,
which will inject one of its brand identities.

⛔ **The playground does not know the 8 themes.** It receives a theme. Owner's
decision.

## The metadata chain

Two sources, each measuring what it alone can measure. Both cover **218/218**
components.

| stage | script | what it alone can give |
|---|---|---|
| **A** runtime | `meta:runtime` | prop names (`extends` flattened), required flag, **default values** |
| **B1** types | `meta:unions` | **literal union members**, emits, slots, JSDoc |
| **B2** aliases | `meta:aliases` | members of a union the TS printer kept behind an alias **name** |
| report | `meta:report` | cross-reads A and B and prints the verdict |

```sh
pnpm -F @origam/playground meta:runtime   # 218/218, 11 276 prop entries
pnpm -F @origam/playground meta:unions    # 218/218, 564 enumerable unions, 410 emits, 735 slots
pnpm -F @origam/playground meta:aliases   # 34 aliases queried, 13 finite unions
pnpm -F @origam/playground meta:report
```

Output lands in `.metadata/` and is **gitignored** — it is a build artefact,
and a generated tree that something later walks is the #966 hazard.

### Why both sources are mandatory

Neither subsumes the other, and the two rows that prove it:

- a **default** exists only in the runtime descriptor — `withDefaults` is
  compiled into it, and no type says `variant` starts at `'outlined'`;
- a union's **members** exist only in the type — `variant?: TKbdVariant`
  leaves no trace of `tonal | outlined | filled` at runtime.

Drop either source and you lose either every starting value or every picker.
Slots (735) and emit payloads are invisible to the runtime descriptor
entirely.

### Measured on `develop` @ `bcb9dc909`

Source A's runtime `type` is usable for picking a control on only **25.1 %**
of the 10 892 authored props:

| classification | props | share |
|---|---|---|
| decidable — names one constructor | 2 738 | 25.1 % |
| ambiguous — compiler could not narrow | 7 089 | 65.1 % |
| absent — no type emitted | 1 065 | 9.8 % |

⛔ `['Boolean', 'Number', 'String']` (4 653 props, the single most common
shape) is **not** a union of three accepted kinds. It is what the SFC compiler
emits when it could not narrow the declared type — an absence of information
wearing the costume of a union. Mapping it to a checkbox because `Boolean`
comes first is how a playground renders a toggle for `padding`.

The two sources **agree on every prop name**: 0 props seen only by A, 0 seen
only by B (excluding `class` / `style`, which are attribute pass-throughs).

## Pitfalls already paid for

- ⛔ **`vue` must be loaded by NODE.** Inlined by Vite → `module is not
  defined` (`vue/index.mjs` is one line re-exporting a CJS `index.js`).
  Externalised with the Vite root at the repo root → `Cannot find module
  'vue'`, because pnpm's isolated layout puts **no** `node_modules/vue` at the
  workspace root. Both failures produce an identical **218/218 red** that
  reads exactly like a catastrophic DS defect. The fix is rooting Vite at this
  package and widening `server.fs.allow`.
- ⛔ **Files come from the git index**, never `readdirSync` — `lib/component-files.mjs`.
- ⛔ **`vue-component-meta`'s printed type is not uniformly expanded.**
  `TKbdVariant = \`${KBD_VARIANT}\`` prints expanded; `TDirectionBoth = TBlock
  | TInline` prints as the **name**. Hence stage B2.

### Positive control

The harness reproduces the Bracket restriction already pinned by
`packages/tests/TU/components/Bracket/bracket-logical-side-restriction.spec.ts`
— `OrigamBracket` / `OrigamBracketMatch` declare 0 of 4 inline edges,
`OrigamBracketCompetitor` all 4. That is what establishes the harness observes
the **resolved type** rather than something adjacent to it.

## Structure

```
packages/playground/
  scripts/               — the metadata chain (build-time, Node)
    lib/component-files.mjs
  src/
    composables/Registry/registry.composable.ts   — useComponentRegistry
    consts/Commons/scene.const.ts
    enums/Commons/                                — CONTROL_KIND, METADATA_SOURCE
    interfaces/Catalog/                           — IComponentDefinition, IPropDefinition, …
    interfaces/Registry/                          — IComponentRegistry
    interfaces/Scene/                             — IPlaygroundScene, IPlaygroundInstance
    types/Commons/prop-value.type.ts
```

Declarations live only in their layer folder — never inline elsewhere.

## Type-check and CI

```sh
pnpm -F @origam/playground type-check     # vue-tsc, origam resolved to DS SOURCE
pnpm -F @origam/tests test:playground     # the TU/playground specs
```

Both run in the `playground` job of `.github/workflows/ci.yml` (#1141).

⛔ `tsconfig.json` `paths` maps `origam` / `origam/*` onto `../ds/src`, never
onto `packages/ds/dist/`. Before #1141 the check resolved through `origam`'s
`package.json` `exports`, so its verdict depended on the disk: no `dist/` →
`$?=0`; any `dist/`, even a fresh one → `$?=2`, 2 399 errors, all inside the
built `.vue` files. The `paths` mapping, the three DS ambient files it pulls in
and the `noUnusedLocals` trade-off are explained in `src/shims.d.ts`.

## The committed catalogue (lot E, #1145)

Every DS component's `IComponentDefinition` — **219** on `develop` @
`7c3f0b1fb` — is a COMMITTED artefact, one JSON per component, plus an index:

```sh
pnpm -F @origam/playground meta:runtime && pnpm -F @origam/playground meta:unions \
  && pnpm -F @origam/playground meta:aliases
pnpm -F @origam/playground meta:catalog          # writes src/assets/catalog/*.json + catalog-index.json
pnpm -F @origam/playground meta:catalog:check    # exit 1 on drift — run by the CI `playground` job
```

- **Committed**, because every host build (the marketing Docker image, CI,
  `nuxt dev`) would otherwise have to run the chain first, and forgetting it
  yields an empty playground that reads exactly like a product defect. Drift is
  caught by `meta:catalog:check` instead. The files carry no SHA or timestamp,
  so they are byte-identical while the DS does not change.
- **One file per component**: 2.78 MB of JSON in total, 176 KB gzip, median
  16 KB. `@origam/playground/catalog` (`src/utils/Commons/catalog.util.ts`)
  loads a definition on demand, as its own chunk; `CATALOG_INDEX` (name / tag /
  family / label) is the one eager file, so a host resolves a family without
  loading anything. It is a separate export because it calls
  `import.meta.glob`, which only a Vite pipeline understands.
- `src/host/catalogSeed.const.ts` is a SUBSET of it (14 named files, eager) —
  no longer a generated copy: one source of truth.
- ⛔ A tag is derived with Vue's own `hyphenate` rule. The former rule spelled
  `OrigamWindowXTranslate` as `origam-window-xtranslate`, which Vue camelizes
  back to an unknown element.

## Embedded in a host page (#1173)

`<playground embedded>` — `IPlaygroundProps.embedded`, `false` by default (the
standalone playground does not change). For a host page that already names
what it shows, e.g. `packages/marketing`'s `/components/{slug}`:

- the "Playground / origam · N components" header is removed;
- **single-component mode** = `embedded` AND the scene holds exactly one root
  with no child (`isSingleComponentScene`, `utils/Commons/scene-instance.util.ts`):
  the Scene panel and the Catalog button are hidden. A scene with children
  (a BtnGroup and its buttons, a DataTable and its action cell) keeps them.
  Derived from the scene's SHAPE only — no component name is interpreted.

⛔ Why a prop and not the scene alone: the standalone host starts from an
empty scene and reaches one root as soon as a component is picked. A rule on
the scene alone would hide the Catalog there and strand the user.

Everywhere, embedded or not:

- **"Select in preview"** only exists when the scene holds more than one
  instance — with one, the inspector already shows the only thing to select;
- the inspector shows **no counter** (no "N props / N emits" chip, no tally
  line, no per-group count); the search and the foldable groups stay;
- the **catalog drawer pushes** the content (an in-flow grid column, not an
  overlay — so no scrim, no `aria-modal`, no focus trap; Escape still closes
  it and returns focus);
- **responsive by container query**, not viewport: below 760 px of PLAYGROUND
  width the layout stacks (top bar, drawer, preview, inspector, dock) inside
  the playground's own height, which scrolls.

## Consumers

`packages/marketing` is the HOST (#1145): `/components/{slug}` mounts the full
`Playground`, `/theming` renders through the engine (`PlaygroundSceneNode` +
registry + snippets), both via its `usePlaygroundHost` composable, with its own
snippets added by `attachSnippets` and its 8 brand themes handed to the
`theme` prop. It also imports the prop-group classification (`TPropGroupId`,
`PROP_GROUP_IDS`, `classifyPropGroup`). The direction is
`marketing → playground`, never the reverse.

## The registry

`useComponentRegistry({ definitions, loaders })` →
`getComponent` / `getComponents` / `getComponentMetadata`.

`getComponents` and `getComponentMetadata` are **synchronous** and load
nothing; `getComponent` is **async** because it may fetch code. That asymmetry
is the contract: a synchronous `getComponent` would force all 218 components to
be loaded up front.

Loaders are keyed by **family**. The DS groups its 218 SFCs into 96
`components/{Family}/index.ts` barrels and `origam`'s `exports` maps
`./components/*` onto them, so one `() => import('origam/components/Btn')`
serves `OrigamBtn`, `OrigamBtnGroup` and `OrigamBtnToggle` — 96 chunks instead
of 218, and a parent arrives with the sub-components that cannot render without
it (9 of the 11 `OrigamDataTable*` are such children).

Verified at runtime, not merely type-checked: metadata reads trigger **0**
loader calls; one family loader resolves the three Btn members as distinct
components; `OrigamBtn` comes back with its 106-prop descriptor; a repeat call
returns the same object; a registered name with no loader and an unregistered
name both return `null`.

## Editing a scene (lot B, #1142)

The inspector renders one origam control per `CONTROL_KIND`
(`PlaygroundPropControl`): `origam-select` (members from source B, unions and
resolved aliases), `origam-switch`, `origam-number-field`,
`origam-textarea-field` (JSON) and `origam-text-field`.

- ⛔ A prop typed `['Boolean', 'Number', 'String']` is a TEXT field with an
  **explicit** "Write as" choice among the kinds its runtime type admits —
  never a switch. `"4"` stays a string unless NUMBER is chosen (on `padding`,
  `"4"` is a design rung and `4` is `4px`). A text that does not parse writes
  nothing. A `Function`-only prop is not editable.
- All writes go through `useSceneEditor` (`composables/Commons/`): set writes
  `instance.props[key]`, reset **deletes** the key, and no default is ever
  copied into `props`. The default (source A) is shown as the field's
  placeholder and a `default: …` caption; a set row carries a `set` marker,
  an accent border and a Reset button.
- `update:{key}` emitted by the rendered instance writes back only a key the
  user already set (a set `modelValue` makes the component controlled).
- Every emit the definition declares is logged in the dock's events panel
  (`useEventLog`, newest first, bounded by `EVENT_LOG_LIMIT`).

`control` is derived by `deriveControlKind` (`scripts/lib/definition.mjs`,
pinned by `packages/tests/TU/playground/prop-control.spec.ts`), see "The
committed catalogue" below.

E2E against the standalone host:

```sh
E2E_PLAYGROUND_PORT=<free port> pnpm -F @origam/tests test:e2e:playground
```


## Scene tree and snippets (lot D, #1144)

The preview renders **every root** of the scene, each with its `children`, through
`PlaygroundSceneNode` (one node per instance: lazy resolution, emit relay, and an
`onErrorCaptured` boundary so one instance that cannot render — a sub-component
outside its parent — does not blank the whole playground). `slotContent` is
rendered as text, never `v-html`: a scene is serialisable and may come from a URL.

- **Scene tree** (`PlaygroundSceneTree`, top of the inspector column):
  `OrigamTreeview`, keyboard-operable (Tab, Arrow keys, Enter / Space). Node ids
  are instance ids, so selecting a row sets `scene.selectedInstanceId` and the
  inspector opens that instance's props. A child in a named slot is labelled with
  it (`Btn — Edit (#item.actions)`).
- **Add / remove** a child: offered on an instance whose definition declares a
  `default` slot (source B). Writes go through `useSceneEditor`
  (`selectInstance`, `addChild`, `removeInstance`, `loadSnippet`); ids are never
  positional — siblings keep theirs across an add or a remove.
- **Snippets** (`consts/Commons/snippets.const.ts`): `createDefaultSnippets(t)`
  returns instance TREES (never strings), every demo text through `t()`. The
  first snippet of a component is its default: picking it in the catalogue loads
  it. The dock's Snippets panel lists the snippets of the root being edited.
  `instantiateSnippet` re-identifies every instance on load.
- ⛔ **`requiresParent` is AUTHORED** (`SNIPPET_PARENT_OF`), because no source
  derives it (#1048 § 3.4). `attachSnippets(definitions, snippets, parentOf)`
  merges both into the extracted definitions — the host does it, the generated
  seed carries neither. A component that requires a parent is hidden from the
  catalogue drawer and offered as a child of its family instead.
- The host seed covers the families that render empty: DataTable, Chart,
  Tabs/Tab, Window/WindowItem, List/ListItem (now a subset of the committed
  catalogue, #1145).

Every snippet prop is checked against the extracted catalogue by
`packages/tests/TU/playground/scene-tree.spec.ts` — a snippet that invents a prop
fails there.

## Chart* snippets and selection by click (lot E1, #1164)

- **The whole Chart family is in the host seed** (26 members; `meta:host-seed`
  `PICK`). Category copied from marketing's curated catalogue where it has one;
  11 members have none there and get none here.
- **Every member but `OrigamChartAxis` has a default snippet**
  (`createChartSnippets`, in `snippets.const.ts`). Each was measured rendering
  empty without one (the "No data to display" state, a 0-px box, or a render
  error on the required `series`). ⛔ Most families do NOT read
  `IChartSeries.data` as `number[]`: they cast `series[0].data` to their own
  datum (`IChartBoxPlotDatum`, `IChartSankeyDatum`, `IChartTreemapDatum`…), and
  each snippet follows that interface. `OrigamChartAxis` renders `<g>` roots that
  only paint inside a chart's `<svg>`, and no catalogue component offers a slot
  there, so it has no snippet and no parent.
- **Selection mode** (owner's decision, 2026-10-16): a toggle button in the top
  bar (`aria-pressed`, `data-cy="playground-select-mode-toggle"`), off by default.
  While it is off, the preview intercepts nothing and every component keeps its own
  interaction. While it is on, the pointer events of `SELECT_MODE_CAPTURED_EVENTS`
  are stopped in the capture phase on the stage, and `click` selects the innermost
  instance (`instanceIdFromTarget`), the same way a tree row does. Hovered instances
  get a dashed outline and the selected one a solid outline. Escape leaves the mode.
  Keyboard selection stays with the scene tree. The public API of `Playground`
  (props, emits, slots) does not change.

```sh
E2E_PLAYGROUND_PORT=<free port> pnpm -F @origam/tests test:e2e:playground   # includes playground-select.spec.ts
```
