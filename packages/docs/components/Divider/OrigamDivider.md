# OrigamDivider

`<OrigamDivider>` is the thin separator line used between sections,
list rows, or toolbar items. It renders a native `<hr>` and supports
horizontal / vertical orientation, custom length, and custom thickness.

It is intentionally **structural**: no chrome, no surface, no elevation.
The visible line is drawn by a single border edge (`border-top` for
horizontal, `border-right` for vertical) so it inherits theme colors via
`currentColor` / opacity.

## Basic usage

```vue
<template>
    <OrigamDivider />
</template>
```

## Direction

```vue
<template>
    <OrigamDivider direction="horizontal" />

    <div style="display: flex; height: 24px;">
        <span>Left</span>
        <OrigamDivider direction="vertical" />
        <span>Right</span>
    </div>
</template>
```

## Length

`length` clamps the divider's main axis. Numbers are treated as `px`,
strings pass through verbatim (`'50%'`, `'8rem'`, …).

```vue
<template>
    <OrigamDivider :length="120" />
    <OrigamDivider length="50%" />
</template>
```

## Thickness

`thickness` overrides the border width on the active edge. Numbers are
treated as `px`.

```vue
<template>
    <OrigamDivider :thickness="2" />
    <OrigamDivider thickness="0.125rem" />
</template>
```

## Slots

`<OrigamDivider>` renders a self-closing `<hr>` and exposes no slots.

## Props (interface)

```ts
interface IDividerProps extends ICommonsComponentProps, IColorProps,
    IMarginProps, IDirectionProps {
    inset?: boolean
    length?: number | string
    thickness?: number | string
}
```

## Anatomy

```html
<hr class="origam-divider origam-divider--{direction} [origam-divider--inset]"
    role="separator"
    aria-orientation="{direction}" />
```

## Design tokens consumed

`<OrigamDivider>` reads from `tokens/component/divider.json`. Override
at the document root or via a `:style` binding to re-skin a single
instance.

| CSS variable | Token reference |
|---|---|
| `--origam-divider---color` | `{color.border.subtle}` |
| `--origam-divider---thickness` | `{border.width.thin}` |
| `--origam-divider---border-style` | `solid` |
| `--origam-divider---opacity` | `{opacity.100}` |
| `--origam-divider---margin-block` | `{space.0}` |
| `--origam-divider---padding-block-start` | `{space.0}` |
| `--origam-divider---padding-block-end` | `{space.0}` |
| `--origam-divider---padding-inline-start` | `{space.0}` |
| `--origam-divider---padding-inline-end` | `{space.0}` |
| `--origam-divider---max-width` | (set inline by `length`, horizontal) |
| `--origam-divider---max-height` | (set inline by `length`, vertical) |
| `--origam-divider---border-top-width` | (set inline by `thickness`, horizontal) |
| `--origam-divider---border-right-width` | (set inline by `thickness`, vertical) |
| `--origam-divider__label---color` | `{color.text.secondary}` |
| `--origam-divider__label---font-size` | `{font.size.sm}` |
| `--origam-divider__label---padding-inline` | `{space.3}` |

The full list lives in
`tokens/component/divider.json`.

## Accessibility

- The element is rendered as `<hr>` with `role="separator"` and
  `aria-orientation` mirroring `direction`.
- A `role` attribute on the host overrides the default `separator` role
  (and suppresses `aria-orientation`).
- Dividers are decorative when sandwiched between visually distinct
  blocks — assistive tech still announces them as section breaks via
  the native `<hr>`.

## Theming notes

- Theme-aware out of the box — switching `<html data-theme="…">`
  re-resolves the border color instantly.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamSheet` — chrome surface frequently
  separated by dividers.
- `OrigamSection` — semantic section
  wrapper.
