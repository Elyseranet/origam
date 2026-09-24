# OrigamRatingFieldItem

`<OrigamRatingFieldItem>` is one star of an
[`<OrigamRatingField>`](/components/RatingField/OrigamRatingField). It renders a `<label>`
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
| `showStar` | `boolean` | `true` | When `false`, the item renders **nothing at all** — no star, no `item` slot, and since #812 no `<label>` and no `<input type="radio">` either. It used to keep the hidden pair, which put a 0×0 transparent, invisibly-focusable radio into the group's arrow cycle; gating only the `<input>` would have left a `<label for>` resolving to nothing, i.e. the #810 defect. The component instance still mounts, which is all `<OrigamRatingField>` needs from its `__empty` delegation ref. |
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
| `readonly` | `boolean` | Native `readonly` on the input. ⚠️ **Inert on its own** — measured: `readonly` has no effect on a radio, the arrows moved the selection straight through it. What actually makes the group read-only is the parent, which cancels those keys' default on `keydown` and puts `aria-readonly="true"` on the `radiogroup` root. ⛔ Do NOT mirror that `aria-readonly` onto the radio itself: `aria-readonly` is not an allowed attribute on `role="radio"`, and axe-core reports it as a **critical** `aria-allowed-attr` violation — measured while building #812, on a first version of this fix that did exactly that. |

### Content & design

| Prop | Type | Default | Description |
|---|---|---|---|
| `itemAriaLabel` | `string` | `'origam.rating.aria_label.item'` | **A locale key**, not a literal. Resolved through `useLocale().t(key, value, length)` — the two positional arguments are the item's value and the row length. |
| `label` | `string` | — | ⛔ **Inert.** Read nowhere in this component, and **not** forwarded to the inner `<OrigamBtn>` either: `filterProps` only picks the keys the button itself declares, and `IBtnProps` has no `label`. Passing it does nothing. Use the `itemAriaLabel` locale key for the accessible name, or the `item` slot for custom content. |
| `color` | `TColor` | — | Star colour, forwarded to the button. |
| `size` | `TSize` | — | Star size. |
| `density` | `TDensity` | — | Button density. |
| `ripple` | `IRippleProps['ripple']` | — | Ripple configuration. |
| `border` / `borderColor` / `borderStyle` / `rounded` / `elevation` / `padding*` / `margin*` | Commons | — | Forwarded to the inner `<OrigamBtn>` (`class`, `style`, `id` and `bgColor` are filtered out). |

> The inner button is forced to `variant: 'text'` before the forwarded
> props are spread, so a rating reads as a row of stars rather than a row
> of pill buttons. Because the spread comes **after**, an explicit
> `variant` you pass on the item still wins.

## Emits

`IRatingFieldItemEmits` = `IClickEmits` + two pointer events + the two
keyboard channels added in #812:

| Event | Payload | Source | Description |
|---|---|---|---|
| `click` | `MouseEvent` | inner `<OrigamBtn>` | The star was clicked. |
| `mouseenter` | `MouseEvent` | inner `<OrigamBtn>` | Pointer entered the star — the parent uses it to drive the hover preview. |
| `mouseleave` | `MouseEvent` | inner `<OrigamBtn>` | Pointer left the star. |
| `change` | `Event` | the `<input type="radio">` | The radio became the checked one. **This is the only signal a keyboard selection produces** — the browser's radio navigation fires `click` + `change` on the input and never touches the star `<div>` the pointer path goes through. |
| `keydown` | `KeyboardEvent` | the `<input type="radio">` | Every key pressed while the radio holds focus. The parent uses it for `Home` / `End` (no-ops natively on a radio group) and to cancel the native default while `readonly`. |

The first three are re-emitted verbatim from the inner `<OrigamBtn>`, the
last two verbatim from the input; the item adds no logic of its own.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `item` | `{ props, value }` | Replaces the star. `props` is the resolved `<OrigamBtn>` prop bag (already carrying the right icon for the current state, `variant: 'text'`, colour, ripple…), `value` is the item's rating value. Rendered only when `showStar` is `true` — and since #812 the whole `<label>` / `<input>` pair goes with it. |

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
- The hidden `<input type="radio">` no longer carries `tabindex="-1"`
  (#812). Removing it is what gives the group its keyboard navigation:
  radios sharing a `name` already implement the WAI-ARIA roving-tabindex
  pattern natively — one `Tab` stop for the row, arrows moving focus and
  selection with wrap-around, `Space` selecting. The row is still reached
  as ONE control, by the browser rather than by us.
- Because that focusable input is `0×0` and transparent,
  `.origam-rating-field-item:has(:focus-visible)` paints the focus ring on
  the **star**. Without it the group would be operable with an invisible
  focus indicator — WCAG 2.4.7 — which is precisely the trade #810 refused
  to make.
- ⚠️ A **slot override that replaces the star** keeps the ring (it is painted
  on the item root, not on the button), but that case was not exercised in a
  browser.
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
    <input class="origam-rating-field-item__hidden" type="radio">
</div>
```

Both the `<label>` and the `<input>` are inside a `v-if="showStar"`: an item
with no visible star renders an empty root.

`__label` carries `cursor: pointer` and the star's transform transition.
The class had been dropped from the template while the rule stayed in the
stylesheet, so neither applied — restored alongside this page.

## Related

- `OrigamRatingField` — the full field that renders and coordinates a row
  of these items.
