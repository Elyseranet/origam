# useStateEffect

One composable for the eight visual axes a component repaints on hover /
active. It replaces the chain `useColorEffect` + `useBorder` + `useRounded` +
`useElevation` + `usePadding` + `useMargin` that every visual component used
to repeat, and is the most-used state hook in the DS — **30 components**.

Axes covered: `color`, `bgColor`, `border`, `rounded`, `elevation`, `padding`,
`margin`, `gap`. Each returns a `*Classes` and a `*Styles` computed.

## API

```ts
function useStateEffect (
    props: TStateEffectProps,
    isHover: Ref<boolean> | ComputedRef<boolean> = noopRef,
    isActive: Ref<boolean> | ComputedRef<boolean> = noopRef,
    hoverState: ComputedRef<IHoverState | undefined> = computed(() => undefined),
    activeState: ComputedRef<IActiveState | undefined> = computed(() => undefined),
    isDisabled: Ref<boolean> | ComputedRef<boolean> = noopRef,
    flat: Ref<boolean> | ComputedRef<boolean> = noopRef
): {
    // resolved scalars — the effective value for the current state
    color: ComputedRef<TColor | undefined>
    bgColor: ComputedRef<TColor | undefined>
    border: ComputedRef<unknown>
    rounded: ComputedRef<unknown>
    elevation: ComputedRef<unknown>
    padding: ComputedRef<unknown>
    margin: ComputedRef<unknown>
    gap: ComputedRef<boolean | number | string | undefined>

    // per-axis class + style channels
    colorClasses: ComputedRef<string[]>
    colorStyles: ComputedRef<string[]>
    borderClasses: ComputedRef<string[]>
    borderStyles: ComputedRef<string[]>
    roundedClasses: ComputedRef<string[]>
    roundedStyles: ComputedRef<string[]>
    elevationClasses: ComputedRef<string[]>
    elevationStyles: ComputedRef<string[]>
    paddingClasses: ComputedRef<string[]>
    paddingStyles: ComputedRef<string[]>
    marginClasses: ComputedRef<string[]>
    marginStyles: ComputedRef<string[]>
    gapClasses: ComputedRef<string[]>
    gapStyles: ComputedRef<string[]>
}
```

22 keys. `TStateEffectProps` is the intersection of `IColorProps`,
`IBgColorProps`, `IBorderProps`, `IRoundedProps`, `IElevationProps`,
`IPaddingProps`, `IMarginProps` plus `{ gap?: boolean | number | string }` —
it is deliberately an intersection so it cannot drift from what the per-axis
composables accept.

## Usage

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useStateEffect, useStateFlag } from 'origam/composables'
import type { IHoverState } from 'origam/interfaces'

const props = defineProps<{
    bgColor?: string
    rounded?: string
    hover?: boolean | IHoverState
}>()

const { isHover } = useStateFlag(props, 'hover')
const hoverState = computed(() => typeof props.hover === 'object' ? props.hover : undefined)

const {
    colorClasses, colorStyles,
    roundedClasses, roundedStyles
} = useStateEffect(props, isHover, undefined, hoverState)
</script>

<template>
    <div
        :class="[colorClasses, roundedClasses]"
        :style="[colorStyles, roundedStyles]"
    >
        <slot />
    </div>
</template>
```

::: danger Requires an active component instance
`useStateEffect` delegates the border axis to `useBorder`, which calls
`getCurrentInstanceName()`. Calling it outside `setup()` throws
`[Origam] composable must be called from inside a setup function`. Measured.
Unlike [`useColor`](./useColor.md), it cannot be exercised in a bare unit test.
:::

## Precedence

Per axis, the effective value is picked by `pickEffective`:

1. `isHover` **and** `hoverState.{axis} != null` → the hover override
2. `isActive` **and** `activeState.{axis} != null` → the active override
3. otherwise the resting `props.{axis}`

⛔ **Hover outranks active**, not the other way round: hovering a pressed or
selected element shows the hover surface. Measured with
`hoverState = { bgColor: 'success' }` and `activeState = { bgColor: 'danger' }`
over a resting `bgColor: 'primary'` — resting `primary`, active-only `danger`,
both engaged `success`.

::: warning A stale comment in the source says the opposite
`pickEffective`'s own JSDoc (`stateEffect.composable.ts`, "active outranks
hover") contradicts its body and the composable's public banner. The body is
what runs; the measurement above confirms it. Do not take that block as spec.
:::

The resting value is read through a **getter**, not captured eagerly, so a
later change to `props.color` still re-evaluates. The same reason drives the
`reactive({ get … })` bags used to forward the directional props below.

## The colour axis

Same resolution as [`useColorEffect`](./useColorEffect.md), with the same two
rules:

- `colorClasses` is `[]` whenever `isHover`, `isActive` or `isDisabled` is
  true — the resolved token is no longer the resting one the utility class
  names.
- `isDisabled` does not swap a token; it only suppresses the class. Disabled
  is an opacity veil the host component applies.

The `bgHover` / `bgActive` bump only happens when the state carries **no own
background**. Measured:

| resting | hover override | resolved while hovering |
|---|---|---|
| `bgColor: 'primary'` | *(none)* | `var(--origam-color__action--primary---bgHover, color-mix(in srgb, var(--origam-color__action--primary---bg), black 20%))` |
| `bgColor: 'primary'` | `{ bgColor: 'primary' }` | the **same bump** — an override equal to the resting intent counts as no override |
| `bgColor: 'primary'` | `{ bgColor: 'success' }` | `var(--origam-color__feedback--success---bg)`, untouched — the consumer picked the value, it is not re-darkened |

⛔ **`useStateEffect` does not handle gradients.** `useColor` and
`useColorEffect` both detect `linear-gradient(…)` and emit
`background-image`; this one has no gradient branch. Measured:
`bgColor: 'linear-gradient(90deg, red, blue)'` → `colorStyles` is `[]` — the
surface is simply not painted. A gradient surface on one of the 30 consumers
needs its own `:style` binding.

## `status` overrides the colour props

A `status` (`success` | `info` | `warning` | `error`) forces the matching
feedback intent and **wins over `color` / `bgColor`** — otherwise setting a
status would be cosmetically inert. `error` maps to the `danger` intent
(`TStatus` says `error`, `TIntent` says `danger`); the others map 1:1. The
consumer's `color` is dropped so the surface auto-pairs its own contrasting
text.

Measured with `{ bgColor: 'primary', color: 'info', status: 'error' }` →
`bgColor` resolves to `danger`, `color` to `undefined`, styles to the
`feedback--danger` pair.

A `status` string that is not one of the four is passed through unchanged as a
colour value; since it is not an intent either, `colorStyles` comes back empty.

## Axes that are not state-swappable

`IStateEffectConfig` (the `hover` / `active` object) carries only the eight
scalars. The **directional** props are read straight from the resting props
and forwarded through explicit getter bags:

- border: `borderColor`, `borderStyle`, `borderBlock`, `borderInline`,
  `borderTop|Right|Bottom|Left` and their `*Color` twins
- rounded: `roundedTopLeft|TopRight|BottomLeft|BottomRight`
- padding / margin: `*Top`, `*Right`, `*Bottom`, `*Left`, `*Block`, `*Inline`

That forwarding list is curated by hand, and forgetting an entry silently
drops the prop for all 30 consumers — it has happened three times (per-side
border, then `borderBlock`/`borderInline`, then the rounded corners). If you
add a directional prop to one of the Commons interfaces, add it here too.

Measured pass-through:
`{ borderTop: 2, borderInline: 1, borderColor: 'primary', roundedTopLeft: 'lg', paddingBlock: 4, marginInline: 2 }`
→ `border-top-width: 2px`, `border-inline-width: 1px`, `border-color: primary`,
`border-top-left-radius: var(--origam-radius---lg, 12px)`, `padding-block: 4px`,
`margin-inline: 2px`.

## `gap` and `flat`

There is no `useGap` composable. `gapStyles` is produced inline and
`gapClasses` is **always `[]`**:

| `gap` | `gapStyles` |
|---|---|
| `12` | `['gap: 12px']` |
| `'1rem'` | `['gap: 1rem']` |
| `true` | `[]` |
| `false` / `undefined` | `[]` |

`flat` is the seventh argument and bridges `useElevation`'s own contract:
when true, **both** `elevationClasses` and `elevationStyles` resolve empty.
Measured with `elevation: 'md'` — `['origam-card--elevated', 'origam--shadow-md']`
+ `box-shadow: var(--origam-shadow---md)` at rest, `[]` + `[]` once flat.

## Consumers

**30** components in `packages/ds/src/components/`, among them `Alert`,
`Avatar`, `AvatarGroup`, `Badge`, `BottomNav`, `Breadcrumb`, `Btn`,
`BtnGroup`, `Calendar`, `Card`, `Chart`, `Chip`, `Drawer`, the
`ExpansionPanel` family, `Field`, `ListGroup`, `ListItem`, `Menu`,
`Pagination`, `Radio`, `SelectionControl`, `Sheet`, `Snackbar`, `Stepper`,
`Switch`, `Table`, `Toolbar`, `Treeview`.

## Known duplication

Issue **#541** records that this composable re-implements the colour axis of
`useColorEffect` rather than calling it; the source comment says as much
("Color resolution keeps the existing `useColorEffect` semantics verbatim").
This page describes what exists — it does not settle that ticket.

## Source

- `packages/ds/src/composables/Commons/stateEffect.composable.ts`
- Types: `packages/ds/src/types/Commons/state-effect.type.ts`,
  `packages/ds/src/interfaces/Commons/state-effect.interface.ts`
- Spec: `packages/tests/TU/composables/Commons/stateEffect.composable.spec.ts`

## Related

- [`useColorEffect`](./useColorEffect.md) — the 2-consumer colour-only ancestor.
- [`useColor`](./useColor.md) — the static resolver.
- [`useStatus`](./useStatus.md) — where the `status` prop's icon and class come
  from.
