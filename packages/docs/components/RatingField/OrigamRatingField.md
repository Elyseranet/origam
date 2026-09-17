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

## Keyboard (fixed in #812)

| Key | What it does |
|---|---|
| `Tab` | Enters the group — **one stop for the whole rating**, landing on the selected star, or on the first one when nothing is selected. A second `Tab` leaves the group. |
| `ArrowRight` / `ArrowDown` | Moves focus **and** selection to the next star, wrapping past the last. |
| `ArrowLeft` / `ArrowUp` | Moves focus **and** selection to the previous star, wrapping past the first. |
| `Home` / `End` | First / last star — focus and selection. |
| `Space` | Selects the focused star when it is not already selected. |
| `Enter` | Nothing, deliberately — see below. |

Everything except `Home` / `End` is the browser's own radio-group behaviour,
which is the WAI-ARIA roving-tabindex pattern implemented natively. The stars
share one `name`, so no JavaScript navigation is written here; the component
only adds the two things the platform omits (`Home` / `End`, and the
`readonly` lock below).

`Enter` is left as the no-op it natively is on a radio: the radiogroup pattern
assigns it no role, and claiming it would break form submission for a consumer
who puts the field inside a `<form>`.

### Focus is on the radio, the ring is on the star

The element that takes focus is the native `<input type="radio">`, which is
`0×0` and transparent. `.origam-rating-field-item:has(:focus-visible)` paints
the focus ring on the **star**, the box the user actually sees — otherwise the
group would be operable with an invisible focus indicator, i.e. a WCAG 2.4.7
failure. That coupling is why #810 explicitly left this fix out of its scope
rather than just removing the `tabindex`.

Under `halfIncrements` the half-step cell is carved by a `clip-path`, which
clips its own outline too; that case uses a negative `outline-offset` so the
ring lands inside the kept region and outlines exactly the half the step
selects.

### `readonly` and `disabled`

- **`readonly`** — the group stays **reachable and focus-visible**, carries
  `aria-readonly="true"`, and is inert: the arrows, `Home`, `End` and `Space`
  all stop moving anything (their native default is cancelled on `keydown`).
  Note that the `readonly` attribute on a radio is natively meaningless, which
  is why `aria-readonly` carries the information instead.
- **`disabled`** — the radios are `disabled`, so the browser removes them from
  the tab order on its own. No code of ours is involved.

⚠️ Measured in **Chromium only**. Firefox and WebKit are not covered.

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
