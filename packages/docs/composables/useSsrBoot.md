# useSsrBoot · useHydration

Two ways to answer "has the client taken over yet?". They are **not**
interchangeable: `useSsrBoot` is self-contained and suppresses a transition
flash; `useHydration` depends on `createOrigam()` and reports the hydration
state as a plain boolean.

---

## `useSsrBoot`

```ts
function useSsrBoot (): {
    ssrBootStyles: ComputedRef<{ transition: string } | []>
    isBooted: Readonly<ShallowRef<boolean>>
}
```

Prevents a CSS transition from firing between the SSR render and hydration:
while `isBooted` is false, `ssrBootStyles` forces
`transition: none !important`.

`isBooted` flips **one frame after mount** — `onMounted` + a single
`requestAnimationFrame` — not at mount itself, so the initial layout settles
before transitions are allowed.

Measured:

```
at mount          isBooted = false   ssrBootStyles = {"transition":"none !important"}
after 1 frame     isBooted = true    ssrBootStyles = []
```

### ⚠️ Two different return shapes on one key

`ssrBootStyles` is an **object** while blocked and an **empty array** once
booted. Both are valid for a Vue `:style` binding, so bind it without
normalising — but do not `Object.keys()` it blindly.

### The boot frame is cancelled on dispose — #719

The frame used to outlive the component: nothing cancelled it, so an owner
unmounted inside the same frame left a continuation queued on an environment
that may already be gone (the #706 family).

The file's own note is honest about the severity: *this* callback body only
writes a ref and dereferences no global, so it cannot itself throw
`ReferenceError: window is not defined`. What it does do is write to a disposed
scope's reactive state one frame after teardown. Cancelling costs one line —

```ts
onScopeDispose(() => {
    if (frame !== -1) { window.cancelAnimationFrame(frame); frame = -1 }
})
```

— and removes the window entirely, rather than arguing about whether writing to
a dead ref is harmless today and will stay harmless tomorrow.

### Usage

```vue
<script setup lang="ts">
    import { useSsrBoot } from 'origam/composables'

    const { ssrBootStyles, isBooted } = useSsrBoot()
</script>

<template>
    <aside class="origam-drawer" :style="ssrBootStyles" :data-booted="isBooted">
        <slot />
    </aside>
</template>
```

### Behaviour notes

- `isBooted` is wrapped in `readonly()` — the consumer cannot flip it.
- It injects nothing and requires no plugin; a bare `mount()` is enough.
- `onMounted` never runs on the server, so `window.requestAnimationFrame` is
  never reached there.

### Consumers

**9** components, verified by import: `AppBar`, `BottomNav`, `Counter`,
`Drawer`, `ListGroup`, `Main`, `Messages`, `SystemBar`, `WindowItem`.

### Source

`packages/ds/src/composables/Commons/ssrBoot.composable.ts`

---

## `useHydration`

```ts
function useHydration (): ShallowRef<boolean>
```

Returns a ref that is `false` until client-side hydration, then `true` in an
`onMounted` — a way to defer hydration-sensitive rendering without
`<ClientOnly>`.

The SSR flag comes from `useDisplay().ssr`. When the display instance was never
created in SSR mode, the ref starts at `true` directly: no artificial delay in a
client-only app. Outside a browser (`!IN_BROWSER`) it returns a ref frozen at
`false`.

### ⛔ It requires `createOrigam()`

Because it calls `useDisplay()`, whose injection only exists when the plugin is
installed. Measured, mounting a component **without** `createOrigam()`:

```
Could not find Origam display injection
```

It throws. That makes it a different animal from `useSsrBoot`, which injects
nothing — do not reach for `useHydration` in a standalone utility or in a unit
test that does not install the plugin.

### Usage

```vue
<script setup lang="ts">
    import { useHydration } from 'origam/composables'

    const isMounted = useHydration()
</script>

<template>
    <div v-if="isMounted" class="origam-overlay__content">
        <slot />
    </div>
</template>
```

### Consumers

**1** component, verified by import: `OrigamOverlay`.

### Source

`packages/ds/src/composables/Commons/hydration.composable.ts`

## Related

- [`useCssSupport`](./useCssSupport.md) — `useCssSupportClient` solves the same
  SSR/hydration asymmetry for a single feature flag.
