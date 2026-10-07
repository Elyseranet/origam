# `@origam/playground`

Private package (`private: true`, `0.x` independent, never published — the
monorepo's only npm publish remains `packages/ds`).

It will eventually replace `packages/stories` (Histoire). **Nothing has been
removed**: lot 1 is foundation and proof only, and there is deliberately no UI
and no component export yet.

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
