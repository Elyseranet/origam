# installThemePropsResolver &amp; themedPropKeysUnion

The machinery that makes a theme's `components` block work. It is **invisible
from every component's source**: no `.vue` file in the catalogue opts into it,
imports it, or mentions it. If a prop's resolved value does not match what you
read in `withDefaults()`, this page is where the value came from.

Full rationale: [ADR-005](../internal/adr-005-theme-props-resolution.md).

## What it does

`createOrigam()` installs a single global Vue mixin:

```ts
app.mixin({ beforeCreate () { /* patch instance.props */ } })
```

For each component instance, the hook patches the exact prop slots a theme (or
an ancestor `<OrigamDefaultsProvider>`) names, **directly onto
`instance.props`** — the same object a compiled `<script setup>` template
reads as `__props.x`. One mechanism, the whole 217-component catalogue, zero
component-side code.

### Why it exists

Before ADR-005, `theme.components` was read only by components calling
`useDefaults()` — 39 of 217. The other 178 ignored a theme silently: no
warning, no error. And even those 39 were broken for any prop their *template*
reads by its bare name, because `useDefaults()` returns a **new object** the
compiled template never sees. Verified repro in the ADR:
`OrigamSelectionControl`'s `:type="type"` binding rendered an `<input>` with
**no `type` attribute at all** under a theme setting `type: 'checkbox'` — no
checkbox semantics, no `update:modelValue`, ever.

## API

```ts
function themedPropKeysUnion (themes: IDefault[]): Map<string, Set<string>>

function installThemePropsResolver (app: App, themedKeysUnion: Map<string, Set<string>>): void
```

### `themedPropKeysUnion`

Pure — no Vue, no DOM — so `createOrigam()` calls it once, synchronously, at
install time. It maps each component name (plus the special `'global'` key) to
the set of prop keys **at least one registered theme** names.

Measured:

```ts
themedPropKeysUnion([
    { 'origam-btn': { rounded: 'lg' }, global: { density: 'compact' } },
    { 'origam-btn': { variant: 'flat' }, 'origam-card': { elevation: 'md' } }
])
// origam-btn  -> ["rounded","variant"]
// global      -> ["density"]
// origam-card -> ["elevation"]
```

It is the **union across every installed theme**, not just the brand×mode
active at mount. A prop that only a *later* brand names still needs its
accessor wired from the start — the gap ADR-005 verified was `rounded` staying
`'none'` after swapping to the first theme that named it.

### `installThemePropsResolver`

⚠️ It **always** calls `app.mixin()`, even when the union is empty. The hook
also resolves the `provideDefaults` cascade, which a group component populates
at *runtime* — there is no install-time way to know whether one will ever
mount. The cheap exit is per-instance instead: an instance neither a theme nor
an ancestor provider names returns after a `Map` lookup and one property
lookup.

## Three things that do not follow from reading a component

### 1. It is an INTERSECTION, not a union

The resolver patches a key only when it is **both** named by a theme (or an
ancestor provider) **and** declared as one of the component's own props. The
gate is `if (!(key in rawProps))` inside the per-key loop.

A theme naming a prop the target does not declare is **skipped** — not written
to `instance.attrs` (a different object, with its own fallthrough semantics),
not a crash. Since #515 it is no longer silent either: a dev-only
`console.warn`, deduplicated per `(component, prop)`, fires through
`warnUnsupportedProp`.

Measured — a theme naming `{ rounded: 'lg', notAProp: 'zzz' }` on a component
that declares only `rounded`:

```
rendered:   <div data-rounded="lg"></div>
console.warn: [origam] <origam-probe-child> prop "notAProp" has no effect on
              this component: theme names this prop but <origam-probe-child>
              does not declare it
```

That silence is what let a test theme name `activeBgColor` on `Radio` — a prop
`Radio` never declares — go unnoticed in #496.

**Declaring the prop is still required.** What became unnecessary is *calling
`useDefaults()`*, not declaring the prop.

### 2. ⛔ A prop read EAGERLY in the `setup()` body never sees the theme

Vue runs `setup()` **before** the `beforeCreate` hook where the resolver
writes. A value captured into a plain local, an object literal, or a composable
that reads it eagerly is a snapshot taken too early: the theme value never
lands, and nothing warns.

Measured on a component declaring `tag` with default `'div'`, under a theme
setting `tag: 'section'`:

```ts
setup (props) {
    const eager = props.tag        // snapshot at setup()
    const lazy = () => props.tag   // read at render
    return () => h('div', {}, [`eager=${eager}`, ` lazy=${lazy()}`])
}
// renders: eager=div lazy=section
```

Reads deferred into a `computed`, a `watch`, or an event handler are evaluated
at render and are safe.

This bites hardest **through shared composables**: `useLink` froze `tag` into a
string and `useVModel` seeded its internal ref at setup, and between them they
broke themed props on **16 components** until both were made lazy. Any new
eager read in a widely-used composable has that same blast radius.

Detector: the AST analyser in
`packages/ds/scripts/guards/lib/setup-reads.mjs`, run as the
`composable-setup-reads` guard (one of those listed in
`packages/ds/scripts/guards/run-all.mjs` — recount there, the number moves)
and pinned by synthetic fixtures in
`packages/tests/TU/origam/setup-reads-composables.spec.ts` and
`setup-level-prop-reads.spec.ts`. It currently reports *"2 known (baselined)
violation(s), 0 new"*.

### 3. An explicit binding still wins

A value the parent actually bound outranks the theme. Measured: with a theme
setting `rounded: 'lg'`, `<Child rounded="xs" />` renders `xs`.

The accessor returns what **Vue resolved** for the slot, not the raw snapshot
of `vnode.props`. The two name the same parent intent, but the raw snapshot
skips Vue's casting. A bare boolean attribute (`<origam-card flat>`) compiles
to `flat: ''`; Vue turns that empty string into `true` because the prop is
declared `type: Boolean`, while the raw snapshot stays `''` — falsy. Returning
the raw value undid Vue's casting, and only for props a theme happened to name:
`<origam-card flat>` did not paint while `<origam-card hover>` — same shape,
prop not named by a theme, therefore not intercepted — did. Issue #644,
non-regression spec `theme-props-boolean-attr-644.spec.ts`.

Binding `undefined` explicitly does **not** count as passed, and falls through
to the theme.

## Cost, and what not to "improve"

Do not reintroduce a per-prop `computed()` pass-through "for clarity": it was
measured at **+42.6 % mount cost** across a realistic prop surface and rejected
on those grounds. See ADR-005.

## Pinned Vue internals

The resolver mutates `instance.props` through `Object.defineProperty`, which is
**not** documented public Vue API. Three internals it relies on:

- `finishComponentSetup` wraps the whole `applyOptions()` call — which invokes
  merged mixin `beforeCreate` hooks — in `setCurrentInstance(instance)`, so
  `getCurrentInstance()` and `inject()` are valid inside the hook.
- `updateComponentPreRender` assigns `instance.vnode = nextVNode` **before**
  calling `updateProps`, which is why the setter is the correct — and only —
  moment to re-snapshot "was this passed?".
- Vue writes the prop slot (`setFullProps` → `props[key] = value`) on every
  parent re-render that changes an explicit value, and again when a parent
  *stops* passing a prop.

That last point is why the fallback is a `shallowRef` read first and
unconditionally in the getter: it is the only reactive dependency the getter
can offer for the branches that read non-reactive sources.

These are pinned by `packages/tests/TU/origam/theme-props-resolver.spec.ts`,
which must fail loudly — not silently — if a Vue upgrade changes them. The
header of `theme-props-resolver.composable.ts` lists exactly what to check.

## Consumers

Both symbols have exactly **one** caller each in `packages/ds/src`:
`packages/ds/src/origam.ts` (inside `createOrigam`'s `install`), plus
`packages/tests/TU/origam/theme-props-resolver.spec.ts`.

## Source

`packages/ds/src/composables/Commons/theme-props-resolver.composable.ts`

## Related

- [ADR-005](../internal/adr-005-theme-props-resolution.md) — the full writeup.
- [`useDefaults`](./useDefaults.md) — the provider side of the same map.
- [`useTheme`](./useTheme.md) — the brand and mode axes.
