# useSize

Turns a single `size` prop into either a pair of classes (when the value is one
of the five enum rungs) or a `width` + `height` pair of inline declarations
(when it is anything else). Never both for the same value.

## API

```ts
function useSize (props: ISizeProps, name = getCurrentInstanceName()): {
    sizeStyles: ComputedRef<string[]>
    sizeClasses: ComputedRef<string[]>
}
```

`ISizeProps` declares a single prop, `size?: TSize | number` — one of the five
`SIZES` enum rungs, or a number. `name` defaults to the current instance's
kebab-cased name, so calling outside `setup()` without an explicit `name`
throws.

```vue
<script setup lang="ts">
import { useSize } from 'origam/composables'
import type { ISizeProps } from 'origam/interfaces'

const props = defineProps<ISizeProps>()
const { sizeClasses, sizeStyles } = useSize(props)
</script>

<template>
    <span :class="['origam-avatar', sizeClasses]" :style="sizeStyles">
        <slot />
    </span>
</template>
```

## The two channels — measured

| `size` | `sizeClasses` | `sizeStyles` |
|---|---|---|
| `'x-small'` | `['{name}--size-x-small', 'origam--text-xs']` | `[]` |
| `'small'` | `['{name}--size-small', 'origam--text-sm']` | `[]` |
| `'default'` | `['{name}--size-default', 'origam--text-md']` | `[]` |
| `'large'` | `['{name}--size-large', 'origam--text-lg']` | `[]` |
| `'x-large'` | `['{name}--size-x-large', 'origam--text-xl']` | `[]` |
| `24` | `[]` | `['width: 24px', 'height: 24px']` |
| `'3rem'` * | `[]` | `['width: 3rem', 'height: 3rem']` |
| unset | `[]` | `[]` |

\* `'3rem'` is **outside the declared type** — `ISizeProps` admits only the five
enum rungs and `number`. It is listed because the runtime accepts it: the
custom path routes through [`convertToUnit`](./convertToUnit.md), so a CSS
length, a `var()` reference or a `calc()` expression all pass straight through
if you force one past the type.

## ⛔ `origam--text-*` is a TYPOGRAPHIC utility — do not bind it blindly

`useSize` historically drives `width` / `height`. The Phase 1 utility classes it
bridges to drive **`font-size`**. The companion class is therefore only useful
on a component whose `size` also implies a typographic scale — `OrigamBtn`,
`OrigamChip`. A component that reads `size` as a pure box dimension should
**not** put `sizeClasses` in its `:class` binding; `sizeStyles` stays
authoritative for geometry.

## ⛔ Two half-implemented edges — measured

**A `Ref` is accepted by one channel and ignored by the other.**
`sizeClasses` unwraps (`isRef(props) ? props.value : props.size`) while
`sizeStyles` reads `props.size` directly. The signature only types
`ISizeProps`, so passing a `Ref` is out of contract — but the result is not a
type error, it is silence:

```ts
// @ts-expect-error — a Ref is outside the signature; this is the point.
useSize(ref(24))        // { classes: [], styles: [] }        ← fully inert
useSize({ size: 24 })   // { classes: [], styles: ['width: 24px', 'height: 24px'] }
```

Pass the props object.

**There is no allow-list on the custom path.** Anything not in `SIZES_ARRAY`
goes to the inline branch verbatim:

```ts
// @ts-expect-error — 'zzz' is outside ISizeProps; TypeScript rejects it,
// the runtime does not.
useSize({ size: 'zzz' }).sizeStyles.value
// [ 'width: zzz', 'height: zzz' ]   ← two invalid declarations, no warning
```

TypeScript is the only guard here, and it is a real one: `size?: TSize | number`
rejects the literal at compile time. But nothing checks at runtime, so the same
value arriving from a theme's `components` block, from `v-bind` of an untyped
object, or from JavaScript passes straight through. The browser drops both
declarations, so the symptom reads as "the prop does nothing". Same absence of
runtime validation as [`useVariant`](./useVariant.md) — and unlike
[`useDensity`](./useDensity.md), which white-lists.

*Reported here, deliberately not fixed — this is a documentation lot.*

## Consumers

Counted by **real import declaration**: **21 components** — `OrigamAvatar`,
`OrigamBtn`, `OrigamBtnGroup`, `OrigamChip`, `OrigamDialog`, `OrigamField`,
`OrigamIcon`, `OrigamInput`, `OrigamKbd`, `OrigamListItem`,
`OrigamMediaVolumeControl`, `OrigamPagination`, `OrigamProgress`,
`OrigamProgressCircular`, `OrigamQrCode`, `OrigamSkeleton`, `OrigamStepper`,
`OrigamTimeline`, `OrigamTimelineItem`, `OrigamTreeview`,
`OrigamBreadcrumbDivider`. One spec,
`packages/tests/TU/composables/Commons/size.composable.spec.ts`.

## Source

`packages/ds/src/composables/Commons/size.composable.ts`

## Related

- [`useDensity`](./useDensity.md) — the other enum-driven class emitter, and
  the one that *does* validate
- [`useDimension`](./useDimension.md) — the explicit six-prop route to
  `width` / `height`
- [`convertToUnit`](./convertToUnit.md)
