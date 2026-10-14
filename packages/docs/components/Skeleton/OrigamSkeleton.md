# OrigamSkeleton

`<OrigamSkeleton>` is a loading placeholder: it shows the shape of content
before it arrives. It is built from four **primitives** (a text line, a block,
a circle, a pill) that you compose to match the anatomy of what is loading.
Several blocks that load together belong in an
`<OrigamSkeletonGroup>`.

Use it for the initial load of content whose structure you know (a card, a
table, a list). An action in progress (saving, submitting) is not a skeleton's
job: use a spinner or a progress indicator.

## Basic usage

```vue
<template>
    <!-- a line of text -->
    <OrigamSkeleton variant="text" width="200" />

    <!-- a block -->
    <OrigamSkeleton variant="rectangular" width="100%" height="80px" />

    <!-- a round avatar -->
    <OrigamSkeleton variant="circular" width="48" />

    <!-- a tag / badge -->
    <OrigamSkeleton variant="pill" />
</template>
```

## Primitives

| Variant | Shape |
|---|---|
| `text` | A rounded bar about `0.7em` tall, vertically centred in a line of text (`--origam-skeleton---text-height` + `---text-margin-block`). Full width unless you set `width`. |
| `rectangular` | A block. Takes `width` / `height`. |
| `circular` | A perfect circle: `width` drives the diameter and the height follows (`aspect-ratio: 1`). 36px by default (`--origam-skeleton---circular-size`). |
| `pill` | A fully rounded capsule (a tag, a chip). `4em` x `1.5em` by default. |

The former `card` and `list-item` templates are gone. Compose the primitives
above inside an `OrigamSkeletonGroup` to mimic the anatomy you need.

## Animation

`animation` chooses how the placeholder moves.

| Value | Behaviour |
|---|---|
| `pulse` (default) | The fill breathes: opacity `1` to `0.55` and back, over `1.6 s`. |
| `wave` | A soft highlight sweeps across the block (`transform: translateX`). |
| `none` | Static. |

```vue
<template>
    <OrigamSkeleton variant="text" animation="wave" />
</template>
```

There is deliberately no `spin`: a rotating placeholder reads as a spinner.
The legacy boolean `pulse` was removed; `:pulse="false"` becomes
`animation="none"`.

### Never loops forever, never plays under reduced motion

- Every animation stops after a **finite number of loops**
  (`--origam-skeleton---animation-iterations`, `6` x `1.6 s` = about `10 s`,
  WCAG 2.2.2). The placeholder then stays on its static fill. This is CSS only,
  no timer.
- Under `prefers-reduced-motion: reduce` there is **no animation at all**: the
  placeholder is static from the first frame.

### Inside a group

Blocks in an `<OrigamSkeletonGroup>` follow the group's `animation` unless they
set their own. In `pulse` the group container is what animates, so every block
breathes on the same clock even if they mount at different moments.

## Colour

The fill is `currentColor` mixed with transparent (`10 %` in light, `13 %` in
dark), so it follows themes, modes and surfaces with no token to maintain. The
contrast against the surface is deliberately low (about 1.25 to 1.5:1): a
placeholder is decorative, it must not compete with content.

`color` tints the placeholder; `bgColor` paints behind the translucent fill.

## Loading toggle

When `loading` is `false` the skeleton is not rendered and the `default` slot
is displayed instead.

```vue
<template>
    <OrigamSkeleton :loading="isLoading" variant="text" width="200">
        <p>Content loaded</p>
    </OrigamSkeleton>
</template>
```

## Painting any element as a placeholder (the host state)

A component can turn **its own element** into a placeholder, without adding a
node, by carrying the utility class `.origam--skeleton`:

```html
<div class="origam--skeleton">A title that is still loading</div>
<div class="origam--skeleton origam--skeleton-wave">Shimmering</div>
<div class="origam--skeleton origam--skeleton-none">Static</div>
```

The element keeps its real size and radius, so the placeholder has the real
silhouette. Its text and children become invisible (the layout box is
untouched) and a fill is painted over it in `::after`. It uses the same tokens,
the same pulse, the same finite-loop cap and the same reduced-motion rule as
`<OrigamSkeleton>`.

Constraints to know before using it on a host:

- **It does not work on `<input>`**, nor on any replaced element (`<img>`,
  `<textarea>`, `<select>`): a browser does not render `::after` there
  (measured, pixels read back: nothing is painted, although `getComputedStyle`
  still reports the pseudo-element). Put the class on the wrapper that draws
  the field.
- The host's own `::before` / `::after` are taken over.
- A static host becomes `position: relative` (a component's own `position`
  still wins).
- It is purely visual and inert (`pointer-events: none`). The host must still
  carry `aria-busy="true"` (and `aria-disabled="true"` on a control).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'text' \| 'rectangular' \| 'circular' \| 'pill'` | `'rectangular'` | Shape. |
| `animation` | `'pulse' \| 'wave' \| 'none'` | `'pulse'` (or the group's) | Motion. |
| `loading` | `boolean` | `true` | When `false`, renders the slot instead. |
| `label` | `string` | `'origam.loading'` | Locale key of the announcement, for a standalone block. See [Accessibility](#accessibility). |
| `width`, `height`, `minWidth`, `minHeight`, `maxWidth`, `maxHeight` | `string \| number` | - | Dimensions (a number is `px`). |
| `rounded` | `TRounded \| boolean \| number \| string` | - | Corner radius override. |
| `size` | `TSize \| number` | - | Size. |
| `bgColor` | `TColor` | - | Colour painted behind the fill. |
| `color` | `TColor` | - | Tints the fill (it is derived from the text colour). |

## Emits

None.

## Slots

| Slot | Description |
|---|---|
| `default` | The real content, rendered when `loading` is `false`. |

## Accessibility

- A block **inside an `<OrigamSkeletonGroup>`** is `aria-hidden="true"` and has
  no role: the group makes the one announcement for the whole zone.
- A **standalone** block is its own zone, so it announces itself:
  `role="status"`, `aria-busy="true"` and an `aria-label`. Several standalone
  blocks therefore announce several times: group them.
- The accessible name comes from `label`, a **locale key** resolved through the
  DS `t()` (default `origam.loading`, shared with `OrigamProgress`,
  `OrigamVideo`, `OrigamAudio`, `OrigamSwitch`). A raw string that matches no
  key is returned unchanged.

```vue
<OrigamSkeleton variant="text" width="200" />
<OrigamSkeleton variant="rectangular" label="invoices.loading_list" />
```

## Design tokens

| CSS variable | Default |
|---|---|
| `--origam-skeleton---background-color` | `color-mix(in srgb, currentColor 10%, transparent)` (13 % in dark) |
| `--origam-skeleton---highlight-color` | `color-mix(in srgb, currentColor 5%, transparent)` (6.5 % in dark), the `wave` highlight |
| `--origam-skeleton---border-radius` | `{radius.sm}` |
| `--origam-skeleton---border-radius-circular` | `{radius.full}` |
| `--origam-skeleton---border-radius-pill` | `{radius.full}`, used by `text` and `pill` |
| `--origam-skeleton---animation-duration` | `{motion.duration.loop}` (`1600ms`) |
| `--origam-skeleton---animation-iterations` | `6` (about 10 s, WCAG 2.2.2) |
| `--origam-skeleton---opacity-min` / `---opacity-max` | `0.55` / `1`, the ends of the pulse |
| `--origam-skeleton---text-height` | `0.7em` |
| `--origam-skeleton---text-margin-block` | `0.35em` |
| `--origam-skeleton---circular-size` | `36px` |
| `--origam-skeleton---pill-height` / `---pill-width` | `1.5em` / `4em` |
| `--origam-skeleton---gap` | `{space.3}`, gap of a group |

`--origam-motion__duration---loop` (`1600ms`) is a new primitive duration for
looping, ambient motion; the skeleton reads it and other loops can reuse it.
