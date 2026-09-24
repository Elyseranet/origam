# usePadding

Turns the seven props of `IPaddingProps` into a utility class **and** a list of
inline declarations. Identical twin of [`useMargin`](./useMargin.md): same
grammar, same precedence, same value vocabulary. This page carries the shared
pieces — read it alongside the margin page rather than instead of it.

## API

```ts
function usePadding (props: IPaddingProps, name = getCurrentInstanceName()): {
    paddingClasses: ComputedRef<string[]>
    paddingStyles: ComputedRef<string[]>
}
```

`name` defaults to the current instance's kebab-cased name, so calling outside
`setup()` without an explicit `name` throws.

```vue
<script setup lang="ts">
import { usePadding } from 'origam/composables'
import type { IPaddingProps } from 'origam/interfaces'

const props = defineProps<IPaddingProps>()
const { paddingClasses, paddingStyles } = usePadding(props)
</script>

<template>
    <section :class="['origam-card', paddingClasses]" :style="paddingStyles">
        <slot />
    </section>
</template>
```

## Precedence and vocabulary

Three rungs, resolved by push order — global shorthand, then
`paddingBlock` / `paddingInline`, then the four physical sides. Measured:

| props | classes | styles |
|---|---|---|
| `{ padding: true }` | `['{name}--padded']` | `[]` |
| `{ padding: '4' }` | `['origam--p-4']` | `[]` |
| `{ padding: 4 }` | `[]` | `['padding: 4px']` |
| `{ padding: '8px 16px' }` | `[]` | `['padding-block: 8px', 'padding-inline: 16px']` |
| `{ paddingInline: '4' }` | `[]` | `['padding-inline: var(--origam-space---4)']` |
| `{ paddingLeft: '8px' }` | `[]` | `['padding-left: 8px']` |
| `{ padding: '4', paddingTop: '1' }` | `['origam--p-4']` | `['padding-top: var(--origam-space---1)']` |

The string form `"4"` selects the design rung; the number form `4` means raw
pixels. ⛔ `{name}--padded` is legacy and — verified across
`packages/ds/src/components` — **no component declares a rule for it**, so
`padding` as a bare boolean paints nothing.

Everything in [`useMargin`'s narrower-shorthand section](./useMargin.md#the-shorthand-grammar-is-narrower-than-the-directional-one)
applies verbatim here, with `PADDING_REGEX` in place of `MARGIN_REGEX` (the two
are character-for-character the same pattern): `padding="1.5rem"` emits
nothing, `paddingTop="1.5rem"` works.

## `formatPaddingStylesVar`

```ts
function formatPaddingStylesVar (values: Array<string>): string[]
```

Same shape as `formatMarginStylesVar`: 1, 2 and 4 values are formatted,
**anything else returns `[]`**. The 4-value distribution is the DS's
**Haut / Gauche / Bas / Droite** order (issue #216), not the CSS clockwise one:

```ts
formatPaddingStylesVar(['8px', '16px', '24px', '32px'])
// [ 'padding-block-start: 8px',   ← 8px  top
//   'padding-block-end: 24px',    ← 24px bottom
//   'padding-inline-start: 16px', ← 16px left in LTR
//   'padding-inline-end: 32px' ]  ← 32px right in LTR
```

**Consumers:** 1 — `composables/Commons/padding.composable.ts`. Plus
`packages/tests/TU/utils/Commons/padding.util.spec.ts`.

## `resolveSpacingValue`

```ts
function resolveSpacingValue (value: boolean | number | string | null | undefined): string | null
```

The single value grammar behind **every** directional spacing prop — the four
`padding*` sides, the two `padding*` axes, and the same six on `useMargin`.
It returns `null` when nothing should be emitted, so the caller skips the
declaration rather than pushing a blank one.

Measured, exhaustively:

| input | output | why |
|---|---|---|
| `8` | `"8px"` | number → raw pixels, via `convertToUnit` |
| `0` | `"0px"` | **a unit is produced** — unlike the shorthand's truthiness guard |
| `'4'` | `"var(--origam-space---4)"` | a ladder rung |
| `'0'` | `"var(--origam-space---0)"` | `0` is a rung |
| `'7'` | `null` | a bare integer **outside** the ladder emits nothing |
| `'13'` / `'14'` / `'16'` / `'20'` | `null` | idem — even though `--origam-space---14/16/20` exist as tokens |
| `'8px'` / `'1.5rem'` / `'50%'` | verbatim | a plain CSS length |
| `'var(--x)'` / `'calc(1px)'` | verbatim | escape hatch |
| `'auto'` | `"auto"` | valid on `margin-*`; on `padding-*` the browser drops it |
| `' 4 '` | `"var(--origam-space---4)"` | the value is trimmed first |
| `''` / `'  '` | `null` | |
| `true` / `false` | `null` | see below |
| `null` / `undefined` | `null` | |

⚠️ **`true` is a no-op on a directional prop.** The `boolean` member exists
only because the directionals copied the shorthand's signature, where `true`
selects the `--padded` / `--marged` class. There is no per-side equivalent of
that class, and no grounded default width to borrow, so emitting a rung here
would be an invention.

⚠️ **A bare integer outside the ladder emits nothing at all** — `padding="7"`
produces neither a class nor a declaration. That is deliberate: a
`var(--origam-space---7)` the token set never declares would be an invalid
declaration the browser drops anyway, and this keeps the shorthand and the
directionals consistent.

**Consumers:** 2 — `composables/Commons/margin.composable.ts` and
`composables/Commons/padding.composable.ts`. No component imports it, and it
has **no dedicated spec** of its own; it is covered indirectly through
`directional-props.composable.spec.ts`.

## Consumers

Counted by **real import declaration**: **66 components** — the same list as
`useMargin` with `OrigamDataTableColumnCell` in place of `OrigamDivider` — plus
`composables/Commons/stateEffect.composable.ts` and
`composables/Progress/progress.composable.ts`. Two specs:
`padding.composable.spec.ts` and `directional-props.composable.spec.ts`.

## Source

`packages/ds/src/composables/Commons/padding.composable.ts` ·
`packages/ds/src/utils/Commons/padding.util.ts` ·
`packages/ds/src/utils/Commons/spacing.util.ts`

## Related

- [`useMargin`](./useMargin.md) — the twin
- [`useRounded`](./useRounded.md) — `resolveRoundedCornerValue` is the same
  idea applied to corners
- [Spacing and corners](../guide/spacing-and-corners.md)
