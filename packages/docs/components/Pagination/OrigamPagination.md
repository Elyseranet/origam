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

Every prop below carries a **locale key**, not finished text — its default is a
`origam.pagination.aria_label.*` entry, and the component resolves it through
`t()` before it reaches the DOM. Pass your own key to translate; literal text
also works, since an unknown key is returned unchanged.

| Prop | Type | Default key | Description |
|---|---|---|---|
| `ariaLabel` | `string` | `origam.pagination.aria_label.root` | `aria-label` on the `<nav>` element |
| `pageAriaLabel` | `string` | `origam.pagination.aria_label.page` | Template for each page button (`{0}` = page number) |
| `currentPageAriaLabel` | `string` | `origam.pagination.aria_label.current_page` | Template for the active page button |
| `firstAriaLabel` | `string` | `origam.pagination.aria_label.first` | First-page button ARIA label |
| `previousAriaLabel` | `string` | `origam.pagination.aria_label.previous` | Previous-page button ARIA label |
| `nextAriaLabel` | `string` | `origam.pagination.aria_label.next` | Next-page button ARIA label |
| `lastAriaLabel` | `string` | `origam.pagination.aria_label.last` | Last-page button ARIA label |

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
| `first` | `number` | The first-page button was clicked (payload is `start`) |
| `prev` | `number` | The previous-page button was clicked (payload is `page - 1`) |
| `next` | `number` | The next-page button was clicked (payload is `page + 1`) |
| `last` | `number` | The last-page button was clicked (payload is `start + length - 1`) |

## Design tokens

| Token | Description |
|---|---|
| `--origam-pagination---*` | Component-level token namespace |
