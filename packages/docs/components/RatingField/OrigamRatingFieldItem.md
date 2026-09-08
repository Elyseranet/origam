# OrigamRatingFieldItem

`<OrigamRatingFieldItem>` is one star of an
[`<OrigamRatingField>`](./OrigamRatingField.md). It renders a `<label>`
wrapping an icon-only `<OrigamBtn>`, plus a visually-hidden
`<input type="radio">` that carries the item's value and its accessible
name.

It owns no state: `isFilled`, `isHovered` and `isHovering` are pushed
down by the parent field, and the item only reports `click` /
`mouseenter` / `mouseleave` back up. Use it directly when you are
building a custom rating widget; otherwise use `<OrigamRatingField>`.

```vue
<template>
  <OrigamRatingFieldItem
    name="score"
    :value="3"
    :index="2"
    :is-filled="true"
    @click="onPick(3)"
  />
</template>
```

## Props

### Identity & value

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | — | **Required.** The rating value this item stands for. Also the native `<input>` value and, with `.` replaced by `-`, part of the generated id. |
| `name` | `string` | — | Native `name`, shared by every item of one rating. |
| `index` | `number` | `-1` | Position in the row. ⛔ **Declared and passed by `<OrigamRatingField>`, but read by nothing** in this component — no template binding, no computed. It has no observable effect today. |
| `id` | `string` | derived | Pairs `<label for>` with `<input id>`. When unset, derived as `` `${name}-${value}` `` (dots replaced by dashes). A consumer-supplied `id` wins — before #372 it was accepted and silently discarded. |
| `length` | `number \| string` | — | Total number of items, interpolated into the accessible name. |

### Icons & rendering

| Prop | Type | Default | Description |
|---|---|---|---|
| `fullIcon` | `TIcon` | `MDI_ICONS.STAR` | Glyph when the item counts as filled. |
| `emptyIcon` | `TIcon` | `MDI_ICONS.STAR_OUTLINE` | Glyph otherwise. |
| `showStar` | `boolean` | `true` | When `false`, the star (and the `item` slot) is not rendered — only the hidden input and label text remain. |
| `halfIncrements` | `boolean` | — | Enables half-star rendering: an item whose `value` has a fractional part gets `--half` (clipped to its left 50 %), an integer one gets `--full`. |
| `tag` | `string` | `'div'` | Root element. |

### State (driven by the parent)

| Prop | Type | Description |
|---|---|---|
| `isFilled` | `boolean` | The item is below or at the current rating. |
| `isHovering` | `boolean` | The row is being hovered — switches icon selection from `isFilled` to `isHovered`. |
| `isHovered` | `boolean` | This item is below or at the hovered position. |
| `checked` | `boolean` | Native `checked` on the hidden input. |
| `disabled` | `boolean` | Native `disabled`. |
| `readonly` | `boolean` | Native `readonly`. |

### Content & design

| Prop | Type | Default | Description |
|---|---|---|---|
| `itemAriaLabel` | `string` | `'origam.rating.aria_label.item'` | **A locale key**, not a literal. Resolved through `useLocale().t(key, value, length)` — the two positional arguments are the item's value and the row length. |
| `label` | `string` | — | ⛔ **Inert.** Read nowhere in this component, and **not** forwarded to the inner `<OrigamBtn>` either: `filterProps` only picks the keys the button itself declares, and `IBtnProps` has no `label`. Passing it does nothing. Use the `itemAriaLabel` locale key for the accessible name, or the `item` slot for custom content. |
| `color` | `TColor` | — | Star colour, forwarded to the button. |
| `size` | `TSize` | — | Star size. |
| `density` | `TDensity` | — | Button density. |
| `ripple` | `IRippleProps['ripple']` | — | Ripple configuration. |
| `border` / `borderColor` / `borderStyle` / `rounded` / `elevation` / `padding*` / `margin*` | Commons | Forwarded to the inner `<OrigamBtn>` (`class`, `style`, `id` and `bgColor` are filtered out). |

> The inner button is forced to `variant: 'text'` before the forwarded
> props are spread, so a rating reads as a row of stars rather than a row
> of pill buttons. Because the spread comes **after**, an explicit
> `variant` you pass on the item still wins.

## Emits

`IRatingFieldItemEmits` = `IClickEmits` + two pointer events:

| Event | Payload | Description |
|---|---|---|
| `click` | `MouseEvent` | The star was clicked. |
| `mouseenter` | `MouseEvent` | Pointer entered the star — the parent uses it to drive the hover preview. |
| `mouseleave` | `MouseEvent` | Pointer left the star. |

All three are re-emitted verbatim from the inner `<OrigamBtn>`; the item
adds no logic of its own.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `item` | `{ props, value }` | Replaces the star. `props` is the resolved `<OrigamBtn>` prop bag (already carrying the right icon for the current state, `variant: 'text'`, colour, ripple…), `value` is the item's rating value. Rendered only when `showStar` is `true`. |

```vue
<template>
  <OrigamRatingFieldItem name="score" :value="4" :is-filled="true">
    <template #item="{ props, value }">
      <OrigamBtn v-bind="props" :aria-label="`Rate ${value}`" />
    </template>
  </OrigamRatingFieldItem>
</template>
```

Note that binding `props` yourself means you also take over wiring the
`click` / `mouseenter` / `mouseleave` handlers — the default render
attaches them, a slot override does not.

## Accessibility

- The accessible name lives in a visually-hidden `<span>` inside the
  `<label>`, resolved from the `itemAriaLabel` locale key with the item's
  value and the row length.
- The hidden `<input type="radio">` carries `tabindex="-1"`: the whole
  row is meant to be reached as one control by the parent
  `<OrigamRatingField>`, not star by star.
- `--half` items are absolutely positioned and clipped; they overlap
  their `--full` neighbour by design, which is why the ripple overlay is
  suppressed on them.

## Anatomy

```html
<div class="origam-rating-field-item">
    <label class="origam-rating-field-item__label" for="…">
        <span class="origam-rating-field-item__hidden">…accessible name…</span>
        <!-- the item slot, or an icon-only OrigamBtn -->
    </label>
    <input class="origam-rating-field-item__hidden" type="radio" tabindex="-1">
</div>
```

`__label` carries `cursor: pointer` and the star's transform transition.
The class had been dropped from the template while the rule stayed in the
stylesheet, so neither applied — restored alongside this page.

## Related

- `OrigamRatingField` — the full field that renders and coordinates a row
  of these items.
