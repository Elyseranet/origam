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

## Label & identity

```vue
<template>
    <OrigamRatingField v-model="rating" label="Rating" name="product-rating" />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Field label text, rendered via `<OrigamLabel>` above the item row. Names the **group**, not a single control — see below |
| `name` | `string` | auto-generated (`origam-rating-{uid}`) | Native `name` shared by the underlying radio inputs, grouping them into one control |
| `itemAriaLabel` | `string` | `'origam.rating.aria_label.item'` | Locale key forwarded to every `<OrigamRatingFieldItem>` for its accessible name — see `OrigamRatingFieldItem`'s own `itemAriaLabel` doc for the resolved arguments |

### How the label is wired (changed in #810)

The root carries `role="radiogroup"`, and `label` names that group through
`aria-labelledby`. The rendered markup is:

```html
<div class="origam-input origam-rating-field"
     role="radiogroup"
     aria-labelledby="<field-id>-label">
  <div class="origam-input__control">
    <div id="<field-id>-label" class="origam-rating-field__label">
      <span class="origam-label"><span>Rating</span></span>
    </div>
    …
  </div>
</div>
```

Three consequences worth knowing:

- **The label element is a `<span>`, not a `<label>`.** It previously rendered
  `<label for="…">` pointing at an id **no element carried** — measured in
  Chromium on this component's own default rendering, with no consumer `id`
  involved. A rating is a group of controls, not one control, so there is
  nothing for a `for` to legitimately target. Making `OrigamInput` honour that
  id would only have aimed the `for` at a `<div>`, which is not a labelable
  element: the relation would have started resolving while a screen reader
  still announced nothing.
- **`aria-labelledby` targets the wrapper**, not the `<OrigamLabel>` inside it,
  so overriding the `label` slot keeps the group named.
- **No label, no `aria-labelledby`.** Pointing it at an empty wrapper would be
  as silent as the orphan it replaces, and this DS does not fabricate a
  fallback name (a guessed name satisfies the audit tool and tells the user
  nothing). Pass `label`, or name the group yourself with `aria-label` /
  `aria-labelledby` — both fall through to the root.

⚠️ **Keyboard operability is a separate, still-open matter.** The stars are not
focusable and the underlying radios carry `tabindex="-1"`, so the component
cannot currently be operated with the keyboard — measured before and after
#810, unchanged by it. `role="radiogroup"` describes the structure correctly
but does not by itself supply the arrow-key navigation the pattern implies.

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
| `itemLabel` | `{ label, index }` | Custom label for every item — `label` is the resolved `itemLabels[index]` entry (`undefined` if none was provided for that position) |
| `itemLabel.{n}` | `{ label, index }` | Custom label for item at index `n` — same scope as `itemLabel` |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `number` | Fires when the rating value changes |

## Design tokens

| Token | Description |
|---|---|
| `--origam-rating-field---*` | Component-level token namespace |
