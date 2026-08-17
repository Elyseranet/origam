# OrigamSliderFieldTrack

Sub-component of `OrigamSliderField`. It paints the
rail a slider thumb travels along: a background stripe, a fill stripe covering
the selected span, and an optional row of tick marks.

The parent owns all the maths. `OrigamSliderFieldTrack` receives `start` /
`stop` as already-resolved percentages and `ticks` as pre-computed descriptors —
it never derives them from a model value. That split is why the track can be
rendered standalone in a story with nothing but plain numbers.

You rarely mount it yourself — `OrigamSliderField` renders it for you.

```vue
<template>
    <origam-slider-field
        v-model="value"
        :track-props="{ size: 8, rounded: 'pill' }"
    />
</template>
```

### ⚠️ `trackProps` accepts only part of this surface

`OrigamSliderField` binds most of the track's props from its **own** top-level
props, then strips those same keys out of your `trackProps` object before
forwarding it, so your value cannot fight the parent's. The keys removed are:

`class`, `start`, `stop`, `color`, `bgColor`, `disabled`, `error`,
`isVertical`, `indexFromEnd`, `showTicks`, `tickSize`, `ticks`, `min`, `max`.

Passing any of them through `trackProps` does nothing, silently. Set them on
the slider itself instead — `<origam-slider-field bg-color="surface">`, not
`:track-props="{ bgColor: 'surface' }"`.

What `trackProps` *does* carry through: `size`, `rounded` (and the four
per-corner variants), `id`, `style`. `rounded` is the documented override
channel — an explicit `trackProps.rounded` wins over the slider's own
`rounded`.

## Props

### Geometry

| Prop | Type | Default | Description |
|---|---|---|---|
| `start` | `number` | `0` | Left/top edge of the fill stripe, as a percentage of the rail. |
| `stop` | `number` | `100` | Right/bottom edge of the fill stripe, as a percentage of the rail. |
| `min` | `number` | `0` | Lower boundary used to filter ticks (suppresses the first tick). |
| `max` | `number` | `100` | Upper boundary used to filter ticks (suppresses the last tick). |
| `isVertical` | `boolean` | `false` | Orientation hint from the parent. Switches the logical CSS axis. |
| `indexFromEnd` | `boolean` | `false` | Inverts the start direction — set by the parent when `reverse` is on, or in vertical mode. |

### Ticks

| Prop | Type | Default | Description |
|---|---|---|---|
| `showTicks` | `TAlways` | `false` | Tick visibility. Same semantics as the parent's `showTicks`. Ticks only render when `parsedTicks` is non-empty. |
| `ticks` | `Array<TTick>` | — | Pre-computed tick descriptors. The parent owns the math; the track only positions and labels them. |
| `tickSize` | `number \| string` | `2` | Tick dot size, in px or a token unit. |

### Appearance

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `TSize \| number` | `4` | Rail thickness. A bare number is read as px. |
| `color` | `TColor` | — | Intent of the fill stripe. |
| `bgColor` | `TColor` | — | Intent of the background stripe. |
| `rounded` | `boolean \| number \| string \| TRounded \| null` | — | Radius of the rail. |
| `roundedTopLeft` / `roundedTopRight` / `roundedBottomLeft` / `roundedBottomRight` | `boolean \| number \| string` | — | Per-corner radius. |

### State

| Prop | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Renders the rail in its disabled surface. |
| `error` | `boolean` | `false` | Forces `danger` intent on **both** colour channels. Driven by the parent slider's `error` flag, and it overrides `color` / `bgColor`. |

### Identity

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | Root `id`. |
| `class` | `string \| Array<string> \| object` | — | Merged into the root class list. |
| `style` | `string \| Array<string> \| object \| StyleValue` | — | Merged into the root style. |

## Emits

None. The track is presentational — pointer handling lives in the parent.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `item` | `{ tick: TTick, index: number }` | Overrides the label of every tick. |
| `item.{index}` | `{ tick: TTick, index: number }` | Overrides the label of one tick. Reached as the fallback content of `item`, so a template that defines both gets `item` on the outside and the indexed form as its default. |

A tick's label element only renders when the tick carries a `label`, or when an
`item` / `item.{index}` slot is supplied — an empty tick stays a bare dot.

## Behaviour notes

- The rail is three stacked elements: `__bg` (full width), `__fill` (spanning
  `start` → `stop`) and `__ticks`. Colour props target the first two.
- `error` short-circuits the colour resolution. If a slider looks stuck on
  `danger`, check the parent's `error` flag before suspecting `color`.
- Tick filtering uses `min` / `max`, not `start` / `stop`: the boundary ticks
  are suppressed relative to the scale, not to the current selection.

## Examples

Thicker pill-shaped rail:

```vue
<template>
    <origam-slider-field
        v-model="value"
        :track-props="{ size: 10, rounded: 'pill' }"
    />
</template>
```

Labelled ticks driven by the parent:

```vue
<template>
    <origam-slider-field
        v-model="value"
        show-ticks="always"
        :ticks="[{ value: 0, label: 'Min' }, { value: 100, label: 'Max' }]"
    />
</template>
```
