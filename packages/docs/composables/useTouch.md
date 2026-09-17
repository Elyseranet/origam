# useTouch · useVelocity

The swipe-to-open/close gesture of an edge-anchored panel, and the sliding
velocity history it uses to detect a fling.

---

## `useTouch`

```ts
function useTouch (options: {
    isActive: Ref<boolean>
    isTemporary: Ref<boolean>
    width: Ref<number>
    touchless: Ref<boolean>
    position: Ref<'left' | 'right' | 'top' | 'bottom'>
}): {
    isDragging: ShallowRef<boolean>
    dragProgress: ShallowRef<number>
    dragStyles: ComputedRef<{ transform: string, transition: string } | undefined>
}
```

Everything arrives as refs — there is no props object, and no ADR-005 exposure.
`isActive` is **written** by the hook at the end of a gesture.

### The gesture, step by step

1. **`touchstart`** — ignored outright when `touchless.value`. The gesture only
   arms when the finger starts *in the edge zone* (`TOUCH_EDGE_ZONE_PX` from the
   anchored side), *inside the already-open panel*, or when the panel is both
   active and temporary. It then records the start point and seeds `offset` /
   `dragProgress`.
2. **`touchmove`** — the drag direction is decided at the first crossing of
   `TOUCH_DRAG_THRESHOLD_PX`: the movement must exceed the threshold **on the
   panel's own axis and dominate the other one**, otherwise the gesture is
   abandoned to the page. A non-cancelable move also abandons it.
3. **`touchend`** — the panel settles by **velocity** first: a fling above
   `TOUCH_FLING_VELOCITY_X` / `…_Y` on the dominant axis sets `isActive` from the
   fling direction (`TOUCH_OPEN_DIRECTION_BY_POSITION`). Otherwise it settles on
   `dragProgress > TOUCH_SETTLE_PROGRESS`.

### `dragStyles`

While dragging, it emits a `transform: translate(…)` tied directly to
`dragProgress`, plus `transition: 'none'` so the panel tracks the finger without
lag. It is **`undefined`** when not dragging — it is the consuming component's
job to restore its normal transition once `isDragging` falls back to `false`.

### `touchless` does not remove the listeners

It is checked at the top of `handleTouchstart` only. The three `window`
listeners stay attached for the component's whole life; a touchless panel simply
never arms a gesture. `touchmove` and `touchend` are not gated by it at all —
they are inert because `maybeDragging` and `isDragging` never became true.

### Lifecycle

`onMounted` attaches `touchstart` / `touchmove` / `touchend` on `window`
(`passive: true` for start and end, `passive: false` for move, which needs
`preventDefault`), and `onBeforeUnmount` removes all three. Since registration
happens in `onMounted`, nothing touches `window` during SSR.

### Usage

```vue
<script setup lang="ts">
    import { computed, ref, toRef } from 'vue'
    import { useTouch } from 'origam/composables'

    const props = withDefaults(defineProps<{
        modelValue?: boolean
        touchless?: boolean
        position?: 'left' | 'right' | 'top' | 'bottom'
    }>(), { modelValue: false, touchless: false, position: 'left' })

    const isActive = ref(props.modelValue)

    const { isDragging, dragStyles } = useTouch({
        isActive,
        isTemporary: ref(true),
        width: ref(256),
        touchless: toRef(props, 'touchless'),
        position: computed(() => props.position)
    })
</script>

<template>
    <aside class="origam-drawer" :style="dragStyles" :data-dragging="isDragging">
        <slot />
    </aside>
</template>
```

### Consumers

**1** component, verified by import: `OrigamDrawer`.

### Source

`packages/ds/src/composables/Commons/touch.composable.ts`

---

## `useVelocity`

```ts
function useVelocity (): {
    addMovement: (e: TouchEvent) => void
    endTouch: (e: TouchEvent) => void
    getVelocity: (id: number) => {
        x: number
        y: number
        readonly direction: 'left' | 'right' | 'up' | 'down'
    }
}
```

Keeps a sliding history of positions **per touch identifier** in a
`CircularBuffer` of size `HISTORY`, and computes an impulse velocity from the
samples inside the most recent `HORIZON` window only.

### ⛔ `getVelocity` throws when the id has no samples

```ts
throw new Error(`No samples for touch id ${id}`)
```

Measured verbatim: `useVelocity().getVelocity(42)` on a fresh instance throws
`No samples for touch id 42`. A caller must have called `addMovement` at least
once for that touch, and must never call `getVelocity` **after** `endTouch`,
which deletes the history for that identifier.

### `direction` is a getter

It is recomputed on every read, never cached, from whichever axis has the larger
absolute velocity. When both are equal it calls `oops()` — the DS's
"unreachable" helper.

### Usage

```ts
import { useVelocity } from 'origam/composables'

const { addMovement, endTouch, getVelocity } = useVelocity()

const onTouchMove = (e: TouchEvent) => addMovement(e)

const onTouchEnd = (e: TouchEvent) => {
    const id = e.changedTouches[0].identifier
    const { x, direction } = getVelocity(id)   // before endTouch, never after

    if (Math.abs(x) > 400) {
        // eslint-disable-next-line no-console
        console.log('fling', direction)
    }

    endTouch(e)
}
```

Note the ordering: `useTouch` calls `addMovement(e)` on `touchend` **before**
reading the velocity, so the release point is part of the impulse.

### Consumers

**1** importer in `packages/ds/src`, verified by import:
`composables/Commons/touch.composable.ts`.

### Source

- `packages/ds/src/composables/Commons/velocity.composable.ts`
- `packages/ds/src/utils/Commons/velocity.util.ts` —
  `calculateImpulseVelocity`.
- `packages/ds/src/classes/Commons/circular-buffer.class.ts`.
