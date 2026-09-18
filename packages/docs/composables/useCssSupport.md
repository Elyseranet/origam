# useCssSupport · useCssSupportClient

The **single feature-detection layer** of the design system. Origam's core
principle is CSS-first, JS-fallback: a component implements the modern CSS path
and only branches to JavaScript when the browser cannot honour it. These two
hooks are the boundary where that decision is made.

## ⛔ Two rules, both non-negotiable

**1. Never call `CSS.supports()` directly from a component.** Every query goes
through these hooks so the matrix of monitored features stays auditable in one
place, and so the answers stay cached — browser support does not change at
runtime.

**2. Never gate hydration-sensitive markup on `css.value.*`.** During SSR every
flag is `false`: the server renders the JS fallback, the client hydrates into
the CSS branch, and Vue logs a hydration mismatch. Wrap such a branch in
`<ClientOnly>`, resolve it in `onMounted` — or use `useCssSupportClient`, which
exists for exactly this.

To add a feature, edit `FEATURE_QUERIES` in
`packages/ds/src/consts/Commons/css-support.const.ts`. That map is the single
source of truth for what is monitored; it currently holds **21** entries
(measured: `Object.keys(css.value).length === 21`).

---

## `useCssSupport`

```ts
function useCssSupport (): IUseCssSupport
```

| Returned | Type | Meaning |
|:---|:---|:---|
| `css` | `Readonly<Ref<TCssSupportMap>>` | Reactive, **frozen** flag map keyed by feature name. |
| `supports` | `(query: string) => boolean` | Free-form query, cached after the first call. |
| `supportsAny` | `(...queries: string[]) => boolean` | True if any query passes. |
| `supportsAll` | `(...queries: string[]) => boolean` | True if every query passes. |
| `has` | `(feature: TCssFeatureName) => ComputedRef<boolean>` | A reactive view on one flag. |

```ts
import { useCssSupport } from 'origam/composables'

const { css, supports, supportsAny, has } = useCssSupport()

if (css.value.containerQueries) {
    // CSS-only path
} else {
    // JS resize-observer path
}

if (supports('display: subgrid')) { /* … */ }
if (supportsAny('display: grid', 'display: -ms-grid')) { /* … */ }
```

### Lifecycle

`_flags` is a **module-level singleton** ref, not per-component state. It starts
at an all-`false` frozen map; the first browser-side call runs `detectAll()`
once (`ensureInitialized`, guarded by `typeof window === 'undefined'`) and
freezes the result. Later calls are free.

`supports` / `supportsAny` / `supportsAll` do **not** read that map — they call
the shared `rawSupports` primitive directly, which returns `false` outside a
browser, `false` on an engine with no `CSS.supports`, `false` on a thrown query,
and otherwise memoises the answer in a module-level `Map`.

Measured under jsdom: `typeof CSS === 'object'`, `CSS.supports` is a function,
`css.value.grid === true`, `has('grid').value === true`,
`supports('display: grid') === true`, and `Object.isFrozen(css.value) === true`.

### `_resetCssSupportCache`

```ts
function _resetCssSupportCache (): void
```

Test-only. Clears the shared `rawSupports` cache, sets `_initialized` back to
`false` and resets `_flags` to the all-`false` map, so the next
`useCssSupport()` re-detects instead of reading a previous spec's frozen state.
**Not part of the public API** — consumers must not depend on it.

Verified by import: **0** importers in `packages/ds/src`, **3** in
`packages/tests` (`cssSupport.composable.spec.ts`,
`parallax-css-progress.composable.spec.ts`, `ssr-smoke.spec.ts`).

---

## `useCssSupportClient`

```ts
function useCssSupportClient (
    feature: TCssFeatureName | string,
    options: IUseCssSupportClientOptions = {}
): Ref<boolean>
```

The hydration-safe variant. Returns a `Ref<boolean>` that starts at
`options.defaultValue` (default `false`) and flips to the real result **inside
`onMounted`**. SSR and the first client render therefore see the same value —
no mismatch — and the runtime branch resolves a tick after mount.

Measured: the ref reads `false` during `setup()` and `true` after mount, for the
`grid` feature under jsdom.

`feature` accepts a `FEATURE_QUERIES` key **or** a raw query string; the lookup
falls back to using the argument itself as the query. It goes through
`rawSupports` rather than the `useCssSupport` singleton, because the caller may
be the first consumer and the singleton may not be initialised yet — this keeps
the shared cache warm regardless of call order.

```vue
<script setup lang="ts">
    import { useCssSupportClient } from 'origam/composables'

    const supportsContainer = useCssSupportClient('containerQueries')
</script>

<template>
    <div v-if="supportsContainer" class="origam-masonry--css">
        <slot />
    </div>
    <div v-else class="origam-masonry--js">
        <slot />
    </div>
</template>
```

Use it when the flag drives **markup** (`v-if`, `<component :is>`, a different
DOM structure). For style-only branches — CSS variables, class toggles — plain
`useCssSupport()` is fine, because the post-hydration class flip is invisible to
the reconciler.

## Consumers

Verified by import statement, not by name grep:

| Symbol | `packages/ds/src` | `packages/tests` |
|:---|:---|:---|
| `useCssSupport` | **2** — `OrigamMasonry`, `composables/Parallax/parallax.composable.ts` | 2 |
| `useCssSupportClient` | **0** | 2 |
| `_resetCssSupportCache` | **0** | 3 |

`useCssSupportClient` has no consumer in the library itself: it is exported for
application code and exercised only by the unit specs. Do not describe it as
"used by" any component.

## Source

- `packages/ds/src/composables/Commons/cssSupport.composable.ts`
- `packages/ds/src/composables/Commons/cssSupportClient.composable.ts`
- `packages/ds/src/utils/Commons/css-support.util.ts` — the shared
  `rawSupports` / `resetSupportsCache` primitive.
- `packages/ds/src/consts/Commons/css-support.const.ts` — `FEATURE_QUERIES`.
