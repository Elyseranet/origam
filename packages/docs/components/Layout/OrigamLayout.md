# OrigamLayout

`<OrigamLayout>` is the application shell. It owns a measured viewport
and registers every layout-aware child (drawer, app-bar, system-bar,
bottom-nav, main, …) via the `useCreateLayout` composable so each one
can position itself relative to its siblings.

Use **one** `<OrigamLayout>` near the top of your app — usually around
`<NuxtPage />` or `<RouterView />`.

## Basic usage

```vue
<template>
    <OrigamLayout>
        <OrigamSystemBar />
        <OrigamAppBar />
        <OrigamDrawer />
        <OrigamMain>
            <RouterView />
        </OrigamMain>
        <OrigamBottomNav />
    </OrigamLayout>
</template>
```

## Overlaps

`overlaps` is a list of layout item id pairs that should not push each
other but instead stack on top of one another. Each entry is the
`name` of a layout item (`AppBar`, `Drawer`, `BottomNav`, …) joined
with a colon.

```vue
<template>
    <OrigamLayout :overlaps="['AppBar:Drawer']">
        <OrigamAppBar name="AppBar" />
        <OrigamDrawer name="Drawer" />
        <OrigamMain>…</OrigamMain>
    </OrigamLayout>
</template>
```

## Full-height

`fullHeight` opts the wrapper into `min-height: 100vh` — it occupies at
least the full viewport (useful for shells that have no surrounding
scroll context: Tauri windows, embedded dashboards…) and grows past one
screen if its content is taller, rather than clipping.

```vue
<template>
    <OrigamLayout full-height>
        <OrigamMain>…</OrigamMain>
    </OrigamLayout>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | The application's chrome and main slot. |

## Exposed methods

`<OrigamLayout>` exposes (via `defineExpose`) helpers that are useful
when you need to read the layout state imperatively:

| Method / property | Returns | Description |
|---|---|---|
| `getLayoutItem(id)` | `ILayerItem \| undefined` | Read the resolved rect of a layout item by id. |
| `items` | `Ref<ILayerItem[]>` | Reactive list of all registered items. |
| `filterProps` | `Function` | Internal helper for deferred-tag rendering. |

## Props

`<OrigamLayout>` is not just a positioning shell: it composes nine
Commons prop interfaces, and consumes every one of them on its root
element.

```ts
interface ILayoutProps extends
    ICommonsComponentProps, IDimensionProps, IMarginProps, IPaddingProps,
    IRoundedProps, IElevationProps, IBgColorProps, IColorProps, IBorderProps {
    overlaps?:   Array<string>
    fullHeight?: boolean
}
```

### Own props

| Prop | Type | Default | Description |
|---|---|---|---|
| `overlaps` | `string[]` | `undefined` | Layout-item name pairs, joined with a colon, that should stack instead of pushing each other (see above). |
| `fullHeight` | `boolean` | `undefined` | Adds `origam-layout--full-height`, which gives the wrapper `width: 100vw; min-height: 100vh`. |

### Surface

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | `undefined` | Foreground colour (`useBothColor`). Inherited by descendants through normal CSS inheritance. |
| `bgColor` | `TColor` | `undefined` | Background colour (`useBothColor`). |
| `rounded` | `boolean \| number \| string \| TRounded` | `undefined` | Corner radius (`useRounded`). |
| `elevation` | `TElevation` | `undefined` | Shadow rung (`useElevation`). Only the class channel is bound, so a free-form `box-shadow` string or the `2xl` / `3xl` rungs — which resolve through the inline-style channel — do not paint. |
| `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`, `borderBlock`, `borderInline` | `boolean \| number \| string` | `undefined` | Border widths, per edge or per axis (`useBorder`). |
| `borderColor` | `string` | `undefined` | Border colour for every edge. |
| `borderStyle` | `string` | `undefined` | Border style. |
| `borderTopColor`, `borderRightColor`, `borderBottomColor`, `borderLeftColor` | `TColor` | `undefined` | Per-edge border colour. |

### Dimension & spacing

| Prop | Type | Default | Description |
|---|---|---|---|
| `height`, `width`, `minHeight`, `minWidth`, `maxHeight`, `maxWidth` | `number \| string` | `undefined` | Explicit box constraints (`useDimension`). A bare number becomes `Npx`. |
| `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `paddingBlock`, `paddingInline` | `boolean \| number \| string` | `undefined` | Padding on the layout root (`usePadding`). |
| `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `marginBlock`, `marginInline` | `boolean \| number \| string` | `undefined` | Margin on the layout root (`useMargin`). |

### Common

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | `layout-{uid}` | DOM id of the layout root — `useCreateLayout` resolves it as the prop when given, `layout-{uid}` otherwise. The inner wrapper always derives from it, as `{id}-wrapper`. |
| `class` | `string \| string[] \| object` | `undefined` | Extra classes on the layout root. |
| `style` | `string \| string[] \| object \| StyleValue` | `undefined` | Extra inline styles, merged last so they win over the composables' output. |

## Emits

None — `ILayoutEmits` is empty. `<OrigamLayout>` only registers layout
items through a provide/inject registry.

## Anatomy

```html
<div :id="layoutId" class="origam-layout">
    <div :id="`${layoutId}-wrapper`" class="origam-layout__wrapper">
        <!-- default slot — layout-aware children -->
    </div>
</div>
```

## Design tokens consumed

`<OrigamLayout>` reads its variables from
`packages/ds/src/assets/css/tokens/light.css` and `dark.css` (SCSS twins
under `packages/ds/src/assets/scss/tokens/`). The
component itself is mostly transparent; the layout-aware children
(drawer, app-bar, system-bar, …) consume their own tokens once
positioned.

| CSS variable | Default |
|---|---|
| `--origam-layout---position-top` | `0` |
| `--origam-layout---position-bottom` | `0` |
| `--origam-layout---position-left` | `0` |
| `--origam-layout---position-right` | `0` |

The `--origam-layout---position-*` variables are written by the layout
machinery whenever a child registers itself, so `<OrigamMain>` and
sibling elements can offset their inner padding accordingly.

## Accessibility

- The wrapper renders a presentational `<div>` — pick a meaningful
  semantic structure inside (a `<header>` slot via `<OrigamAppBar>`, a
  `<main>` slot via `<OrigamMain>`, …).
- Keep a single `<main>` per page; the layout doesn't enforce it but
  most consumers should.

## Theming notes

- **The wrapper does paint chrome of its own.** `<OrigamLayout>` wires
  `useBothColor`, `useBorder`, `useRounded`, `useElevation`,
  `useDimension`, `usePadding` and `useMargin` on its root, so
  `color` / `bgColor` / `border` / `rounded` / `elevation` and the
  spacing and dimension props all take effect there — the story's
  *Design* variant drives exactly those. Only the layout positioning
  itself (`position: relative`, `height`/`width: 100%`, the
  `--full-height` rule) is hard-coded in the scoped stylesheet.
- Because those props are declared, a theme's `components` block can set
  them for every layout at once — e.g.
  `{ 'origam-layout': { bgColor: 'surface', rounded: 'lg' } }`.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamMain` — the central scroll area.
- `OrigamSystemBar` — OS-style title bar.
- `OrigamAppBar`, `OrigamDrawer`, `OrigamBottomNav` — siblings registered against the layout.
