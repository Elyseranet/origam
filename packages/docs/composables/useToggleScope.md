# useToggleScope

Runs a function inside a **dedicated `EffectScope` that exists only while a
reactive boolean is true**, and stops that scope — and every watcher, computed
and effect created inside it — the moment the boolean goes false.

It is the DS's answer to "this watcher should not be running right now": rather
than guarding the callback body, the watcher is not created at all.

## API

```ts
function useToggleScope (
    source: WatchSource<boolean>,
    fn: (reset: () => void) => void
): void
```

| Parameter | Role |
|:---|:---|
| `source` | Any `WatchSource<boolean>` — a ref, a getter. Watched with `immediate: true`. |
| `fn` | Run inside the scope. **If it declares a parameter**, it receives a `reset`. |

Returns nothing. Everything is driven by the scope's own lifetime.

## `reset`

The `fn.length > 0` test is what decides whether `reset` is passed at all:

```ts
scope.run(() => fn.length
    ? fn(() => { scope?.stop(); start() })
    : (fn as () => void)()
)
```

Calling `reset()` stops the current scope **and starts a new one immediately**,
re-running `fn` from scratch — without waiting for a false→true cycle on
`source`. It is how a consumer re-arms its own effects when a configuration
changes.

Measured, on a ref source:

```
source = false      runs = []
source = true       runs = ["run"]
reset()             runs = ["run","run"]
false, then true    runs = ["run","run","run"]
```

## Teardown

Three paths stop the scope, and all three are wired:

1. `source` goes false → `scope.stop()`, `scope = undefined`.
2. `reset()` → `scope.stop()` then a fresh `start()`.
3. The **owning** scope is disposed → `onScopeDispose(() => scope?.stop())`.

Nothing scheduled by `fn` survives its scope, provided `fn` registers its own
cleanup with `onScopeDispose` — which is exactly what
[`useLocationStrategies`](./useLocationStrategies.md) does for its `resize`
listener.

## Usage

Only listen while the component is open:

```vue
<script setup lang="ts">
    import { ref, watch } from 'vue'
    import { useToggleScope } from 'origam/composables'

    const isOpen = ref(false)

    useToggleScope(isOpen, () => {
        watch(() => window.innerWidth, () => {
            // recomputed only while the panel is open
        })
    })
</script>

<template>
    <button type="button" @click="isOpen = !isOpen">Basculer</button>
</template>
```

With `reset`, re-arming on a configuration change — the shape
`useLocationStrategies` uses:

```ts
useToggleScope(() => !!(isActive.value && props.strategy), (reset) => {
    watch(() => props.strategy, reset)

    onScopeDispose(() => window.removeEventListener('resize', handleResize))
    window.addEventListener('resize', handleResize, { passive: true })
})
```

## Behaviour notes

- **`immediate: true`.** If `source` is already true at call time, `fn` runs
  synchronously, during `setup()`. A read performed there is an *eager* read in
  the ADR-005 sense — the reason `useIntersectionObserver` defers both its
  creation and its subscription into `onMounted` rather than using this hook.
- The watch only starts a scope when there is none (`active && !scope`), so a
  source that re-emits `true` does not stack scopes.
- No parameter, no `reset`: an arrow function written `() => { … }` has
  `length === 0` and is called with no argument.

## Consumers

**9** importers in `packages/ds/src`, verified by import: `OrigamAppBar`,
`OrigamDrawer`, `OrigamOverlay`, `OrigamSnackbar`, `OrigamVirtualScroll`, and
the composables `locationStrategies`, `stack`, `vModel`, `validation`.

## Source

`packages/ds/src/composables/Commons/toggleScope.composable.ts`

## Related

- [`useVModel`](./useVModel.md) — mirrors the prop only while uncontrolled.
- [`useValidation`](./useValidation.md) — one scope per `validateOn` axis.
- [`useLocationStrategies`](./useLocationStrategies.md) — the `reset` pattern.
