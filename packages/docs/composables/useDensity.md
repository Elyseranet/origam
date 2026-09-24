# useDensity

Turns `density` into a single BEM modifier class, `{name}--density-{value}`.
The smallest composable of the dimension / spacing / shape axis, and the only
one of the ten with **no style channel at all**.

## API

```ts
function useDensity (
    props: IDensityProps | Ref<number | string | undefined>,
    name = getCurrentInstanceName()
): {
    densityClasses: ComputedRef<string[]>
}
```

`IDensityProps` declares a single `density?: TDensity`. `name` defaults to the
current instance's kebab-cased name — override it when a child borrows its
parent's density channel, which is what the second argument exists for.

```vue
<script setup lang="ts">
import { useDensity } from 'origam/composables'
import type { IDensityProps } from 'origam/interfaces'

const props = defineProps<IDensityProps>()
const { densityClasses } = useDensity(props)
</script>

<template>
    <ul :class="['origam-list', densityClasses]"><slot /></ul>
</template>
```

Borrowing a parent's channel — the `name` override in practice. A row that must
answer to the table's density rules rather than its own:

```vue
<script setup lang="ts">
import { toRef } from 'vue'
import { useDensity } from 'origam/composables'
import type { IDensityProps } from 'origam/interfaces'

const props = defineProps<IDensityProps>()

// density="compact" → [ 'origam-table--density-compact' ]
const { densityClasses } = useDensity(toRef(props, 'density'), 'origam-table')
</script>

<template>
    <tr :class="['origam-table-row', densityClasses]"><slot /></tr>
</template>
```

## It validates — measured

Unlike `useSize` and `useVariant`, this composable has a **white-list**
(`PREDEFINED_DENSITY` = `default | compact | comfortable`). A value outside it
emits nothing rather than a class no stylesheet declares:

| `density` | `densityClasses` |
|---|---|
| `'default'` | `['{name}--density-default']` |
| `'compact'` | `['{name}--density-compact']` |
| `'comfortable'` | `['{name}--density-comfortable']` |
| `'zzz'` | `[]` |
| `0` | `[]` |
| `null` / unset | `[]` |

Note the `0` row. The `Ref` overload types `number | string | undefined`, but
the white-list holds three strings, so no number can ever match — the numeric
member of that union is unreachable in practice.

There are two guards, not one: an explicit `if (density == null) return` and
then a truthiness test inside the white-list check. That is why `''` yields
nothing rather than the malformed `{name}--density-`.

## No style channel, no custom values

`useDensity` returns **one** key. There is no `densityStyles`, and no
"custom value falls back to inline style" path — the classes-first contract
that governs `useRounded` / `useElevation` / `useBorder` does not apply here at
all. A density that is not one of the three is simply not expressible: the
component's own SCSS owns what each rung means.

## Consumers

Counted by **real import declaration**: **44 components** — the widest reach of
any composable in this lot after the spacing pair. `OrigamBtn`,
`OrigamBtnGroup`, `OrigamList`, `OrigamListItem`, `OrigamTable`, `OrigamCard*`,
`OrigamField`, `OrigamFileField`, `OrigamChip`, `OrigamAvatar*`,
`OrigamBreadcrumb*`, `OrigamExpansionPanel*`, `OrigamStepper`, `OrigamTabs`,
`OrigamTimeline*`, `OrigamToolbar`, `OrigamTreeview`, … One spec,
`packages/tests/TU/composables/Commons/density.composable.spec.ts`.

## Source

`packages/ds/src/composables/Commons/density.composable.ts`

## Related

- [`useSize`](./useSize.md) — the sibling enum channel, which does **not**
  validate
- [`useVariant`](./useVariant.md) — the third name-builder of the family, also
  without a white-list
- [`usePadding`](./usePadding.md) — where a density rung usually ends up
  resolving, through the component's SCSS
