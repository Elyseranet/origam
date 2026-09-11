# OrigamPagination

`<OrigamPagination>` renders a navigation strip of page buttons with optional first/last shortcuts and ellipsis truncation.

## Basic usage

```vue
<template>
    <OrigamPagination v-model="page" :length="20" />
</template>

<script setup>
import { ref } from 'vue'
const page = ref(1)
</script>
```

## Length and visible range

```vue
<template>
    <OrigamPagination v-model="page" :length="100" :total-visible="7" />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `number` | `undefined` | Active page (1-based) |
| `length` | `number \| string` | `undefined` | Total number of pages |
| `totalVisible` | `number \| string` | `undefined` | Max visible page buttons (auto-fills with ellipsis) |
| `start` | `number` | `1` | First page number |

## First / last page shortcuts

```vue
<template>
    <OrigamPagination v-model="page" :length="20" show-first-last-page />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `showFirstLastPage` | `boolean` | `false` | Show first and last page buttons |
| `firstIcon` | `TIcon` | — | Icon for the first-page button |
| `lastIcon` | `TIcon` | — | Icon for the last-page button |
| `prevIcon` | `TIcon` | — | Icon for the previous-page button |
| `nextIcon` | `TIcon` | — | Icon for the next-page button |
| `ellipsis` | `string` | `'...'` | Text used for gap placeholders |

## States

| Prop | Type | Description |
|---|---|---|
| `disabled` | `boolean` | Disable all buttons |

## ARIA

| Prop | Type | Description |
|---|---|---|
| `ariaLabel` | `string` | `aria-label` on the `<nav>` element |
| `pageAriaLabel` | `string` | Template for each page button |
| `currentPageAriaLabel` | `string` | Template for the active page button |
| `firstAriaLabel` | `string` | First-page button ARIA label |
| `previousAriaLabel` | `string` | Previous-page button ARIA label |
| `nextAriaLabel` | `string` | Next-page button ARIA label |
| `lastAriaLabel` | `string` | Last-page button ARIA label |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `first` | button props | Custom first-page button |
| `prev` | button props | Custom previous-page button |
| `next` | button props | Custom next-page button |
| `last` | button props | Custom last-page button |
| `item` | — | Custom page button |
| `item-{key}` | — | Custom button for a specific page key |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `number` | Active page changed |

## Design tokens

| Token | Description |
|---|---|
| `--origam-pagination---*` | Component-level token namespace |
