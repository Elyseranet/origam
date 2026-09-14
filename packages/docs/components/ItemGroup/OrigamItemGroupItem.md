# OrigamItemGroupItem

`<OrigamItemGroupItem>` is the child half of the
[`OrigamItemGroup`](/components/ItemGroup/OrigamItemGroup) selection primitive. It registers
itself with the nearest group, renders **no chrome of its own**, and hands
you the resolved selection state through its default slot so you paint the
option however you like.

> The exported name is `OrigamItemGroupItem` and the tag is
> `<origam-item-group-item>`. There is no `OrigamItem` component — the file
> `OrigamItem.story.vue` and the `origam-item` CSS class are historical
> spellings that survive inside the code, not a second component.

```vue
<template>
    <origam-item-group v-model="selected">
        <origam-item-group-item
                v-for="plan in plans"
                :key="plan.value"
                :value="plan.value"
        >
            <template #default="{ isSelected, toggle }">
                <button :aria-pressed="isSelected" @click="toggle">
                    {{ plan.label }}
                </button>
            </template>
        </origam-item-group-item>
    </origam-item-group>
</template>

<script setup lang="ts">
    import { ref } from 'vue'

    const plans = [
        { value: 's', label: 'Small' },
        { value: 'm', label: 'Medium' },
        { value: 'l', label: 'Large' }
    ]
    const selected = ref('m')
</script>
```

Nothing is selectable until you wire `toggle` (or `select`) yourself — the
component binds no `click` and no `keydown` handler.

## Rendered markup

```html
<div class="origam-item origam-item--selected">…slot…</div>
```

The root tag comes from `tag` (default `'div'`). The second class is the
resolved `selectedClass`, present only while the item is selected. The DS
ships **no CSS** for either class — they are hooks for your stylesheet.

## Props

`IItemGroupItemProps extends ICommonsComponentProps, ITagProps, IGroupItemProps`
(`item-group.interface.ts`). The selection props come from the generic
`IGroupItemProps`, shared with `OrigamTab`, `OrigamChip`, `OrigamBtnToggle`'s
buttons and `OrigamSlideGroup`'s slides.

| Prop            | Type      | Default | Description                                                                 |
|-----------------|-----------|---------|-----------------------------------------------------------------------------|
| `value`         | `any`     | `undefined` | Value this item contributes to the group's `modelValue`                 |
| `disabled`      | `boolean` | —       | Disables this item. Also forced `true` when the enclosing group is `disabled` |
| `selectedClass` | `string`  | `undefined` | Fallback class applied while selected — used **only** when the group's own `selectedClass` is falsy (the group defaults it to `'origam-item--selected'`, so this rarely takes effect) |
| `tag`           | `string`  | `'div'` | Root element tag, rendered through `<component :is>`                        |
| `id`            | `string`  | —       | Rendered on the root element                                                |
| `class` / `style` | —       | —       | Merged onto the root element                                                |

## Emits

| Event            | Payload              | Description                                                     |
|------------------|----------------------|-----------------------------------------------------------------|
| `group:selected` | `{ value: boolean }` | Fired whenever this item's own selection state flips. Emitted by `useGroupItem`'s `watch` on the CALLING instance (`groupItem.composable.ts:94`), so it lands on the item, not on the group. |

`update:modelValue` belongs to `<OrigamItemGroup>`, not to the item.

## Slots

| Slot      | Scope                                                            | Description        |
|-----------|------------------------------------------------------------------|--------------------|
| `default` | `{ isSelected, selectedClass, toggle, select, value, disabled }` | The item's content |

`isSelected` is this item's own boolean state, `toggle` / `select` operate on
this item specifically (no internal-id juggling, unlike the group's own slot
scope), and `selectedClass` is the resolved class array.

## Behaviour notes

- **Outside a group it throws at setup time.** `useGroupItem` is called with
  `required = true`, so it raises
  `[Origam] Could not find useGroup injection with symbol origam:item-group`
  (`groupItem.composable.ts:65`) before the component's own
  `if (!groupItem)` guard can run — that guard is unreachable.
- **No ARIA, no tabindex, no keyboard handling.** The component adds nothing.
  Give the slot content a real `<button>` (or set `tag="button"` and bind the
  handlers yourself) and supply `aria-pressed` / `aria-checked` to match your
  chosen role. Unrecognised attributes fall through to the root element.
- **Registration is on mount, unregistration on unmount**, with an internal
  counter id that never reaches the DOM.
- **No CSS variables.** The component ships no `<style>` block and declares no
  `--origam-item-group-item---*` token.

## Usage

### Multiple selection with a cap

```vue
<origam-item-group v-model="picked" multiple :max="2">
    <origam-item-group-item v-for="o in options" :key="o" :value="o">
        <template #default="{ isSelected, toggle, disabled }">
            <button :disabled="disabled" :aria-pressed="isSelected" @click="toggle">
                {{ o }}
            </button>
        </template>
    </origam-item-group-item>
</origam-item-group>
```

### Reacting to one item's own state

```vue
<origam-item-group-item :value="plan.value" @group:selected="onFlip">
    <template #default="{ isSelected, toggle }">
        <button :aria-pressed="isSelected" @click="toggle">{{ plan.label }}</button>
    </template>
</origam-item-group-item>

<script setup lang="ts">
    function onFlip (payload: { value: boolean }) {
        console.log('selected?', payload.value)
    }
</script>
```
