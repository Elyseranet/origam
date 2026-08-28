# OrigamSelectionControl

`<OrigamSelectionControl>` is the low-level primitive that renders a single
toggleable input (a native `<input type="checkbox|radio|...">` plus its
label and a visual state-layer box). `<OrigamCheckbox>`, `<OrigamRadio>` and
`<OrigamSwitch>` are all built on top of it — each wraps `OrigamSelectionControl`
(via `OrigamCheckboxBtn` / `OrigamRadioBtn` for Checkbox/Radio, or directly for
Switch) inside an `<OrigamInput>` shell.

## When to use the primitive directly

Reach for `<OrigamSelectionControl>` itself when you need a bare toggle with
**no** `<OrigamInput>` chrome — no `hint`, no `persistentHint`, no `messages`,
no validation `rules`, no `hideDetails` (all of these come from `IInputProps`,
which `ICheckboxProps` / `IRadioProps` / `ISwitchProps` extend but
`ISelectionControlProps` does not). Typical cases:

- A custom selectable card/tile where the native input is visually hidden
  and you drive the whole visual from the `default` / `input` slots (see the
  "Slots" section below).
- A tight grid of toggles laid out with your own CSS, without paying for the
  `OrigamInput` wrapper markup.
- Building a new higher-level form atom (the same way `OrigamCheckboxBtn` /
  `OrigamRadioBtn` do).

If you need a hint, error messages, or validation `rules`, use
`OrigamCheckbox`, `OrigamRadio` or `OrigamSwitch` instead — they add exactly
that on top of this primitive.

## Basic usage

```vue
<template>
  <origam-selection-control
    v-model="accepted"
    type="checkbox"
    label="Accept terms"
    value="accepted"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const accepted = ref(false)
</script>
```

`type` is forwarded as-is to the native `<input type="…">` attribute — it is
not validated against a fixed list. `checkbox` and `radio` are the two
values with native semantics (radio needs a shared `name` to group inputs at
the browser level). The visual glyph itself never depends on `type`: it is
always an `<origam-icon>` driven by `trueIcon` / `falseIcon`, independent of
what the browser renders for that input type.

## Standalone vs. inside a group

`<OrigamSelectionControl>` works both on its own and nested inside an
`<origam-selection-control-group>`:

```vue
<template>
  <!-- Standalone — each control owns its own v-model -->
  <origam-selection-control
    v-for="n in 4"
    :key="n"
    v-model="picked"
    type="radio"
    name="grid-context"
    :value="`option-${n}`"
    :label="`Option ${n}`"
  />
</template>
```

```vue
<template>
  <!-- Inside a group — v-model lives on the group, children delegate to it -->
  <origam-selection-control-group v-model="picked" type="radio" color="primary">
    <origam-selection-control value="a" label="Option A" />
    <origam-selection-control value="b" label="Option B" />
  </origam-selection-control-group>
</template>
```

When a `<OrigamSelectionControl>` is nested inside a
`<origam-selection-control-group>`, it reads/writes the group's shared
`modelValue` instead of its own, and inherits `density`, `color`, `type`,
`disabled`, `readonly`, `error`, `multiple`, `name`, `ripple`, `falseIcon`,
`trueIcon` and `valueComparator` as **defaults** — any of these passed
directly on the child still wins.

::: warning `OrigamSelectionControlGroup` ships no layout CSS of its own
The group component renders a plain `<div role="group">` around its children
— it does not emit any `display: flex` / `gap` rule, and the `inline` prop
toggles a `origam-selection-control-group--inline` class that currently has
no matching style rule either. Design tokens named
`--origam-selection-control-group---*` (gap, flex-direction, padding…) are
generated in the theme sheet but are not consumed anywhere in the component.
In practice, children stack according to normal block flow (each
`origam-selection-control` is itself `display: flex`), and any spacing/row-vs-column
layout you want has to come from your own CSS on the group (or a wrapping
element) today.
:::

## Value & v-model

- `value` / `trueValue` / `falseValue` — `trueValue` defaults to `value` (or
  `true` if neither is set); `falseValue` defaults to `false`.
- `multiple` — when left unset, multiple mode is auto-detected from whether
  the current `modelValue` is an array.
- `valueComparator` — custom equality function used to match `modelValue`
  against `trueValue` (defaults to a deep-equal).
- `readonly` — blocks writes to the model; clicking the label still no-ops.

```vue
<template>
  <origam-selection-control
    v-model="flags"
    type="checkbox"
    value="newsletter"
    true-value="subscribed"
    false-value="unsubscribed"
    label="Newsletter"
  />
</template>
```

## Color

```vue
<template>
  <origam-selection-control color="primary" bg-color="primary" label="Primary" />
  <origam-selection-control color="success" label="Success" />
  <origam-selection-control color="danger" label="Danger" />
</template>
```

`color` also drives the label text and the thumb/icon via `currentColor`.
The checked glyph itself (the `<origam-icon>` rendered inside the
state-layer box once `trueIcon` / `falseIcon` resolves) is painted with a
**static** `:color="bgColor"` binding (`OrigamSelectionControl.vue:26`) —
it always reflects `bgColor`, independent of any interaction state.
`ISelectionControlProps` has no `active` prop at all (this component never
had one to fold into an object — see "Hover state-effect" below), so there
is no way to give the checked glyph a distinct color while pressed today.

::: warning No `activeColor` / `activeBgColor`
Earlier revisions of this doc described `activeColor` / `activeBgColor` as
legacy-but-functional props. Both were removed in the DS-wide state-color
purge (folded into the `hover` / `active` object props elsewhere in the
system) — but this component's interface never extended `IActiveProps` to
begin with, so there is no `:active="{ bgColor: ... }"` equivalent to
migrate to here. If you need the checked glyph to change color on press,
that's a feature gap, not a migration — raise it with the DS lead.
:::

## Rounded / border / elevation

`rounded`, `border` and `elevation` (all inherited from the Commons
interfaces) apply to `.origam-selection-control__input` — the state-layer
box that sits behind the icon glyph — not to the glyph itself (a `mdi-*`
icon-font character has no border-radius/border/shadow of its own).

```vue
<template>
  <origam-selection-control rounded="md" label="Rounded state layer" />
  <origam-selection-control border label="Bordered state layer" />
  <origam-selection-control elevation="sm" label="Elevated state layer" />
</template>
```

::: warning `rounded` alone paints nothing at rest
The state-layer box has no background and no border by default. Changing
its `border-radius` is real (measurable in the computed style), but there is
nothing painted at rest for the new corner to reveal. It becomes visible on
hover (the `::before` overlay fills in and follows the radius), combined
with `border` (which draws a ring on the box), combined with `elevation`
(which casts a shadow shaped by the radius), or with a custom background of
your own.
:::

## Hover state-effect

`hover` (`boolean | IHoverState`) is declared on `ISelectionControlProps`
and IS wired: `useStateFlag(props, {state: 'hover'})` drives `isHover` /
`hoverState`, which feed `useStateEffect(…)` (`OrigamSelectionControl.vue:268`).
Its `colorClasses` / `colorStyles` / `borderClasses` / `borderStyles` /
`roundedClasses` / `roundedStyles` / `elevationClasses` / `elevationStyles`
apply to `.origam-selection-control__input` — the state-layer box that sits
behind the icon glyph — so `:hover="{ bgColor: 'success', border: 'thick' }"`
does produce a visible change on that box while hovered.

```vue
<template>
  <origam-selection-control
    :hover="{ bgColor: 'success', rounded: 'lg' }"
    label="Custom hover surface"
  />
</template>
```

There is **no `active` prop** on this component (`ISelectionControlProps`
does not extend `IActiveProps`) — only `hover` participates in the
state-effect system here. The checked glyph's color (`bgColor`, see "Color"
above) is unaffected by hover: it is a separate, static binding.

## Density

```vue
<template>
  <origam-selection-control density="compact" label="Compact" />
  <origam-selection-control density="default" label="Default" />
  <origam-selection-control density="comfortable" label="Comfortable" />
</template>
```

## Icons

```vue
<template>
  <origam-selection-control
    :true-icon="MDI_ICONS.CHECK_CIRCLE"
    :false-icon="MDI_ICONS.CIRCLE_OUTLINE"
    label="Custom glyphs"
  />
</template>
```

`icon` (the glyph actually rendered) is a computed value: `trueIcon` when the
control is checked, `falseIcon` otherwise. If neither is set, no
`<origam-icon>` renders and only the native `<input>` remains.

## States

```vue
<template>
  <origam-selection-control label="Disabled" disabled />
  <origam-selection-control label="Readonly" readonly :model-value="true" />
  <origam-selection-control label="Error" error />
  <origam-selection-control label="Inline" inline />
</template>
```

`error` accepts `boolean` or a `string` (same contract as validation `error`
elsewhere in the DS); truthiness alone drives the danger-tinted label/icon —
no message is rendered by this component (there is no hint/message slot at
this level, see "When to use the primitive directly" above).

`required` is declared on the props interface but is **not** wired to the
native `<input required>` attribute nor consumed anywhere else in this
component — passing it currently has no observable effect at the
`OrigamSelectionControl` level.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | `{ model, color, bgColor, icon, props }` | Replaces the whole wrapper content (icon + native input included) |
| `input` | `{ model, color, bgColor, icon, props }` | Replaces only the visual control inside the state-layer box (icon + native input) |
| `label` | — | Replaces the `<origam-label>` entirely |

`props` (in `default` / `input`) bundles the attributes/handlers you'd need
to wire your own markup: `onFocus`, `onBlur`, `id` (in `default`), plus
`disabled`, `label`, `name`, `type`, `value`, `onInput` (in `input`).

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `any` | Fired when the control's checked state changes (standalone mode only — inside a group, the group's own `modelValue` is mutated instead) |
| `click:label` | `MouseEvent` | The `<origam-label>` was clicked |

Internal focus/focus-visible state is tracked for styling only and is not
emitted as a custom event. Native `focus` / `blur` listeners bound on
`<origam-selection-control>` are still wired straight onto the inner
`<input>` through attribute fallthrough, so `@focus` / `@blur` work the
normal HTML way even though they aren't part of the typed `emits` contract.

## Props

`ISelectionControlProps extends Partial<Omit<ISelectionControlGroupProps, 'items'>>`
(`selection-control.interface.ts:22`) — every prop of `ISelectionControlGroupProps`
except `items` is inherited here too (now optional), on top of the props
declared directly on `ISelectionControlProps` and the other Commons
interfaces it extends. Concretely, `disabled`, `error`, `inline`,
`falseIcon`, `trueIcon`, `multiple`, `name`, `readonly`, `modelValue`,
`type` and `valueComparator` below all come from that inherited group
surface (`selection-control-group.interface.ts:6-20`) — they aren't
redeclared independently, they're the exact same props
`<origam-selection-control-group>` itself accepts, just usable directly on
a standalone control too.

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Visible + `aria-label` text |
| `value` | `any` | — | Value represented by this control |
| `trueValue` | `any` | `value` ?? `true` | Model value when checked |
| `falseValue` | `any` | `false` | Model value when unchecked |
| `modelValue` | `any` | — | v-model (standalone mode) |
| `multiple` | `boolean` | auto-detected | Force array-based model handling |
| `valueComparator` | `(a, b) => boolean` | deep-equal | Custom equality check |
| `type` | `string` | — | Native `<input type>` (forwarded as-is) |
| `name` | `string` | — | Native `<input name>` — required to group native radios |
| `required` | `boolean` | — | Declared on the interface; not consumed by this component (see States) |
| `disabled` | `boolean` | — | Disables the control |
| `readonly` | `boolean` | — | Blocks model writes |
| `error` | `string \| boolean` | — | Tints the label/icon with the danger token |
| `inline` | `boolean` | — | Lays the control out inline instead of `flex: 1` |
| `color` | `TColor` | — | Text/label/icon intent color |
| `bgColor` | `TColor` | — | Background intent color; also paints the checked glyph (see Color above) |
| `hover` | `boolean \| IHoverState` | — | Wired to the state-layer box's color/border/rounded/elevation (see "Hover state-effect" above) |
| `density` | `TDensity` | — | `compact` \| `default` \| `comfortable` |
| `rounded` | `TRounded \| boolean \| number \| string` | — | Corner radius of the state-layer box (see warning above) |
| `border` | `boolean \| number \| string \| …` | — | Border of the state-layer box |
| `elevation` | `TElevation` | — | Shadow of the state-layer box |
| `trueIcon` / `falseIcon` | `TIcon` | — | Glyph shown when checked / unchecked |
| `ripple` | `boolean \| { class: string }` | — | Enables the click ripple on the state-layer box |
| `id` | `string` | `input-{uid}` | Native `id`, also used as the `<label for>` target |
| `class` / `style` | `ICommonsComponentProps` | — | Passthrough on the root element |

## Accessibility

- The native `<input>` carries `aria-checked` (checkbox only), `aria-disabled`
  and `aria-label` (mirroring `label`).
- The visible `<origam-label>` is a real `<label for="…">` bound to the
  input's `id`, so clicking the label toggles the control natively.
- `focus-visible` gets a dedicated outline (`--origam-color__border---focus`)
  drawn around the state-layer box, distinct from the plain `:hover` overlay.
- Building a fully custom visual through the `default` / `input` slots means
  you are responsible for forwarding the `props` bag's `onFocus` / `onBlur`
  / `id` onto your own focusable element to keep keyboard/AT support intact.

## CSS variables

Only the variables actually read by `OrigamSelectionControl`'s own
`<style>` block are listed — the token file also declares
`--origam-selection-control---*` / `--origam-selection-control__wrapper---*`
/ `--origam-selection-control__icon---*` / `--origam-selection-control__label---color`
entries that are generated in the global theme sheet but are **not**
consumed by this component's SCSS today.

| Variable | Description |
|---|---|
| `--origam-selection-control__input---backdrop-filter` | Backdrop filter applied to the state-layer box (default `none`) |
| `--origam-selection-control__label---color-error` | Label color in error state (falls back to `--origam-color__feedback--danger---fgSubtle`) |
| `--origam-selection-control__icon---color-error` | Icon color in error state (same fallback) |
| `--origam-border__width---2` | Focus-visible outline width |
| `--origam-color__border---focus` | Focus-visible outline color |
| `--origam-space---1` | Focus-visible outline offset |
