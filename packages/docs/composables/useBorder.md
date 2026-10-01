# useBorder

Turns the twenty-one props of `IBorderProps` — or a single `Ref` carrying the
`border` shorthand — into classes and inline declarations. The widest prop
surface of the dimension / spacing / shape axis, and the one with the most
history attached.

Three directional grids coexist, and all three are now complete (#1013):

| grid | props | emitted CSS |
|---|---|---|
| physical per side | `borderTop` / `borderRight` / `borderBottom` / `borderLeft` (+ `*Color`) | `border-top-width` … |
| logical per axis | `borderBlock` / `borderInline` | `border-block-width` … |
| logical per side | `borderBlockStart` / `borderBlockEnd` / `borderInlineStart` / `borderInlineEnd` (+ `*Color`) | `border-inline-start-width` … |

Pick the **logical** spelling whenever the design follows the reading
direction — a quote's accent rule, a nav indicator, a tree guide. The
physical spelling pins the paint to a screen edge and silently inverts the
design in RTL.

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
twenty other props (`borderColor`, `borderStyle`, the four physical sides, the
two logical axes, the four logical sides, and the eight per-edge colors) are
all read inside an `if (!isRef(props))` block, so passing a `Ref` makes them
unreachable by construction. Pass the props object whenever you need more
than the shorthand.

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
3. the logical **axes** `borderBlock` / `borderInline`
4. the logical **sides** `borderBlockStart` / `borderBlockEnd` /
   `borderInlineStart` / `borderInlineEnd` — each immediately followed by its
   own `borderBlockStartColor` / … override
5. the physical **sides** `borderTop` / `borderRight` / `borderBottom` /
   `borderLeft` — each immediately followed by its own `borderTopColor` / …
   override

Each rung only overrides the edge or axis it targets; everything else keeps
cascading from the rung below.

There is no CSS specificity at work here at all: every declaration lands in
the same inline `style` attribute, so **push order is the entire mechanism**
and the list above is literally the order of the `styles.push` calls.

### ⛔ Physical beats logical for the same edge

`borderLeft` and `borderInlineStart` are two *spellings of one edge* in LTR,
not two edges, and CSS gives them equal weight. The tie is broken in favour
of **physical** (rung 5 after rung 4):

```ts
useBorder({ borderInlineStart: 1, borderLeft: 9 }).borderStyles.value
// [ 'border-inline-start-width: 1px', …   ← rung 4
//   'border-left-width: 9px', … ]         ← rung 5 wins in LTR
```

This matches the repo's only prior physical-vs-logical tiebreak, recorded on
`ROUNDED_CORNER_MAP` (`consts/Commons/spacing.const.ts`), and is settled the
same way across all four directional grids (border here, padding / margin /
rounded alongside it) so the rule is learned once rather than per family.

⚠️ Passing **both** spellings for one edge is a code smell: in RTL the
physical prop still wins, but it now paints the *opposite* edge from the
logical one, so the two stop overlapping and both become visible. Pick one
vocabulary per edge.

Measured:

```ts
useBorder({ border: 'thin', borderTop: 4 }).borderStyles.value
// [ 'border-width: var(--origam-border__width---thin)',
//   'border-style: solid',
//   'border-color: currentColor',
//   'border-top-width: 4px',          ← rung 4 wins for the top edge only
//   'border-top-style: solid',
//   'border-top-color: currentColor' ]
```

## The logical-per-side grid (#1013)

Four width props and four colour props, resolving to the native CSS logical
longhands. The browser maps each to the right physical edge per the active
writing mode — nothing in the DS translates between the two vocabularies.

| prop | CSS longhands | LTR edge | RTL edge |
|---|---|---|---|
| `borderInlineStart` | `border-inline-start-{width,style,color}` | left | right |
| `borderInlineEnd` | `border-inline-end-*` | right | left |
| `borderBlockStart` | `border-block-start-*` | top | top |
| `borderBlockEnd` | `border-block-end-*` | bottom | bottom |

Plus `borderInlineStartColor` / `borderInlineEndColor` /
`borderBlockStartColor` / `borderBlockEndColor`, each a `TColor` (semantic
intent, raw CSS colour, or falsy to opt out).

The value grammar is **identical** to the physical per-side props — boolean
opt-in, bare width number, or a free-form `"width style color"` string:

```ts
useBorder({ borderInlineStart: 4 }).borderStyles.value
// [ 'border-inline-start-width: 4px',
//   'border-inline-start-style: solid',      ← a bare width alone paints
//   'border-inline-start-color: currentColor' ] ← nothing, so both default

useBorder({ borderInlineStart: true }).borderStyles.value
// [ 'border-inline-start-width: var(--origam-border__width---thin)', … ]

useBorder({ borderInlineStart: '2px dashed red' }).borderStyles.value
// [ 'border-inline-start-width: 2px',
//   'border-inline-start-style: dashed',
//   'border-inline-start-color: red' ]
```

A `*Color` prop wins over the colour embedded in its own width string, since
it is pushed straight after it:

```ts
useBorder({ borderInlineStart: '2px dashed red', borderInlineStartColor: 'blue' })
// … 'border-inline-start-color: red', 'border-inline-start-color: blue'
//                                     ← later push wins
```

An intent resolves through the **foreground** token family, because a border
is a stroke rather than a filled surface — the same rule the physical
`*Color` props follow. Gradients are silently ignored: CSS `border-color`
has no gradient form.

### ⚠️ Shared grammar means shared limits

These props go through the same `BORDER_REGEX` as `borderLeft` and
`borderBlock`, so they accept exactly what those accept and reject exactly
what those reject. Measured 2026-10-01, and **not** introduced by #1013 —
the physical props fail identically:

| value | result |
|---|---|
| `'var(--origam-border__width---thin) solid var(--c)'` | parses ✅ |
| `'calc(2px + 1px) solid red'` | **`[]`** — no `calc()` alternative in the width group |
| `'0.5rem solid red'` | **`[]`** — the width group is `[0-9]+`, no decimals |
| `4` (bare number) | parses ✅ — bypasses the regex via `convertToUnit` |

So a tokenised width works only in the `var(--x) <style>` form. Pinned by
the "shared grammar limits" tests in
`packages/tests/TU/composables/Commons/border-logical-side.spec.ts`, each
with the physical prop as a negative control, so a future regex change has
to acknowledge all three grids at once.

### ⚠️ One component omits the two inline edges — `OrigamBracket`

Every component that inherits `IBorderProps` and routes through `useBorder`
gets all four logical edges. `OrigamBracket` is the exception: it does not
paint its own root, it routes its surface onto the match card through
`--origam-bracket-match---*` custom properties read inside **physical**
declarations, so a logical-to-physical mapping has to be chosen when the
stylesheet is written. `block-start` / `block-end` are `top` / `bottom`
invariantly in `horizontal-tb` and are supported; `inline-start` /
`inline-end` flip under RTL and no `var()` fallback chain can express that,
so those four are removed from Bracket's surface with `Omit<>` rather than
declared and ignored (#1013). See `OrigamBracket.md` for the full note.

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
    position: TDirectionBoth | TBorderLogicalAxis | TLogicalSide,
    facets: { width?: string, style?: string, color?: string }
): Array<string>
```

Formats the facets into `border-{position}-{width,style,color}`, skipping any
empty facet. `position` takes a physical side (`'top'`…), a logical axis
(`'block'` / `'inline'`) **or a logical side** (`'inline-start'`…) — all
three share the same template, so one function covers them all.

#1013 widened the union by one member and changed nothing else in the body:
`'inline-start'` interpolates into the same template and yields the correct
native longhands. That is why the logical-per-side grid needed no new
formatter.

```ts
formatBorderPositionStylesVar('top', { width: '2px' })
// [ 'border-top-width: 2px' ]
formatBorderPositionStylesVar('block', { width: '2px', style: 'dashed', color: 'red' })
// [ 'border-block-width: 2px', 'border-block-style: dashed', 'border-block-color: red' ]
formatBorderPositionStylesVar('inline-start', { width: '2px', style: 'solid' })
// [ 'border-inline-start-width: 2px', 'border-inline-start-style: solid' ]
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
