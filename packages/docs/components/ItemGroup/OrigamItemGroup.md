# OrigamItemGroup

`<OrigamItemGroup>` is a renderless selection container: it tracks which of
its registered `<origam-item>` children are selected and exposes
`select` / `toggle` / `next` / `prev`, but renders **no visual chrome of its
own** (no border, background, layout) — you drive 100% of the visual through
the default slot. It is the same `useGroup` mechanism used internally by
`OrigamTabs`, `OrigamBtnToggle`, `OrigamChipGroup` and `OrigamSlideGroup`,
exposed here as a standalone building block for custom selectable
collections (plan pickers, segmented choices, card grids…).

`<OrigamItem>` is the required child: it registers itself with the nearest
`<OrigamItemGroup>` and throws if used outside one.

## Basic usage

```vue
<template>
  <origam-item-group v-model="selected">
    <origam-item v-for="plan in plans" :key="plan.value" :value="plan.value">
      <template #default="{ isSelected, toggle }">
        <origam-card
          border
          :class="{ 'is-selected': isSelected }"
          @click="toggle"
        >
          {{ plan.label }}
        </origam-card>
      </template>
    </origam-item>
  </origam-item-group>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const plans = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
]
const selected = ref('m')
</script>
```

Neither `<origam-item-group>` nor `<origam-item>` binds a native `click` or
`keydown` handler for you — the story above wires `@click="toggle"` inside
the slot by hand, and that pattern is required: without it, nothing is
selectable.

## Parent/child model

- `<OrigamItemGroup>` owns `modelValue` (single value, or an array when
  `multiple` is set) and provides the shared selection state via
  `useGroup` / `ORIGAM_ITEM_GROUP_KEY`.
- Each `<OrigamItem>` registers itself on mount (`useGroupItem`) with an
  auto-generated internal id and its own `value` prop, and unregisters on
  unmount.
- `modelValue` is expressed in terms of each item's `value` — internally the
  group maps values to registration ids and back (`getIds` / `getValues`),
  so consumers never see the internal ids.
- An `<OrigamItem>` rendered outside of an `<OrigamItemGroup>` throws at
  setup time — but not the message the guard in `OrigamItem.vue:53-55` would
  suggest. `useGroupItem` is called with `required = true` (the default), so
  when no group injection is found, `useGroupItem` itself throws first
  (`group.composable.ts:51-54`), before `OrigamItem.vue`'s own
  `if (!groupItem)` check can ever run. The message actually thrown is:
  `[Origam] Could not find useGroup injection with symbol origam:item-group`.

## Selection modes

```vue
<template>
  <!-- single selection (default) -->
  <origam-item-group v-model="single">
    <origam-item v-for="o in options" :key="o" :value="o">
      <template #default="{ isSelected, toggle }">…</template>
    </origam-item>
  </origam-item-group>

  <!-- multiple selection -->
  <origam-item-group v-model="multi" multiple>
    <origam-item v-for="o in options" :key="o" :value="o">
      <template #default="{ isSelected, toggle }">…</template>
    </origam-item>
  </origam-item-group>

  <!-- mandatory: always at least one item selected -->
  <origam-item-group v-model="always" mandatory>
    <origam-item v-for="o in options" :key="o" :value="o">
      <template #default="{ isSelected, toggle }">…</template>
    </origam-item>
  </origam-item-group>

  <!-- max: caps how many items can be selected at once (multiple only) -->
  <origam-item-group v-model="capped" multiple :max="2">
    <origam-item v-for="o in options" :key="o" :value="o">
      <template #default="{ isSelected, toggle }">…</template>
    </origam-item>
  </origam-item-group>
</template>
```

- `mandatory` — on mount, if nothing is selected, the first non-disabled
  item is auto-selected; afterwards, the last remaining selected item can't
  be deselected (single mode) and the last item in a multi-selection can't
  be removed either.
- `max` — only enforced in `multiple` mode: once `max` items are selected,
  further selections are ignored until one is deselected.
- `disabled` (on the group) forces every descendant item's `disabled` to
  `true`, in addition to whatever each `<origam-item>` sets on its own
  (an item can still be individually disabled without disabling the group).

## Selected item styling

```vue
<template>
  <origam-item-group v-model="selected" selected-class="plan-card--active">
    <origam-item v-for="plan in plans" :key="plan.value" :value="plan.value">
      <template #default="{ isSelected, toggle, selectedClass }">
        <div :class="['plan-card', selectedClass]" @click="toggle">
          {{ plan.label }}
        </div>
      </template>
    </origam-item>
  </origam-item-group>
</template>
```

The group's `selectedClass` **always wins** over an item's own
`selected-class` prop, not the other way around: `useGroupItem` resolves it
as `group.selectedClass.value ? group.selectedClass.value : props.selectedClass`
(`group.composable.ts:74-80`), and the group's `selectedClass` prop defaults
to `'origam-item--selected'` (`OrigamItemGroup.vue:41`) — so it is truthy
unless you explicitly clear it, which means a per-item `selected-class` is
only ever used when the group's own prop has been unset.

`<OrigamItemGroup>` also wraps its default slot in an
`<origam-defaults-provider>` seeded with `{ 'origam-item': { selectedClass }
}` (`OrigamItemGroup.vue:54-60`). That looks like the mechanism pushing the
default down, but it has **no effect here**: `<OrigamItem>` never calls
`useDefaults()`, so it never reads from that provider — the resolution
above (through the group injection) is the only path that actually runs.

The class (or array of classes) is present in the item's slot scope while
that item is selected, and it **is** applied automatically: `OrigamItem.vue`
pushes `groupItem.selectedClass.value` into its own root element's `class`
binding, alongside the fixed `origam-item` class (`OrigamItem.vue:72-78`).
Since the DS ships no CSS for `.origam-item` / `origam-item--selected` (see
"CSS variables" below), that class alone won't visibly style anything — you
still typically bind `selectedClass` onto your own inner markup (as in the
example above) to get an actual visual effect, but that's for styling
purposes, not because the class is otherwise missing from the DOM.

## Programmatic navigation

`next()` / `prev()` step the selection to the following/previous
non-disabled item (wrapping around). They are designed for single-selection
mode: in `multiple` mode they still run (after logging a console warning),
and since they replace the selection with a single resolved id, calling
`next()` / `prev()` while several items are selected collapses that
selection down to just one item. Neither is wired to any keyboard event by
default — arrow-key navigation, if you want it, has to be added by the
consumer:

```vue
<template>
  <origam-item-group
    ref="groupRef"
    v-model="selected"
    @keydown.right="groupRef?.next()"
    @keydown.left="groupRef?.prev()"
  >
    …
  </origam-item-group>
</template>
```

`next` / `prev` / `select` are exposed both through the component ref
(`defineExpose`) and through the default slot's scope (`{ isSelected, select,
next, prev, selected }`) — note that the slot-scope `isSelected` / `select`
operate on internal numeric item ids, not on `value`; in practice, the
per-item `isSelected` / `toggle` exposed by each `<origam-item>`'s own slot
(used throughout this page) is the ergonomic path.

## Props

`IItemGroupProps extends ICommonsComponentProps, ITagProps, IGroupProps`
(`item-group.interface.ts:21`) — the selection-related props (`modelValue`,
`multiple`, `mandatory`, `max`, `disabled`, `selectedClass`) come from the
generic `IGroupProps` (`Commons/group.interface.ts:27-34`), the same
interface `OrigamTabs`, `OrigamBtnToggle`, `OrigamChipGroup` and
`OrigamSlideGroup` build their own selection surface on; `tag` from
`ITagProps`; `id`/`class`/`style` from `ICommonsComponentProps`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `any` | — | Selected value (or array of values when `multiple`) |
| `multiple` | `boolean` | — | Allow more than one selected item |
| `mandatory` | `boolean` | — | Keep at least one item selected at all times |
| `max` | `number` | — | Cap on simultaneous selections (multiple mode only) |
| `disabled` | `boolean` | — | Disables every descendant item |
| `selectedClass` | `string` | `'origam-item--selected'` | Class name pushed to descendant items' slot scope while selected |
| `tag` | `string` | `'div'` | Root element tag |
| `id` | `string` | — | Declared on the interface, but not bound anywhere in the template — passing it has no effect on the rendered element |
| `class` / `style` | `ICommonsComponentProps` | — | Passthrough on the root element |

### `<OrigamItem>` props

`IItemGroupItemProps extends ICommonsComponentProps, ITagProps, IGroupItemProps`
(`item-group.interface.ts:32`) — `value`/`disabled`/`selectedClass` come
from the generic `IGroupItemProps` (`Commons/group.interface.ts:36-40`);
`tag` from `ITagProps`; `id`/`class`/`style` from `ICommonsComponentProps`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `any` | — | Value this item contributes to the group's `modelValue` |
| `disabled` | `boolean` | — | Disables this item (also forced `true` when the group itself is `disabled`) |
| `selectedClass` | `string` | — | Fallback class used only when the group's own `selectedClass` is falsy — see "Selected item styling" above, since the group always defaults to a truthy value this rarely takes effect |
| `tag` | `string` | `'div'` | Root element tag |
| `id` | `string` | — | Passthrough on the root element |
| `class` / `style` | `ICommonsComponentProps` | — | Passthrough on the root element |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `any` | Fired whenever the selection changes |

Each `<OrigamItem>` additionally emits its own `group:selected` event
(`{ value: boolean }`) whenever its individual selection state flips — that
is an event on the **item**, not on `<OrigamItemGroup>` itself.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ isSelected, select, next, prev, selected }` | Container for `<origam-item>` children — see the caveat about `isSelected`/`select` operating on internal ids above |

### `<OrigamItem>` slots

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ isSelected, selectedClass, toggle, select, value, disabled }` | Item content (`OrigamItem.vue:57-64`) — `isSelected` is this item's own selection state, `toggle`/`select` operate on this item specifically (no id juggling needed), `selectedClass` is the resolved class from "Selected item styling" above |

## Accessibility

`<OrigamItemGroup>` and `<OrigamItem>` add **no ARIA role or attribute by
themselves** — no `role="group"`/`"radiogroup"`, no `aria-selected`, no
`tabindex`. Because unrecognised attributes fall through to the root element
by default in Vue 3, you can (and should) supply the semantics that fit your
use case directly on the tags:

```vue
<template>
  <origam-item-group
    v-model="selected"
    role="radiogroup"
    aria-label="Choose a plan"
  >
    <origam-item
      v-for="plan in plans"
      :key="plan.value"
      :value="plan.value"
      tag="button"
    >
      <template #default="{ isSelected, toggle }">
        <span :aria-pressed="isSelected" @click="toggle">{{ plan.label }}</span>
      </template>
    </origam-item>
  </origam-item-group>
</template>
```

Keyboard activation (`Enter`/`Space` on a focused item, arrow-key roving
selection) is likewise entirely the consumer's responsibility — bind it in
the slot content, as shown in "Programmatic navigation" above.

## CSS variables

None. Neither `OrigamItemGroup.vue` nor `OrigamItem.vue` ships a `<style>`
block, and the class each renders (`origam-item-group`, `origam-item`,
plus the resolved `selectedClass`) carries no built-in styling in the DS —
the classes exist purely as CSS hooks for your own stylesheet.
