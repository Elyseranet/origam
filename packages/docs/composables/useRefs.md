# useRefs

Collects the template refs of a `v-for` list into an array, in index order.

## API

```ts
function useRefs<T extends object> (): {
    refs: Ref<(T | null | undefined)[]>
    updateRef: (e: T | null, i: number) => void
}
```

Bind `updateRef` as the list item's `:ref`, closing over the loop index:

```vue
<script setup lang="ts">
    import { useRefs } from 'origam/composables'

    const items = [ 'un', 'deux', 'trois' ]
    const { refs, updateRef } = useRefs<HTMLElement>()

    const focusFirst = () => refs.value.find(Boolean)?.focus()
</script>

<template>
    <ul>
        <li
            v-for="(item, index) in items"
            :key="item"
            :ref="(el) => updateRef(el as HTMLElement | null, index)"
        >
            {{ item }}
        </li>
    </ul>
    <button type="button" @click="focusFirst">Focus</button>
</template>
```

## ⛔ The array does not shrink

`onBeforeUpdate` resets `refs.value` to `[]`, and Vue refills the indices during
the re-render that follows. But Vue also calls the `ref` function of every
**unmounted** vnode with `null`, and those calls carry the *old* indices — so
the freed slots come back as `null` rather than disappearing.

Measured, a list of 3 items reduced to 1:

```
3 items   refs = [<li>1, <li>2, <li>3]        length 3
1 item    refs = [<li>1, null, null]          length 3
```

No stale element is retained — that part of the design works. But
`refs.value.length` is **not** the list's length, and the array has holes.
Filter before iterating (`refs.value.filter(Boolean)`), and never index blindly.

## Behaviour notes

- `refs` is typed `Ref<(T | null | undefined)[]>`; the `undefined` arm covers a
  slot Vue has not filled yet in the current render pass.
- `updateRef` performs no bounds check and no deduplication — two items sharing
  an index overwrite each other.
- There is no unmount cleanup: the array simply dies with the component's scope.

## Consumers

**1** component, verified by import: `OrigamPagination`.

## Source

`packages/ds/src/composables/Commons/refs.composable.ts`
