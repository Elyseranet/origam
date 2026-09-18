# useLazy

Lazy content for a floating or conditional component: the content is not
mounted until the component is activated **once**, then stays mounted until an
explicit exit hook releases it.

## API

```ts
function useLazy (props: { eager: boolean }, active: Ref<boolean>): {
    isBooted: ShallowRef<boolean>
    hasContent: ComputedRef<boolean>
    onAfterLeave: () => void
}
```

| Member | Meaning |
|:---|:---|
| `isBooted` | The component has been activated at least once since the last release. |
| `hasContent` | `isBooted \|\| props.eager \|\| active.value` — bind this to your `v-if`. |
| `onAfterLeave` | Releases the content. Bind on the leave transition's end. |

## The lifecycle, measured

`props.eager: false`:

```
initial               hasContent = false   isBooted = false
active → true         hasContent = true    isBooted = true
active → false        hasContent = true    isBooted = true     ← still mounted
onAfterLeave()        hasContent = false   isBooted = false
```

The key point is the third line. Flipping `active` back to `false` does **not**
unmount anything; it is `onAfterLeave` that does, which is why it must be wired
to the transition's `@after-leave` and not simply forgotten. Between the two,
the content is hidden but alive — a form inside a menu keeps its state across a
close/reopen only for as long as `onAfterLeave` has not fired.

`props.eager: true`: `hasContent` is `true` from the start, and
`onAfterLeave()` is ignored — measured, still `true` after the call. An eager
component's content is mounted forever.

## Usage

```vue
<script setup lang="ts">
    import { ref } from 'vue'
    import { useLazy } from 'origam/composables'

    const props = withDefaults(defineProps<{ eager?: boolean }>(), { eager: false })

    const isActive = ref(false)
    const { hasContent, onAfterLeave } = useLazy(props, isActive)
</script>

<template>
    <Transition name="fade" @after-leave="onAfterLeave">
        <div v-if="hasContent" v-show="isActive" class="origam-overlay__content">
            <slot />
        </div>
    </Transition>
</template>
```

## Behaviour notes

- `watch(active, () => isBooted.value = true)` has **no** `immediate`, so a
  component whose `active` is already `true` at setup only boots through
  `hasContent`'s `active.value` term until the first change.
- `isBooted` is a `shallowRef` and is returned **writable** — nothing stops a
  consumer from setting it.
- The signature types `props` structurally as `{ eager: boolean }`, not as a
  named interface: any props object carrying an `eager` boolean fits.
- `props.eager` is read **inside** `hasContent`'s computed, so it is
  ADR-005-safe here. Note that the detector
  `packages/ds/scripts/guards/lib/setup-reads.mjs` flags `TabPanel [eager]` —
  an eager read on the **consumer** side, not in this composable.

## Consumers

**4** components, verified by import: `OrigamExpansionPanelContent`,
`OrigamOverlay`, `OrigamTabPanel`, `OrigamWindowItem`. Plus one unit spec.

## Source

`packages/ds/src/composables/Commons/lazy.composable.ts`

## Related

- [`useVModel`](./useVModel.md) — supplies the `active` ref at every call site.
