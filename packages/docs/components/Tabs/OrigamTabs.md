# OrigamTabs

`<OrigamTabs>` is a fully-accessible tablist with optional content panels.
It is composed of four siblings:

| Component           | Role                                                        |
|---------------------|-------------------------------------------------------------|
| `<OrigamTabs>`      | The tablist container. Owns the selection state via `useGroup`. |
| `<OrigamTab>`       | A single tab. Registers itself via `useGroupItem`. ARIA `role="tab"`. |
| `<OrigamTabPanels>` | The content area. Mirrors the same `v-model` as the tablist. |
| `<OrigamTabPanel>`  | A single content panel. ARIA `role="tabpanel"`.             |

The two halves bind to the same `v-model` value — the tablist drives the
selection, the panels render the matching content.

## Basic usage

```vue
<template>
    <OrigamTabs v-model="active">
        <OrigamTab :value="0">Profile</OrigamTab>
        <OrigamTab :value="1">Settings</OrigamTab>
        <OrigamTab :value="2">Billing</OrigamTab>
    </OrigamTabs>

    <OrigamTabPanels v-model="active">
        <OrigamTabPanel :value="0">Profile content.</OrigamTabPanel>
        <OrigamTabPanel :value="1">Settings content.</OrigamTabPanel>
        <OrigamTabPanel :value="2">Billing content.</OrigamTabPanel>
    </OrigamTabPanels>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    const active = ref<number>(0)
</script>
```

## Variants

The visual treatment is controlled by the `variant` prop on `<OrigamTabs>`.

```vue
<OrigamTabs v-model="active" variant="default" />
<OrigamTabs v-model="active" variant="pills" />
<OrigamTabs v-model="active" variant="underline" />
```

| Value     | Description                                            |
|-----------|--------------------------------------------------------|
| `default` | Plain row of buttons, separated by a subtle divider.   |
| `pills`   | Each tab is a rounded pill — active tab fills with the primary intent. |
| `underline` | Active tab gets a horizontal indicator bar.          |

## Vertical orientation

Switch to a vertical column with `direction="vertical"`. The indicator
on `variant="underline"` moves to the trailing edge. ARIA
`aria-orientation` follows the prop.

```vue
<OrigamTabs v-model="active" direction="vertical" variant="underline">
    <OrigamTab :value="0">Inbox</OrigamTab>
    <OrigamTab :value="1">Sent</OrigamTab>
    <OrigamTab :value="2">Drafts</OrigamTab>
</OrigamTabs>
```

## Lazy panels

By default, panel content is **mounted on first activation** and kept
alive afterwards (`v-show`). Set `eager` on a specific panel to force
it to mount from the start — useful when the panel must populate a
form ref or trigger a fetch before being shown.

```vue
<OrigamTabPanels v-model="active">
    <OrigamTabPanel :value="0" eager>Always mounted</OrigamTabPanel>
    <OrigamTabPanel :value="1">Lazy mounted</OrigamTabPanel>
</OrigamTabPanels>
```

## Swipeable panels

On touch devices, enable horizontal swipe between panels with
`swipeable`. Left swipe selects the next tab, right swipe the previous.

```vue
<OrigamTabPanels v-model="active" swipeable>
    <OrigamTabPanel :value="0">…</OrigamTabPanel>
    <OrigamTabPanel :value="1">…</OrigamTabPanel>
</OrigamTabPanels>
```

## Props

### `<OrigamTabs>`

| Prop          | Type                       | Default        | Description                            |
|---------------|----------------------------|----------------|----------------------------------------|
| `modelValue`  | `number \| string`         | —              | Active tab value (two-way bound).     |
| `variant`     | `'default' \| 'pills' \| 'underline'` | `'default'` | Visual treatment.                |
| `direction`   | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout axis + ARIA orientation. |
| `density`     | `'default' \| 'compact' \| 'comfortable'` | `'default'` | Vertical compression. |
| `fixed`       | `boolean`                  | `false`        | Each tab gets `flex: 1` — equal width. |
| `centered`    | `boolean`                  | `false`        | Centers the tablist in its container. |
| `mandatory`   | `boolean`                  | `true`         | Forbids the empty selection (ARIA-recommended). |
| `disabled`    | `boolean`                  | `false`        | Disables the entire tablist.          |
| `color`       | `TIntent`                  | —              | Foreground intent.                    |
| `bgColor`     | `TIntent`                  | —              | Background intent.                    |

### `<OrigamTab>`

| Prop          | Type            | Default | Description                              |
|---------------|-----------------|---------|------------------------------------------|
| `value`       | `number \| string` | —    | Required. Identifier matched by the panel. |
| `disabled`    | `boolean`       | `false` | Disables this tab (skipped by keyboard). |
| `icon`        | `TIcon`         | —       | Leading icon.                            |
| `appendIcon`  | `TIcon`         | —       | Trailing icon (badge, close, …).         |
| `fontSize`    | `TFontSize`     | —       | Font size token override (`xs` · `sm` · `md` · `lg` · `xl` · …). Maps to `--origam-tabs__item---font-size`. |
| `fontWeight`  | `TFontWeight`   | —       | Font weight token override (`regular` · `medium` · `semibold` · `bold` · …). Maps to `--origam-tabs__item---font-weight`. |
| `letterSpacing` | `TLetterSpacing` | —   | Letter-spacing token override (`tight` · `normal` · `wide` · `wider` · `widest`). Maps to `--origam-tabs__item---letter-spacing`. |

### `<OrigamTabPanels>`

| Prop         | Type            | Default | Description                                   |
|--------------|-----------------|---------|-----------------------------------------------|
| `modelValue` | `number \| string` | — | Active panel — same value as `<OrigamTabs>`.  |
| `transition` | `string \| false` | `'fade'` | Transition name. `false` disables.        |
| `swipeable`  | `boolean`       | `false` | Allow horizontal touch swipe between panels. |

### `<OrigamTabPanel>`

| Prop         | Type            | Default | Description                                   |
|--------------|-----------------|---------|-----------------------------------------------|
| `value`      | `number \| string` | — | Required. Must match a sibling `<OrigamTab>`. |
| `eager`      | `boolean`       | `false` | Mount the panel content from the start instead of on first activation. |

## Events

| Component         | Event              | Payload          |
|-------------------|--------------------|------------------|
| `<OrigamTabs>`    | `update:modelValue` | new active value |
| `<OrigamTabPanels>` | `update:modelValue` | new active value |

## Slots

| Component         | Slot      | Scope                          | Description |
|-------------------|-----------|--------------------------------|-------------|
| `<OrigamTabs>`    | `default` | `{ isSelected, select, next, prev, selected, items }` | Children — usually `<OrigamTab>` instances. |
| `<OrigamTab>`     | `default` | `{ isSelected, toggle, select, value, disabled }` | Tab label. Falls back to the `text` prop. |
| `<OrigamTabPanels>` | `default` | `{ isSelected, select, next, prev, selected, items }` | Children — usually `<OrigamTabPanel>` instances. |
| `<OrigamTabPanel>`| `default` | —                              | Panel content. |

## Accessibility

`<OrigamTabs>` applies the ARIA tablist pattern out of the box:

- `<OrigamTabs>` carries `role="tablist"` and `aria-orientation` matching
  `direction`.
- Each `<OrigamTab>` carries `role="tab"`, `aria-selected`, `aria-controls`
  (pointing to the matching panel), `aria-disabled`, and a managed
  `tabindex` so only the active tab participates in tab focus.
- Each `<OrigamTabPanel>` carries `role="tabpanel"`, `aria-labelledby`
  (pointing to the controlling tab), and `tabindex="0"` so the content
  is focusable for AT users.

Keyboard navigation (focus inside the tablist):

| Key                        | Action                                |
|----------------------------|---------------------------------------|
| `←` / `→` (horizontal)     | Select previous / next tab.           |
| `↑` / `↓` (vertical)       | Select previous / next tab.           |
| `Home` / `End`             | Jump to first / last tab.             |
| `Enter` / `Space`          | Activate the currently focused tab.   |

Disabled tabs are skipped by arrow navigation and cannot be focused
via `Home` / `End`.

## Imperative API

`<OrigamTabs>` exposes navigation helpers through `defineExpose`:

| Method              | Effect                                           |
|---------------------|--------------------------------------------------|
| `next()`            | Move selection to the next non-disabled tab.     |
| `prev()`            | Move selection to the previous non-disabled tab. |
| `select(id, value)` | Toggle a specific tab by internal id.            |
| `filterProps()`     | Mixin pass-through.                              |

```vue
<template>
    <OrigamTabs ref="tabsRef" v-model="active">…</OrigamTabs>
    <OrigamBtn text="Next" @click="tabsRef?.next()" />
</template>
```
