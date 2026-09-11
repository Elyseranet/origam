# OrigamTextMask

`<OrigamTextMask>` paints arbitrary text as a transparent "window" over
an animated background, using `background-clip: text` + a transparent
fill. The text content stays in the DOM so screen readers, search
engines and copy-paste keep working — the transform is purely visual.

Typical use: hero headlines on marketing pages, brand reveals, hover
flourishes on display typography.

## Basic usage

```vue
<template>
    <OrigamTextMask
        text="HELLO WORLD"
        :background="{ from: 'primary', to: 'success', direction: 90 }"
        animated
        animation-duration="3s"
        font-size="5xl"
        font-weight="black"
    />
</template>
```

```vue
<template>
    <OrigamTextMask
        text="ORIGAM"
        :background="{ type: 'conic', stops: [
            { color: 'primary', position: 0 },
            { color: 'success', position: 50 },
            { color: 'primary', position: 100 }
        ] }"
        animated
        animation-type="rotate"
    />
</template>
```

## Use cases

- **Hero text** — large display typography on a marketing landing page
  with a brand-coloured ramp moving behind the glyphs.
- **Brand reveal** — short product names or wordmarks with a slow `zoom`
  or `pulse` animation that draws the eye without distracting.
- **Section dividers** — display headings where the gradient hints at
  the section's tone (warning → danger for a "Risks" section, primary →
  success for a "Roadmap" section).
- **Status callouts** — for headlines that should pull double duty as a
  semantic cue (e.g. an `info → primary` ramp on a tip block).

## Background sources

`background` accepts four shapes:

| Input | Example | Resolved as |
|---|---|---|
| `IGradient` object | `{ from: 'primary', to: 'success' }` | `linear-gradient(135deg, var(--origam-color__action--primary---bg), var(--origam-color__action--success---bg))` |
| Raw gradient string | `"linear-gradient(90deg, #ff0080, #7928ca)"` | Passed through |
| Preset name | `"gradient-sunset"` | `var(--origam-gradient---sunset)` |
| Image / video URL | `"url(/hero-poster.jpg)"` | Passed through as `background-image` |

The four shapes share the same prop and resolver (`resolveGradient`) as
the design-system-wide gradient enrichment shipped with the wave-4
release.

## Animation types

| Type | Visual | Best fit |
|---|---|---|
| `pan` (default) | Background `background-position` slides 0% → 100% horizontally | Linear ramps where every stop is colour-meaningful |
| `rotate` | `filter: hue-rotate(0 → 360deg)` | Conic gradients (every angle is a colour) — rotating the element itself would tilt the glyphs |
| `pulse` | `background-size` breathes 100% ↔ 140% on a 50% ease-in-out cycle | Subtle "alive" feel without much movement |
| `zoom` | `background-size` grows 100% → 220% on `alternate` | Cinematic "moving forward" effect |

All four respect `prefers-reduced-motion: reduce` — the SCSS sets
`animation: none !important;` so users opting out of motion get the
painted text without flashes or transforms.

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Replaces the `text` prop. Accepts any markup (multi-line headlines, nested `<h1>` / `<span>` / `<em>`). When the slot is provided, the `text` prop is ignored. |

```vue
<template>
    <OrigamTextMask
        :background="{ from: 'primary', via: 'warning', to: 'danger' }"
        animated
        tag="div"
    >
        <h1 style="font-size: 6rem">DESIGN</h1>
        <span style="font-size: 2rem">— system —</span>
    </OrigamTextMask>
</template>
```

## Props (interface)

```ts
interface ITextMaskProps extends ICommonsComponentProps, ITagProps, ITypographyProps {
    text?: string
    background: string | IGradient
    animated?: boolean
    animationDuration?: string
    animationType?: 'pan' | 'rotate' | 'pulse' | 'zoom'
    align?: 'left' | 'center' | 'right'
}
```

Typography props (from `ITypographyProps` — all optional, accept design token keys):

| Prop | Type | Token group | Default (SCSS fallback) |
|---|---|---|---|
| `fontFamily` | `'sans' \| 'mono' \| 'serif'` | `--origam-font__family---*` | `inherit` |
| `fontSize` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl'` | `--origam-font__size---*` | `--origam-text-mask---font-size-default` (`5xl`) |
| `fontWeight` | `'regular' \| 'medium' \| 'semibold' \| 'bold' \| 'extrabold' \| 'black'` | `--origam-font__weight---*` | `--origam-text-mask---font-weight-default` (`bold`) |
| `lineHeight` | `'none' \| 'tight' \| 'snug' \| 'normal' \| 'relaxed' \| 'loose'` | `--origam-font__lineHeight---*` | `--origam-text-mask---line-height-default` (`tight`) |
| `letterSpacing` | `'tight' \| 'normal' \| 'wide' \| 'wider' \| 'widest'` | `--origam-font__letterSpacing---*` | `normal` |

When a typography prop is unset, the corresponding inline custom property is not emitted and the
SCSS fallback token keeps control — the component is still fully themed without passing any typography
prop explicitly.

## Anatomy

```html
<span class="origam-text-mask origam-text-mask--align-left origam-text-mask--pan">
    HELLO WORLD
</span>
```

The `tag` prop swaps the wrapping element (default `span`, often `h1`
/ `h2` / `p`).

## Design tokens consumed

`<OrigamTextMask>` reads from `tokens/component/text-mask.json`. The
per-instance values (font-size, animation duration, …) are emitted as
inline custom properties; the file below lets you re-skin every mask
in the document by overriding the defaults at the document root.

| CSS variable | Token reference |
|---|---|
| `--origam-text-mask---font-size-default` | `{font.size.5xl}` |
| `--origam-text-mask---font-weight-default` | `{font.weight.bold}` |
| `--origam-text-mask---line-height-default` | `{font.lineHeight.tight}` |
| `--origam-text-mask__animation---duration-default` | `3s` |
| `--origam-text-mask__animation---easing-default` | `{motion.easing.standard}` |

The full list lives in `tokens/component/text-mask.json`.

## Browser support

`background-clip: text` reached
[Baseline 2024](https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip)
(Chrome 120, Firefox 120, Safari 17). On older engines the property is
ignored — the text stays painted with the default `color` of the
element, which is still legible. We also ship the `-webkit-` vendor-
prefixed variant for older WebKit / iOS Safari.

## Accessibility

- The text content stays in the DOM, so screen readers, browser find,
  and translation tools see the original characters unchanged.
- The transparent fill is purely visual. The element keeps its semantic
  tag (`<span>` by default, or whatever you pass through `tag`).
- All four animation keyframes are disabled under
  `prefers-reduced-motion: reduce`. Users who request reduced motion
  see a static painted text without any movement.
- When pairing a gradient with `tag="h1"`, make sure the document
  outline still resolves to a single H1 — visual emphasis is decoupled
  from heading level.

## Performance

- Zero JavaScript animation — every motion path is a CSS `@keyframes`
  rule. The browser keeps the work on the compositor when possible
  (`background-position` and `filter: hue-rotate` are GPU-friendly).
- One reflow per prop change (font-size / animation-duration are
  applied as inline custom properties).
- The component does not register `IntersectionObserver` — if you have
  dozens of mask instances on the page, consider pausing animations
  off-screen by toggling the `animated` prop based on `useIntersectionObserver`
  (planned enhancement; not yet wired into the component).

## Theming notes

- The component is theme-aware out of the box when the background uses
  intents or preset names. Switching `<html data-theme="…">` re-resolves
  every CSS variable instantly — no Vue re-render required.
- Raw colour strings (`"#ff0080"`, `"rgb(...)"`) are passed through
  verbatim and do NOT re-tint with the theme.

## Related

- `OrigamTitle` — semantic heading wrapper. Wrap it inside a `TextMask`
  when you want a clipped heading.
- `OrigamLabel` — inline label element with intent-aware colour.
- The gradient resolver (`resolveGradient`) and the `IGradient`
  interface are shared with the `useColor` transversal — the same input
  shapes work on `bgColor`, `color` and `background`.
