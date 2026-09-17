# convertToUnit

Turns one dimension-ish value into one CSS value. It is the primitive every
composable of the **dimension / spacing / shape** axis routes through, and the
reason the root `CLAUDE.md` forbids hand-rolling a dimension parser.

## API

```ts
function convertToUnit (str: number, unit?: string): string
function convertToUnit (str: string | number | null | undefined, unit?: string): string | undefined
```

`unit` defaults to `'px'` and is appended **only** on the numeric path.

## What it accepts — measured

The body is four branches, and the third one is what makes the function
general: anything that does not read as a finite number is returned
**verbatim**. That single rule is what buys CSS lengths, `var()` references,
`calc()` expressions and `aspect-ratio` shortcuts at once — none of them is
special-cased anywhere in the code.

| input | output | branch |
|---|---|---|
| `4` | `"4px"` | numeric |
| `0` | `"0px"` | numeric — **a unit is produced** |
| `-8` | `"-8px"` | numeric |
| `1.5` | `"1.5px"` | numeric |
| `'4'` | `"4px"` | numeric (a numeric string is coerced) |
| `'4px'` | `"4px"` | verbatim |
| `'1.5rem'` / `'50%'` | `"1.5rem"` / `"50%"` | verbatim |
| `'var(--x)'` | `"var(--x)"` | verbatim |
| `'calc(1rem + 2px)'` | `"calc(1rem + 2px)"` | verbatim |
| `'16/9'` | `"16/9"` | verbatim — the `aspect-ratio` shorthand |
| `'auto'` | `"auto"` | verbatim |
| `null` / `undefined` / `''` | `undefined` | nullish guard |
| `Infinity` | `undefined` | non-finite guard |
| `4` with `unit: '%'` | `"4%"` | numeric |

## Three edges worth knowing — measured

- **`NaN` is returned as the string `"NaN"`.** `isNaN(+NaN)` is true, so it
  takes the verbatim branch and `String(NaN)` produces `"NaN"` — not
  `undefined`. In practice no caller of this axis emits it, because every one
  of them guards on truthiness first and `NaN` is falsy (see below).
- **`' '` (a lone space) returns `"0px"`.** `+' '` is `0`, which is finite.
- **`true` returns `"1px"` and `false` returns `"0px"`.** Booleans coerce
  numerically. The overloads do not admit a boolean, so this is only reachable
  from an untyped call site.

## Why nobody re-implements it

The `CLAUDE.md` rule ("Reuse existing interfaces / composables") names this
function as its second worked example, and the table above is why: a
hand-rolled `parseFloat(v) + 'px'` handles the first four rows and loses every
other one silently — a `maxHeight="50vh"` becomes `NaNpx`, a `var()` reference
becomes `NaNpx`, an `aspect-ratio` shorthand becomes `NaNpx`. The failure is
invisible because an invalid declaration is dropped by the browser without a
console entry.

## The truthiness guard, and what it costs

⛔ `convertToUnit` itself handles `0` correctly — but **its callers on this
axis do not reach it for `0`**. `useDimension`, `usePosition` and the two
directional loops all gate on `if (props[x])`, a truthiness test rather than a
presence test. Measured:

| call | `convertToUnit` alone | through `useDimension` |
|---|---|---|
| `0` | `"0px"` | *nothing emitted* |
| `NaN` | `"NaN"` | *nothing emitted* |
| `Infinity` | `undefined` | `"height: undefined"` — invalid |

So a zero dimension must be written as the string `"0px"`, never as the number
`0`. The same holds for `top` / `bottom` / `left` / `right` on
[`usePosition`](./usePosition.md).

## Usage

```ts
import { convertToUnit } from 'origam/utils'

convertToUnit(240)            // '240px'
convertToUnit('50vh')         // '50vh'
convertToUnit('var(--w)')     // 'var(--w)'
convertToUnit(3, 'rem')       // '3rem'
convertToUnit(null)           // undefined
```

Inside a component, prefer the composable that already calls it — you get the
whole prop surface rather than one value:

```vue
<script setup lang="ts">
import { useDimension } from 'origam/composables'
import type { IDimensionProps } from 'origam/interfaces'

const props = defineProps<IDimensionProps>()
const { dimensionStyles } = useDimension(props)
</script>

<template>
    <div :style="dimensionStyles"><slot /></div>
</template>
```

## Consumers

Counted by **real import declaration**, not by textual occurrence:
**39 files** under `packages/ds/src` — 24 components (`OrigamImg`,
`OrigamDivider`, `OrigamOverlay`, `OrigamSkeleton`, `OrigamProgressCircular`,
`OrigamSliderField`, …) plus 15 composables and utils, among them **7 of the
10 composables of this lot** (`border`, `dimension`, `margin`, `padding`,
`position`, `rounded`, `size`) and `spacing.util`. One spec,
`packages/tests/TU/utils/Commons/commons.util.spec.ts`.

⚠️ The generated page [Composables — Commons](./Commons.md) reports **34**.
The two numbers measure different things and both are right about what they
measure. On the generator's own scope — everything under `packages/ds/src`
**except** `composables/` — the comparable figures are **34 by grep** against
**29 by import**: it matches `\bconvertToUnit\b` in any file, so it counts five
prose mentions (`consts/Commons/rounded.const.ts` and `types/Grids/row.type.ts`
name it in a comment, `commons.util.ts` is its own declaration site), and by
excluding `composables/` it misses the ten composables that genuinely import
it.

## Source

`packages/ds/src/utils/Commons/commons.util.ts`

## Related

- [`useDimension`](./useDimension.md) — the six-prop surface built on it
- [`resolveSpacingValue`](./usePadding.md#resolvespacingvalue) — the spacing
  vocabulary, which delegates its numeric form here
- [`usePosition`](./usePosition.md) — same primitive, same truthiness guard
