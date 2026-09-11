# OrigamAvatar

`<OrigamAvatar>` is the polymorphic identity glyph for origam. It can
render an image, an icon, or a text initial inside a sized chip with
the full chrome mixin set (size, density, color, status, rounded,
border, elevation, hover/active feedback, padding, margin).

It is the building block of `OrigamAvatarGroup` and is what
`OrigamBtn` consumes through its `prepend-avatar` / `append-avatar`
slots.

## Basic usage

Pick one of the three content modes — `image`, `icon`, or `text`. The
fall-through priority is image > icon > text, so passing several at the
same time renders only the first available.

```vue
<template>
    <OrigamAvatar text="AP" />
    <OrigamAvatar :icon="MDI_ICONS.ACCOUNT" />
    <OrigamAvatar image="https://picsum.photos/seed/origam-av/120/120" />
</template>
```

## Sizes

`size` follows the shared origam ladder. Each step bumps width, height
and font-size atomically so the avatar never becomes lopsided.

| Size | Pixels |
|---|---|
| `x-small` | 24 |
| `small` | 32 |
| `default` | 40 |
| `large` | 48 |
| `x-large` | 56 |

```vue
<template>
    <OrigamAvatar size="x-small" text="XS" />
    <OrigamAvatar size="small"   text="SM" />
    <OrigamAvatar size="default" text="MD" />
    <OrigamAvatar size="large"   text="LG" />
    <OrigamAvatar size="x-large" text="XL" />
</template>
```

## Density

Density shaves 8 pixels off both axes (compact / comfortable behave the
same — they remap to the same SCSS variable on purpose, so the host can
override one without touching the other).

```vue
<template>
    <OrigamAvatar density="default"     text="DF" />
    <OrigamAvatar density="compact"     text="CP" />
    <OrigamAvatar density="comfortable" text="CF" />
</template>
```

## Color (intent)

`color` and `bg-color` map to the semantic intent ladder. `color` drives
the foreground (initials + icon stroke), `bg-color` drives the chip
background. Use `:style` for one-off custom hexes.

```vue
<template>
    <OrigamAvatar bg-color="primary"   text="P" />
    <OrigamAvatar bg-color="success"   text="S" />
    <OrigamAvatar bg-color="warning"   text="W" />
    <OrigamAvatar bg-color="danger"    text="D" />
</template>
```

## Status

Pass `status` to apply one of the feedback intents. The component reads
the same `--origam-color__feedback--{intent}---{bg|fg}` semantic tokens as
the rest of origam, so theme switches stay coherent.

```vue
<template>
    <OrigamAvatar status="success" text="OK" />
    <OrigamAvatar status="warning" text="!"  />
    <OrigamAvatar status="error"   text="X"  />
    <OrigamAvatar status="info"    text="?"  />
</template>
```

## Rounded

The avatar is fully circular by default (`border-radius: 50%`). Use
`rounded` to switch to one of the named rungs (`x-small`, `small`,
`default`, `medium`, `large`, `x-large`) for a square-with-corners
look.

```vue
<template>
    <OrigamAvatar text="AP" />
    <OrigamAvatar text="AP" rounded="default" />
    <OrigamAvatar text="AP" rounded="x-large" />
    <OrigamAvatar text="AP" :rounded="false" />
</template>
```

## Elevation

`elevation` applies the shared shadow ladder (`xs` / `sm` / `md` / `lg`
/ `xl`). Useful for floating-status avatars on top of cards.

```vue
<template>
    <OrigamAvatar text="AP" :elevation="4" />
    <OrigamAvatar text="AP" :elevation="8" />
</template>
```

## Border

Pass the `border` mixin to draw a thin outline around the chip — handy
for layering on coloured surfaces.

```vue
<template>
    <OrigamAvatar text="AP" border />
</template>
```

## Hover / active

Like every origam atom that consumes the hover + active mixins, the
avatar can be wired to interactive feedback. The classes are emitted
even when the avatar is purely decorative — only style cost, no event
listeners attached.

```vue
<template>
    <OrigamAvatar text="AP" hover active />
</template>
```

## Polymorphic tag

The avatar renders a `<div>` by default. Switch the tag for menus and
clickable contexts:

```vue
<template>
    <OrigamAvatar tag="button" text="AP" @click="onClick" />
    <OrigamAvatar tag="a" text="AP" href="/profile" />
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Full content override. |
| `avatar` | — | Custom rendering when `image` is provided. |
| `icon` | — | Custom rendering when `icon` is provided. |
| `text` | — | Custom rendering when `text` is provided. |

## Events

| Event | Payload | Description |
|---|---|---|
| `update:active` | `boolean` | Active state toggled on click. |
| `update:hover` | `boolean` | Hover state toggled on mouse enter / leave. |

## Props (interface)

```ts
interface IAvatarProps extends ICommonsComponentProps, IDensityProps,
    IRoundedProps, ISizeProps, ITagProps, IColorProps, IPaddingProps,
    IMarginProps, IBorderProps, IStatusProps, IElevationProps,
    IHoverProps, IActiveProps, ITypographyProps {
    start?: boolean
    end?: boolean
    image?: string | ISrcObject
    text?: string
}
```

### Typography props

| Prop | Type | Default | Description |
|---|---|---|---|
| `fontSize` | `TFontSize` | — | Override the initials font-size. Maps to `--origam-avatar---font-size` via `--origam-font__size---{value}`. |
| `fontWeight` | `TFontWeight` | — | Override the initials font-weight. Maps to `--origam-avatar---font-weight` via `--origam-font__weight---{value}`. |
| `lineHeight` | `TLineHeight` | — | Override the avatar line-height. Maps to `--origam-avatar---line-height` via `--origam-font__lineHeight---{value}`. |
| `letterSpacing` | `TLetterSpacing` | — | Override the initials letter-spacing. Maps to `--origam-avatar---letter-spacing` via `--origam-font__letterSpacing---{value}`. |

## Anatomy

```html
<div class="origam-avatar origam-avatar--size-default
            origam-avatar--rounded origam-avatar--{status}">
    <div class="origam-avatar__wrapper">
        <div class="origam-avatar__image | origam-avatar__icon | origam-avatar__text">
            …
        </div>
    </div>
</div>
```

## Design tokens consumed

| CSS variable | Purpose |
|---|---|
| `--origam-avatar---width` / `--origam-avatar---height` | Avatar bounding box. |
| `--origam-avatar---density` | Density shaving (`8px`, `0px`, `8px`). |
| `--origam-avatar---font-size` | Initials size — scales with `size`. |
| `--origam-avatar---background` / `--origam-avatar---color` | Default chrome. |
| `--origam-avatar---border-radius` | Defaults to `50%`. Overridden by `rounded`. |
| `--origam-avatar---box-shadow` | Empty by default, raised by `elevation`. |
| `--origam-avatar--{intent}---background-color` | Per-status background. |
| `--origam-avatar--{intent}---color` | Per-status foreground. |

The full list lives in `tokens/component/avatar.json`.

## Accessibility

- Provide a meaningful `alt` on the `image` source so AT users get a
  description rather than a generic "image" label.
- For purely decorative avatars (e.g. group affordance), pass `alt=""`
  on the inner `OrigamImg` and rely on the host context for meaning.
- Use the `tag="button"` polymorph when the avatar is interactive.
  Plain `<div>`s are not announced as actionable.

## Theming notes

- The avatar inherits the active theme automatically. Switching
  `<html data-theme="dark">` re-resolves both default and status
  intents.
- A nested `<OrigamThemeProvider>` re-skins a sub-tree without
  re-mounting components.

## Related

- `OrigamAvatarGroup` — overlapping cluster with hover / click expand.
- `OrigamImg` — underlying picture surface.
- `OrigamIcon` — icon rendering when `icon` is set.
