# OrigamRadioBtn

`<OrigamRadioBtn>` is the bare radio **control** — the glyph plus its
hidden native `<input type="radio">` and optional label. It is a thin
wrapper over `<OrigamSelectionControl type="radio">` that pins the
`radio` type and the two MDI glyphs, and forwards everything else down.

It carries **no** field chrome: no `<OrigamInput>` wrapper, no validation
messages, no `prepend` / `append` adjacent slots. Use
[`<OrigamRadio>`](/components/Radio/OrigamRadio) when you want the full field, or
[`<OrigamRadioGroup>`](/components/Radio/OrigamRadioGroup) for a set of mutually
exclusive options.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const picked = ref('a')
</script>

<template>
  <OrigamRadioBtn v-model="picked" value="a" label="Option A" />
  <OrigamRadioBtn v-model="picked" value="b" label="Option B" />
</template>
```

## Props

`IRadioBtnProps` adds nothing of its own — it is
`ICommonsComponentProps & ISelectionControlProps`. The whole surface is
therefore the selection-control surface.

### Value

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `any` | — | The group's selected value (`v-model`). |
| `value` | `any` | — | The value this button contributes when checked. |
| `trueValue` / `falseValue` | `any` | — | Explicit checked / unchecked values, when `value` alone is not enough. |
| `valueComparator` | `(a, b) => boolean` | identity | How `modelValue` is matched against `value`. |
| `name` | `string` | — | Native `name`, shared by the buttons of one group. |

### Content

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Text rendered next to the glyph. |
| `trueIcon` | `TIcon` | `MDI_ICONS.RADIOBOX_MARKED` | Glyph when checked. |
| `falseIcon` | `TIcon` | `MDI_ICONS.RADIOBOX_BLANK` | Glyph when unchecked. |
| `type` | `string` | `'radio'` | Pinned by the component — passing it is a no-op. |

### State

| Prop | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | — | Disables the native input. |
| `readonly` | `boolean` | — | Keeps the appearance, blocks input. |
| `required` | `boolean` | — | Native `required`. |
| `error` | `string \| boolean` | — | Error state; a string doubles as the message for the surrounding field. |
| `hover` | `boolean \| IStateEffectConfig` | — | `true` forces the hover state on regardless of the pointer; an object (`{ color, bgColor, border, rounded, elevation, padding, margin, gap }`) overrides the resting values only while hovered. |
| `hoverClass` | `string` | — | Extra class applied while hovered. |

### Design

| Prop | Type | Description |
|---|---|---|
| `color` | `TColor` | Foreground intent — paints the glyph. |
| `bgColor` | `TColor` | Background intent — paints the state-layer box behind the glyph. |
| `density` | `TDensity` | `default · comfortable · compact`. Defaults to `'default'`. |
| `border` / `borderColor` / `borderStyle` | `IBorderProps` | Border on the state-layer box. |
| `rounded` | `TRounded` | Corner radius of the state-layer box. |
| `elevation` | `number` | Shadow rung of the state-layer box. |
| `ripple` | `IRippleProps['ripple']` | Ripple configuration. |
| `inline` | `boolean` | Lays the control out inline. |
| `multiple` | `boolean` | Inherited from the shared selection-control surface; meaningless on a radio. |

Plus `ICommonsComponentProps` (`id`, `class`, `style`).

## Emits

`IRadioBtnEmits` = `ICommonsComponentEmits` + `IClickLabelEmits`:

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `any` | Fired when the selection changes. |
| `click:label` | `MouseEvent` | Fired when the user clicks the `<label>` rather than the glyph. Forwarded up from `<OrigamSelectionControl>`. |

> ⛔ There is **no** `update:focused` emit. `IFocusEmits` used to be in
> this list and was removed: this component has no focus handling at all
> — no `focus` / `blur` handler, no `useFocus` call, and `focused` is not
> even one of its props. The declaration was dead surface. A consumer
> binding `@update:focused` received nothing before and receives nothing
> after; the listener now flows through `$attrs` instead of being
> swallowed. Use `<OrigamRadio>` if you need the focus channel.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | — | Replaces the control's inner content. Forwarded unscoped to `<OrigamSelectionControl>`. |
| `input` | `{ model, icon, props }` | Replaces the native `<input>` + glyph. `props` is the resolved input prop bag, `icon` the glyph for the current state. |
| `label` | — | Replaces the label text. |

Each slot is only forwarded when the consumer actually provides it, so
the underlying default rendering stays intact otherwise.

```vue
<template>
  <OrigamRadioBtn v-model="picked" value="a">
    <template #label><strong>Custom label</strong></template>
  </OrigamRadioBtn>
</template>
```

## Behaviour

- **Theming** — every prop above is reachable from a theme's
  `components['origam-radio-btn']` block; `OrigamRadioBtn` declares them,
  which is all the global props resolver needs (see ADR-005).
- **Forwarding** — `controlProps` re-derives what
  `<OrigamSelectionControl>` actually declares via `filterProps`, so the
  surface stays in sync automatically as the selection control grows.
- **Styling** — the component contributes only the `origam-radio-btn`
  class; the visible surface (glyph, state layer, ripple) belongs to
  `<OrigamSelectionControl>`.

## Accessibility

The rendered control is a real `<input type="radio">` — arrow-key
roving, `Space` toggling, and the label association are the browser's
own. No ARIA role is added, deliberately.

Pass `label` (or the `label` slot) on every button: an unlabelled radio
has no accessible name.

## Related

- `OrigamRadio` — the full field (input chrome, validation, focus).
- `OrigamRadioGroup` — a set of mutually exclusive `OrigamRadio`s.
- `OrigamSelectionControl` — the shared primitive behind Radio,
  Checkbox and Switch.
