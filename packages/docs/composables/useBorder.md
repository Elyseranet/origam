# useBorder

Turns the thirteen props of `IBorderProps` — or a single `Ref` carrying the
`border` shorthand — into classes and inline declarations. The widest prop
surface of the dimension / spacing / shape axis, and the one with the most
history attached.

## API

```ts
function useBorder (
    props: IBorderProps | Ref<boolean | number | string | TDirectionBoth | Array<TDirectionBoth> | null | undefined>,
    name = getCurrentInstanceName()
): {
    borderClasses: ComputedRef<string[]>
    borderStyles: ComputedRef<string[]>
}
```

⚠️ **The `Ref` overload carries the `border` shorthand and nothing else.** The
twelve other props (`borderColor`, `borderStyle`, the four physical sides, the
two logical axes, the four per-side colors) are all read inside an
`if (!isRef(props))` block, so passing a `Ref` makes them unreachable by
construction. Pass the props object whenever
you need more than the shorthand.

`name` defaults to the current instance's kebab-cased name, so calling outside
`setup()` without an explicit `name` throws.

```vue
<script setup lang="ts">
import { useBorder } from 'origam/composables'
import type { IBorderProps } from 'origam/interfaces'

const props = defineProps<IBorderProps>()
const { borderClasses, borderStyles } = useBorder(props)
</script>

<template>
    <div :class="['origam-panel', borderClasses]" :style="borderStyles">
        <slot />
    </div>
</template>
```

## Precedence — five rungs, by push order

1. the global `border` shorthand
2. the standalone `borderColor` / `borderStyle`
3. the logical axes `borderBlock` / `borderInline`
4. the physical sides `borderTop` / `borderRight` / `borderBottom` / `borderLeft`
5. the per-side colors `borderTopColor` / `borderRightColor` / `borderBottomColor` / `borderLeftColor`

Each rung only overrides the side or axis it targets; everything else keeps
cascading from the rung below. Measured:

```ts
useBorder({ border: 'thin', borderTop: 4 }).borderStyles.value
// [ 'border-width: var(--origam-border__width---thin)',
//   'border-style: solid',
//   'border-color: currentColor',
//   'border-top-width: 4px',          ← rung 4 wins for the top edge only
//   'border-top-style: solid',
//   'border-top-color: currentColor' ]
```

## ⛔ Width keywords go through the INLINE channel (#391)

`none` / `thin` / `thick` emit **both** the `.origam--border-{kw}` utility class
and the matching inline declarations. That is not a Strategy-A redundancy to
clean up: a utility class is specificity (0,1,0) while a Vue scoped rule is
`.class[data-v-hash]` = (0,2,0), so on a component that paints from
`border-width: var(--origam-{cmp}---border-width, …)` the class **loses
whatever the sheet order**. The count recorded in the composable's own banner
at the time of #391 was 10 of its 43 consumers, and on every one of them
`thick` painted `thin` and `none` painted `thin`.
The inline copy is the only channel that can actually paint there. Both sides
read `BORDER_KEYWORD_WIDTH`, so they cannot drift.

This is also why the numeric form `:border="4"` never had the bug: it always
took the inline path.

| `border` | `borderClasses` | `borderStyles` |
|---|---|---|
| `true` | `['{name}--border', 'origam--border-thin']` | `[]` |
| `'thin'` | `['{name}--border', 'origam--border-thin']` | `border-width: var(--origam-border__width---thin)` + `solid` + `currentColor` |
| `'thick'` | `['{name}--border', 'origam--border-thick']` | `border-width: var(--origam-border__width---2)` + … |
| `'none'` | `['{name}--border', 'origam--border-none']` | `border-width: var(--origam-border__width---0)` + … |
| `4` | `['{name}--border']` | `border-width: 4px` + `solid` + `currentColor` |
| `''` | `[]` | `[]` |

⚠️ Note the first row: **`border` as a bare `true` emits no inline declaration
at all.** It opts into the `thin` utility class and stops there, where
`border="thin"` emits both channels. The two forms are therefore not
interchangeable on a component whose own scoped rule outranks the utility —
which is the situation the paragraph above describes.

A bare width also defaults `border-style` to `solid` and `border-color` to
`currentColor`, on every path. Without that, `border-width: 4px` alone would be
invisible — CSS defaults `border-style` to `none`.

## A direction isolates its edge

```ts
useBorder({ border: 'top' }).borderStyles.value
// [ 'border-top-width: var(--origam-border__width---thin)',
//   'border-bottom-width: var(--origam-border__width---0)',
//   'border-left-width: var(--origam-border__width---0)',
//   'border-right-width: var(--origam-border__width---0)',
//   'border-style: solid', 'border-color: currentColor' ]
```

All four widths are emitted, not just the named one, because the components
that paint from a single `border-width` shorthand have no per-side custom
property a class could target.

## ⛔ The array form is half implemented — measured

`IBorderProps` types `border` as accepting `Array<TDirectionBoth>`, and
`borderClasses` walks that branch. `borderStyles` does not test for an array
anywhere — not `isUtilityBorder`, not `isDirectionBorder`, not
`typeof === 'string'`, not `typeof === 'number'`:

```ts
useBorder({ border: ['top', 'bottom'] })
// classes: [ '{name}--border', '{name}--border-top,bottom' ]
// styles : []
```

The class name carries the **comma** of `Array.prototype.toString`, and no
stylesheet declares it. No width is emitted on any edge. Until that is fixed,
express multiple edges with the per-side props (`border-top` + `border-bottom`).

*Reported here, deliberately not fixed — this is a documentation lot.*

## The free-form string grammar

`BORDER_REGEX` splits a value into `width` / `style` / `color` groups; an
omitted style defaults to `solid`, an omitted color to `currentColor`. Unlike
`MARGIN_REGEX` / `PADDING_REGEX`, the unit is **optional** here, so `"0"` is
accepted:

| `border` | `borderStyles` |
|---|---|
| `'2px dashed red'` | `border-width: 2px` · `border-style: dashed` · `border-color: red` |
| `'8px'` | `border-width: 8px` · `solid` · `currentColor` |
| `'0'` | `border-width: 0` · `solid` · `currentColor` |
| `'2px 4px'` | `border-block-width: 2px` · `border-inline-width: 4px` · `solid` · `currentColor` |
| `'2px 4px 6px'` | **`border-style: solid` · `border-color: currentColor` only** |
| `'1.5rem'` | **`[]`** — the width group has no decimals |

⚠️ The 3-value row is the sharpest edge of this grammar. The value *matches*
the regex, so the style and color defaults are still emitted — but
`formatBorderStylesVar` has no 3-value case, so **no width is**. The result is
a `solid` `currentColor` border of width `medium` (the CSS initial value),
which is neither what was asked for nor nothing. Pass 1, 2 or 4 values.

The 2- and 4-value distributions follow the same **Haut / Gauche / Bas /
Droite** logical order as `useMargin` / `usePadding` (issue #216).

## Utilities

### `formatBorderStylesVar`

```ts
function formatBorderStylesVar (values: Array<string>, type: string): string[]
```

Distributes a value list across `border-{position}-{type}`. Same length switch
as its margin/padding cousins — 1, 2 and 4 are formatted, **3 and 5+ return
`[]`**. `type` is the facet name (`'width'`, `'style'`, `'color'`), passed by
`useBorder` from the regex group key.

**Consumers:** 1 — `composables/Commons/border.composable.ts`. Plus
`packages/tests/TU/utils/Commons/border.util.spec.ts`.

### `parseBorderPositionValue`

```ts
function parseBorderPositionValue (value: string): { width: string, style: string, color: string } | null
```

Parses ONE per-side value with the same `BORDER_REGEX`, so `borderTop="2px
dashed red"` resolves exactly like `border="2px dashed red"` would. Measured:

| input | output |
|---|---|
| `'2px dashed red'` | `{ width: '2px', style: 'dashed', color: 'red' }` |
| `'2px'` | `{ width: '2px', style: 'solid', color: 'currentColor' }` |
| `'dashed'` | `{ width: '', style: 'dashed', color: 'currentColor' }` |
| `'2px solid var(--x)'` | `{ width: '2px', style: 'solid', color: 'var(--x)' }` |
| `''` | `null` |
| `'zzz'` | `{ width: '', style: 'solid', color: 'zzz' }` |

⚠️ The last row is not a typo: the color group's final alternative is a bare
`[A-Za-z]+`, so **any word is accepted as a color**. `borderTop="zzz"` emits
`border-top-color: zzz`, an invalid declaration the browser drops. There is no
validation and no warning on this path.

Unlike the global shorthand, an entirely unparsable or empty value returns
`null`, and the caller skips emission rather than pushing a blank declaration.

**Consumers:** 1 — `composables/Commons/border.composable.ts`. Plus
`border.util.spec.ts`.

### `formatBorderPositionStylesVar`

```ts
function formatBorderPositionStylesVar (
    position: TDirectionBoth | TBorderLogicalAxis,
    facets: { width?: string, style?: string, color?: string }
): Array<string>
```

Formats the facets into `border-{position}-{width,style,color}`, skipping any
empty facet. `position` takes either a physical side (`'top'`…) or a logical
axis (`'block'` / `'inline'`) — both share the same template, so one function
covers both.

```ts
formatBorderPositionStylesVar('top', { width: '2px' })
// [ 'border-top-width: 2px' ]
formatBorderPositionStylesVar('block', { width: '2px', style: 'dashed', color: 'red' })
// [ 'border-block-width: 2px', 'border-block-style: dashed', 'border-block-color: red' ]
```

**Consumers:** 1 — `composables/Commons/border.composable.ts`. Plus
`border.util.spec.ts`.

### `resolveBorderSideColor`

```ts
function resolveBorderSideColor (value: TColor): string | null
```

Resolves the four `border*Color` props. A border is a **stroke, not a filled
surface**, so an intent resolves through `tokenForegroundForIntent` — the same
token family the foreground `color` prop uses — rather than a background token:

| input | output |
|---|---|
| `'primary'` | `var(--origam-color__action--primary---fgSubtle)` |
| `'danger'` | `var(--origam-color__feedback--danger---fgSubtle)` |
| `'#ff0080'` / `'red'` | verbatim |
| `'linear-gradient(red, blue)'` | `null` — see below |
| `'zzz'` / `''` / nullish | `null` |

⛔ **Gradients are silently ignored.** Native CSS `border-color` has no gradient
form (`border-image` is a different property), so a gradient resolves to `null`
and no declaration is emitted. This is documented on `IBorderProps` so it is
not a surprise, but it is silent — no warning.

Note the contrast with `parseBorderPositionValue` above: this function
**rejects** an unknown word (`'zzz'` → `null`), while the embedded-color path
of a per-side string accepts it. Two paths onto `border-{side}-color`, two
validation contracts.

**Consumers:** 1 — `composables/Commons/border.composable.ts`. Plus
`border.util.spec.ts`.

## Consumers

Counted by **real import declaration**: **41 components** — `OrigamField`,
`OrigamInput`, `OrigamList`, `OrigamKbd`, `OrigamCode`, `OrigamImg`,
`OrigamSwitchTrack`, `OrigamSystemBar`, the grid family, … plus
`composables/Commons/stateEffect.composable.ts`. Two specs:
`border.composable.spec.ts` and `border-keywords-391.spec.ts`.

## Source

`packages/ds/src/composables/Commons/border.composable.ts` ·
`packages/ds/src/utils/Commons/border.util.ts`

## Related

- [`useMargin`](./useMargin.md) / [`usePadding`](./usePadding.md) — the same
  precedence grammar on the two spacing axes
- [`useRounded`](./useRounded.md) — the other half of a border's look
- [`useStateEffect`](./useStateEffect.md) — the state layer that re-drives
  `useBorder` per hover / active
