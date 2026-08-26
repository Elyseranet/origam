# OrigamListItem

`<OrigamListItem>` renders a single interactive or informational row inside an
`OrigamList`. It supports a title and subtitle (as props or slots), leading /
trailing icons or avatars via the prepend and append slots, and a full set of
visual, spacing, link and typography props.

## Basic usage

```vue
<template>
    <OrigamList>
        <OrigamListItem title="Primary text" subtitle="Secondary line" />
    </OrigamList>
</template>
```

## With prepend / append icons

```vue
<template>
    <OrigamList>
        <OrigamListItem
            title="Inbox"
            prepend-icon="mdi-inbox"
            append-icon="mdi-chevron-right"
        />
    </OrigamList>
</template>
```

## Typography on title and subtitle

`fontSize`, `fontWeight`, `lineHeight` and `letterSpacing` drive **both** the
title and subtitle surfaces simultaneously via two dedicated CSS variable
prefixes (`list-item__title` and `list-item__subtitle`).

```vue
<template>
    <OrigamList>
        <OrigamListItem
            title="Bold title"
            subtitle="Compact subtitle"
            font-size="lg"
            font-weight="semibold"
            line-height="tight"
            letter-spacing="wide"
        />
    </OrigamList>
</template>
```

## Props

| Prop          | Type                      | Default | Description                                   |
|---------------|---------------------------|---------|-----------------------------------------------|
| `title`       | `string \| number`        | —       | Primary text (also available as `#title` slot) |
| `subtitle`    | `string \| number`        | —       | Secondary text (also available as `#subtitle` slot) |
| `active`      | `boolean`                 | `false` | Forces the active state                       |
| `activeClass` | `string`                  | —       | CSS class applied when active                 |
| `disabled`    | `boolean`                 | `false` | Prevents interaction                          |
| `lines`       | `TLines`                  | —       | Clamp subtitle to one, two or three lines     |
| `link`        | `boolean`                 | `false` | Makes the item behave as a link               |
| `nav`         | `boolean`                 | `false` | Nav-mode sizing (0.8125rem title, 0.75rem subtitle) |
| `slim`        | `boolean`                 | `false` | Reduced inner spacing                         |
| `tag`         | `string`                  | `'div'` | Root HTML element                             |
| `href`        | `string`                  | —       | Anchor href (renders as `<a>`)                |
| `to`          | `RouteLocationRaw`        | —       | Router-link target                            |
| `value`       | `any`                     | —       | Selectable value within a list group          |
| `prependIcon` | `string`                  | —       | Icon shown before content                     |
| `appendIcon`  | `string`                  | —       | Icon shown after content                      |
| `prependAvatar` | `string`                | —       | Avatar image URL shown before content         |
| `appendAvatar`  | `string`                | —       | Avatar image URL shown after content          |
| `density`     | `TDensity`                | —       | Row density (`default` · `compact` · `comfortable`). Inherited from the parent list unless set. Shifts the row height by `0` / `-8px` / `+8px` |
| `size`        | `TSize`                   | —       | Row-height rung — see the section below. Inherited from the parent list unless set |

### Props — `size`: the row-height scale

`size` selects a rung of the shared control-height scale — the same one
`--origam-input__control---height-{sm,md,lg,xl}` drives — so a row and a
field carrying the same `size` end up with an identical vertical footprint.
This is what lets an `OrigamSelect` dropdown match its own control.

| `size`      | Row height | Block padding | Notes |
|-------------|-----------|---------------|-------|
| *(unset)*   | `40px`    | `8px`         | Historical default — unchanged for lists that never opt in |
| `x-small`   | `36px`    | `6px`         | Deliberately mapped onto the default rung: `.origam-field` has no `x-small` rule either, so a smaller row would re-create the mismatch |
| `small`     | `28px`    | `2px`         | |
| `default`   | `36px`    | `6px`         | |
| `large`     | `44px`    | `10px`        | |
| `x-large`   | `52px`    | `14px`        | |

Two behaviours worth knowing:

- **The title is NOT scaled.** `.origam-field` keeps a fixed 16px text at
  every size, so shrinking the row title would re-introduce the very mismatch
  this scale exists to remove — `__title` holds its own `1rem` / `1.5rem`
  line box whatever the rung. `size` does still emit the `origam--text-{rung}`
  utility on the row root, so anything inheriting the row's font size (default
  slot content, for instance) follows the rung. Use the typography props below
  if you want the title itself to follow.
- **`size` composes with `density`, it does not replace it.** The resolved
  height is `max(rung + density, titleLineHeight + blockPadding)` — the exact
  model `.origam-field__input` uses, flooring included. A `small` row at
  `compact` density therefore stays at 28px rather than collapsing to 20px,
  just as the field does.

Each rung is overridable per theme through
`--origam-list-item---height-{sm,md,lg,xl}` and
`--origam-list-item---padding-block-{sm,md,lg,xl}`. The rung is the **total**
row height; because the row is a `content-box`, it is split internally between
`--origam-list-item---min-height` (`rung - 2 × padding`) and the block padding,
which sum back to the rung.

### Props — Typography (title and subtitle surfaces)

Both `__title` and `__subtitle` respond to the same prop set — one value
controls both children simultaneously.

| Prop            | Type              | Default | Description                                                                                                          |
|-----------------|-------------------|---------|----------------------------------------------------------------------------------------------------------------------|
| `fontSize`      | `TFontSize`       | —       | Font-size token (xs · sm · md · lg · xl · …). Sets `--origam-list-item__title---font-size` and `--origam-list-item__subtitle---font-size`. Overrides nav-mode sizing. |
| `fontWeight`    | `TFontWeight`     | —       | Font-weight token (regular · medium · semibold · bold · …). Sets `--origam-list-item__title---font-weight` and `--origam-list-item__subtitle---font-weight`. |
| `lineHeight`    | `TLineHeight`     | —       | Line-height token (none · tight · snug · normal · relaxed · loose). Sets `--origam-list-item__title---line-height` and `--origam-list-item__subtitle---line-height`. |
| `letterSpacing` | `TLetterSpacing`  | —       | Letter-spacing token (tight · normal · wide · wider · widest). Sets `--origam-list-item__title---letter-spacing` and `--origam-list-item__subtitle---letter-spacing`. |

## Emits

| Event           | Payload        | Description                            |
|-----------------|----------------|----------------------------------------|
| `click`         | `MouseEvent`   | Fired on item click                    |
| `click:prepend` | `MouseEvent`   | Fired when the prepend area is clicked |
| `click:append`  | `MouseEvent`   | Fired when the append area is clicked  |

## Slots

| Slot       | Scope                              | Description                         |
|------------|------------------------------------|-------------------------------------|
| `default`  | `{ isActive, select, isSelected, isIndeterminate }` | Arbitrary content inside the content area |
| `title`    | `{ title }`                        | Custom title content                |
| `subtitle` | `{ subtitle }`                     | Custom subtitle content             |
| `prepend`  | slot props                         | Leading avatar / icon override      |
| `append`   | slot props                         | Trailing avatar / icon override     |
| `wrapper`  | —                                  | Full content wrapper override       |

## Accessibility

- **`role="option"` (#424)** — set only when the item is nested inside a
  list (an `OrigamList` / `OrigamListChildren` ancestor is present) AND is
  not itself a group activator row. A bare `OrigamListItem` used outside
  any list context gets no role: no ARIA is better than a role whose
  promised `listbox` container doesn't exist.
- `aria-selected` mirrors `isSelected` whenever `role="option"` is set —
  required state for the `option` role in a listbox/combobox.
- `aria-disabled` mirrors the `disabled` prop whenever `role="option"` is
  set.
- A group activator row (rendered inside `OrigamListGroupActivator`) never
  gets `role="option"` — clicking it only toggles expand/collapse, it never
  fires a selection (see `OrigamListGroup`'s `role="group"` region).

## Tokens

| Variable                                          | Default          | Used for                              |
|---------------------------------------------------|------------------|---------------------------------------|
| `--origam-list-item__title---font-size`           | `1rem`           | title font size                       |
| `--origam-list-item__title---font-weight`         | `400`            | title font weight                     |
| `--origam-list-item__title---letter-spacing`      | `0.009375em`     | title letter spacing                  |
| `--origam-list-item__title---line-height`         | `1.5rem`         | title line height                     |
| `--origam-list-item__subtitle---font-size`        | `0.875rem`       | subtitle font size                    |
| `--origam-list-item__subtitle---font-weight`      | `400`            | subtitle font weight                  |
| `--origam-list-item__subtitle---letter-spacing`   | `0.0178571429em` | subtitle letter spacing               |
| `--origam-list-item__subtitle---line-height`      | `1rem`           | subtitle line height                  |
| `--origam-list-item---min-height`                 | `40px`           | row minimum **content** height (density-adjusted) |
| `--origam-list-item---padding-block-start`        | `8px`            | top padding                           |
| `--origam-list-item---padding-inline-start`       | `16px`           | left padding (indent-adjusted)        |
| `--origam-list-item---height-sm` / `-md` / `-lg` / `-xl` | `28px` / `36px` / `44px` / `52px` | total row height per `size` rung |
| `--origam-list-item---padding-block-sm` / `-md` / `-lg` / `-xl` | `2px` / `6px` / `10px` / `14px` | block padding per `size` rung |
