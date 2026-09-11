# OrigamRatingField

`<OrigamRatingField>` renders a row of star (or custom icon) items that map to a numeric value. It supports half-increments, hover preview, and item labels.

## Basic usage

```vue
<template>
    <OrigamRatingField v-model="rating" />
</template>

<script setup>
import { ref } from 'vue'
const rating = ref(0)
</script>
```

## Length and half-increments

```vue
<template>
    <OrigamRatingField v-model="rating" :length="10" half-increments />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `length` | `number \| string` | `5` | Number of rating items |
| `halfIncrements` | `boolean` | `false` | Allow half-star values |
| `modelValue` | `number \| string` | `0` | Current rating value |
| `clearable` | `boolean` | `false` | Clicking the current value resets to 0 |

## Icons

```vue
<template>
    <OrigamRatingField v-model="rating" empty-icon="mdi-heart-outline" full-icon="mdi-heart" />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `emptyIcon` | `TIcon` | Icon for unfilled items |
| `fullIcon` | `TIcon` | Icon for filled items |

## States and interaction

```vue
<template>
    <OrigamRatingField v-model="rating" hover />
    <OrigamRatingField v-model="rating" readonly />
    <OrigamRatingField v-model="rating" disabled />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `hover` | `boolean` | Shows hover preview while the user drags |
| `readonly` | `boolean` | Prevents value changes |
| `disabled` | `boolean` | Disables all interaction |

## Item labels

```vue
<template>
    <OrigamRatingField
        v-model="rating"
        :item-labels="['Terrible', 'Bad', 'OK', 'Good', 'Excellent']"
        item-label-position="top"
    />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `itemLabels` | `string[]` | `undefined` | Labels below or above each item |
| `itemLabelPosition` | `TBlock` | `'top'` | Label position: `'top'` or `'bottom'` |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `default` | `{ id, messagesId, isDisabled, isReadonly, isValid }` | Full body override |
| `label` | — | Custom label element |
| `prepend` | — | Content before the rating items |
| `append` | — | Content after the rating items |
| `details` | slot bindings | Details area below the field |
| `messages` | `{ hasMessages, messages }` | Messages override |
| `message` | `{ message }` | Single message override |
| `itemLabel` | — | Custom label for every item |
| `itemLabel.{n}` | — | Custom label for item at index `n` |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `number` | Fires when the rating value changes |

## Design tokens

| Token | Description |
|---|---|
| `--origam-rating-field---*` | Component-level token namespace |
