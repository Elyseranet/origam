# usePosition

Turns `position` into a BEM modifier class and the four inset props
(`top` / `bottom` / `left` / `right`) into inline declarations.

## API

```ts
function usePosition (props: IPositionProps, name = getCurrentInstanceName()): {
    positionClasses: ComputedRef<string | undefined>
    positionStyles: ComputedRef<string[]>
}
```

`IPositionProps` declares `position?: TPosition` — `static | relative | fixed |
absolute | sticky` — plus `top`, `bottom`, `left`, `right`, each
`number | string`. `name` defaults to the current instance's kebab-cased name,
so calling outside `setup()` without an explicit `name` throws.

⚠️ **`positionClasses` is a bare string, not an array** — the only composable in
this lot shaped that way; `densityClasses`, `roundedClasses`, `borderClasses`
and the rest all return `Array<string>`. It is `undefined` when `position` is
unset. Vue's `:class` accepts all three forms, so this is invisible until you
try to spread or concatenate it.

⚠️ The class is `{name}--{position}`, **not** `{name}--position-{position}`.
`position="sticky"` on a component named `origam-toolbar` emits
`origam-toolbar--sticky`.

```vue
<script setup lang="ts">
import { usePosition } from 'origam/composables'
import type { IPositionProps } from 'origam/interfaces'

const props = defineProps<IPositionProps>()
const { positionClasses, positionStyles } = usePosition(props)
</script>

<template>
    <header :class="['origam-toolbar', positionClasses]" :style="positionStyles">
        <slot />
    </header>
</template>
```

## Measured

| props | `positionClasses` | `positionStyles` |
|---|---|---|
| `{ position: 'absolute' }` | `'{name}--absolute'` | `[]` |
| `{ position: 'sticky', top: 8 }` | `'{name}--sticky'` | `['top: 8px']` |
| `{ bottom: '2rem' }` | `undefined` | `['bottom: 2rem']` |
| `{ top: '8px', left: 0 }` | `undefined` | `['top: 8px']` |
| `{ top: 0 }` | `undefined` | `[]` |
| `{}` | `undefined` | `[]` |

Insets are emitted in the fixed order `top, bottom, left, right`, regardless of
declaration order, and each value goes through
[`convertToUnit`](./convertToUnit.md) — so `top={8}` gives `top: 8px` and
`top="8px"` stays verbatim.

## ⛔ A side pinned to `0` is dropped — measured

The emission guard is `if (props[layer])`, a **truthiness** test. The number
`0` is the most natural way to write "flush against this edge", and it is
exactly the value that produces nothing:

```ts
usePosition({ top: 0 }).positionStyles.value        // []
usePosition({ top: '0px' }).positionStyles.value    // [ 'top: 0px' ]
```

Write `"0px"`. The same guard, with the same consequence, governs
[`useDimension`](./useDimension.md).

## A banner that said the opposite, for months

⚠️ Until this delivery the composable's own banner — and therefore
`packages/docs/composables/Commons.md`, which is generated from it — stated:

> ⛔ Contrairement a `useDimension`, AUCUNE conversion via `convertToUnit`
> n'est appliquee sur `top`/`bottom`/`left`/`right` […] un nombre est interpole
> TEL QUEL (`"top: 8"`, pas `"top: 8px"`) — declaration CSS invalide.

That was true until **`b357f7eba` (#557)**, which added the `convertToUnit`
call and did not update the text. The published reference then asserted the
exact opposite of the shipped behaviour for every reader who arrived after the
fix — including three existing tests that had pinned `'top: 10'`, without a
unit, and were rewritten in that same commit. The banner is corrected in the
same delivery as this page.

It is worth noting *how* it survived: the fix commit's own message complains
about precisely this failure mode on its sibling defect (`useSticky`, #556) —
*"la banniere decrivait le defaut AU PRESENT. Une fois corrige elle devenait
fausse a son tour"* — and then made the same mistake one file over.

## Consumers

Counted by **real import declaration**: **7 components** — `OrigamAlert`,
`OrigamAudio`, `OrigamBtn`, `OrigamCard`, `OrigamSheet`, `OrigamSnackbar`,
`OrigamToolbar`. Two specs: `position.composable.spec.ts` and
`position-sticky-556-557.spec.ts`.

## Source

`packages/ds/src/composables/Commons/position.composable.ts`

## Related

- [`useLocation`](./useLocation.md) — which edge to pin to, once the scheme is
  chosen
- [`useDimension`](./useDimension.md) — same primitive, same truthiness guard
- [`convertToUnit`](./convertToUnit.md)
