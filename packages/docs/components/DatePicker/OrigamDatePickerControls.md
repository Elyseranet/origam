# OrigamDatePickerControls

`<OrigamDatePickerControls>` is the navigation toolbar of
[`<OrigamDatePicker>`](/components/DatePicker/OrigamDatePicker): a month button and a year
button (each with a chevron that flips while its grid is open), and the previous / next arrows. It renders that
row and nothing else — it holds no date state and performs no navigation of
its own. Every button only emits; the parent decides what the click means.

It is rendered automatically inside `<OrigamDatePicker>`; you use it directly
only when replacing the picker's `default` slot with your own layout.

## Basic usage

```vue
<template>
    <OrigamDatePickerControls
        :text="monthLabel"
        :year-text="yearLabel"
        :view-mode="viewMode"
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
const monthLabel = computed(() => new Date(2024, month.value).toLocaleString(undefined, { month: 'long' }))
const yearLabel = '2024'
</script>
```

## Props

### Content

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | `undefined` | Label of the month button (opens the months grid) — the picker feeds it the formatted month name, e.g. "September" |
| `yearText` | `string` | `undefined` | Label of the year button (opens the years grid) — the picker feeds it the formatted year, e.g. "2026" |

### State

| Prop | Type | Default | Description |
|---|---|---|---|
| `viewMode` | `TDateMode` | `'month'` | Grid currently open (`'month'` = day grid, `'months'`, `'years'`). Sets `aria-expanded` on the matching button and flips its chevron |

### Icons

| Prop | Type | Default | Description |
|---|---|---|---|
| `prevIcon` | `TIcon` | `MDI_ICONS.CHEVRON_LEFT` | Icon of the "previous" arrow |
| `nextIcon` | `TIcon` | `MDI_ICONS.CHEVRON_RIGHT` | Icon of the "next" arrow |
| `modeIcon` | `TIcon` | `MDI_ICONS.MENU_DOWN_OUTLINE` | Chevron icon shown on both the month and the year button |

### Disabled state

Each flag is OR-ed with the global `disabled`, so `disabled` alone greys the
whole row.

| Prop | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `undefined` | Disables all four buttons |
| `disabledMonth` | `boolean` | `undefined` | Disables the month button |
| `disabledYear` | `boolean` | `undefined` | Disables the year button |
| `disabledPrev` | `boolean` | `undefined` | Disables the "previous" arrow |
| `disabledNext` | `boolean` | `undefined` | Disables the "next" arrow |

### Commons

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | auto | Forwarded to the root element and to the `useStyle` scope |
| `class` | `string \| string[] \| object` | `undefined` | Appended to the root class list |
| `style` | `StyleValue` | `undefined` | Appended to the root inline style |

### Declared but inert

Declared so that `IDatePickerProps` can extend this interface; warns once in
development (`useUnsupportedProp`) when you pass it.

| Prop | Type | Why it has no effect |
|---|---|---|
| `active` | `string \| string[] \| boolean \| IActiveState` | The row mirrors the picker's view state; it has no active state of its own |

## Emits

The `MouseEvent` is typed as optional because the handlers
call `emits('click:prev')` and friends without forwarding it — in practice
listeners always receive `undefined`.

| Event | Payload | Fired by |
|---|---|---|
| `click:month` | `MouseEvent \| undefined` | The month button |
| `click:year` | `MouseEvent \| undefined` | The year button |
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

- **Chevron rotation.** The chevron of the button whose grid is open
  (`viewMode` `months` / `years`) pivots 180° (`__month-btn--open` /
  `__year-btn--open`); the transition is disabled under
  `prefers-reduced-motion: reduce`.
- **Structure.** Month button + year button sit in one `<OrigamBtnGroup>`, an
  `<OrigamSpacer>` pushes the arrows to the far end, and the arrows sit in a
  second group inside `.origam-date-picker-controls__month`.
- **Accessibility.** All four controls are real `<OrigamBtn>` buttons, so they
  are focusable and operable with <kbd>Enter</kbd> / <kbd>Space</kbd> out of
  the box. The month and year buttons carry an explicit `aria-label`
  ("Choose the month, currently June") and `aria-expanded` reflecting their
  grid; the arrows are icon-only with their own `aria-label`.

## Examples

### Disabling navigation at a boundary

```vue
<template>
    <OrigamDatePickerControls
        :text="monthLabel"
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
    <OrigamDatePickerControls :text="monthLabel" disabled />
</template>
```
