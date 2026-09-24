# useColor

Static colour resolver for the `color` (foreground) and `bgColor` (surface)
channels. It turns a `TColor` value — a semantic intent, a raw CSS colour, a
gradient — into a **utility class list** and an **inline declaration list**,
both of which the consumer binds.

`useColor` is the base hook. Three thin wrappers narrow it to one channel and
rename its output so a component can bind several channels without aliasing:

| Hook | Reads | Returns |
|---|---|---|
| `useColor` | a `{ background, text }` computed | `colorClasses`, `colorStyles` |
| `useBackgroundColor` | one source → `background` | `backgroundColorClasses`, `backgroundColorStyles` |
| `useTextColor` | one source → `text` | `textColorClasses`, `textColorStyles` |
| `useBothColor` | two sources → `background` + `text` | `colorClasses`, `colorStyles` |

None of the four is state-aware. Hover / active / disabled resolution lives in
[`useColorEffect`](./useColorEffect.md) (2 consumers) and
[`useStateEffect`](./useStateEffect.md) (30 consumers), which are **separate
algorithms**, not wrappers around this one.

## Basic usage

```vue
<script setup lang="ts">
import { toRef } from 'vue'
import { useBothColor } from 'origam/composables'

const props = defineProps<{ color?: string, bgColor?: string }>()

const { colorClasses, colorStyles } = useBothColor(
    toRef(props, 'bgColor'),
    toRef(props, 'color')
)
</script>

<template>
    <div :class="colorClasses" :style="colorStyles">Painted surface</div>
</template>
```

`colorStyles` is an **array of declaration strings** (`'background-color: …'`),
not an object. Vue accepts that shape directly in `:style`.

## API

```ts
function useColor (colors: ComputedRef<{ background?: TColor, text?: TColor }>): {
    colorClasses: ComputedRef<string[]>
    colorStyles: ComputedRef<string[]>
}

function useBackgroundColor<T extends Record<K, TColor>, K extends string> (
    props: T | Ref<TColor>,
    name?: K
): {
    backgroundColorClasses: ComputedRef<string[]>
    backgroundColorStyles: ComputedRef<string[]>
}

function useTextColor<T extends Record<K, TColor>, K extends string> (
    props: T | Ref<TColor>,
    name?: K
): {
    textColorClasses: ComputedRef<string[]>
    textColorStyles: ComputedRef<string[]>
}

function useBothColor<T extends Record<K, TColor>, K extends string> (
    bgColorProps: T | Ref<TColor> | ComputedRef<TColor>,
    colorProps: T | Ref<TColor> | ComputedRef<TColor>,
    name?: K
): {
    colorClasses: ComputedRef<string[]>
    colorStyles: ComputedRef<string[]>
}
```

`TColor` is `string | IGradient | false | null | undefined` — see
`packages/ds/src/types/Commons/color.type.ts`.

### The two input forms of the wrappers

Each wrapper accepts either a **ref** (then `name` is omitted) or a **props
object plus the key to read**:

```ts
useBackgroundColor(toRef(props, 'bgColor'))   // ref form
useBackgroundColor(props, 'bgColor')          // props + key form
```

::: warning `useBothColor` takes ONE `name` for TWO objects
`name` is applied to *both* `bgColorProps` and `colorProps`. Passing two
different props objects with a single key therefore reads the **same key from
both**, and the second channel silently resolves to `undefined`. Measured:
`useBothColor({ bgColor: 'primary' }, { color: 'success' }, 'bgColor')` emits
only `origam--bg-primary` — the `success` foreground never appears.

All 44 call sites in `packages/ds/src/components/` use the ref form
(`useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))`). Use it too.
:::

## Which channel fires — measured

⛔ **The "tokenised value → class, custom value → inline style" rule does not
describe this composable.** It is true only of the *class* side; the inline
side fires in cases where a class was also emitted. Measured against the DS's
own token sheet:

| input | `colorClasses` | `colorStyles` |
|---|---|---|
| `{ text: 'primary' }` | `['origam--color-primary']` | `['color: var(--origam-color__action--primary---fgSubtle)']` |
| `{ background: 'primary' }` | `['origam--bg-primary']` | `['background-color: var(--origam-color__action--primary---bg)', 'color: var(--origam-color__action--primary---fg)']` |
| `{ background: '#ff00aa' }` | `[]` | `['background-color: #ff00aa', 'color: #fff']` |
| `{ text: 'linear-gradient(90deg, red, blue)' }` | `[]` | `['background-image: linear-gradient(90deg, red, blue)', 'background-clip: text', '-webkit-background-clip: text', 'color: transparent']` |

Two things to read off that table:

1. **A tokenised background still emits inline styles**, because the composable
   auto-pairs the intent's contrasting foreground when the consumer set no
   `color`. Only the `background-color` half has a class equivalent.
2. **A tokenised foreground emits a class *and* an inline declaration, and the
   two do not name the same token.**

### Why the foreground class and the foreground style differ

`.origam--color-{intent}` resolves `…---fg` — the light-on-saturated pair,
designed to sit on that intent's own surface.
`tokenForegroundForIntent()` resolves `…---fgSubtle` — the intent's own hue,
designed for coloured text on a neutral surface. They are opposite roles.

Read from `assets/css/tokens/origam-utilities.css` and
`utils/Commons/color.util.ts`, for the 7 intents that ship a utility class:

| intent | class resolves | inline resolves | same? |
|---|---|---|---|
| `primary` | `--origam-color__action--primary---fg` | `--origam-color__action--primary---fgSubtle` | no |
| `secondary` | `--origam-color__action--secondary---fg` | `--origam-color__action--secondary---fg` | **yes** |
| `neutral` | `--origam-color__text---primary` | `--origam-color__action--secondary---fg` | no |
| `success` | `--origam-color__feedback--success---fg` | `--origam-color__feedback--success---fgSubtle` | no |
| `warning` | `--origam-color__feedback--warning---fg` | `--origam-color__feedback--warning---fgSubtle` | no |
| `danger` | `--origam-color__feedback--danger---fg` | `--origam-color__feedback--danger---fgSubtle` | no |
| `info` | `--origam-color__feedback--info---fg` | `--origam-color__feedback--info---fgSubtle` | no |

`ghost` is the eighth intent and ships **no** utility class at all
(`COLOR_UTILITY_INTENTS` excludes it), so `color="ghost"` never produces a
class — only the inline `--origam-color__action--ghost---fg`.

Issue #514 measured the rendered colours in Chromium and reached the same
verdict from the other side: the pair differs for every intent but `secondary`.

Keeping the inline declaration is deliberate, not a migration leftover: a Vue
scoped rule (`.class[data-v-hash]`, specificity `0,2,0`) outranks a utility
(`0,1,0`), and `origam-utilities.css` is loaded *before* component SCSS on
purpose. Only the inline declaration outranks a component's own `color:` rule.
Bind **both** channels; dropping `colorStyles` stops the `color` prop painting.

## Resolution order

**Background** (first match wins):

1. gradient (`linear-` / `radial-` / `conic-gradient(…)`, or an `IGradient`)
   → `background-image: …`; no auto-contrast is attempted afterwards.
2. an intent → `background-color: var(--origam-color__…---bg)`, and the
   intent's paired `fg` token is remembered for step 2 of the foreground.
3. the literal `'transparent'` → `background-color: transparent`.
4. any other parsable CSS colour → `background-color: <value>`.

**Foreground** (first match wins):

1. gradient → the `background-clip: text` triad plus `color: transparent`.
2. an intent → `color: var(…---fgSubtle)`, *except* when `color` and `bgColor`
   are the **same** intent, where it swaps to the background's paired contrast
   token. Without that swap, `color="primary" bgColor="primary"` would paint
   `primary.700` text on a `primary` surface — hue on hue.
3. any other CSS colour → `color: <value>`.
4. no `color` at all, but `bgColor` was an intent → the intent's paired `fg`.
5. no `color` at all, but `bgColor` was an opaque raw colour → a WCAG-aware
   foreground from `getForeground()`. Skipped when the background is
   translucent (`alpha < 1`), where contrast cannot be computed reliably.

Measured for the clash case:
`{ background: 'primary', text: 'primary' }` →
`['background-color: var(--origam-color__action--primary---bg)', 'color: var(--origam-color__action--primary---fg)']`.

## Behaviour notes

- **No component instance required.** Unlike `useStateEffect`, these four
  never call `getCurrentInstance()`, so they can be used in a plain composable
  or a unit test without mounting.
- **SSR-safe**: pure computeds, no DOM access.
- **Legacy raw colours do not warn here.** `useColorEffect` and
  `useStateEffect` call `warnLegacyColor()` on a raw hex/rgb; `useColor` does
  not. Passing `color="#ff00aa"` through `useTextColor` is silent.
- `false` / `null` / `undefined` are the opt-out: nothing is emitted on that
  channel.

## Consumers

Counted by import, in `packages/ds/src` at the commit this page was written:

- `useColor` — **0 direct consumers.** It is reached only through the three
  wrappers below (plus its own spec).
- `useBackgroundColor` — **31** components, 21 of them the `Chart` family,
  plus `Drawer`, `Overlay`, `OverlayScrim`, `Picker`, `QrCode`,
  `SliderField`, `SliderFieldTrack`, `SwitchTrack`, `Tabs`, `MediaScrubber`.
- `useTextColor` — **11** components: `DataTableGroupHeaderRow`,
  `DataTableRows`, `DatePickerHeader`, `DatePickerField`, `MediaVolumeControl`,
  `Messages`, `ProgressCircular`, `ProgressLinear`, `QrCode`, `Select`,
  `SliderField`.
- `useBothColor` — **44** components (`Card`, `Chip`, `Icon` family, `Menu`,
  `Tooltip`, the `ExpansionPanel` family, …).

85 distinct component files import at least one of the three wrappers.

## Source

- `packages/ds/src/composables/Commons/color.composable.ts`
- `packages/ds/src/composables/Commons/backgroundColor.composable.ts`
- `packages/ds/src/composables/Commons/textColor.composable.ts`
- `packages/ds/src/composables/Commons/bothColor.composable.ts`
- Spec: `packages/tests/TU/composables/Commons/color.composable.spec.ts`

## Related

- [`useColorEffect`](./useColorEffect.md) — hover / active / disabled surfaces.
- [`useStateEffect`](./useStateEffect.md) — the 8-axis state resolver that
  replaced the `useColorEffect` + border + rounded + … chain.
- [`useTheme`](./useTheme.md) — brand and mode axes the tokens above resolve
  against.
