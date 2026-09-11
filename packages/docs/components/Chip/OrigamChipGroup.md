# OrigamChipGroup

`<OrigamChipGroup>` wraps `<OrigamChip>` elements in a scrollable
[`<OrigamSlideGroup>`](/components/Slide/OrigamSlideGroup) with optional single or
multiple selection. Child chips register through `useGroup` and receive the
class named by `selectedClass` — `origam-chip--selected` by default — while
they are selected.

It renders no markup and no CSS of its own: the root **is** the slide group,
and `<OrigamChipGroup>` has no `<style>` block at all.

## Basic usage

```vue
<template>
    <OrigamChipGroup v-model="selected">
        <OrigamChip :value="1" text="Vue"        />
        <OrigamChip :value="2" text="TypeScript" />
        <OrigamChip :value="3" text="Vite"       />
    </OrigamChipGroup>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const selected = ref<number | undefined>(undefined)
</script>
```

## Multiple selection

```vue
<template>
    <OrigamChipGroup v-model="tags" multiple>
        <OrigamChip :value="'a'" text="Alpha"   />
        <OrigamChip :value="'b'" text="Beta"    />
        <OrigamChip :value="'c'" text="Gamma"   />
    </OrigamChipGroup>
</template>
```

## Mandatory

`mandatory` guarantees that at least one chip is always selected.

```vue
<template>
    <OrigamChipGroup v-model="view" mandatory>
        <OrigamChip :value="'grid'" text="Grid" />
        <OrigamChip :value="'list'" text="List" />
    </OrigamChipGroup>
</template>
```

## Props

### Selection (`IGroupProps`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `any` | `undefined` | The selected chip value, or an array of them when `multiple` |
| `multiple` | `boolean` | `undefined` | Allow more than one chip to be selected |
| `mandatory` | `boolean` | `undefined` | Keep at least one chip selected |
| `max` | `number` | `undefined` | Cap on how many chips may be selected at once |
| `disabled` | `boolean` | `undefined` | Disables selection for every registered chip |
| `selectedClass` | `string` | `'origam-chip--selected'` | Class applied to the selected chip(s) |
| `valueComparator` | `(a, b) => boolean` | `undefined` | Custom equality used to match `modelValue` against a chip's `value` |

### Cascaded to child chips

These four are **not** styling props of the group. They are pushed down to
every descendant `<OrigamChip>` as *defaults*, through
`<OrigamDefaultsProvider>` — a chip that sets its own value still wins.

Only props the consumer actually passed are forwarded (`usePassedProps`).
That guard matters: `TColor` includes `false` and `IHoverState` /
`IActiveState` include `boolean`, so Vue coerces every unset one to a concrete
`false`, and a forwarded `color: false` used to beat the theme's
`'origam-chip': { color: 'primary' }` — chips lost their themed colour just by
being wrapped in a group (#263).

| Prop | Type | Description |
|---|---|---|
| `color` | `TColor` | Default foreground for every chip |
| `bgColor` | `TColor` | Default surface for every chip |
| `active` | `IActiveState` | Default active-state object |
| `hover` | `IHoverState` | Default hover-state object |
| `filter` | `boolean` | Default `filter` for every chip — a leading check icon (`MDI_ICONS.CHECK`) expands in, before the chip's own `prepend` area, while the chip is selected. `<OrigamChip>` only renders it when it is inside a group, which this always is |

Setting `filter` on the group is therefore enough; you do not have to repeat
it on each chip.

```vue
<template>
    <OrigamChipGroup v-model="cat" filter>
        <OrigamChip :value="'news'" text="News" />
        <OrigamChip :value="'art'"  text="Art"  />
    </OrigamChipGroup>
</template>
```

### Slide-group surface (`ISlideGroupProps`)

Forwarded to the root `<OrigamSlideGroup>` via `filterProps`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `direction` | `TDirection` | `'horizontal'` | `'vertical'` stacks the chips and switches the container to vertical scrolling |
| `showArrows` | `boolean \| string` | `undefined` | Render the prev / next affordances |
| `prevIcon` | `TIcon` | `MDI_ICONS.CHEVRON_LEFT` | |
| `nextIcon` | `TIcon` | `MDI_ICONS.CHEVRON_RIGHT` | |
| `centerActive` | `boolean` | `undefined` | Keep the selected chip scrolled into the centre |
| `tag` | `string` | — | Element the slide group renders as |

### Layout mixins

`margin*`, `padding*`, `border*` and `rounded*` are consumed at this level by
`useMargin` / `usePadding` / `useBorder` / `useRounded` and land on the root as
utility classes (tokenised values) or inline declarations (custom values).

### ⛔ `column` has no effect

`column` emits `origam-chip-group--column` on the root, and **no rule in the
design system targets that class** — there is no `origam-chip-group`
stylesheet anywhere. Passing it changes nothing.

To stack chips vertically, use the slide group's own axis instead:

```vue
<template>
    <OrigamChipGroup v-model="tags" direction="vertical">
        <OrigamChip text="One"   />
        <OrigamChip text="Two"   />
        <OrigamChip text="Three" />
    </OrigamChipGroup>
</template>
```

That path is real: `.origam-slide-group--vertical` sets `flex-direction: column`
on the root, the container and the content, and swaps the container's
overflow axes.

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `any` | The selection changed |

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ isSelected, select, next, prev, selected }` | The chips. The scope is the group's own API: `isSelected(id)`, `select(id, value)`, `next()`, `prev()`, and the `selected` id array (auto-unwrapped in templates) |

## Exposed instance API

`defineExpose` publishes `filterProps`, `css`, `id`, `load`, `unload` and
`isLoaded` — the standard `useStyle` / `useProps` surface.

## Tokens

`<OrigamChipGroup>` declares **no tokens of its own** — it has no stylesheet.
What you see comes from two other components:

- the root, from [`OrigamSlideGroup`](/components/Slide/OrigamSlideGroup)'s
  `--origam-slide-group*` surface (including
  `--origam-slide-group--vertical---max-height` and the two
  `--origam-slide-group--vertical---content-overflow-*` channels);
- each chip, from [`OrigamChip`](/components/Chip/OrigamChip)'s `--origam-chip*` surface —
  e.g. `--origam-chip---background-color`
  (`var(--origam-color__surface---overlay)`) and
  `--origam-chip---border-radius` (`var(--origam-radius---full)`, i.e.
  `9999px`).

Spacing between chips is not a token: it comes from the slide group's own
layout.
