# useRounded

Resolves the `rounded` shorthand and the four per-corner props into classes and
inline `border-radius` declarations.

## API

```ts
function useRounded (
    props: IRoundedProps | Ref<boolean | number | string | TRounded | null | undefined>,
    name = getCurrentInstanceName()
): {
    roundedClasses: ComputedRef<string[]>
    roundedStyles: ComputedRef<string[]>
}
```

⚠️ **The per-corner props are only reachable through the props-object
overload.** A `Ref` carries a single scalar — the shorthand — by construction,
so `roundedTopLeft` & co. are read inside an `if (!isRef(props))` block.

```vue
<script setup lang="ts">
import { useRounded } from 'origam/composables'
import type { IRoundedProps } from 'origam/interfaces'

const props = defineProps<IRoundedProps>()
const { roundedClasses, roundedStyles } = useRounded(props)
</script>

<template>
    <div :class="['origam-card', roundedClasses]" :style="roundedStyles">
        <slot />
    </div>
</template>
```

## Two rungs

1. the global `rounded` shorthand
2. the per-corner `roundedTopLeft` / `roundedTopRight` / `roundedBottomLeft` /
   `roundedBottomRight`

Rung 2 emits **physical** corner longhands (`border-top-left-radius`), which
beat the **logical** ones the 4-value shorthand emits
(`border-start-start-radius`) purely by declaration order.

## The shorthand vocabulary — measured

Three vocabularies coexist, and they do not overlap:

| `rounded` | `roundedClasses` | `roundedStyles` |
|---|---|---|
| `'none'` | `['origam--rounded-none']` | `border-radius: var(--origam-radius---none, 0)` |
| `'xs'` `'sm'` `'md'` `'lg'` `'xl'` `'full'` | `['origam--rounded-{v}']` | `border-radius: var(--origam-radius---{v}, {fallback})` |
| `'x-small'` `'small'` `'default'` `'medium'` `'large'` `'x-large'` | `['{name}--rounded-{v}']` | `border-radius: var(--origam-radius---{mapped}, …)` |
| `'shaped'` / `'shaped-invert'` | `['{name}--rounded-{v}']` | `[]` — corner-asymmetric, owned by the component's SCSS |
| `true` / `''` | `['{name}--rounded', 'origam--rounded-md']` | `border-radius: var(--origam-radius---md, 8px)` |
| `false` / `null` / unset | `[]` | `[]` |
| `4` | `[]` | `border-radius: 4px` |
| `'4px'` | `[]` | `border-radius: 4px` |
| `'4px 0 4px 0'` | `[]` | four logical corner longhands — see order note |
| `'var(--origam-radius---card)'` / `'calc(…)'` / `'12vw'` | `[]` | verbatim |
| `'4px 8px'` | `[]` | **`[]`** — 2 values are silently dropped |
| `'zzz'` | `[]` | `[]` |

The **modern** rungs (`xs`…`xl`, `none`, `full`) and the **legacy** named
variants (`x-small`…`x-large`) are two different taxonomies. Only the modern
ones have a global utility class; the legacy ones emit a component-local class
and rely on the component's own SCSS.

## ⛔ The inline companion on a utility rung is load-bearing

On the utility rungs `roundedStyles` emits an inline declaration **in addition**
to the class. That is not a Strategy-A redundancy waiting to be cleaned up: a
utility class is specificity (0,1,0) and a Vue scoped corner longhand is
(0,2,0), so the class routinely loses. The measurement recorded in the
composable is Chromium, Histoire rebuilt with and without the `styles.push`,
computed `border-start-start-radius` on each component whose theme entry pins a
rung:

| component | with | without |
|---|---|---|
| card | 12px | **0px** |
| table | 12px | **0px** |
| expansion-panel | 8px | **4px** |
| code / text-field | 12px | 12px |
| skeleton | 4px | 4px |
| avatar | 9999px | 9999px |

3 of 7 regress. Card is the clearest case: `.origam-card[data-v-…]` declares
the four logical corner longhands, which beat the utility's `border-radius`
shorthand. Retiring this branch in v3.0.0 is therefore **not a pure deletion**;
two Playwright assertions in `prop-audit-phase4.spec.ts` pin it, one of which
fails loudly the day the cascade is fixed.

## ⚠️ The 4-value order is neither CSS's nor margin's

```ts
useRounded({ rounded: '4px 0 4px 0' }).roundedStyles.value
// [ 'border-start-start-radius: 4px',  ← top-left
//   'border-start-end-radius: 0',      ← top-right
//   'border-end-start-radius: 4px',    ← bottom-LEFT
//   'border-end-end-radius: 0' ]       ← bottom-right
```

So the DS order is **TL, TR, BL, BR** (row-major), while native CSS
`border-radius: a b c d` means **TL, TR, BR, BL** (clockwise) — the last two
swap. And unlike `useMargin`, the formatter here has **no 2-value case at all**:
`'4px 8px'` matches `BORDER_RADIUS_REGEX` but produces zero declarations.

## `formatRoundedStylesVar`

```ts
function formatRoundedStylesVar (values: Array<string>): string[]
```

| length | output |
|---|---|
| 1 | `border-radius: v0` |
| 2 | **`[]`** |
| 3 | `[]` |
| 4 | the four logical corner longhands above |
| 5+ | `[]` |

**Consumers:** 1 — `composables/Commons/rounded.composable.ts`. Plus
`packages/tests/TU/utils/Commons/rounded.util.spec.ts`.

## `isCustomBorderRadius`

```ts
function isCustomBorderRadius (value: string): boolean
```

The escape hatch for a value `BORDER_RADIUS_REGEX`'s fixed unit whitelist
cannot describe. Measured:

| input | result |
|---|---|
| `'var(--x)'` / `'calc(1px)'` / `'clamp(4px, 1vw, 16px)'` | `true` |
| `'12vw'` | `true` — a unit outside the whitelist |
| `'4px'` | `true` |
| `'0'` | **`false`** — a unit is required |
| `'zzz'` | `false` |

That `'0'` row is the root of the per-corner surprise below.

**Consumers:** 1 — `composables/Commons/rounded.composable.ts`. Plus
`rounded.util.spec.ts`.

## `resolveRoundedCornerValue`

```ts
function resolveRoundedCornerValue (value: boolean | number | string | null | undefined): string | null
```

The per-corner vocabulary — deliberately the same one the shorthand accepts,
resolved through the same shared tables, so `roundedTopLeft="large"` and
`rounded="large"` cannot drift. Measured:

| input | output |
|---|---|
| `8` | `"8px"` |
| `0` | `"0px"` |
| `'md'` | `"var(--origam-radius---md, 8px)"` |
| `'none'` | `"var(--origam-radius---none, 0)"` |
| `'full'` | `"var(--origam-radius---full, 9999px)"` |
| `'large'` | `"var(--origam-radius---xl, 16px)"` |
| `'x-small'` / `'default'` | `"var(--origam-radius---xs, 2px)"` / `"var(--origam-radius---md, 8px)"` |
| `'8px'` / `'var(--x)'` / `'calc(1px)'` / `'12vw'` | verbatim |
| `'shaped'` / `'shaped-invert'` | `null` — corner-asymmetric by definition |
| `'4'` | `null` — there is no spacing-style ladder on this axis |
| `'0'` | **`null`** — see below |
| `'zzz'` / `''` / `true` / `false` / nullish | `null` |

### ⛔ `roundedTopLeft="0"` does nothing — measured

```ts
useRounded({ rounded: 'lg', roundedTopLeft: '0' }).roundedStyles.value
// [ 'border-radius: var(--origam-radius---lg, 12px)' ]   ← the corner is gone

useRounded({ rounded: 'lg', roundedTopLeft: 0 }).roundedStyles.value
// [ 'border-radius: var(--origam-radius---lg, 12px)', 'border-top-left-radius: 0px' ]

useRounded({ rounded: 'lg', roundedTopLeft: '0px' }).roundedStyles.value
// [ 'border-radius: var(--origam-radius---lg, 12px)', 'border-top-left-radius: 0px' ]
```

The bare string `"0"` is neither a utility rung, nor a named variant, nor a
match for `CUSTOM_BORDER_RADIUS_REGEX` (which requires a unit), so it resolves
to `null` and the corner is skipped in silence. **In a template,
`rounded-top-left="0"` is a string** — exactly the failing form. Bind the
number (`:rounded-top-left="0"`) or write `"0px"`.

The composable's own banner used to carry `roundedTopLeft="0"` as its worked
example of rung-2 precedence; it was corrected in the same delivery as this
page.

### A note on the unitless `0` fallback

`'none'` resolves to `var(--origam-radius---none, 0)` — the fallback is
**unitless**. As a `border-radius` value that is valid CSS, and the token itself
is declared as `0px` in `primitive.css`, so the fallback is unreachable unless
a theme drops the rung. It would stop being harmless the day such a value is
consumed inside a `calc()`, where a unitless zero invalidates the declaration
at computed-value time. Verified: **no component under
`packages/ds/src/components` feeds `--origam-radius---*` or
`--origam-space---*` into a `calc()` today.**

**Consumers:** 1 — `composables/Commons/rounded.composable.ts`. No component
imports it, and it has no dedicated spec.

## Consumers

Counted by **real import declaration**: **64 components** — `OrigamCard*`,
`OrigamSwitch` / `OrigamSwitchTrack`, `OrigamSkeleton`, `OrigamTabs`,
`OrigamProgressLinear`, `OrigamSliderField*`, `OrigamMedia*`, the `OrigamChart*`
family, … plus `composables/Commons/stateEffect.composable.ts`. Two specs:
`rounded.composable.spec.ts` and `directional-props.composable.spec.ts`.

## Source

`packages/ds/src/composables/Commons/rounded.composable.ts` ·
`packages/ds/src/utils/Commons/rounded.util.ts` ·
`packages/ds/src/utils/Commons/spacing.util.ts`

## Related

- [`useBorder`](./useBorder.md) — the other half of a border's look
- [`usePadding`](./usePadding.md) — `resolveSpacingValue`, the sibling grammar
- [Spacing and corners](../guide/spacing-and-corners.md)
