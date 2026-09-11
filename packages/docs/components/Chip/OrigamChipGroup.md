# OrigamChipGroup

`<OrigamChipGroup>` wraps `<OrigamChip>` elements in a horizontally scrollable
slide group with optional single or multiple selection. Child chips are registered
via `useGroup` and receive the active class `origam-chip--selected` when selected.

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

## Filter mode

`filter` prop propagates to each chip — a check icon appears when selected.

```vue
<template>
    <OrigamChipGroup v-model="cat" filter>
        <OrigamChip :value="'news'" filter text="News" />
        <OrigamChip :value="'art'"  filter text="Art"  />
    </OrigamChipGroup>
</template>
```

## Column layout

`column` switches from the horizontal slide layout to a wrapping column layout.

```vue
<template>
    <OrigamChipGroup column>
        <OrigamChip text="One"   />
        <OrigamChip text="Two"   />
        <OrigamChip text="Three" />
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

## Slots

| Slot      | Scope                                      | Description                          |
|-----------|--------------------------------------------|--------------------------------------|
| `default` | `{ isSelected, select, next, prev, selected }` | Chip children                    |

## Tokens

`OrigamChipGroup` inherits the token surface of `OrigamSlideGroup`. The active
chip class is `origam-chip--selected`. Chips inside the group receive
`origam-chip--active` when toggled.

| Variable                            | Default    | Used for                  |
|-------------------------------------|------------|---------------------------|
| `--origam-chip-group---gap`         | (unset)    | space between chips       |
| `--origam-chip---background-color`  | (unset)    | chip fill (via child)     |
| `--origam-chip---border-radius`     | `9999px`   | chip shape (via child)    |
