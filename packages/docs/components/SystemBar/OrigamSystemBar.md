# OrigamSystemBar

`<OrigamSystemBar>` is the OS-style status bar that sits above the
application's `<OrigamAppBar>`. It registers itself as a top-positioned
layout item with the surrounding `<OrigamLayout>` so that
`<OrigamMain>` and other items push down by its height.

Two heights are supported out of the box:

- `default` (24px) — slim status / connection indicator.
- `window` (32px) — taller variant used in Tauri / Electron windows
  where the bar carries traffic-light controls and a window title.

## Basic usage

```vue
<template>
    <OrigamLayout>
        <OrigamSystemBar />
        <OrigamMain>…</OrigamMain>
    </OrigamLayout>
</template>
```

## Window mode

`window` switches to the 32px variant — typically used in desktop
shells.

```vue
<template>
    <OrigamSystemBar window>
        <OrigamSpacer />
        <span>App title</span>
        <OrigamSpacer />
    </OrigamSystemBar>
</template>
```

## Color (intent)

```vue
<template>
    <OrigamSystemBar color="primary">
        connected
    </OrigamSystemBar>

    <OrigamSystemBar bg-color="danger">
        offline
    </OrigamSystemBar>
</template>
```

## Elevation

```vue
<template>
    <OrigamSystemBar :elevation="2">subtle drop shadow</OrigamSystemBar>
</template>
```

## Rounded

```vue
<template>
    <OrigamSystemBar rounded="x-small">x-small</OrigamSystemBar>
</template>
```

## Layout placement

`<OrigamSystemBar>` is layout-aware. It uses the standard
`name` / `order` / `absolute` triple from `ILayoutItemProps`:

- `name` — unique id used by the layout machinery.
- `order` — relative order against siblings (lower = closer to the edge).
- `absolute` — opt out of pushing siblings; the bar then floats over
  the main slot.

```vue
<template>
    <OrigamLayout>
        <OrigamSystemBar name="status" order="0" />
        <OrigamAppBar    name="app"    order="1" />
        <OrigamMain>…</OrigamMain>
    </OrigamLayout>
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamSystemBar tag="header">…</OrigamSystemBar>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Bar content (text, icons, controls). |

## Props (interface)

```ts
interface ISystemBarProps extends ICommonsComponentProps, ITagProps,
    IElevationProps, IColorProps, ILayoutItemProps, IRoundedProps,
    IBorderProps, IDimensionProps, ITypographyProps {
    window?: boolean
}
```

### Typography props

| Prop | Type | Default | Description |
|---|---|---|---|
| `fontSize` | `TFontSize` | — | Font size token override (`xs` · `sm` · `md` · `lg` · `xl` · `2xl` · `3xl` · `4xl` · `5xl`). Maps to `--origam-system-bar---font-size`. |
| `fontWeight` | `TFontWeight` | — | Font weight token override (`regular` · `medium` · `semibold` · `bold` · `extrabold` · `black`). Maps to `--origam-system-bar---font-weight`. |
| `letterSpacing` | `TLetterSpacing` | — | Letter-spacing token override (`tight` · `normal` · `wide` · `wider` · `widest`). Maps to `--origam-system-bar---letter-spacing`. |
| `lineHeight` | `TLineHeight` | — | Line-height token override (`none` · `tight` · `snug` · `normal` · `relaxed` · `loose`). Maps to `--origam-system-bar---line-height`. |

## Anatomy

```html
<div class="origam-system-bar [origam-system-bar--window]
            [origam-system-bar--rounded]
            [origam-system-bar--absolute]">
    <!-- default slot -->
</div>
```

## Design tokens consumed

`<OrigamSystemBar>` reads from `tokens/component/system-bar.json`.

| CSS variable | Default |
|---|---|
| `--origam-system-bar---align-items` | `center` |
| `--origam-system-bar---display` | `flex` |
| `--origam-system-bar---flex` | `1 1 auto` |
| `--origam-system-bar---height` | `24px` |
| `--origam-system-bar---height-window` | `32px` |
| `--origam-system-bar---justify-content` | `flex-end` |
| `--origam-system-bar---max-width` | `100%` |
| `--origam-system-bar---padding-inline` | `8px` |
| `--origam-system-bar---position` | `relative` |
| `--origam-system-bar---text-align` | `end` |
| `--origam-system-bar---width` | `100%` |
| `--origam-system-bar---background` | `{color.neutral.700}` |
| `--origam-system-bar---color` | `{color.text.inverse}` |
| `--origam-system-bar---font-size` | `0.75rem` |
| `--origam-system-bar---font-weight` | `400` |
| `--origam-system-bar---letter-spacing` | `0.0333em` |
| `--origam-system-bar---line-height` | `1.667` |
| `--origam-system-bar---text-transform` | `none` |
| `--origam-system-bar__icon---opacity` | `0.7` |
| `--origam-system-bar--rounded---border-radius` | inherits |

The full list lives in
`tokens/component/system-bar.json`.

## Accessibility

- Renders a presentational `<div>` by default; pick a meaningful `tag`
  (`header` is a common choice) when the bar is the page's banner.
- The bar is **decorative** in many cases (network status, time, …)
  — keep critical information accessible elsewhere too.
- `--origam-system-bar__icon---opacity` is set to `0.7` for a softer
  look. If your icons carry semantic meaning, lift the opacity back
  to `1` via a `:style` override.

## Theming notes

- The component is theme-aware out of the box. Switching
  `<html data-theme="…">` re-resolves every variable instantly.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamLayout` — parent layout that absorbs the bar.
- `OrigamMain` — pushed down by the bar's height.
- `OrigamAppBar` — the larger, content-rich sibling.
