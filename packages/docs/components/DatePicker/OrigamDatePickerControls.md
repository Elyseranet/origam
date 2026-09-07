# OrigamDatePickerControls

`<OrigamDatePickerControls>` is the navigation toolbar of
[`<OrigamDatePicker>`](./OrigamDatePicker.md): a month label doubling as a
button, a view-mode toggle, and the previous / next arrows. It renders that
row and nothing else — it holds no date state and performs no navigation of
its own. Every button only emits; the parent decides what the click means.

It is rendered automatically inside `<OrigamDatePicker>`; you use it directly
only when replacing the picker's `default` slot with your own layout.

## Basic usage

```vue
<template>
    <OrigamDatePickerControls
        :text="label"
        @click:prev="month--"
        @click:next="month++"
        @click:month="viewMode = 'months'"
        @click:year="viewMode = 'years'"
    />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const month = ref(new Date().getMonth())
const viewMode = ref('month')
const label = computed(() => new Date(2024, month.value).toLocaleString(undefined, { month: 'long', year: 'numeric' }))
</script>
```

## Props

### Content

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | `undefined` | Label rendered on the month button — the picker feeds it the formatted "September 2026" |

### Icons

| Prop | Type | Default | Description |
|---|---|---|---|
| `prevIcon` | `TIcon` | `MDI_ICONS.CHEVRON_LEFT` | Icon of the "previous" arrow |
| `nextIcon` | `TIcon` | `MDI_ICONS.CHEVRON_RIGHT` | Icon of the "next" arrow |
| `modeIcon` | `TIcon` | `MDI_ICONS.MENU_DOWN_OUTLINE` | Icon of the view-mode toggle sitting next to the label |

### Disabled state

Each flag is OR-ed with the global `disabled`, so `disabled` alone greys the
whole row.

| Prop | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `undefined` | Disables all four buttons |
| `disabledMonth` | `boolean` | `undefined` | Disables the month-label button |
| `disabledYear` | `boolean` | `undefined` | Disables the view-mode toggle |
| `disabledPrev` | `boolean` | `undefined` | Disables the "previous" arrow |
| `disabledNext` | `boolean` | `undefined` | Disables the "next" arrow |

### Commons

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | auto | Forwarded to the root element and to the `useStyle` scope |
| `class` | `string \| string[] \| object` | `undefined` | Appended to the root class list |
| `style` | `StyleValue` | `undefined` | Appended to the root inline style |

### Declared but inert

Both are declared so that `IDatePickerProps` can extend this interface, and
both warn once in development (`useUnsupportedProp`) when you pass them.

| Prop | Type | Why it has no effect |
|---|---|---|
| `active` | `string \| string[] \| boolean \| IActiveState` | The row mirrors the picker's view state; it has no active state of its own |
| `viewMode` | `TDateMode` | The displayed mode comes from the picker, never from this prop. The warning fires only when the value differs from the `'month'` default |

## Emits

There is no button dedicated solely to the label: clicking the label fires
`click:month`. The `MouseEvent` is typed as optional because the handlers
call `emits('click:prev')` and friends without forwarding it — in practice
listeners always receive `undefined`.

| Event | Payload | Fired by |
|---|---|---|
| `click:month` | `MouseEvent \| undefined` | The month-label button |
| `click:year` | `MouseEvent \| undefined` | The view-mode toggle |
| `click:prev` | `MouseEvent \| undefined` | The "previous" arrow |
| `click:next` | `MouseEvent \| undefined` | The "next" arrow |

## Slots

**None.** `IDatePickerControlsSlots` is deliberately empty: the template
renders a fixed toolbar with no `<slot>` anywhere. To change the layout,
replace the whole component through `<OrigamDatePicker>`'s `default` slot.

## Exposed instance API

`defineExpose` publishes `filterProps`, `css`, `id`, `load`, `unload` and
`isLoaded` — the standard `useStyle` / `useProps` surface. `<OrigamDatePicker>`
uses `filterProps` to decide which of its own props belong to this child.

## Behaviour notes

- **Rotation in year mode — currently inert.** `<OrigamDatePicker>` ships a
  `:deep` rule that rotates `.origam-date-picker-controls__mode-btn` by 180°
  under `.origam-date-picker--year`, but the root class it emits is
  `origam-date-picker--{viewMode}`, i.e. `--month` / `--months` / `--years`
  (or `--undefined` before any mode is set). `--year` singular is never
  emitted, so the chevron never flips today. The toolbar itself knows nothing
  about it either way.
- **Structure.** Label + mode toggle sit in one `<OrigamBtnGroup>`, an
  `<OrigamSpacer>` pushes the arrows to the far end, and the arrows sit in a
  second group inside `.origam-date-picker-controls__month`.
- **Accessibility.** All four controls are real `<OrigamBtn>` buttons, so they
  are focusable and operable with <kbd>Enter</kbd> / <kbd>Space</kbd> out of
  the box; the arrows are icon-only and rely on the parent picker for their
  accessible names.

## Examples

### Disabling navigation at a boundary

```vue
<template>
    <OrigamDatePickerControls
        :text="label"
        :disabled-prev="month <= 0"
        :disabled-next="month >= 11"
        @click:prev="month--"
        @click:next="month++"
    />
</template>
```

### Read-only header

```vue
<template>
    <OrigamDatePickerControls :text="label" disabled />
</template>
```
