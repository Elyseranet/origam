# useLocation

Resolves a `location` anchor such as `'top'` or `'bottom right'` into
absolute-positioning declarations, with an optional pixel offset and an
`opposite` mode used by anchored surfaces.

⚠️ Despite the shared word, this is **not** related to `useLocationStrategies`
— no shared state, no call dependency. That composable runs a floating
element's placement strategy against a live activator; this one is a pure
anchor-to-CSS translation.

## API

```ts
function useLocation (
    props: ILocationProps,
    opposite = false,
    offset?: (side: string) => number
): {
    locationStyles: ComputedRef<Record<string, string | number>>
}
```

⚠️ **`locationStyles` is an OBJECT, not an array of declaration strings.** It
is the only composable in this lot shaped that way — its nine neighbours all
return `Array<string>`. Both bind fine on `:style`, but they do not concatenate
the same way, so do not drop it into an array of style strings.

`ILocationProps` declares a single `location?: TAnchor`. There is no `name`
parameter — no class is emitted — so this composable can legally be called
outside `setup()`.

```vue
<script setup lang="ts">
import { useLocation } from 'origam/composables'
import type { ILocationProps } from 'origam/interfaces'

const props = defineProps<ILocationProps>()
const { locationStyles } = useLocation(props)
</script>

<template>
    <span class="origam-badge" :style="locationStyles"><slot /></span>
</template>
```

## The anchor vocabulary

`TAnchor` is a block side (`top` / `bottom`), an inline side (`left` /
`right`), `'center'`, or a two-word pair crossing the axes
(`'top left'`, `'bottom center'`, `'left top'`, …). A **single** word is
expanded to `"{word} center"` before parsing, which is why a bare `'top'`
centres horizontally rather than taking `parseAnchor`'s own default.

Measured, default mode:

| `location` | `locationStyles` |
|---|---|
| `'top'` | `{ top: 0, left: '50%', transform: 'translateX(-50%)' }` |
| `'bottom'` | `{ bottom: 0, left: '50%', transform: 'translateX(-50%)' }` |
| `'left'` | `{ left: 0, top: '50%', transform: 'translateY(-50%)' }` |
| `'right'` | `{ right: 0, top: '50%', transform: 'translateY(-50%)' }` |
| `'center'` | `{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }` |
| `'top left'` | `{ top: 0, left: 0 }` |
| `'bottom right'` | `{ bottom: 0, right: 0 }` |
| unset | `{}` |

A named side pins that edge to `0`; a `center` alignment pins the cross-axis to
`50%` and adds the matching `transform` to pull the element back by half its
own size.

⚠️ There is no validation. A string outside `TAnchor` is used as a CSS property
name verbatim — `'top end'` produces `{ top: 0, end: 0 }`, and `end` is not a
CSS property. TypeScript is the only guard on this path.

## `opposite` and `offset`

With `opposite = true`, each named side is replaced by its mirror from
`OPPOSITE_MAP` and pinned with `calc(100% - {offset}px)` instead of `0` — which
places the element *outside* the anchor edge rather than inside it. `offset` is
a callback taking the side name, so a caller can return a different gap per
edge; it defaults to `0`.

```ts
useLocation({ location: 'top' }, true).locationStyles.value
// { bottom: 'calc(100% - 0px)', left: '50%', transform: 'translateX(-50%)' }

useLocation({ location: 'top left' }, true, () => 12).locationStyles.value
// { bottom: 'calc(100% - 12px)', right: 'calc(100% - 12px)' }
```

⚠️ The offset is interpolated as a **bare number followed by `px`**, so an
`offset` returning a non-number breaks the `calc()` silently. Return a number.

## Anchor utilities

These five pure functions are the anchor algebra `useLocation` and the
connected location strategy share. None of them is imported by a component.

### `parseAnchor`

```ts
function parseAnchor (anchor: TAnchor): TParsedAnchor
```

Splits an anchor into `{ side, align }`. When no second word is given it picks a
**cross-axis** default — `'left'` for a block side, `'top'` for an inline side,
`'center'` for `'center'` itself:

| input | output |
|---|---|
| `'top'` | `{ side: 'top', align: 'left' }` |
| `'bottom'` | `{ side: 'bottom', align: 'left' }` |
| `'left'` | `{ side: 'left', align: 'top' }` |
| `'right'` | `{ side: 'right', align: 'top' }` |
| `'center'` | `{ side: 'center', align: 'center' }` |
| `'top left'` | `{ side: 'top', align: 'left' }` |
| `'bottom center'` | `{ side: 'bottom', align: 'center' }` |

⚠️ Those one-word defaults are **not** what `useLocation` produces for the same
input, because it appends `' center'` first. The defaults here only apply to the
other caller, `utils/Commons/location.util.ts`.

**Consumers:** 2 — `composables/Commons/location.composable.ts` and
`utils/Commons/location.util.ts`. Plus
`packages/tests/TU/utils/Commons/anchor.util.spec.ts`.

### `flipSide` · `flipAlign` · `flipCorner`

```ts
function flipSide (anchor: TParsedAnchor): TParsedAnchor
function flipAlign (anchor: TParsedAnchor): TParsedAnchor
function flipCorner (anchor: TParsedAnchor): TParsedAnchor
```

The three moves a placement strategy makes when a floating element does not fit:
mirror the side, mirror the alignment, or swap the two. From
`{ side: 'top', align: 'left' }`:

| call | result |
|---|---|
| `flipSide` | `{ side: 'bottom', align: 'left' }` |
| `flipAlign` | `{ side: 'top', align: 'right' }` |
| `flipCorner` | `{ side: 'left', align: 'top' }` — the two fields simply swap |

`'center'` maps to itself in both mirror tables, so a centred anchor is a fixed
point of `flipSide` and `flipAlign`.

**Consumers:** 1 each — `utils/Commons/location.util.ts`. Plus
`anchor.util.spec.ts`.

### `getAxis`

```ts
function getAxis (anchor: TParsedAnchor): AXIS
```

Returns the axis the `side` lies on: `AXIS.Y` when the side is `top` or
`bottom`, `AXIS.X` otherwise.

| anchor | axis |
|---|---|
| `'top left'` | `'y'` |
| `'left top'` | `'x'` |
| `'center'` | `'x'` |

⚠️ Note the last row: the test is `BLOCK_ARRAY.includes(side)`, so **`'center'`
falls to the `X` branch** rather than to a third value. There is no
axis-less case.

**Consumers:** 1 — `utils/Commons/location.util.ts`. Plus `anchor.util.spec.ts`.

## Consumers

Counted by **real import declaration**: **6 components** — `OrigamAlert`,
`OrigamBadge`, `OrigamBtn`, `OrigamCard`, `OrigamProgressLinear`,
`OrigamSheet`. One spec,
`packages/tests/TU/composables/Commons/location.composable.spec.ts`.

The generated page [Composables — Commons](./Commons.md) also reports 6 here —
grep and import agree on this symbol.

## Source

`packages/ds/src/composables/Commons/location.composable.ts` ·
`packages/ds/src/utils/Commons/anchor.util.ts` ·
`packages/ds/src/consts/Commons/location.const.ts`

## Related

- [`usePosition`](./usePosition.md) — the other half: which positioning scheme
  the element uses at all
