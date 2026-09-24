# useScopeId

Reads the current component's `<style scoped>` marker — the `data-v-xxxxxxxx`
attribute Vue stamps on the elements a scoped stylesheet targets — and returns
it as an attribute bag ready to spread with `v-bind`.

## Why it exists

Vue applies a scoped attribute to the elements it renders **inside the
component's own DOM subtree**. A node moved out of that subtree by
`<Teleport>` — a menu panel, a tooltip bubble, a dialog surface, an overlay —
loses it, and the parent's scoped rules stop matching. Re-spreading the bag on
the teleported root puts the marker back.

## API

```ts
function useScopeId (): {
    scopeId: Record<string, string> | undefined
}
```

`scopeId` is `{ 'data-v-1a2b3c4d': '' }` when the component has a scoped
style block, and `undefined` when it does not. Measured on a component built
without `<style scoped>`: the returned object is `{ scopeId: undefined }` —
the key is present, its value is not.

Spreading `undefined` is a no-op in an object literal, which is why call sites
spread unconditionally.

## Usage

The pattern used by all six consumers, verbatim from `OrigamMenu.vue`:

```vue
<script setup lang="ts">
import { useScopeId } from 'origam/composables'

const props = defineProps<{ overlayProps?: Record<string, unknown> }>()

const { scopeId } = useScopeId()
</script>

<template>
    <OrigamOverlay v-bind="{ ...overlayProps, ...scopeId }">
        <slot />
    </OrigamOverlay>
</template>
```

## Behaviour notes

- **Requires an active instance.** It calls `getCurrentInstance('useScopeId')`,
  which throws `[Origam] useScopeId must be called from inside a setup
  function` outside `setup()`.
- **Read once, not reactive.** `vm.vnode.scopeId` is read at setup and the bag
  is a plain object — the scope id of a component never changes at runtime, so
  there is nothing to track.
- The value it reads is the scope of the **component calling it**, not of its
  parent. A teleporting component therefore re-attaches *its own* scope to the
  teleported node.

## Consumers

**6** components, all of them teleporting or overlay-based:
`Dialog`, `Drawer`, `Menu`, `Overlay`, `Snackbar`, `Tooltip`. Plus
`packages/tests/TU/composables/Commons/scopeId.composable.spec.ts`.

## Source

`packages/ds/src/composables/Commons/scopeId.composable.ts`

## Related

- [`useStyle`](./useStyle.md) — the other half of the styling story for
  teleported surfaces: a `#id { … }` rule in `<head>` is not scope-dependent
  at all.
