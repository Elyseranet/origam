# OrigamQrCode

Native SVG QR-code renderer powered by
[`qrcode-generator`](https://www.npmjs.com/package/qrcode-generator)
(~5 kB minified, pure JavaScript, no canvas dependency). Produces a
scalable, themeable matrix that inherits the parent's `color` by
default — drop it into any layout, swap the surrounding theme, the
QR re-paints with the right foreground without a re-encode.

## Quick start

```vue
<template>
    <origam-qr-code
        value="https://origam.dev"
        size="large"
        error-correction-level="M"
    />

    <origam-qr-code
        value="WIFI:T:WPA;S:origam-guest;P:welcome2026;;"
        :size="200"
        error-correction-level="Q"
    />

    <origam-qr-code
        value="https://origam.dev/qrcode-with-icon"
        error-correction-level="H"
        icon="mdi-star"
        :size="240"
        rounded="default"
    />

    <origam-qr-code
        value="https://origam.dev/qrcode-with-image"
        error-correction-level="H"
        :image="{ src: '/brand-logo.svg', alt: 'Brand', aspectRatio: 1 }"
        :size="240"
    />
</template>
```

## Props

The component extends every standard DS transverse interface
(`ICommonsComponentProps`, `ITagProps`, `IColorProps`, `IBgColorProps`,
`IRoundedProps`, `ISizeProps`, `IBorderProps`, `IMarginProps`,
`IPaddingProps`). Only the QR-specific props are listed below.

| Prop                   | Type                                   | Default          | Notes                                                                                          |
|------------------------|----------------------------------------|------------------|------------------------------------------------------------------------------------------------|
| `value`                | `string`                               | required         | Text or URL to encode (UTF-8).                                                                 |
| `errorCorrectionLevel` | `'L' \| 'M' \| 'Q' \| 'H'`             | `'M'`            | Reed-Solomon redundancy budget — see the matrix below.                                         |
| `quietZone`            | `number`                               | `4`              | Quiet-zone width (in modules). ISO/IEC 18004 recommends ≥4.                                    |
| `icon`                 | `TIcon`                                | —                | Centred `<OrigamIcon>` overlay. Mutually exclusive with `image`.                               |
| `image`                | `string \| ISrcObject`                 | —                | Centred image overlay (URL or `ISrcObject`). Wins over `icon` when both are set.               |
| `ariaLabel`            | `string`                               | —                | Accessible label. Defaults to `"QR code for {value}"`.                                         |

### DS transverse props

| Prop             | Source            | Effect                                                                                       |
|------------------|-------------------|----------------------------------------------------------------------------------------------|
| `color`          | `IColorProps`     | Dark-module fill — accepts a `TIntent` (`primary`, …), any CSS colour, or `'currentColor'`. |
| `bgColor`        | `IBgColorProps`   | Quiet-zone background — same value space as `color`. `'transparent'` keeps the parent visible. |
| `size`           | `ISizeProps`      | Wrapper width / height — accepts the canonical `TSize` rungs (`'x-small'` … `'x-large'`) **or** any raw number / CSS dimension. |
| `rounded`        | `IRoundedProps`   | **Per-module** SVG corner radius (mapped to 0..0.5 module units). `'x-large'` paints circle modules. Distinct from a wrapper `border-radius`. |
| `border`         | `IBorderProps`    | Wrapper border (rendered via `useBorder`).                                                  |
| `margin`         | `IMarginProps`    | Wrapper outer spacing (rendered via `useMargin`).                                           |
| `padding`        | `IPaddingProps`   | Wrapper inner spacing (rendered via `usePadding`).                                          |
| `tag`            | `ITagProps`       | Wrapper element (default `'div'`).                                                          |
| `class`, `style` | `ICommonsComponentProps` |                                                                                       |

### `rounded` → per-module corner mapping

| `rounded` value          | Internal cornerRadius (module units) |
|--------------------------|--------------------------------------|
| `undefined` / `''`       | `0` (square modules)                 |
| `false`                  | `0`                                  |
| `'x-small'`              | `0.10`                               |
| `'small'`                | `0.18`                               |
| `'default'`              | `0.25`                               |
| `'medium'`               | `0.30`                               |
| `'large'`                | `0.40`                               |
| `'x-large'` / `true`     | `0.50` (circle modules)              |
| `number`                 | clamped to `[0, 0.5]`                |
| string CSS (`'4px'`)     | `0` (modules speak module units, not pixels) |

## Error correction levels

| Level | Recovery | Recommended for                                                       |
|-------|----------|-----------------------------------------------------------------------|
| `L`   | ~7%      | Clean digital display, dense payload, no overlay.                     |
| `M`   | ~15%     | Default — balanced for screen and clean print without overlay.        |
| `Q`   | ~25%     | Outdoor / print surface at risk of light damage; small icon overlay.  |
| `H`   | ~30%     | Marketing-style codes with a centred icon/image (up to ~25–30% width).|

Bumping the level **grows** the matrix for the same payload. Take that
into account when designing for a fixed physical footprint — going
from `L` to `H` on a long URL can push the matrix from a 25×25 to a
33×33 grid, and the per-module size shrinks proportionally.

## Centre overlay — `icon`, `image`, `#center` slot

Three overlay options, **slot wins over `image` wins over `icon`**:

1. **`icon`** — pass any `TIcon` value (`'mdi-star'`, a Vue component,
   an SVG-path array). Rendered via `<OrigamIcon>` positioned at the
   centre of the wrapper (absolute, 20 % × 20 % of the wrapper box).

2. **`image`** — pass a raw URL string or an `ISrcObject` shape (the
   same shape `<OrigamImg>` accepts). Injected as an inline SVG
   `<image>` element so the asset stays vector-friendly and SSR-safe.

3. **`#center` scoped slot** — full control. Receives
   `{ size }` (module units of the reserved square) so you can paint
   custom HTML / SVG without re-deriving the geometry. When the slot
   is provided, both `icon` and `image` are ignored.

```vue
<origam-qr-code
    value="https://origam.dev/icon-overlay"
    error-correction-level="H"
    icon="mdi-star"
    :size="240"
/>

<origam-qr-code
    value="https://origam.dev/image-overlay"
    error-correction-level="H"
    :image="{ src: '/brand-logo.svg', alt: 'Brand', aspectRatio: 1 }"
    :size="240"
/>

<origam-qr-code
    value="https://origam.dev/custom-overlay"
    error-correction-level="H"
    :size="240"
>
    <template #center="{ size }">
        <my-custom-marker :size="size" />
    </template>
</origam-qr-code>
```

Overlay sizing guidelines (centre block ≈ 20 % of wrapper width):

| `errorCorrectionLevel` | Safe overlay surface |
|------------------------|----------------------|
| `L`                    | do not use an overlay |
| `M`                    | ≤ 10 % wrapper width  |
| `Q`                    | ≤ 20 % wrapper width  |
| `H`                    | ≤ 25 – 30 % wrapper width |

## Scannability tips

- **Contrast** — keep the foreground / background luminance contrast
  ≥ 4.5:1. Inverted codes (light modules on dark surface) work in
  practice but some legacy scanners fail; test on a real device.
- **Physical size** — for a printed code, the rule of thumb is
  `scan_distance / 10 ≈ matrix_width`. A 240 px / 6 cm code is
  comfortable at arm's length; a 480 px / 12 cm code is needed for a
  poster meant to be scanned from 1 metre.
- **Quiet zone** — the default `quietZone=4` is mandatory. Reducing it
  below 4 makes the matrix harder to detect against busy backgrounds.
- **Don't recolour blindly** — `color="currentColor"` works well in
  any theme, but pairing it with a contrasting `bgColor` is what lets
  the scanner detect the matrix boundaries.

## Accessibility

The component renders inside a `role="img"` element with an
`aria-label` derived from `value` (or the explicit `ariaLabel` prop).
Screen readers announce the underlying payload — useful for URLs and
plain-text codes; consider a custom `ariaLabel` for opaque payloads
(magic links, signed tokens, …) where the raw value is meaningless to
a human listener.

Because the SVG is decorative for sighted users (the meaning is in
the scan), no visible alternative text is provided — the `aria-label`
is exactly the accessibility contract.

## SSR

The renderer is SSR-safe. `qrcode-generator` is pure JavaScript with
no DOM access, and the SVG is emitted as a string mounted via
`innerHTML` after `onMounted`. The matrix encodes identically on
server and client — no hydration mismatch.

## Slots

| Slot       | Scoped bindings        | Notes                                                                 |
|------------|------------------------|-----------------------------------------------------------------------|
| `center`   | `{ size: number }`     | Replaces `icon` / `image`. `size` is the central reserved square in module units (≈ 20 % of the matrix). |

## Composable — `useQrCode`

The composable is intentionally **lower-level** than the component —
it speaks `foreground` / `background` / `cornerRadius` (raw CSS
values + module units) rather than the canonical DS contracts. The
wrapper component maps `color` / `bgColor` / `rounded` down to these
keys.

```ts
import { useQrCode } from '@origam/composables'

const { svg, modules, size } = useQrCode(valueRef, {
    errorCorrectionLevel: 'H',
    foreground: '#000',
    background: '#fff',
    cornerRadius: 0.25,
    logo: { src: '/logo.svg', size: 0.2 }
})
```

- `svg: ComputedRef<string>` — ready-to-mount SVG fragment.
- `modules: ComputedRef<boolean[][]>` — raw N×N matrix (`true` = dark).
- `size: ComputedRef<number>` — matrix width in modules.

The composable caches the latest 16 matrices in a module-level LRU
keyed on `value + errorCorrectionLevel`. Re-renders with the same
payload reuse the cached matrix, so the only cost is the SVG-string
build.
