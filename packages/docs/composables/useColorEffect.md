# useColorEffect

State-aware colour resolver: same `color` / `bgColor` surface as
[`useColor`](./useColor.md), but the background token is bumped to its
`bgHover` / `bgActive` rung while the element is hovered or pressed.

It is **not** a wrapper around `useColor` — the role/state derivation is a
different algorithm living in its own file. The two share no code beyond the
helpers in `utils/Commons/color.util.ts`.

::: tip Which one do I want?
`useColorEffect` has exactly **2 consumers** left in the DS: `OrigamAudio` and
`OrigamVideo`. Everything else moved to [`useStateEffect`](./useStateEffect.md),
which resolves the same colour axis plus seven others. Prefer `useStateEffect`
in new components.
:::

## API

```ts
function useColorEffect (
    props: IColorProps & IBgColorProps,
    isHover: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isActive: Ref<boolean> | ComputedRef<boolean> = ref(false),
    isDisabled: Ref<boolean> | ComputedRef<boolean> = ref(false)
): {
    colorClasses: ComputedRef<string[]>
    colorStyles: ComputedRef<string[]>
    color: ComputedRef<TColor>
    bgColor: ComputedRef<TColor>
}
```

`color` and `bgColor` are pass-through computeds over `props.color` /
`props.bgColor` — the raw values, not the resolved declarations.

## Usage

```vue
<script setup lang="ts">
import { useColorEffect, useStateFlag } from 'origam/composables'

const props = defineProps<{ color?: string, bgColor?: string, disabled?: boolean }>()

const { isHover } = useStateFlag(props, 'hover')
const { colorClasses, colorStyles } = useColorEffect(props, isHover)
</script>

<template>
    <div :class="colorClasses" :style="colorStyles">
        <slot />
    </div>
</template>
```

## What each state emits — measured

With `bgColor="primary"` and no `color`:

| state | `colorClasses` | `colorStyles` |
|---|---|---|
| resting | `['origam--bg-primary']` | `background-color: var(--origam-color__action--primary---bg)` + `color: var(--origam-color__action--primary---fg)` |
| hover | `[]` | `background-color: var(--origam-color__action--primary---bgHover, color-mix(in srgb, var(--origam-color__action--primary---bg), black 20%))` (fg unchanged) |
| active | `[]` | same shape with `---bgActive` and `black 30%` |
| hover **and** active | `[]` | the **hover** rung |
| disabled | `[]` | identical to resting |

Three consequences the code makes explicit:

- **`colorClasses` is empty as soon as `isHover`, `isActive` or `isDisabled`
  is true.** Utility classes are static by design and there is no
  `.origam--bg-primary-hover`; the inline declaration takes over. Never assert
  on the utility class in a test that also drives a state flag.
- **Hover outranks active.** Pressing *and* hovering lands on the hover
  surface. (`bgRole` reads `isHover` first.)
- **`isDisabled` never swaps a token.** It is accepted for API symmetry and
  only suppresses the class. The design contract is that disabled is an
  opacity veil applied by the host component on whatever colour was resolved,
  so a row of buttons dims consistently instead of all collapsing to one grey.

The foreground token is taken from the intent's `default` slot in every
state — text does not darken along with its surface.

## Other inputs — measured

| input | `colorClasses` | `colorStyles` |
|---|---|---|
| `bgColor: 'transparent'`, resting | `[]` | `background-color: transparent` |
| `bgColor: 'transparent'`, hover | `[]` | `background-color: color-mix(in srgb, transparent, black 20%)` |
| `bgColor: '#ff00aa'`, resting | `[]` | `background-color: #ff00aa` + `color: #fff` |
| `bgColor: '#ff00aa'`, hover | `[]` | `background-color: color-mix(in srgb, #ff00aa, black 20%)` + `color: #fff` |
| `color: 'success'` only | `['origam--color-success']` | `color: var(--origam-color__feedback--success---fgSubtle)` |
| `color: 'ghost'` only | `[]` | `color: var(--origam-color__action--ghost---fg)` |
| `bgColor: 'linear-gradient(…)'` | `[]` | `background-image: linear-gradient(…)` — **identical under hover** |
| nothing | `[]` | `[]` |

- **Gradients ignore the hover/active cascade entirely**, by design: a
  per-stop `color-mix` would bloat the declaration and change the artistic
  intent. Express the state through opacity or transform on the host instead.
- **A foreground gradient hijacks `background-image`** and overrides whatever
  the background branch resolved, adding the `background-clip: text` triad.
  Measured with `color: 'linear-gradient(…)'` + `bgColor: 'primary'`: classes
  keep `origam--bg-primary` while the styles paint the gradient.
- **Raw CSS colours warn once per value.** `warnLegacyColor()` logs a
  deprecation naming the prop and the value; a second resolution of the same
  value is silent (measured: two evaluations, one `console.warn`). `transparent`
  is exempt. Raw-colour support is announced for removal in v3.0.0.

## Foreground: the class and the style do not agree

The same asymmetry documented for [`useColor`](./useColor.md#why-the-foreground-class-and-the-foreground-style-differ)
applies here: `.origam--color-{intent}` resolves `…---fg`, the inline
declaration resolves `…---fgSubtle`. They are different roles, and only the
inline declaration outranks a component's own scoped `color:` rule. Bind both.

## Behaviour notes

- **No component instance required** — pure computeds, no
  `getCurrentInstance()`, no DOM. Usable in a plain composable or a spec.
- The flat per-state override props (`hoverColor`, `activeBgColor`, …) were
  removed. State now only selects the token *rung*; there is no way to hand
  this composable a different colour for hover. `useStateEffect`'s
  `hoverState` / `activeState` object props are where that lives.

## Consumers

**2** in `packages/ds/src/components/`:
`components/Audio/OrigamAudio.vue`, `components/Video/OrigamVideo.vue`.
Plus `packages/tests/TU/composables/Commons/color.composable.spec.ts`.

## Source

- `packages/ds/src/composables/Commons/colorEffect.composable.ts`
- Spec: `packages/tests/TU/composables/Commons/color.composable.spec.ts`

## Related

- [`useStateEffect`](./useStateEffect.md) — the 8-axis successor.
- [`useColor`](./useColor.md) — the static resolver.
