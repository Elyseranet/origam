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
| `color`       | `TIntent`                  | —              | Forwarded as a default to every child `<OrigamTab>`; does **not** paint the tablist itself. |
| `bgColor`     | `TIntent \| string`        | —              | Paints the tablist surface. An intent resolves to `--origam-color__{base}---bg` and auto-pairs its contrast foreground; a raw CSS colour is emitted verbatim. |
| `rounded`     | `TRounded`                 | —              | Corner-radius rung (`IRoundedProps`).  |
| `tag`         | `string`                   | `'div'`        | Element rendered as the tablist root.  |
| `multiple`    | `boolean`                  | `false`        | Inherited from `IGroupProps` — allows several tabs to be selected at once. |
| `max`         | `number`                   | —              | Inherited from `IGroupProps` — caps the number of simultaneous selections when `multiple`. |
| `selectedClass` | `string`                 | `'origam-tab--active'` | Class applied to the selected `<OrigamTab>`. |

### `<OrigamTab>`

| Prop          | Type            | Default | Description                              |
|---------------|-----------------|---------|------------------------------------------|
| `value`       | `number \| string` | —    | Required. Identifier matched by the panel. |
| `disabled`    | `boolean`       | `false` | Disables this tab (skipped by keyboard). |
| `selectedClass` | `string`      | —       | Inherited from `IGroupItemProps` — per-tab override of the parent's `selectedClass`. |
| `text`        | `string`        | `''`    | Text label, used when the `default` slot is not provided. |
| `variant`     | `'default' \| 'pills' \| 'underline'` | — | Visual treatment, normally mirrored down from the parent `<OrigamTabs>`. |
| `tag`         | `string`        | `'button'` | Element rendered as the tab root. |
| `prependIcon` | `TIcon`         | —       | Leading icon (`IAdjacentProps` — the same contract as `OrigamBtn` / `OrigamChip` / `OrigamListItem`). |
| `appendIcon`  | `TIcon`         | —       | Trailing icon (badge, close, …).         |
| `prependAvatar` | `string`      | —       | Leading avatar image, rendered by `<OrigamAvatar>` in the prepend slot. |
| `appendAvatar`  | `string`      | —       | Trailing avatar image, rendered by `<OrigamAvatar>` in the append slot. |
| `icon`        | `TIcon`         | —       | **Deprecated** — use `prependIcon`. Same leading-icon position, kept for backward compatibility; **ignored when `prependIcon` is set** (`resolvedPrependIcon = prependIcon ?? icon`). |
| `fontSize`    | `TFontSize`     | —       | Font size token override (`xs` · `sm` · `md` · `lg` · `xl` · …). Maps to `--origam-tabs__item---font-size`. |
| `fontWeight`  | `TFontWeight`   | —       | Font weight token override (`regular` · `medium` · `semibold` · `bold` · …). Maps to `--origam-tabs__item---font-weight`. |
| `letterSpacing` | `TLetterSpacing` | —   | Letter-spacing token override (`tight` · `normal` · `wide` · `wider` · `widest`). Maps to `--origam-tabs__item---letter-spacing`. |

`lineHeight` is deliberately **not** part of the surface: the tab SCSS
hard-codes `line-height: 1` with no CSS-variable hook, so the prop would have
had nothing to write to.

### `<OrigamTabPanels>`

| Prop         | Type            | Default | Description                                   |
|--------------|-----------------|---------|-----------------------------------------------|
| `modelValue` | `number \| string` | — | Active panel — same value as `<OrigamTabs>`.  |
| `transition` | `string \| false` | `'fade'` | Transition name. `false` disables.        |
| `swipeable`  | `boolean`       | `false` | Allow horizontal touch swipe between panels. |
| `direction`  | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout axis, inherited from `IDirectionProps`. |
| `tag`        | `string`        | `'div'` | Element rendered as the panels container root. |
| `mandatory`  | `boolean`       | `true`  | Inherited from `IGroupProps` — forbids the empty selection. |
| `selectedClass` | `string`     | `'origam-tab-panel--active'` | Class applied to the active `<OrigamTabPanel>`. |

### `<OrigamTabPanel>`

| Prop         | Type            | Default | Description                                   |
|--------------|-----------------|---------|-----------------------------------------------|
| `value`      | `number \| string` | — | Required. Must match a sibling `<OrigamTab>`. |
| `eager`      | `boolean`       | `false` | Mount the panel content from the start instead of on first activation. |
| `disabled`   | `boolean`       | `false` | Inherited from `IGroupItemProps` — excludes the panel from group selection. |
| `selectedClass` | `string`     | —       | Inherited from `IGroupItemProps` — class applied while this panel is the selected one. |
| `tag`        | `string`        | `'div'` | Element rendered as the panel root. |

## Events

| Component         | Event              | Payload          |
|-------------------|--------------------|------------------|
| `<OrigamTabs>`    | `update:modelValue` | new active value |
| `<OrigamTabPanels>` | `update:modelValue` | new active value |
| `<OrigamTab>`     | `group:selected`   | `{ value: boolean }` — `true` when this tab becomes the selected one, `false` when it stops being it |
| `<OrigamTabPanel>`| `group:selected`   | `{ value: boolean }` — same contract, on the panel side |

`group:selected` is not optional chrome: both `<OrigamTab>` and
`<OrigamTabPanel>` self-register through `useGroupItem`, which `watch`es
`isSelected` and calls `vm.emit('group:selected', { value })` on the
registering component's own instance. It fires on **every** selection change,
whether or not a handler is bound — it is the per-item counterpart of the
container's `update:modelValue`, and the only way to react to selection on the
item itself rather than on the tablist.

```vue
<template>
    <OrigamTabs v-model="tab">
        <OrigamTab value="one" text="One" @group:selected="onTabSelected" />
        <OrigamTab value="two" text="Two" @group:selected="onTabSelected" />
    </OrigamTabs>
</template>

<script setup lang="ts">
    function onTabSelected (payload: { value: boolean }) {
        // payload.value === true  → this tab just became active
        // payload.value === false → this tab just lost the selection
    }
</script>
```

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
