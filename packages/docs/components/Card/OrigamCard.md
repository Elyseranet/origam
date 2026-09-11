# OrigamCard

`<OrigamCard>` is a **flagship surface component** that composes a clickable or static content
container with optional header, asset image, text body, and footer. It supports the full
gamut of layout, styling, and accessibility features via composable prop mixins.

## Basic usage

```vue
<template>
    <OrigamCard title="Card title" text="Supporting text." />
</template>
```

## Header

Pass `title`, `subtitle`, `prependIcon`, `appendIcon`, `prependAvatar`, or `appendAvatar`
to populate the header automatically. Use the named header slots for full control.

```vue
<template>
    <OrigamCard
        title="Profile"
        subtitle="Active account"
        prepend-icon="mdi-account"
    />
</template>
```

## Asset / image

```vue
<template>
    <OrigamCard
        image="https://picsum.photos/600/300"
        title="Image card"
    />
</template>
```

## Clickable (link)

```vue
<template>
    <OrigamCard
        link
        href="https://origam.dev"
        title="Click me"
    />
</template>
```

## Loading state

Accepts a boolean or a number (progress percentage) for `loading`.

```vue
<template>
    <OrigamCard loading title="Fetching data…" />
    <OrigamCard :loading="75" title="75 % loaded" />
</template>
```

## Disabled

```vue
<template>
    <OrigamCard disabled title="Cannot interact" />
</template>
```

## Hover elevation

Add the `hover` boolean to lift the card on pointer-over.

```vue
<template>
    <OrigamCard hover title="Hover me" />
</template>
```

## Flat

Remove shadow with `flat`.

```vue
<template>
    <OrigamCard flat title="No shadow" />
</template>
```

## Elevation

`elevation` accepts three shapes:

- An **origam-native rung name** — `'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'` —
  resolves to `var(--origam-shadow---{rung})`.
- A **Material-style number** — `0..24` — bucketised onto the origam shadow ladder.
- A **free-form custom `box-shadow` value** — `var(...)`, `calc(...)`, a literal shadow list,
  multiple comma-separated layers, `inset`, … — emitted verbatim.

```vue
<template>
    <OrigamCard :elevation="8" title="Elevated card" />
    <OrigamCard elevation="lg" title="Elevated card (named rung)" />
    <OrigamCard elevation="0 4px 12px rgba(0,0,0,.24)" title="Custom box-shadow" />
</template>
```

The custom form is detected permissively (same approach as the `rounded` free-form escape
hatch): any string that isn't a named rung and doesn't parse as `0..24` is treated as a custom
`box-shadow` if it carries at least one shadow-like signal — a CSS function call (`var(`,
`calc(`, `rgba(`, …), a hex color, a length with a unit, or `inset`. Anything else falls
through to the pre-existing behaviour (no shadow emitted). See `useElevation`
(`src/composables/Commons/elevation.composable.ts`) for the full resolution order.

## Rounded

```vue
<template>
    <OrigamCard rounded="large" title="Rounded card" />
</template>
```

## Border

```vue
<template>
    <OrigamCard border title="Bordered card" />
</template>
```

### Border — per side

`borderTop` / `borderRight` / `borderBottom` / `borderLeft` set an independent width
(and optionally style/color, via a free-form string like `"2px dashed red"`) for a
single physical side, and `borderTopColor` / `borderRightColor` / `borderBottomColor` /
`borderLeftColor` set an independent color for that side (accepts a semantic intent —
`'primary'`, `'danger'`, … — or a raw CSS color; gradients are not supported on border
colors and are silently ignored).

```vue
<template>
    <OrigamCard
        :border-top="4"
        :border-right="2"
        :border-bottom="4"
        :border-left="2"
        border-top-color="danger"
        border-right-color="primary"
        border-bottom-color="success"
        border-left-color="info"
        title="Per-side border"
    />
</template>
```

Precedence (specific beats global, per physical side): the global `border` shorthand
resolves first, then the standalone `borderColor` / `borderStyle`, then the per-side
`borderTop` / `borderRight` / `borderBottom` / `borderLeft`, and finally the per-side
`*Color` props win last. Each rung only overrides the side(s) it actually targets —
e.g. `border="1px solid black"` with `borderTop="4px dashed red"` renders a 4px dashed
red top edge while the other three sides stay 1px solid black.

## Density

```vue
<template>
    <OrigamCard density="compact" title="Compact card" />
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `wrapper` | — | Full override of all internal content. |
| `loader` | — | Custom loader element (replaces the progress bar). |
| `header` | — | Replaces the entire auto-generated header. |
| `header.prepend` | — | Prepend content inside the header. |
| `header.append` | — | Append content inside the header. |
| `header.title` | — | Title content inside the header. |
| `header.subtitle` | — | Subtitle content inside the header. |
| `header.content` | — | Body of the header. |
| `asset` | — | Replaces the image container. |
| `text` | — | Replaces the `OrigamCardText` text region. |
| `default` | — | Main body content. |
| `footer` | — | Footer area below the body. |

## Events

| Name | Payload | When |
|---|---|---|
| `click:prepend` | `MouseEvent` | Click on the prepend icon/avatar in the header. |
| `click:append` | `MouseEvent` | Click on the append icon/avatar in the header. |

## Design tokens

| CSS variable | Description |
|---|---|
| `--origam-card---background` | Card background color. |
| `--origam-card---color` | Card text color. |
| `--origam-card---box-shadow` | Shadow layer. |
| `--origam-card---border-radius` | Border radius (composed from four corner tokens). |
| `--origam-card---border-color` | Border color. |
| `--origam-card---border-width` | Border width. |
| `--origam-card---padding-block-start` | Block-start padding. |
| `--origam-card---padding-block-end` | Block-end padding. |
| `--origam-card---density` | Density modifier (added to each padding axis). |
| `--origam-card---transition-duration` | Hover / focus transition timing. |
| `--origam-card__overlay---opacity` | Overlay scrim opacity on hover / focus. |

## Accessibility

- When `link` is true the card is rendered as an anchor element and is keyboard-reachable.
- `disabled` sets `tabindex="-1"` and `pointer-events: none`.
- The card never assumes an implicit ARIA role; authors must add `role="article"` or similar
  when the content requires it.
