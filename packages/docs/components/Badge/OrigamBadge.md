# OrigamBadge

`<OrigamBadge>` is the floating notification chip you stick on top of
another element to surface a count, a status, or an unread indicator.
The host element is rendered through the default slot — the chip is
absolutely positioned on top of it and shows / hides via the
`modelValue` prop.

## Basic usage

```vue
<template>
    <OrigamBadge :model-value="true" :content="3">
        <OrigamAvatar text="AP" />
    </OrigamBadge>
</template>
```

## Content

`content` accepts a number, a string, or any printable value. Set
`max` to clamp the rendered number (the badge then prints `{max}+`).

```vue
<template>
    <OrigamBadge :model-value="true" :content="42" :max="9" />
    <OrigamBadge :model-value="true" content="NEW" />
</template>
```

## Dot mode

`dot` collapses the chip into a 9-pixel circle without content. Use
this for "something happened" indicators where the count itself is
not meaningful.

```vue
<template>
    <OrigamBadge :model-value="true" dot />
</template>
```

## Inline

`inline` swaps the chip from absolute positioning to inline flow,
which makes it act as a tag inside a paragraph.

```vue
<template>
    <p>
        Status:
        <OrigamBadge :model-value="true" inline content="active" />
    </p>
</template>
```

## Floating

`floating` shifts the chip outside the bounding box of the host
element instead of overlapping it. Useful for circular hosts (avatars)
where overlap would crop the badge.

```vue
<template>
    <OrigamBadge :model-value="true" floating :content="3">
        <OrigamAvatar text="AP" />
    </OrigamBadge>
</template>
```

## Location

`location` accepts any of the origam anchor strings (`'top right'`,
`'bottom left'`, `'top center'`, …). Combine with `offsetX` /
`offsetY` for fine-grained nudging without breaking the cardinal axis.

```vue
<template>
    <OrigamBadge :model-value="true" location="top right" :content="2">
        <OrigamAvatar text="AP" />
    </OrigamBadge>
    <OrigamBadge :model-value="true" location="bottom left" dot>
        <OrigamAvatar text="AP" />
    </OrigamBadge>
</template>
```

## Status

`status` applies the feedback intent ladder — same semantic tokens as
`OrigamAvatar`. The colour pair `--origam-color__feedback--{intent}---{bg|fg}`
keeps the badge readable in both light and dark themes.

```vue
<template>
    <OrigamBadge :model-value="true" status="success" :content="1" />
    <OrigamBadge :model-value="true" status="warning" :content="1" />
    <OrigamBadge :model-value="true" status="error"   :content="1" />
    <OrigamBadge :model-value="true" status="info"    :content="1" />
</template>
```

## Color (intent)

Outside of the status helper, `color` and `bg-color` accept the same
intent ladder as the rest of origam.

```vue
<template>
    <OrigamBadge :model-value="true" bg-color="primary" :content="1" />
    <OrigamBadge :model-value="true" bg-color="secondary" :content="1" />
</template>
```

## Icon

Pass `icon` to render an icon glyph instead of `content`. The slot
`badge` lets you fully override the visual.

```vue
<template>
    <OrigamBadge :model-value="true" :icon="MDI_ICONS.HEART">
        <OrigamAvatar text="AP" />
    </OrigamBadge>
</template>
```

## Rounded / border / elevation

The same chrome mixins as the rest of origam apply to the badge chip
itself.

```vue
<template>
    <OrigamBadge :model-value="true" :content="1" border />
    <OrigamBadge :model-value="true" :content="1" rounded="default" />
    <OrigamBadge :model-value="true" :content="1" :elevation="4" />
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | The host element the badge attaches to. |
| `badge` | — | Override the badge chip content (icon / text / custom). |

## Events

| Event | Payload | Description |
|---|---|---|
| `update:hover` | `boolean` | Hover toggled on mouse enter / leave. |

## Props (interface)

```ts
interface IBadgeProps extends ICommonsComponentProps, ITagProps,
    IBorderProps, IColorProps, ILocationProps, IRoundedProps,
    ITransitionComponentProps, IStatusProps, IHoverProps,
    IElevationProps, ITypographyProps {
    content?: number | string
    dot?: boolean
    floating?: boolean
    inline?: boolean
    label?: string         // i18n key for aria-label, defaults to 'origam.badge'
    max?: number | string
    modelValue?: boolean
    offsetX?: number | string
    offsetY?: number | string
}
```

### Typography props

Bound on the `__badge` pill (the visible surface). Both props have a real visual effect because the `__badge` SCSS block reads their matching CSS variables.

| Prop | Type | Default | CSS variable |
|---|---|---|---|
| `fontSize` | `TFontSize` | — | `--origam-badge__badge---font-size` |
| `fontWeight` | `TFontWeight` | — | `--origam-badge__badge---font-weight` |

## Anatomy

```html
<div class="origam-badge origam-badge--{status} origam-badge--floating">
    <div class="origam-badge__wrapper">
        <!-- default slot — the host element -->
        <span class="origam-badge__badge" role="status"
              aria-live="polite" aria-atomic="true">
            <!-- icon or content -->
        </span>
    </div>
</div>
```

## Design tokens consumed

| CSS variable | Purpose |
|---|---|
| `--origam-badge__badge---background-color` / `--origam-badge__badge---color` | Default chrome of the chip. |
| `--origam-badge__badge---border-radius` / `--origam-badge__badge---border-width` | Chrome shape. |
| `--origam-badge__badge---font-size` / `--origam-badge__badge---font-weight` | Number rendering. |
| `--origam-badge__badge---height` / `--origam-badge__badge---min-width` | Chip metrics. |
| `--origam-badge__badge---padding-block-*` / `--origam-badge__badge---padding-inline-*` | Chip padding. |
| `--origam-badge--{intent}---background-color` / `--origam-badge--{intent}---color` | Per-status palette. |
| `--origam-badge__wrapper---*` | Host wrapper layout (display, padding, margin). |

The full list lives in `tokens/component/badge.json`.

## Accessibility

- The chip carries `role="status"`, `aria-live="polite"`, and
  `aria-atomic="true"`. Screen readers announce updates as they
  happen (e.g. counter increments) without re-announcing the host.
- The visual content (`content`, `icon`) is mirrored into
  `aria-label` via the i18n `label` key (defaults to `origam.badge`).
- Override `label` to pass a tailored localised string when the
  numeric content alone is not informative ("3 unread messages"
  rather than "3").

## Theming notes

- Status colours come from the shared `--origam-color__feedback--*---*`
  semantic tokens, so theme switching is automatic.
- For one-off styling, the SCSS exposes
  `--origam-badge__badge---background-color` /
  `--origam-badge__badge---color` as instance-level overrides via
  `:style`.

## Related

- `OrigamAvatar` — common host for the badge.
- `OrigamChip` — inline counterpart for tag-like UI.
- `OrigamIcon` — used internally when `icon` is set.
