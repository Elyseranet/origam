# OrigamSystemBar

`<OrigamSystemBar>` is the OS-style status bar that sits above the
application's `<OrigamAppBar>`. It registers itself as a layout item with
the surrounding `<OrigamLayout>` so that `<OrigamMain>` and other items
give up room equal to its height — docked to the top by default, to any
other edge via `location`.

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
`name` / `order` / `location` / `absolute` quadruple from
`ILayoutItemProps`:

- `name` — unique id used by the layout machinery.
- `order` — relative order against siblings (lower = closer to the edge).
- `location` (default `'top'`) — which edge of the `<OrigamLayout>` the
  bar docks against: `'top'` · `'bottom'` · `'left'` · `'right'`. It
  drives the anchor, the `calc()` height/width, and how much room
  sibling regions give up. `'bottom'` is the desktop status-bar
  placement.
- `absolute` — opt out of pushing siblings; the bar then floats over
  the main slot.

```vue
<template>
    <OrigamLayout>
        <OrigamSystemBar name="status" order="0" />
        <OrigamAppBar    name="app"    order="1" />
        <OrigamMain>…</OrigamMain>
        <OrigamSystemBar name="footer" order="0" location="bottom" />
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
    IElevationProps, IColorProps, IBgColorProps, ILayoutItemProps,
    IRoundedProps, IBorderProps, IDimensionProps,
    Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
    window?: boolean
}
```

### Layout props (`ILayoutItemProps`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | — | Unique id used by the layout machinery. |
| `order` | `string \| number` | `0` | Relative order against siblings (lower = closer to the edge). |
| `location` | `TDirectionBoth` | `'top'` | Edge of the `<OrigamLayout>` the bar docks against (`top` · `bottom` · `left` · `right`) — see [Layout placement](#layout-placement). |
| `absolute` | `boolean` | — | Float over the main slot instead of pushing siblings. |

### Own props

| Prop | Type | Default | Description |
|---|---|---|---|
| `window` | `boolean` | `undefined` | Switches to the 32px window variant (`--origam-system-bar---height-window`) |
| `tag` | `string` | `'div'` | Element the root renders as |

### Design props

| Group | Props | Notes |
|---|---|---|
| Color | `color`, `bgColor` | `IColorProps` + `IBgColorProps` |
| Elevation | `elevation` | Maps onto the `shadow` scale |
| Shape | `rounded`, `roundedTopLeft` / `TopRight` / `BottomLeft` / `BottomRight` | A tokenised value emits `origam-system-bar--rounded-{rung}`; bare `rounded` emits `origam-system-bar--rounded`, whose rule reads `--origam-radius---2xl` |
| Border | `border`, `borderBlock`, `borderInline`, `borderTop` / `Right` / `Bottom` / `Left`, `borderColor`, `borderStyle`, the four per-side `border*Color` | |
| Dimension | `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight` | |
| Commons | `id`, `class`, `style` | |

### Typography props (`Pick<ITypographyProps, …>`)

Only these four keys are declared. `fontFamily` is **not** a prop of this
component and passing it does nothing — it is a project-level setting
configured once on `OrigamApp`.

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

`<OrigamSystemBar>` reads its variables from
`packages/ds/src/assets/css/tokens/light.css` and `dark.css` (SCSS twins
under `packages/ds/src/assets/scss/tokens/`).

| CSS variable | Default |
|---|---|
| `--origam-system-bar---align-items` | `center` |
| `--origam-system-bar---display` | `flex` |
| `--origam-system-bar---flex` | `1 1 auto` |
| `--origam-system-bar---height` | `24px` |
| `--origam-system-bar---height-window` | `32px` |
| `--origam-system-bar---justify-content` | `flex-end` |
| `--origam-system-bar---max-width` | `100%` |
| `--origam-system-bar---padding-inline` | `var(--origam-space---2)` → `8px` |
| `--origam-system-bar---position` | `relative` |
| `--origam-system-bar---text-align` | `end` |
| `--origam-system-bar---width` | `100%` |
| `--origam-system-bar---background` | `var(--origam-color__neutral---700)` |
| `--origam-system-bar---color` | `var(--origam-color__text---inverse)` |
| `--origam-system-bar---font-size` | `var(--origam-font__size---sm)` → `0.75rem` |
| `--origam-system-bar---font-weight` | `var(--origam-font__weight---regular)` → `400` |
| `--origam-system-bar---letter-spacing` | `var(--origam-font__letterSpacing---wide)` → `0.0094em` |
| `--origam-system-bar---line-height` | `1.667` |
| `--origam-system-bar---text-transform` | `none` |
| `--origam-system-bar__icon---opacity` | `var(--origam-opacity---70)` → `0.7` |
| `--origam-system-bar---border-style` | `solid` |
| `--origam-system-bar---border-color` | `var(--origam-color__border---default)` |
| `--origam-system-bar---border-{top,right,bottom,left}-width` | `var(--origam-border__width---0)` |
| `--origam-system-bar---border-{start-start,start-end,end-start,end-end}-radius` | `var(--origam-radius---none)` |

That is the complete list — grep `--origam-system-bar` in
`packages/ds/src/assets/css/tokens/light.css` to confirm.

⚠️ The SCSS carries a literal fallback on `letter-spacing`
(`.0333333333em`) that **never fires**: the token is declared on `:root`, so
`var()` always resolves and the fallback is unreachable. The rendered value is
`0.0094em`. Same shape for every other `var(--origam-system-bar---…, literal)`
in that stylesheet — read the token column above, not the fallbacks.

⚠️ There is **no** `--origam-system-bar--rounded---border-radius`. An earlier
version of this table listed one; it is declared nowhere in the repository.
The `.origam-system-bar--rounded` rule reads `--origam-radius---2xl` (`24px`)
directly, and the six per-rung modifiers read the generic radius scale:

| Class | Token |
|---|---|
| `--rounded-x-small` | `--origam-radius---xs` |
| `--rounded-small` | `--origam-radius---sm` |
| `--rounded-default` | `--origam-radius---md` |
| `--rounded-medium` | `--origam-radius---lg` |
| `--rounded-large` | `--origam-radius---xl` |
| `--rounded-x-large` | `--origam-radius---2xl` |

⚠️ The whole `--origam-system-bar---border-*` family (style, color, the four
widths, the four radii) is **declared but never read**: no rule in
`OrigamSystemBar.vue` references any of them. Borders and corners come from
the `border` / `rounded` props via `useBorder` / `useRounded`, which emit
utility classes or inline declarations. Setting those variables changes
nothing.

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
