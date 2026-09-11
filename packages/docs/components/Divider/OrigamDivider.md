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

⛔ **Re-verified 2026-09-10** — the previous version of this table (written
2026-08-31, issue #419) listed `---thickness`, `---border-style`,
`---margin-block` and the four `---padding-*` entries as dead. Issue #550's
C2 campaign (commit `4573f9c1`, 2026-09-05) wired 7 of those into the SCSS
**after** this doc was last edited, so that list went stale without anyone
updating the doc — exactly the kind of drift this section exists to prevent.
Re-verified line-by-line against the current
`packages/ds/src/components/Divider/OrigamDivider.vue` `<style>` block
before rewriting.

| CSS variable | Default | Read by |
|---|---|---|
| `--origam-divider---opacity` | `100%` | base rule, `opacity` |
| `--origam-divider---border-style` | `solid` | base rule, `border-style` |
| `--origam-divider---border-top-width` | falls to `---thickness`, then `thin` | base rule (horizontal), `border-top-width` — overridden inline when `thickness` prop is set |
| `--origam-divider---border-right-width` | falls to `---thickness`, then `thin` | `&--vertical`, `border-right-width` — overridden inline when `thickness` prop is set |
| `--origam-divider---thickness` | `{border.width.thin}` | shared fallback for both `---border-top-width` and `---border-right-width` above |
| `--origam-divider---max-width` | `100%` | base rule, `max-width` — overridden inline when `length` prop is set (horizontal) |
| `--origam-divider---max-height` | `100%` | `&--vertical`, `max-height` — overridden inline when `length` prop is set (vertical) |
| `--origam-divider---margin-block` | `{space.0}` | base rule, `margin-block` |
| `--origam-divider---padding-block-start` | `{space.0}` | base rule, `padding-block-start` |
| `--origam-divider---padding-block-end` | `{space.0}` | base rule, `padding-block-end` |
| `--origam-divider---padding-inline-start` | `{space.0}` | base rule, `padding-inline-start` |
| `--origam-divider---padding-inline-end` | `{space.0}` | base rule, `padding-inline-end` |
| `--origam-divider--inset---margin-inline-start` | `16px` | `&--inset`, `margin-inline-start` / clamps `max-width` |
| `--origam-divider--inset---margin-block-start` | `8px` | `&--inset.origam-divider--vertical`, `margin-block-start` / clamps `max-height` |

Still declared in the token sheets but **not read** by this component
(#550 left these on purpose — see the commit message for the reason each
was skipped, not silently forgotten):

- `--origam-divider---color` — no `border-color` rule exists on the
  component; `color`/`bgColor` styling goes through `useBothColor` (inline
  `color`/`background-color`), not this named token. Wiring it would
  replace today's implicit `currentColor` inheritance with a fixed neutral
  — a real visual change, not a free one.
- `--origam-divider__label---color`, `---font-size`, `---padding-inline` —
  a "divider with a label" feature that does not exist on this component:
  the root element is a bare `<hr>` (void content model, cannot host a
  slot). Building it is a markup change, not a token wiring.

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
