# useIntersectionObserver · useResizeObserver

The two DOM-observer wrappers. Both follow the same shape: a template ref to
place on the observed element, a read-only result, automatic re-observation when
that ref changes element, and `disconnect()` on `onBeforeUnmount`.

Both are also **silent no-ops** when their API is unavailable. That is the
single most important thing to know about them.

---

## `useIntersectionObserver`

```ts
function useIntersectionObserver (
    callback?: IntersectionObserverCallback,
    options?: MaybeRefOrGetter<IntersectionObserverInit | undefined>
): {
    intersectionRef: Ref<HTMLElement | undefined>
    isIntersecting: ShallowRef<boolean>
}
```

`callback` receives the raw entries; `isIntersecting` is maintained
independently as `!!entries.find(e => e.isIntersecting)`.

When `SUPPORTS_INTERSECTION` is false — an engine without the API, or SSR — **no
observer is created at all**: `isIntersecting` stays `false` forever and
`callback` is never invoked. There is no polyfill fallback, and nothing warns.

### `options` is reactive, and re-creates the observer

`rootMargin` and `root` are **native** options, frozen at construction: no
amount of reactivity can catch them up without rebuilding the observer. So
`options` accepts a ref or getter, and a change re-runs `createObserver()`.

### ⛔ Creation *and* subscription are deferred to `onMounted` — ADR-005, #682

Both live inside the `onMounted` callback, never in the body of
`useIntersectionObserver` (hence never in the caller's `setup()`):

```ts
onMounted(() => {
    createObserver()
    watch(() => toValue(options), () => createObserver())
})
```

Measured, not assumed. A caller that unwrapped `options` once during `setup()` —
`OrigamInfiniteScrollIntersect`'s former usage, via `observerOptions.value` —
froze the value **before** the ADR-005 resolver (a global `beforeCreate` hook,
which runs after the `setup()` body) could patch the prop; a theme aiming at
`margin` therefore never reached the observer.

Passing the ref itself, unwrapped, is **not enough** as long as the very first
read of `options` still happens during `setup()` — including through
`watch(() => toValue(options), …)`, whose initial evaluation (to capture
`oldValue`) is synchronous at call time. Verified empirically:
`Object.defineProperty` replaces the descriptor **without** triggering
`trigger()` for subscriptions already established on the old one, so a
`computed` — or a watcher — whose first evaluation predates `beforeCreate`
stays frozen on the pre-theme value forever, however many times it is read
afterwards. Only deferring the **first** read — creation *and* subscription —
past `beforeCreate` closes the hole; `onMounted` guarantees it in every case.

### Re-observation

A separate `watch(intersectionRef, …, { flush: 'post' })` unobserves the old
element (resetting `isIntersecting` to `false`) and observes the new one. It
returns early when no observer exists.

### Usage

```vue
<script setup lang="ts">
    import { useIntersectionObserver } from 'origam/composables'

    const { intersectionRef, isIntersecting } = useIntersectionObserver(
        undefined,
        () => ({ rootMargin: '200px' })
    )
</script>

<template>
    <div ref="intersectionRef" class="origam-infinite-scroll__sentinel">
        <slot v-if="isIntersecting" />
    </div>
</template>
```

### Consumers

**4** importers, verified by import: `OrigamInfiniteScrollIntersect`,
`OrigamProgressCircular`, `OrigamProgressLinear`,
`composables/Progress/progress.composable.ts`.

### Source

`packages/ds/src/composables/Commons/intersectionObserver.composable.ts`

---

## `useResizeObserver`

```ts
function useResizeObserver (
    callback?: ResizeObserverCallback,
    box: 'content' | 'border' = 'content'
): IResizeState
```

| Returned | Type | Meaning |
|:---|:---|:---|
| `resizeRef` | `Ref<HTMLElement \| null \| undefined>` | Template ref for the observed element. |
| `contentRect` | `DeepReadonly<Ref<DOMRectReadOnly \| undefined>>` | The last measured box. |

`box` picks **what** is measured:

- `'content'` — `entries[0].contentRect`, the native callback's own value.
- `'border'` — `entries[0].target.getBoundingClientRect()`, read at callback
  time.

Outside a browser (`!IN_BROWSER`), no observer is created: `contentRect` stays
`undefined` permanently, silently — the same guard shape as
`useIntersectionObserver`.

Re-observation uses the same `flush: 'post'` watch on `resizeRef`, passing each
value through `refElement` so a component instance is accepted as well as a raw
element, and resetting `contentRect` to `undefined` when the old element is
released.

### Usage

```vue
<script setup lang="ts">
    import { computed } from 'vue'
    import { useResizeObserver } from 'origam/composables'

    const { resizeRef, contentRect } = useResizeObserver(undefined, 'border')

    const width = computed(() => contentRect.value?.width ?? 0)
</script>

<template>
    <div ref="resizeRef" :data-width="width">
        <slot />
    </div>
</template>
```

### Consumers

**7** importers, verified by import: `OrigamColorPickerCanvas`,
`OrigamPagination`, `OrigamProgressCircular`, `OrigamSlideGroup`,
`OrigamVirtualScrollItem`, and the composables `createLayout`, `virtual`.

### Source

`packages/ds/src/composables/Commons/resizeObserver.composable.ts`

## Behaviour notes (both)

- Under jsdom, measured: `IN_BROWSER` and `SUPPORTS_INTERSECTION` are both
  `true`, both hooks construct their observer, and neither ever fires — jsdom's
  observers do not observe. `isIntersecting` reads `false` and `contentRect`
  reads `undefined`. **A unit test cannot verify observation here**; that
  belongs in Playwright.
- Neither returns a manual `stop()`: teardown is `onBeforeUnmount` only, so both
  are meant to be called from `setup()`. Outside one, the two behave
  differently — `useResizeObserver` constructs its `ResizeObserver` eagerly at
  call time, so it would leak; `useIntersectionObserver` only constructs inside
  `onMounted`, which never runs, so nothing is created and nothing observes.
