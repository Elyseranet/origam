# OrigamExpansionPanels

`<OrigamExpansionPanels>` is the accordion container. It owns the
selection state every `<OrigamExpansionPanel>` registers into
(`useGroup` under `ORIGAM_EXPANSION_PANEL_KEY`), and it is **required**:
a panel rendered outside one throws
`[Origam] Could not find useGroup injection with symbol …` at runtime.

## Basic usage

```vue
<template>
    <origam-expansion-panels>
        <origam-expansion-panel title="Panel one" content="First body."/>
        <origam-expansion-panel title="Panel two" content="Second body."/>
    </origam-expansion-panels>
</template>
```

## Data-driven

`items` renders one `<origam-expansion-panel>` per entry, each spread
with its own props.

```vue
<script setup lang="ts">
    const items = [
        { title: 'Shipping', content: 'Delivered in 2 days.' },
        { title: 'Returns',  content: '30 days, no questions.' }
    ]
</script>

<template>
    <origam-expansion-panels :items="items"/>
</template>
```

## Selection

`modelValue` is the group's selection. With `multiple` it is an array of
values, otherwise a single value. `mandatory` keeps at least one panel
open (and opens the first non-disabled one when nothing is selected);
`max` caps how many can be open at once.

```vue
<template>
    <origam-expansion-panels v-model="open" multiple :max="2">
        <origam-expansion-panel value="a" title="A" content="…"/>
        <origam-expansion-panel value="b" title="B" content="…"/>
        <origam-expansion-panel value="c" title="C" content="…"/>
    </origam-expansion-panels>
</template>
```

## Props

### Group / selection

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `any` | `undefined` | Selected panel value(s). An array when `multiple`, a single value otherwise. |
| `multiple` | `boolean` | `undefined` | Allow several panels open at once. |
| `mandatory` | `boolean` | `undefined` | Keep at least one panel open; selects the first non-disabled item when nothing is selected, and refuses to deselect the last one. |
| `max` | `number` | `undefined` | Maximum number of simultaneously open panels (`multiple` only). |
| `disabled` | `boolean` | `undefined` | Disable every panel in the group. |
| `selectedClass` | `string` | `undefined` | Class applied to the selected panel(s). |

### Layout variants

| Prop | Type | Default | Description |
|---|---|---|---|
| `accordion` | `boolean` | `undefined` | Panels are flush against each other: no gap when a panel opens, and the inner corner radii are squared off. |
| `popout` | `boolean` | `undefined` | Panels are inset (`calc(100% - 32px)`) and the active one grows past the container (`calc(100% + 16px)`). |
| `inset` | `boolean` | `undefined` | The inverse of `popout`: panels are full width and the active one shrinks (`calc(100% - 32px)`). |
| `flat` | `boolean` | `undefined` | Drops the panel shadow (`__shadow` hidden, separator border removed) **and** suppresses the `elevation` output — `useElevation(props, flat)` returns nothing while it is on. |

`accordion`, `popout`, `inset` and `flat` are independent booleans, not a
single `variant` prop; combining them is allowed and each adds its own
`origam-expansion-panels--{name}` class.

### Forwarded to panels

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `IExpansionPanelProps[]` | `undefined` | Data-driven panel list. Each entry is spread onto its `<origam-expansion-panel>`. |
| `expandIcon` | `TIcon` | `undefined` | Collapsed indicator for every panel. |
| `collapseIcon` | `TIcon` | `undefined` | Expanded indicator for every panel. |
| `hideActions` | `boolean` | `undefined` | Hide the expand / collapse indicator on every panel. |

> ⛔ `expandIcon` / `collapseIcon` / `hideActions` reach the panels
> through the **`items` render path only** (`v-bind` on the generated
> `<origam-expansion-panel>`). They are **not** part of the
> `<OrigamDefaultsProvider>` cascade below, so panels you write by hand in
> the `default` slot do not receive them — pass them on each panel, or
> switch to `items`.

The props that DO cascade to hand-written panels — through
`<origam-defaults-provider>`, as *defaults*, so a panel setting its own
still wins — are `density`, `color`, `bgColor`, `rounded`, `border`,
`eager` and `loadingText`. Each is forwarded only when the consumer
actually passed it (`usePassedProps`), because Vue coerces the unset
value of the boolean-inclusive ones to a concrete `false` that would
otherwise erase an ancestor's or a theme's value (#263).

### Surface

| Prop | Type | Default | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Element rendered for the container. |
| `color` | `TColor` | `undefined` | Foreground colour. Also cascades to panels. |
| `bgColor` | `TColor` | `undefined` | Background colour. Also cascades to panels. |
| `elevation` | `TElevation` | `undefined` | Shadow rung. Suppressed by `flat`. Only the class channel is bound, so a free-form `box-shadow` string or the `2xl` / `3xl` rungs — which resolve through the inline-style channel — do not paint on the container. |
| `rounded` | `boolean \| number \| string \| TRounded` | `undefined` | Corner radius. Also cascades to panels. |
| `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`, `borderBlock`, `borderInline` | `boolean \| number \| string` | `undefined` | Border widths. `border` also cascades to panels. |
| `borderColor` | `string` | `undefined` | Border colour for every edge. |
| `borderStyle` | `string` | `undefined` | Border style. |
| `borderTopColor`, `borderRightColor`, `borderBottomColor`, `borderLeftColor` | `TColor` | `undefined` | Per-edge border colour. |
| `density` | `TDensity` | `undefined` | Density modifier. Also cascades to panels. |

### Spacing

| Prop | Type | Default | Description |
|---|---|---|---|
| `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `paddingBlock`, `paddingInline` | `boolean \| number \| string` | `undefined` | Padding on the container. |
| `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `marginBlock`, `marginInline` | `boolean \| number \| string` | `undefined` | Margin on the container. |

### State

| Prop | Type | Default | Description |
|---|---|---|---|
| `hover` | `boolean \| IStateEffectConfig` | `undefined` | `true` forces the hover state on; an object overrides the resting `border` / `rounded` / `padding` / `margin` while hovered. |
| `active` | `boolean \| IStateEffectConfig` | `undefined` | Same grammar, for the active state. |
| `hoverClass` | `string` | `undefined` | ⛔ **Declared but not rendered** — same gap as on `<OrigamExpansionPanelHeader>`: `useStateFlag`'s `classes` channel is not destructured here. |
| `activeClass` | `string` | `undefined` | ⛔ **Declared but not rendered** — see above. |

### Lazy & loading

| Prop | Type | Default | Description |
|---|---|---|---|
| `eager` | `boolean` | `undefined` | Cascaded to panels: mount their content immediately instead of on first expand. The container owns no content of its own. |
| `loading` | `boolean \| number \| TLoaderConfig` | `undefined` | Adds the loader class hook on the container only — the container paints **no** indicator. Put `loading` on a panel (or its content) for a visible one. |
| `loadingText` | `string` | `undefined` | Cascaded to panels, where it becomes the loading renderer's `label`. |

### Common

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | generated | DOM id of the container. |
| `class` | `string \| string[] \| object` | `undefined` | Extra classes. |
| `style` | `string \| string[] \| object \| StyleValue` | `undefined` | Extra inline styles. |

## Emits

| Event | Payload | When |
|---|---|---|
| `update:modelValue` | `any` | The group's selection changed. An array when `multiple`, a single value otherwise. |

Per-panel selection is reported by `<OrigamExpansionPanel>` itself, which
emits `group:selected` with `{ value: boolean }`.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | — | Replaces the whole generated list — write your `<origam-expansion-panel>` children here. |
| `item` | `{ collapseIcon, expandIcon, hideActions, item, index }` | Replaces the render of every entry of `items`. |
| `item.{index}` | same | Replaces the render of one entry. Checked before `item`. |
| `header` | `Partial<IExpansionPanelHeaderProps>` | Forwarded into each panel's `#header`. |
| `prepend` | `IExpansionPanelHeaderSlotProps` | Forwarded into each panel's header `#prepend`. |
| `title` | `IExpansionPanelHeaderSlotProps` | Forwarded into each panel's header `#title`. |
| `append` | `IExpansionPanelHeaderSlotProps` | Forwarded into each panel's header `#append`. |
| `wrapper` | `Partial<IExpansionPanelContentProps>` | Forwarded into each panel's `#wrapper`. |
| `content` | — | Forwarded into each panel's `#default` (the body). |

Every slot in the second half of the table also has an indexed twin —
`header.{index}`, `prepend.{index}`, `title.{index}`, `append.{index}`,
`wrapper.{index}`, `content.{index}` — checked first, with the unindexed
name as fallback. All of them apply to the **`items` render path**; a
`default` slot replaces that path entirely, so the per-panel forwards no
longer apply.

## Accessibility

- The container itself carries no ARIA role. The header / content pair of
  each panel wires `aria-expanded` / `aria-controls` / `aria-labelledby`
  between themselves through the shared panel context.
- Keyboard activation comes from each header being a real `<button>`;
  there is no roving-tabindex arrow-key navigation between panels.

## Design tokens

The container reads no `--origam-expansion-panels---*` variable of its
own beyond the radius rungs its `rounded` classes set. The layout
variants read the panel-scoped ones:

| CSS variable | Default |
|---|---|
| `--origam-expansion-panel__popout---max-width` | `calc(100% - 32px)` |
| `--origam-expansion-panel__popout---max-width-active` | `calc(100% + 16px)` |
| `--origam-expansion-panel__inset---max-width` | `100%` |
| `--origam-expansion-panel__inset---max-width-active` | `calc(100% - 32px)` |
| `--origam-expansion-panel__accordion---header-overlay-transition` | `0.3s` |
| `--origam-expansion-panel---transition-timing-function` | `cubic-bezier(0.4, 0, 0.2, 1)` |

## Examples

### Accordion, one panel at a time, always one open

```vue
<template>
    <origam-expansion-panels accordion mandatory>
        <origam-expansion-panel title="Step 1" content="…"/>
        <origam-expansion-panel title="Step 2" content="…"/>
    </origam-expansion-panels>
</template>
```

### Shared icons via the data path

```vue
<template>
    <origam-expansion-panels
            :items="items"
            expand-icon="mdi:mdi-plus"
            collapse-icon="mdi:mdi-minus"
    />
</template>
```

### Per-index title override

```vue
<template>
    <origam-expansion-panels :items="items">
        <template #title.0="{ expanded }">
            <strong>{{ expanded ? 'Close' : 'Open' }} the first one</strong>
        </template>
    </origam-expansion-panels>
</template>
```

## Related

- `OrigamExpansionPanel` — one collapsible panel.
- `OrigamExpansionPanelHeader` — its toggling header.
- `OrigamExpansionPanelContent` — its collapsible body.
