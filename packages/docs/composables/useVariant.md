# useVariant

Turns `props.variant` (or a `Ref` passed directly) into a single BEM modifier
class, `{name}--variant-{value}`.

## API

```ts
function useVariant (
    props: IVariantProps | Ref<TVariant | TVariantInput | string | undefined>,
    name = getCurrentInstanceName()
): {
    variantClasses: ComputedRef<string[]>
}
```

`name` defaults to the current instance's kebab-cased name, so calling
outside `setup()` without an explicit `name` throws.

## Usage

```vue
<script setup lang="ts">
import { useVariant } from 'origam/composables'
import type { IVariantProps } from 'origam/interfaces'

const props = defineProps<IVariantProps>()
const { variantClasses } = useVariant(props)
</script>

<template>
    <button :class="['origam-btn', variantClasses]"><slot /></button>
</template>
```

## No allow-list — measured

Unlike `useDensity` and `useSize`, there is **no `*_ARRAY` white-list to
match**. Any non-empty string produces a class, including a variant the
component knows nothing about:

| input | `variantClasses` |
|---|---|
| `undefined` | `[]` |
| `null` | `[]` |
| `''` | `[]` |
| `'flat'` | `['origam-btn--variant-flat']` |
| `'zzz-not-a-variant'` | `['origam-btn--variant-zzz-not-a-variant']` |

So a typo does not throw and does not warn — it emits a class no stylesheet
matches, and the component renders in its base appearance. The composable is a
pure name-builder; validity is the SCSS's business.

The guard against `null` is explicit (`if (variant == null) return classes`)
and the emission is guarded again by truthiness, which is why the empty string
also yields nothing rather than the invalid `origam-btn--variant-`.

## Consumers

**3** components: `components/Btn/OrigamBtn.vue`,
`components/Btn/OrigamBtnGroup.vue`, `components/Field/OrigamField.vue`.
Plus `packages/tests/TU/composables/Commons/variant.composable.spec.ts`.

## Source

`packages/ds/src/composables/Commons/variant.composable.ts`

## Related

- [ADR-005 (variant as props preset)](../internal/adr-005-variant-as-props-preset.md)
- [`useStateEffect`](./useStateEffect.md) — where a variant's colours usually
  end up resolving.
