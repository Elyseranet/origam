# OrigamExpansionPanelHeader

`<OrigamExpansionPanelHeader>` is the clickable row that toggles a single
`<OrigamExpansionPanel>`. It renders a `<button>` by default, carrying the
title, an optional prepend / append area, and the expand / collapse
indicator.

> **Runtime requirement** — the component `inject`s the panel context
> published under `ORIGAM_EXPANSION_PANEL_KEY` by
> `<OrigamExpansionPanel>`. Rendered outside one it throws at setup. You
> rarely mount it yourself: `<OrigamExpansionPanel>` already renders one
> and forwards the header-shaped half of its own props — every prop and
> slot below is therefore also reachable directly on
> `<OrigamExpansionPanel>` and `<OrigamExpansionPanels>`.

## Basic usage

```vue
<template>
    <origam-expansion-panels>
        <origam-expansion-panel>
            <origam-expansion-panel-header title="Shipping"/>
            <origam-expansion-panel-content content="Delivered in 2 days."/>
        </origam-expansion-panel>
    </origam-expansion-panels>
</template>
```

## Props

### Content & indicator

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `undefined` | Header label. The title `<span>` is only rendered when a `title` slot, a `default` slot, or this prop is present. |
| `expandIcon` | `TIcon` | `mdi:mdi-chevron-down` | Indicator shown while the panel is collapsed. |
| `collapseIcon` | `TIcon` | `mdi:mdi-chevron-up` | Indicator shown while the panel is expanded. |
| `hideActions` | `boolean` | `undefined` | Drop the expand / collapse indicator. The append area is then only rendered when it has other content. |
| `prependIcon` | `TIcon` | `undefined` | Leading icon, before the title. |
| `prependAvatar` | `string` | `undefined` | Leading avatar image, before the title. |
| `appendIcon` | `TIcon` | `undefined` | Trailing icon, before the indicator. |
| `appendAvatar` | `string` | `undefined` | Trailing avatar image, before the indicator. |

### Behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `tag` | `string` | `'button'` | Element rendered for the header row. It also carries `type="button"`. |
| `readonly` | `boolean` | `undefined` | Clicking no longer toggles the panel. The header stays focusable and keeps its `aria-expanded`; only `expansionPanel.toggle()` is skipped. |
| `static` | `boolean` | `undefined` | Adds `origam-expansion-panel-header--static`, which opts the header out of the height growth an active panel normally applies (`--origam-expansion-panel__header---min-height-active`, `64px`). The header keeps its collapsed `min-height`. |
| `focusable` | `boolean` | `undefined` | Adds `origam-expansion-panel-header--focusable`, which keeps the focus overlay painted while the panel is active instead of only on `:focus` / `:focus-visible`. |
| `ripple` | `boolean \| { class: string }` | `undefined` | Value forwarded to the `v-ripple` directive. |

`disabled` is **not** a prop of this component: it is read from the panel
context (`expansionPanel.disabled`), which comes from the panel's own
`disabled` / the group's. It drives the `disabled` attribute and
`tabindex="-1"`.

### State

| Prop | Type | Default | Description |
|---|---|---|---|
| `hover` | `boolean \| IStateEffectConfig` | `undefined` | `true` forces the hover state on; an object overrides the resting `border` / `rounded` / `padding` / `margin` while hovered. |
| `active` | `boolean \| IStateEffectConfig` | `undefined` | Same grammar as `hover`, for the active state. |
| `hoverClass` | `string` | `undefined` | ⛔ **Declared but not rendered.** See the note below. |
| `activeClass` | `string` | `undefined` | ⛔ **Declared but not rendered.** See the note below. |

> The header's own `origam-expansion-panel-header--active` class is driven
> by the panel's selection state, not by these props.

> ⛔ **`hoverClass` / `activeClass` currently have no effect on this
> component.** They are resolved by `useStateFlag`, which returns them on
> its `classes` channel — and the header destructures only `isOn` and
> `config`, so that channel is dropped before it reaches the class list.
> `hover` / `active` themselves DO work: they feed `useStateEffect`, whose
> border / rounded / padding / margin output is bound. The same gap exists
> on `<OrigamExpansionPanels>`.

### Surface

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | `undefined` | Foreground colour. |
| `bgColor` | `TColor` | `undefined` | Background colour. |
| `rounded` | `boolean \| number \| string \| TRounded` | `undefined` | Corner radius. |
| `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`, `borderBlock`, `borderInline` | `boolean \| number \| string` | `undefined` | Border widths, per edge or per axis. |
| `borderColor` | `string` | `undefined` | Border colour for every edge. |
| `borderStyle` | `string` | `undefined` | Border style. |
| `borderTopColor`, `borderRightColor`, `borderBottomColor`, `borderLeftColor` | `TColor` | `undefined` | Per-edge border colour. |
| `density` | `TDensity` | `undefined` | Density modifier. Also forwarded to the prepend / append `<origam-avatar>` and `<origam-icon>`. |

### Spacing

| Prop | Type | Default | Description |
|---|---|---|---|
| `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `paddingBlock`, `paddingInline` | `boolean \| number \| string` | `undefined` | Padding on the header row. |
| `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `marginBlock`, `marginInline` | `boolean \| number \| string` | `undefined` | Margin on the header row. |

### Typography

Only two of the five `ITypographyProps` members are declared here — the
header picks them with `Pick<ITypographyProps, 'fontSize' \| 'lineHeight'>`.
Each overrides the matching `--origam-expansion-panel__header---*` CSS
variable with a primitive design token.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `fontSize` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl'` | `undefined` | Overrides `--origam-expansion-panel__header---font-size`. Default is `0.9375rem`. |
| `lineHeight` | `'none' \| 'tight' \| 'snug' \| 'normal' \| 'relaxed' \| 'loose'` | `undefined` | Overrides `--origam-expansion-panel__header---line-height`. Default is `1`. |

### Common

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | generated | DOM id of the header. Published to the sibling content region so its `aria-labelledby` points at the real id (#519, #520). Falls back to `expansion-panel-header-{panelId}`. |
| `class` | `string \| string[] \| object` | `undefined` | Extra classes on the header row. |
| `style` | `string \| string[] \| object \| StyleValue` | `undefined` | Extra inline styles. |

## Emits

| Event | Payload | When |
|---|---|---|
| `click:prepend` | `MouseEvent` | The prepend area is clicked. The area only exists when `prependIcon`, `prependAvatar` or a `#prepend` slot is present. |
| `click:append` | `MouseEvent` | Same, for the append area (which also exists whenever the indicator is shown). |

Both areas are keyboard-reachable **only when a listener is actually
bound**: `useAdjacent` gives them `role="button"` + `tabindex="0"` and
relays `Enter` / `Space` through a `keydown` handler in that case, and
leaves a purely decorative icon inert — no spurious tab stop (#443).

Toggling the panel is **not** an emit: the click handler calls
`expansionPanel.toggle()` on the injected context. Listen to
`group:selected` on `<OrigamExpansionPanel>` (or `update:modelValue` on
`<OrigamExpansionPanels>`) for selection changes.

## Slots

Every slot receives the same scope, `IExpansionPanelHeaderSlotProps`:
`{ collapseIcon, disabled, expanded, expandIcon, readonly }`.

| Slot | Description |
|---|---|
| `title` | Overrides the title area. |
| `default` | Legacy override for the title area — kept for direct consumers of `OrigamExpansionPanelHeader` that predate the `title` slot. Prefer `title`; it's the name `OrigamExpansionPanel` and `OrigamExpansionPanels` forward into when a consumer passes their own `#title`. |
| `prepend` | Leading icon / avatar area, before the title. Replaces the `prependIcon` / `prependAvatar` render. |
| `append` | Trailing area, before the expand / collapse indicator. Replacing it also replaces the indicator, since the indicator is part of this slot's fallback. |

`hasTitle` mounts the title `<span>` when any of the `title` slot, the
`default` slot, or the `title` prop is present — so a consumer relying
purely on `#title` (no `title` prop) renders correctly, matching what
`OrigamExpansionPanel`'s own `#title` slot has always forwarded here.

## Accessibility

- Renders a real `<button type="button">` by default, so keyboard
  activation, focus and disabled semantics come from the platform.
- `aria-expanded` mirrors the panel's selection state;
  `aria-controls` points at the sibling content region's **resolved** id,
  read from the shared panel context rather than guessed.
- While the panel is disabled the header gets the `disabled` attribute
  and `tabindex="-1"`.
- The `v-contrast` directive is applied so the foreground stays legible
  against a custom `bgColor`.
- The prepend / append areas only receive `role="button"` and
  `tabindex="0"` when a click listener is actually bound — no phantom tab
  stop on a decorative icon.

## Design tokens

| CSS variable | Default |
|---|---|
| `--origam-expansion-panel__header---font-size` | `0.9375rem` |
| `--origam-expansion-panel__header---line-height` | `1` |
| `--origam-expansion-panel__header---min-height` | `48px` |
| `--origam-expansion-panel__header---min-height-active` | `64px` (skipped when `static`) |
| `--origam-expansion-panel__header---width` | `100%` |
| `--origam-expansion-panel__header---border` | `none` |
| `--origam-expansion-panel__header---outline` | `none` |
| `--origam-expansion-panel__header---border-radius` | `inherit` |
| `--origam-expansion-panel__header---focus-overlay-opacity` | `calc(0.12 * 1)` |
| `--origam-expansion-panel__header__wrapper---padding-block` | `16px` |
| `--origam-expansion-panel__header__wrapper---padding-inline` | `24px` |
| `--origam-expansion-panel__header__wrapper---display` | `flex` |
| `--origam-expansion-panel__header__wrapper---align-items` | `center` |
| `--origam-expansion-panel__header__wrapper---justify-content` | `space-between` |
| `--origam-expansion-panel__header__wrapper---transition-duration` | `0.3s` |
| `--origam-expansion-panel__header__wrapper---transition-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--origam-expansion-panel__header__overlay---position` | `absolute` |
| `--origam-expansion-panel__header__overlay---top` / `---left` | `0` |
| `--origam-expansion-panel__header__overlay---width` / `---height` | `100%` |
| `--origam-expansion-panel__header__overlay---border-radius` | `inherit` |
| `--origam-expansion-panel__header__overlay---opacity` | `0` |
| `--origam-expansion-panel__header__prepend---margin-inline-end` | `8px` |
| `--origam-expansion-panel__header__prepend---margin-block` | `-4px` |
| `--origam-expansion-panel__header__append---margin-inline-start` | `auto` |
| `--origam-expansion-panel__header__append---margin-block` | `-4px` |

## Examples

### Custom indicator icons

```vue
<template>
    <origam-expansion-panel-header
            title="Advanced"
            expand-icon="mdi:mdi-plus"
            collapse-icon="mdi:mdi-minus"
    />
</template>
```

### Read-only header with a leading icon

```vue
<template>
    <origam-expansion-panel-header
            title="Locked section"
            prepend-icon="mdi:mdi-lock"
            readonly
            hide-actions
    />
</template>
```

### Title slot with the expanded state

```vue
<template>
    <origam-expansion-panel-header>
        <template #title="{ expanded }">
            <strong>{{ expanded ? 'Hide' : 'Show' }} details</strong>
        </template>
    </origam-expansion-panel-header>
</template>
```

## Related

- `OrigamExpansionPanel` — the panel that owns this header.
- `OrigamExpansionPanelContent` — the collapsible region it controls.
- `OrigamExpansionPanels` — the accordion container.
