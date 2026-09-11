# OrigamSlideGroup

`<OrigamSlideGroup>` is a horizontal (or vertical) scroller that
accommodates more children than fit in its container. It exposes
prev / next affixes that smoothly scroll one viewport at a time, picks
up keyboard navigation (arrow keys + Home / End), and optionally centers
the active item.

The group also participates in `useGroup`, so children that opt into
`useGroupItem` can be made selectable through it.

## Basic usage

```vue
<template>
    <OrigamSlideGroup>
        <div v-for="n in 30" :key="n" class="chip">Tag {{ n }}</div>
    </OrigamSlideGroup>
</template>
```

## Direction

`direction="horizontal"` (default) scrolls left / right, `vertical`
scrolls up / down.

```vue
<template>
    <OrigamSlideGroup direction="horizontal">…</OrigamSlideGroup>
    <OrigamSlideGroup direction="vertical">…</OrigamSlideGroup>
</template>
```

## Show arrows

`showArrows` decides when the prev / next affixes appear.

| Value | Behaviour |
|---|---|
| `true` (default for desktop) | Arrows appear when content overflows. |
| `false` | Arrows never appear. |
| `'always'` | Arrows are always rendered (even without overflow). |
| `'desktop'` | Visible on desktop only. |
| `'mobile'` | Visible on mobile when overflowing, hidden otherwise. |

```vue
<template>
    <OrigamSlideGroup show-arrows="always">…</OrigamSlideGroup>
    <OrigamSlideGroup :show-arrows="false">…</OrigamSlideGroup>
</template>
```

## Center active

`centerActive` keeps the currently selected child centered in the
viewport whenever selection changes — useful for tab strips.

```vue
<template>
    <OrigamSlideGroup center-active v-model="active">
        <div v-for="t in tabs" :key="t.id" :data-value="t.id">{{ t.label }}</div>
    </OrigamSlideGroup>
</template>
```

## Custom icons

`prevIcon` / `nextIcon` swap the affix glyphs.

```vue
<template>
    <OrigamSlideGroup prev-icon="mdi-chevron-double-left" next-icon="mdi-chevron-double-right">…</OrigamSlideGroup>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | `next`, `prev`, `select`, `isSelected` | Where the children live. The slot props expose the group navigation API. |
| `prev` | — | Replace the prev affix glyph entirely. |
| `next` | — | Replace the next affix glyph entirely. |

## Props (interface)

```ts
interface ISlideGroupProps extends ICommonsComponentProps, ITagProps,
    IDirectionProps, IGroupProps, IPaddingProps, IMarginProps,
    IRoundedProps, IBorderProps, IDisplayProps {
    centerActive?: boolean
    nextIcon?: TIcon
    prevIcon?: TIcon
    showArrows?: boolean | string
}
```

## Anatomy

```html
<div class="origam-slide-group">
    <div class="origam-slide-group__prev">…</div>
    <div class="origam-slide-group__container">
        <div class="origam-slide-group__content">
            <slot/>
        </div>
    </div>
    <div class="origam-slide-group__next">…</div>
</div>
```

## Design tokens consumed

Defined in `tokens/component/slide-group.json`.

| CSS variable | Default |
|---|---|
| `--origam-slide-group---display` | `flex` |
| `--origam-slide-group---overflow` | `hidden` |
| `--origam-slide-group---transition-duration` | `{motion.duration.medium}` |
| `--origam-slide-group---transition-easing` | `{motion.easing.standard}` |
| `--origam-slide-group__prev---min-width` | `52px` |
| `--origam-slide-group__prev---color` | `{color.text.primary}` |
| `--origam-slide-group__prev---opacity-disabled` | `{opacity.60}` |
| `--origam-slide-group__container---overflow-x` | `auto` |
| `--origam-slide-group__container---scrollbar-color` | `transparent` |
| `--origam-slide-group__content---white-space` | `nowrap` |
| `--origam-slide-group--vertical---max-height` | `inherit` |

## Accessibility

- Arrow keys (Left / Right or Up / Down depending on `direction`) move
  focus across children. Home / End jump to the first / last child.
- The native scrollbar is hidden. The component is scrollable via touch
  / wheel / arrow keys / focus only.
- Prev / next affixes lose focus events via `mousedown` (they are
  click-only) so keyboard navigation stays focused on the content.

## Related

- `OrigamChipGroup` — wraps `<OrigamSlideGroup>` to expose a chip strip
  with toggle semantics.
- `OrigamWindow` — sibling component for full-viewport carousels.
