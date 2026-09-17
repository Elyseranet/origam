# useDimension

Turns the six props of `IDimensionProps` into inline CSS declarations. It is
the composable the root `CLAUDE.md` tells you to `extends` rather than
declaring `height` / `width` on a new interface by hand.

## API

```ts
function useDimension (props: IDimensionProps): {
    dimensionStyles: ComputedRef<string[]>
}
```

`IDimensionProps` (`packages/ds/src/interfaces/Commons/dimension.interface.ts`)
declares `height`, `maxHeight`, `maxWidth`, `minHeight`, `minWidth`, `width` —
each `number | string | undefined`.

Note the signature: **no `name` parameter and no `Ref` overload**. This
composable needs no instance name because it emits no class, so — unlike its
neighbours — it can legally be called outside `setup()`.

## Return value

`dimensionStyles` is an `Array<string>` of `"property: value"` entries, ready
to bind on `:style`. The order follows `DIMENSIONS_ARRAY`
(`consts/Commons/dimension.const.ts`), which is alphabetical, not the order the
consumer declared:

```ts
useDimension({ minWidth: 10, maxWidth: 20, minHeight: 30, maxHeight: 40, width: 50, height: 60 })
    .dimensionStyles.value
// [ 'height: 60px', 'max-height: 40px', 'max-width: 20px',
//   'min-height: 30px', 'min-width: 10px', 'width: 50px' ]
```

Property names are kebab-cased by `toKebabCase`, values converted by
[`convertToUnit`](./convertToUnit.md).

## No class channel

Unlike `useRounded` / `useElevation` / `useBorder`, there is **no
"tokenised → class" path here**: every dimension produces inline style, always.
There is no `.origam--h-*` utility family to fall back on, so the classes-first
contract described in the root `CLAUDE.md` simply does not apply to this axis.

The upside is that the output wins the cascade against any scoped rule
(`useStyle` lands it at `#id`, specificity (1,0,0)). The downside is that a
consumer cannot override a dimension from a stylesheet without `!important`.

## ⛔ Falsy values are dropped silently — measured

The emission guard is `if (props[dimension])` — a **truthiness** test, not a
presence test:

| prop value | `convertToUnit` alone | `dimensionStyles` |
|---|---|---|
| `240` | `"240px"` | `["height: 240px"]` |
| `'50vh'` | `"50vh"` | `["height: 50vh"]` |
| `'var(--x)'` | `"var(--x)"` | `["height: var(--x)"]` |
| `'16/9'` | `"16/9"` | `["height: 16/9"]` |
| **`0`** | `"0px"` | **`[]`** |
| **`NaN`** | `"NaN"` | **`[]`** |
| `''` / `null` / `undefined` | `undefined` | `[]` |
| **`Infinity`** | `undefined` | **`["height: undefined"]`** |

Two consequences for a consumer:

- **A zero dimension must be written as a string.** `:height="0"` emits
  nothing and the element keeps its intrinsic size; `height="0px"` works.
- **`Infinity` produces an invalid declaration** rather than nothing, because
  it is truthy but converts to `undefined`, and the template literal stringifies
  that to `"undefined"`. The browser drops the declaration, so the symptom is
  identical to "the prop does nothing".

## Usage

```vue
<script setup lang="ts">
import { useDimension } from 'origam/composables'
import type { IDimensionProps } from 'origam/interfaces'

const props = defineProps<IDimensionProps>()
const { dimensionStyles } = useDimension(props)
</script>

<template>
    <div class="origam-panel" :style="dimensionStyles">
        <slot />
    </div>
</template>
```

Consuming it from a parent, with the whole surface rather than one prop:

```vue
<template>
    <origam-card width="100%" max-width="40rem" min-height="12rem">
        …
    </origam-card>
</template>
```

## ⛔ The half-implemented-surface trap

The root `CLAUDE.md` names this composable in its anti-duplication rule for a
reason: an interface that declares `height` but never reads `maxHeight` leaves
a consumer's `max-height="50vh"` doing **nothing, in silence**. Extending
`IDimensionProps` and binding `dimensionStyles` covers the six props at once —
you cannot forget one, because the loop is over the const, not over your
memory.

## Consumers

Counted by **real import declaration**: **64 components** — `OrigamCard`,
`OrigamImg`, `OrigamList`, `OrigamTable`, `OrigamSheet`, `OrigamOverlay`,
the whole `OrigamChart*` family, the five icon components, … Plus one spec,
`packages/tests/TU/composables/Commons/dimension.composable.spec.ts`.

⚠️ The generated page [Composables — Commons](./Commons.md) reports **68**: it
counts by `\buseDimension\b` anywhere outside `composables/`, and four of those
hits are prose. `OrigamDrawer.vue` says *"component has no `useDimension()`
fallback"* in a comment; `consts/Commons/rounded.const.ts` and
`utils/Commons/spacing.util.ts` name it while explaining that they mirror its
behaviour. None of the four imports it.

## Source

`packages/ds/src/composables/Commons/dimension.composable.ts`

## Related

- [`convertToUnit`](./convertToUnit.md) — the value grammar, in full
- [`useSize`](./useSize.md) — the other route to `width`/`height`, driven by a
  size enum instead of six explicit props
- [`usePosition`](./usePosition.md) — same primitive, same truthiness guard,
  applied to the four inset sides
