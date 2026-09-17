# useDefaults

The `<OrigamDefaultsProvider>` machinery: a provider declares default prop
values for a sub-tree, and descendants resolve their props against it.

Three exported symbols live in `defaults.composable.ts`:

| symbol | side | role |
|---|---|---|
| `provideDefaults` | provider | declare a defaults map for the sub-tree |
| `createDefaults` | install | seed the root `Ref<IDefault>` `createOrigam()` provides |
| `useDefaults` | consumer | resolve a component's props against the closest provider |

::: danger `useDefaults` has no caller, and should not get one back
**No component in the catalogue calls `useDefaults()`, and none should.** The
40 remaining calls were removed under issue #363. A global resolver installed
by `createOrigam()` already patches themed and provided props onto
`instance.props` for the entire catalogue — see
[the theme props resolver](./installThemePropsResolver.md) and ADR-005. The
call bought nothing the resolver does not already do, and cost roughly
+0.07 ms per mount on Btn / Card / Chip.

A guard enforces this: `packages/ds/scripts/guards/no-usedefaults-in-components.mjs`.

`provideDefaults` and `createDefaults` are unaffected — `provideDefaults` is
what `<OrigamDefaultsProvider>` and `<OrigamThemeProvider>` are built on, and
`createDefaults` is called once by `createOrigam()`.
:::

Issue **#544** tracks `useDefaults` being a composable without a caller. This
page describes what exists; it does not settle that ticket.

## `useDefaults`

```ts
function useDefaults<T extends object> (
    props: T,
    name = getCurrentInstanceName()
): T
```

Returns a `Proxy` over the props. Every declared prop name is an accessor
backed by a `computed`; reads of anything else (Vue internals, symbols) fall
through to the original `props` object, and `Object.keys` / spread /
`filterProps` still see every declared prop name.

### Resolution order, per prop

1. the value the parent **explicitly bound** in the template
2. the component-specific entry from the closest provider —
   `defaults['origam-btn'].color`
3. the provider's `global` entry — `defaults.global.color`
4. the component's own `withDefaults()` value

Measured on a component named `origam-probe-defaults`, with a parent
providing `{ 'origam-probe-defaults': { b: 'prov-b' }, global: { c: 'glob-c' } }`
and binding `a="passed-a"`:

```
a (passed)     = passed-a
b (component)  = prov-b
c (global)     = glob-c
ownKeys        = ["a","b","c"]
```

"Explicitly bound" is decided by `usePassedProps`, not by a
`!== undefined` check — a prop bound to `undefined` deliberately does not
count as passed and falls through to the provider.

Each per-prop `computed` reads the component's own value **eagerly** on every
evaluation. That is not an oversight: without it, a prop that starts unpassed
would track only `defaults.value` and stay stale when the parent later starts
forwarding it through a dynamic `v-bind`.

## `provideDefaults`

```ts
function provideDefaults (
    defaults?: Ref<IDefault> | IDefault,
    options?: {
        scoped?: MaybeRefOrGetter<boolean | undefined>
        reset?: MaybeRefOrGetter<string | number | undefined>
        root?: MaybeRefOrGetter<string | number | undefined>
        disabled?: MaybeRefOrGetter<boolean | undefined>
    }
): ComputedRef<IDefault>
```

Provides the resolved map under `ORIGAM_DEFAULTS_KEY` and returns it.

### What each option does — measured

Setup: an outer provider declares
`{ 'origam-probe-leaf': { x: 'outer' }, global: { y: 'outer-y' } }`, an inner
provider declares `{ 'origam-probe-leaf': { x: 'inner' } }`, and a leaf reads
both `x` and `y` (own default `'own'` for each).

| inner options | leaf `x` | leaf `y` | meaning |
|---|---|---|---|
| *(none)* | `inner` | `outer-y` | deep merge: the inner map layers **over** the parent's |
| `{ scoped: true }` | `inner` | `own` | only this provider's map is visible; the parent's is dropped |
| `{ reset: 1 }` | `inner` | `own` | same as `scoped` |
| `{ disabled: true }` | `outer` | `outer-y` | this provider is **bypassed**; the parent's map passes through untouched |

`root` is not in the table because it was not measured separately; the source
tests it in the **same condition** as `reset`
(`if (toValue(options?.reset) != null || toValue(options?.root) != null)`), so
it takes the same branch. Note both are tested against `!= null`, not for
truthiness: `reset: 0` engages the branch.

Note the asymmetry worth remembering: `disabled` does not disable the
*defaults*, it disables **this provider** — the ancestor's map still applies.

### Options must be getters when they come from props

Each option is a `MaybeRefOrGetter`, unwrapped with `toValue()` on every
re-evaluation.

⛔ A caller whose option is a **component prop** must pass a getter
(`() => props.scoped`), never the bare value. Issue #438:
`<OrigamDefaultsProvider>` forwarded `props.scoped` as a raw boolean captured
at `setup()`, so the internal `computed` never re-tracked it and
`:scoped="aRef"` had no effect after the initial mount.

## `createDefaults`

```ts
function createDefaults (options?: IDefault): Ref<IDefault>
```

A one-line factory returning `ref(options ?? {})`. `createOrigam()` calls it
once to seed the root map, then assigns `defaultsRef.value` with the active
brand×mode's collapsed `components` block.

⛔ The Nuxt plugins **reassign** `defaultsRef.value` with a **new object** on
every brand / mode change. Mutating the existing object in place would not
invalidate the computeds reading it.

## Consumers

- `useDefaults` — **0** in `packages/ds/src`. Four specs exercise it:
  `TU/components/DefaultsProvider/OrigamDefaultsProvider.spec.ts`,
  `TU/composables/Commons/defaults.composable.spec.ts`,
  `TU/origam/defaults-from-theme.spec.ts`,
  `TU/origam/setup-level-prop-reads.spec.ts`.
- `provideDefaults` — **2** components:
  `components/DefaultsProvider/OrigamDefaultsProvider.vue`,
  `components/ThemeProvider/OrigamThemeProvider.vue`.
- `createDefaults` — **1**: `packages/ds/src/origam.ts`.

## Source

- `packages/ds/src/composables/Commons/defaults.composable.ts`
- Injection key: `packages/ds/src/consts/Commons/defaults.const.ts`
- Spec: `packages/tests/TU/composables/Commons/defaults.composable.spec.ts`

## Related

- [`installThemePropsResolver`](./installThemePropsResolver.md) — the global
  mechanism that reads the very same defaults map without any opt-in.
- [`<OrigamDefaultsProvider>`](../components/DefaultsProvider/OrigamDefaultsProvider.md)
- [`<OrigamThemeProvider>`](../components/ThemeProvider/OrigamThemeProvider.md)
