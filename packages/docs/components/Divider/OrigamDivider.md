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
    IBgColorProps, IMarginProps, IDirectionProps {
    inset?: boolean
    length?: number | string
    thickness?: number | string
}
```

| Prop | Type | Description |
|---|---|---|
| `direction` | `'horizontal' \| 'vertical'` | Orientation of the line (default `horizontal`). |
| `inset` | `boolean` | Offsets the line's start (and, when vertical, both ends) by a fixed margin — see the tokens table. |
| `length` | `number \| string` | Clamps the main axis (`max-width` horizontal / `max-height` vertical). Numbers are `px`, strings pass through verbatim. |
| `thickness` | `number \| string` | Overrides the border width on the active edge (`border-top-width` horizontal / `border-right-width` vertical). Numbers are `px`. |
| `color` / `bgColor` | `TIntent \| string` | Text/background intent forwarded to the `<hr>` via `useBothColor` — `color` tints the line through `currentColor`, `bgColor` paints a background behind it. |
| `margin*` | (`IMarginProps`) | Standard spacing props. |

## Anatomy

```html
<hr class="origam-divider origam-divider--{direction} [origam-divider--inset]"
    role="separator"
    aria-orientation="{direction}" />
```

## Design tokens consumed

⛔ **Corrected 2026-08-31 (issue #419)** — the table below previously listed
8 tokens the component's SCSS never reads (`--origam-divider---color`,
`---margin-block`, the four `---padding-*` entries, and a `label` feature
that does not exist in this component at all — `grep -n "label"
OrigamDivider.vue` returns zero matches). Overriding those at the
document root has **no visible effect**. The list below is the actually
consumed set, verified against
`packages/ds/src/components/Divider/OrigamDivider.vue`'s `<style>` block.
Override via a `:style` binding on the instance, or the matching entry in
`packages/ds/src/assets/css/tokens/light.css` / `dark.css` (and their
`_light.scss` / `_dark.scss` twins) to re-skin every divider.

| CSS variable | Default | Read by |
|---|---|---|
| `--origam-divider---opacity` | `100%` | base rule, `opacity` |
| `--origam-divider---border-top-width` | `thin` | base rule (horizontal), `border-top-width` — overridden inline when `thickness` is set |
| `--origam-divider---border-right-width` | *(unset, falls to `thin`)* | `&--vertical`, `border-right-width` — overridden inline when `thickness` is set (vertical) |
| `--origam-divider---max-width` | `100%` | base rule, `max-width` — overridden inline when `length` is set (horizontal) |
| `--origam-divider---max-height` | `100%` | `&--vertical`, `max-height` — overridden inline when `length` is set (vertical) |
| `--origam-divider--inset---margin-inline-start` | `16px` | `&--inset`, `margin-inline-start` / clamps `max-width` |
| `--origam-divider--inset---margin-block-start` | `8px` | `&--inset.origam-divider--vertical`, `margin-block-start` / clamps `max-height` |

Declared in the token sheets but **not currently read** by this
component (kept for a future revision — do not rely on them today):
`--origam-divider---color`, `---thickness`, `---border-style`,
`---margin-block`, the four `---padding-*` entries, and the three
`--origam-divider__label---*` entries. `color`/`bgColor` styling is real
but goes through `useBothColor` (inline `color`/`background-color`, not
these named tokens) — see the Props table above.

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
