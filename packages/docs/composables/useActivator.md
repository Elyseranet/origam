# useActivator · useDelay

The activator wiring of every floating component — Menu, Tooltip, Dialog — and
the small timer hook it delegates its open/close delays to.

---

## `useActivator`

```ts
function useActivator (
    props: IActivatorProps,
    { isActive, isTop }: { isActive: Ref<boolean>, isTop: Ref<boolean> }
): {
    activatorEl: Ref<HTMLElement | undefined>
    activatorRef: Ref<HTMLElement | undefined>
    target: ComputedRef<HTMLElement | [x: number, y: number] | undefined>
    targetEl: ComputedRef<HTMLElement | undefined>
    targetRef: Ref<HTMLElement | undefined>
    activatorEvents: ComputedRef<Record<string, EventListener>>
    contentEvents: ComputedRef<Record<string, EventListener>>
    scrimEvents: ComputedRef<Record<string, EventListener>>
}
```

Derives, from `openOnHover` / `openOnFocus` / `openOnClick` /
`openOnContextMenu`, the three handler bags to spread on the **activator**, the
**content** and the **scrim**, and resolves the positioning target — including
the `'cursor'` mode, which follows the coordinates of the last click.

### How the four `openOn*` props resolve

They are not independent booleans; each falls back on the absence of the
others:

```ts
openOnFocus       = props.openOnFocus       || (props.openOnFocus == null && props.openOnHover)
openOnClick       = props.openOnClick       || (props.openOnClick == null && !props.openOnHover && !openOnFocus)
openOnContextMenu = props.openOnContextMenu || (props.openOnContextMenu == null && !props.openOnHover && !openOnClick && !openOnFocus)
```

Read it as: hover implies focus; click is the default unless hover or focus took
it; context-menu only when nothing else claimed the interaction. The `== null`
tests mean an explicit `false` behaves differently from an omitted prop.

### The three bags

| Bag | Contains, when enabled |
|:---|:---|
| `activatorEvents` | `onClick`, `onContextmenu`, `onMouseenter`/`onMouseleave`, `onFocus`/`onBlur`. |
| `contentEvents` | `onMouseenter`/`onMouseleave`, `onFocusin`/`onFocusout`, and `onClick` when `closeOnContentClick` — which also calls `menu?.closeParents()`. |
| `scrimEvents` | `onMouseenter` (first enter only, via `firstEnter`) / `onMouseleave`, hover mode only. |

`handleMouseEnter` ignores an event whose `sourceCapabilities.firesTouchEvents`
is true — a synthesised mouse event from a touch. `handleFocus` ignores anything
that does not match `:focus-visible`, so keyboard focus opens the surface and a
mouse click on the activator does not open it twice.

### Delay, not timing

Opening and closing go through `runOpenDelay` / `runCloseDelay` from
[`useDelay`](#usedelay). `useActivator` decides **when** to call them; it never
measures time itself. The callback it passes re-checks the hover/focus state
before committing, so a pointer that leaves during the delay cancels the open.

### Lifecycle — three separate teardowns

1. **Cursor reset timer (#753).** `watch(isActive, …, { flush: 'post' })` arms a
   `setTimeout` to clear `cursorTarget` when the surface closes. The file's own
   note says this defect was *absent from the ticket's list, found by my own
   sweep*: the watch stops at dispose, but a timer armed on the **last tick
   before unmount** survived and then wrote `cursorTarget.value` on a destroyed
   scope. The body dereferences no global, so it is not the #706 profile — it is
   a post-mortem reactive write, and the same call #719 made for `useSsrBoot`:
   cancelling costs one line and removes the window. `tryOnScopeDispose` clears
   it.
2. **External-activator scope.** `watch(() => !!props.activator, …)` starts a
   dedicated `effectScope` only when an external activator selector is supplied
   (and only `IN_BROWSER`), and stops it otherwise. No permanent scope when the
   feature is unused. `onScopeDispose` stops it too.
3. **`activatorRef` → `activatorEl`.** A `watchEffect` + `nextTick` copies the
   resolved element across.

### Usage

```vue
<script setup lang="ts">
    import { ref } from 'vue'
    import { useActivator } from 'origam/composables'
    import type { IActivatorProps } from 'origam/interfaces'

    const props = defineProps<IActivatorProps>()

    const isActive = ref(false)
    const isTop = ref(true)

    const { activatorRef, activatorEvents, contentEvents, targetEl } = useActivator(
        props,
        { isActive, isTop }
    )
</script>

<template>
    <span ref="activatorRef" v-bind="activatorEvents">
        <slot name="activator" />
    </span>
    <div v-if="isActive" v-bind="contentEvents" :data-anchored="!!targetEl">
        <slot />
    </div>
</template>
```

### Behaviour notes

- **Requires an active instance** — `getCurrentInstance('useActivator')`.
- `isHovered`, `isFocused` and `firstEnter` are plain `let` variables, not refs:
  they gate the delay callback and are deliberately non-reactive.
- `target` resolution order: the cursor coordinates (when `target === 'cursor'`
  and a click has been recorded), then `targetRef`, then
  `getTargetActivator(props.target, vm)`, then `activatorEl`. `targetEl` is the
  same value narrowed to an element — `undefined` in cursor mode, since that
  branch yields a coordinate pair.

### Consumers

**2** importers, verified by import: `OrigamOverlay` and
`utils/Commons/activator.util.ts`. Every Menu / Tooltip / Dialog reaches it
through `OrigamOverlay`, not directly.

### Source

`packages/ds/src/composables/Commons/activator.composable.ts`

---

## `useDelay`

```ts
function useDelay (props: IDelayProps, cb?: (value: boolean) => void): {
    clearDelay: () => void
    runOpenDelay: () => Promise<unknown>
    runCloseDelay: () => Promise<unknown>
}
```

Defers a state change by `props.openDelay` / `props.closeDelay` and calls `cb`
with `true` / `false` once elapsed. It knows nothing about hover, focus or
click.

**Each call cancels the pending delay** (`cancelRef.current()`) before scheduling
a new one, so a fast enter/leave never stacks two callbacks — only the last one
lands. Measured with `openDelay: 100` / `closeDelay: 200`:

```
runOpenDelay() ; +99 ms     callback saw []
               ; +101 ms    callback saw [true]
runOpenDelay() ; runCloseDelay() ; +500 ms
                            callback saw [true, false]
```

The second open never fired: the close that followed it cancelled it.

### ⛔ `0` and "absent" do not behave the same

`defer` tests `timeout === 0` literally:

| `openDelay` | behaviour | cancellable? |
|:---|:---|:---|
| `0` | `cb` runs **synchronously**, inside `runOpenDelay()` | **no** — the returned canceller is a no-op |
| absent | `Number(undefined)` is `NaN`, so `setTimeout(cb, NaN)` → next tick | yes |

Measured: with `openDelay: 0`, the callback had already fired before
`runOpenDelay()` returned. With the prop absent, nothing had fired at 0 ms and
the callback arrived after 1 ms. `clearDelay()` on a real delay suppresses it
entirely (measured: nothing fired after 200 ms).

### No automatic teardown

A delay armed just before unmount is not cancelled by this composable, and
`useActivator` — its only consumer — does not cancel it on scope disposal
either. Only the `cursorTarget` timer is.

### Usage

```ts
import { ref } from 'vue'
import { useDelay } from 'origam/composables'
import type { IDelayProps } from 'origam/interfaces'

const props = defineProps<IDelayProps>()
const isActive = ref(false)

const { runOpenDelay, runCloseDelay, clearDelay } = useDelay(props, (open) => {
    isActive.value = open
})

const onEnter = () => runOpenDelay()
const onLeave = () => runCloseDelay()
const onDestroy = () => clearDelay()
```

### Consumers

**1** importer in `packages/ds/src`, verified by import:
`composables/Commons/activator.composable.ts`. Plus one unit spec.

### Source

`packages/ds/src/composables/Commons/delay.composable.ts`

## Related

- [`useLocationStrategies`](./useLocationStrategies.md) — the positioning half
  of the same overlay.
- [`useToggleScope`](./useToggleScope.md) — the scope pattern `useActivator`
  hand-rolls for its external-activator branch.
