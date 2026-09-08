# OrigamDatePickerHeader

`<OrigamDatePickerHeader>` is the large title row of
[`<OrigamDatePicker>`](/components/DatePicker/OrigamDatePicker) — the formatted date, optionally
flanked by an icon or avatar on either side, with a transition between two
consecutive values.

It renders inside `<OrigamDatePicker>` automatically; you use it directly only
when overriding the picker's `header` slot.

## Basic usage

```vue
<template>
    <OrigamDatePickerHeader header="May 8, 2026" />
</template>
```

## Props

### Content

| Prop | Type | Default | Description |
|---|---|---|---|
| `header` | `string` | `undefined` | Text rendered in the content area. Ignored when the `default` slot is filled |
| `transition` | `TTransitionProps` | `undefined` | Passed straight to the `<OrigamTransition>` wrapping the content, so swapping `header` animates. `<OrigamDatePicker>` feeds it a direction-aware transition (`OrigamTranslatePicker` / `OrigamReverseTranslatePicker`) |

### Color

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | `undefined` | Foreground only (`IColorProps`) |

Consumed through `useTextColor`, applied on the **root**. Because neither
`.origam-date-picker-header` nor `__content` / `__prepend` / `__append`
declares a `color` of its own, the value inherits down to the text *and* to
the icons, which paint in `currentColor`.

A `TIntent` value resolves to that intent's own hue (`fgSubtle`) — the shade
meant for coloured text on a neutral surface, not the white-on-saturated
pair. A raw CSS colour is passed through untouched.

The header owns no surface, so `color` paints no background. Use the parent
picker's `bgColor` for that.

```vue
<origam-date-picker-header header="May 8, 2026" color="primary"/>
```

### Sizing

| Prop | Type | Default | Description |
|---|---|---|---|
| `density` | `TDensity` | `undefined` | `'compact' \| 'default' \| 'comfortable'` |

⚠️ `density` emits `origam-date-picker-header--density-{value}` on the root
but **the DS ships no rule for that class** — the row's own height and padding
come from the tokens below and do not change. What the prop does change is the
**default** prepend / append content: it is forwarded to `<OrigamAvatar>`,
which does implement the three density steps. It is also forwarded to
`<OrigamIcon>`, which does not declare `density` at all, so there it only
lands in `$attrs`. Content you supply through the `prepend` / `append` slots
never receives it.

### Icons and avatars

Each pair renders inside the matching grid area. `prepend` / `append` slot
content replaces the default render entirely.

| Prop | Type | Default | Description |
|---|---|---|---|
| `prependIcon` | `TIcon` | `undefined` | Icon rendered before the content |
| `prependAvatar` | `string` | `undefined` | Avatar image URL rendered before the content |
| `appendIcon` | `TIcon` | `undefined` | Icon rendered after the content |
| `appendAvatar` | `string` | `undefined` | Avatar image URL rendered after the content |

### Commons

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | auto | Forwarded to the root element and to the `useStyle` scope |
| `class` | `string \| string[] \| object` | `undefined` | Appended to the root class list |
| `style` | `StyleValue` | `undefined` | Appended to the root inline style |

## Emits

| Event | Payload | Description |
|---|---|---|
| `click` | `MouseEvent \| undefined` | The root row was activated. `event` is typed optional because the handler calls `emits('click')` without forwarding the original event — listeners receive `undefined` |

`<OrigamDatePicker>` listens to it and switches back to the month view when the
header is showing months or years.

`useAdjacent` additionally fires `click:prepend` and `click:append` when the
matching side area is clicked, and turns that area into a `role="button"` tab
stop as soon as a listener is attached. Those two are **not** listed in
`IDatePickerHeaderEmits`, so TypeScript will not suggest them, but
`vm.emit(…)` resolves the listener from the raw vnode props and they do fire.

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `default` | — | Replaces the header text. Its presence alone is enough to render the content area, even with no `header` |
| `prepend` | — | Replaces the default prepend avatar / icon |
| `append` | — | Replaces the default append avatar / icon |

## Behaviour notes

- **Layout.** A three-column CSS grid (`grid-template-areas: "prepend content append"`)
  with `min-content / minmax(0, 1fr) / min-content`. Content is bottom-aligned
  (`align-items: flex-end`) and the row clips overflow.
- **Accessibility.** The root only becomes interactive when a `click` listener
  is actually attached: it then takes `role="button"` and `tabindex="0"`, and
  <kbd>Enter</kbd> / <kbd>Space</kbd> fire the same `click` emit as the mouse
  (with `preventDefault`, so <kbd>Space</kbd> does not scroll). Without a
  listener it stays a plain `<div>` — no bogus button in the tab order. The
  detection reads `vm.vnode.props` as well as `$attrs`, because a *declared*
  emit never appears in `$attrs`.
- **Transitions.** The content is keyed on `header`, so each new value is a new
  vnode and `<OrigamTransition>` can animate the swap.

## Design tokens

| Token | Default | Description |
|---|---|---|
| `--origam-date-picker__header---min-height` | `70px` | Row height |
| `--origam-date-picker__header---padding-inline` | `var(--origam-space---6) var(--origam-space---3)` | Inline padding |
| `--origam-date-picker__header---padding-block` | `0 var(--origam-space---3)` | Block padding |
| `--origam-date-picker__header---font-size` | `32px` | Font size of `__content` |

## Exposed instance API

`defineExpose` publishes `filterProps`, `css`, `id`, `load`, `unload` and
`isLoaded` — the standard `useStyle` / `useProps` surface.

## Examples

### Clickable header with a trailing chevron

```vue
<template>
    <OrigamDatePickerHeader
        header="May 8, 2026"
        :append-icon="MDI_ICONS.CHEVRON_DOWN"
        @click="viewMode = 'years'"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MDI_ICONS } from '@origam/enums'

const viewMode = ref('month')
</script>
```

### Custom content through the default slot

```vue
<template>
    <OrigamDatePickerHeader>
        <strong>{{ start }}</strong> → <strong>{{ end }}</strong>
    </OrigamDatePickerHeader>
</template>
```
