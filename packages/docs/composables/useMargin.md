# useMargin

Turns the seven props of `IMarginProps` into a utility class **and** a list of
inline declarations. Twin of [`usePadding`](./usePadding.md) — same grammar,
same precedence, one axis over.

## API

```ts
function useMargin (props: IMarginProps, name = getCurrentInstanceName()): {
    marginClasses: ComputedRef<string[]>
    marginStyles: ComputedRef<string[]>
}
```

`name` defaults to the current instance's kebab-cased name, so calling outside
`setup()` without an explicit `name` throws. `IMarginProps` declares `margin`,
`marginBlock`, `marginInline`, `marginTop`, `marginRight`, `marginBottom`,
`marginLeft` — each `boolean | number | string | undefined`.

Bind both returns; the empty side is harmless:

```vue
<script setup lang="ts">
import { useMargin } from 'origam/composables'
import type { IMarginProps } from 'origam/interfaces'

const props = defineProps<IMarginProps>()
const { marginClasses, marginStyles } = useMargin(props)
</script>

<template>
    <div :class="['origam-panel', marginClasses]" :style="marginStyles">
        <slot />
    </div>
</template>
```

## Precedence — specific beats global

There is no cascade trick here: precedence is **push order onto the styles
array**, and a later declaration in the same inline `style` attribute wins —
which holds even between a logical and a physical property naming the same
edge.

1. the global `margin` shorthand
2. the logical axes `marginBlock` / `marginInline`
3. the physical sides `marginTop` / `marginRight` / `marginBottom` / `marginLeft`

Measured:

```ts
useMargin({ marginBlock: '2', marginTop: '8px' }).marginStyles.value
// [ 'margin-block: var(--origam-space---2)', 'margin-top: 8px' ]
//   rung 2 paints both block edges, rung 3 then overrides the top one
```

Rung 1 does **not** suppress the others: a scale-step `margin` emits only the
class, and the directional rungs still run on top of whatever the class paints.

```ts
useMargin({ margin: '4', marginTop: '8px' })
// classes: [ 'origam--m-4' ]
// styles : [ 'margin-top: 8px' ]
```

## The two `margin` vocabularies — measured

The **string** form `"4"` opts into the design-system ladder; the **number**
form `4` keeps its legacy raw-pixel meaning. They are not interchangeable.

| `margin` | `marginClasses` | `marginStyles` |
|---|---|---|
| `true` | `['{name}--marged']` | `[]` |
| `''` | `['{name}--marged']` | `[]` |
| `'4'` | `['origam--m-4']` | `[]` |
| `'7'` | `[]` | `[]` — not a ladder rung, nothing at all |
| `4` | `[]` | `['margin: 4px']` |
| `'8px'` | `[]` | `['margin: 8px']` |
| `'8px 16px'` | `[]` | `['margin-block: 8px', 'margin-inline: 16px']` |
| `'8px 16px 24px 32px'` | `[]` | 4 logical longhands — see the order note |

The ladder is `SPACING_SCALE_STEPS` = `0 1 2 3 4 5 6 8 10 12`. ⚠️ The token set
also declares `--origam-space---14`, `---16` and `---20`, but they are **not**
in the ladder: measured, `resolveSpacingValue('14')` returns `null` and
`margin="14"` emits nothing at all.

⛔ `{name}--marged` is a legacy class kept for backward compatibility — and,
verified across `packages/ds/src/components`, **no component declares a rule
for it**. `margin` as a bare boolean therefore paints nothing today.

## ⛔ The shorthand grammar is narrower than the directional one

`margin` is parsed by `MARGIN_REGEX`, which accepts one to four groups of
*integer digits + a unit from a fixed list*. The per-side and per-axis props go
through [`resolveSpacingValue`](./usePadding.md#resolvespacingvalue) instead,
which passes any non-ladder string through verbatim. The two do not accept the
same values, and the shorthand **fails silently** — measured:

| value | `margin="…"` | `marginTop="…"` |
|---|---|---|
| `'8px'` | `margin: 8px` | `margin-top: 8px` |
| `'1.5rem'` | **nothing** — no decimals in the regex | `margin-top: 1.5rem` |
| `'auto'` | **nothing** | `margin-top: auto` |
| `'8px 16px 24px'` | **nothing** — only 1, 2 or 4 values are formatted | n/a |
| `'8px 16px 24px 32px 40px'` | **nothing** — over four groups | n/a |
| `'8PX'` | **nothing** — the unit list is case-sensitive | `margin-top: 8PX` |
| `' 8px'` | `margin-block: ` + `margin-inline: 8px` — a malformed empty declaration | `margin-top: 8px` |

Two rules follow: **write a decimal, a keyword or a negative margin on a
directional prop, never on the shorthand**, and do not pass three values.

## ⚠️ The 4-value order is NOT the CSS one

The 4-value shorthand distributes in the DS's **Haut / Gauche / Bas / Droite**
order — grouped by logical axis, which is what keeps it RTL-safe. This is an
arbitrated convention (issue #216), not a bug, and it differs from native CSS:

```ts
useMargin({ margin: '8px 16px 24px 32px' }).marginStyles.value
// [ 'margin-block-start: 8px',    ← 8px  top
//   'margin-block-end: 24px',     ← 24px bottom
//   'margin-inline-start: 16px',  ← 16px left in LTR
//   'margin-inline-end: 32px' ]   ← 32px right in LTR
//
// native CSS `margin: 8px 16px 24px 32px` means top=8 right=16 bottom=24 left=32
```

The per-side props exist precisely so a consumer never has to know that.

## `formatMarginStylesVar`

```ts
function formatMarginStylesVar (values: Array<string>): string[]
```

The formatter rung 1 delegates to. It switches on `values.length` and
**returns an empty array for any length other than 1, 2 or 4** — which is where
the `'8px 16px 24px'` silent drop above comes from.

| length | output |
|---|---|
| 1 | `margin: v0` |
| 2 | `margin-block: v0`, `margin-inline: v1` |
| 3 | `[]` |
| 4 | `margin-block-start: v0`, `margin-block-end: v2`, `margin-inline-start: v1`, `margin-inline-end: v3` |
| 5+ | `[]` |

**Consumers:** 1 — `composables/Commons/margin.composable.ts`. Plus
`packages/tests/TU/utils/Commons/margin.util.spec.ts`. No component imports it
directly.

## Consumers

Counted by **real import declaration**: **66 components** (`OrigamCode`,
`OrigamList`, `OrigamImg`, `OrigamTitle`, `OrigamDivider`, the `OrigamChart*`
family, the grid trio `OrigamRow` / `OrigamCol` / `OrigamContainer`, …) plus
two composables — `composables/Commons/stateEffect.composable.ts` and
`composables/Progress/progress.composable.ts`. Two specs:
`margin.composable.spec.ts` and `directional-props.composable.spec.ts`.

## Source

`packages/ds/src/composables/Commons/margin.composable.ts` ·
`packages/ds/src/utils/Commons/margin.util.ts`

## Related

- [`usePadding`](./usePadding.md) — the identical twin, and where
  `resolveSpacingValue` is documented in full
- [`useBorder`](./useBorder.md) — third member of the same precedence family
- [Spacing and corners](../guide/spacing-and-corners.md) — the consumer-facing
  guide
