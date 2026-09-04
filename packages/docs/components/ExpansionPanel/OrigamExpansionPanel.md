# OrigamExpansionPanel

`<OrigamExpansionPanel>` is a single collapsible panel — a header row that
toggles a content region below it. It must be used as a child of
`OrigamExpansionPanels`, which registers the accordion/group context every
panel needs (selection state, `multiple`, `mandatory`, `max`).

> **Runtime requirement** — `OrigamExpansionPanel` calls `useGroupItem`
> against the group injected by `OrigamExpansionPanels`
> (`packages/ds/src/components/ExpansionPanel/OrigamExpansionPanel.vue`,
> `ORIGAM_EXPANSION_PANEL_KEY`). Rendering it outside an `OrigamExpansionPanels`
> ancestor throws `[Origam] Could not find useGroup injection with symbol …`
> at runtime — this isn't an optional wrapper, it's required.

## Basic usage

```vue
<template>
    <origam-expansion-panels>
        <origam-expansion-panel title="Panel one" content="First panel body." />
        <origam-expansion-panel title="Panel two" content="Second panel body." />
    </origam-expansion-panels>
</template>
```

## Header — title, prepend/append icons

`title` and `content` are shorthand props; for full control override the
header entirely or just the pieces you need. `expandIcon` / `collapseIcon`
(default: chevron-down / chevron-up) swap the trailing indicator, and
`hideActions` removes it. Every header prop and slot documented on
`OrigamExpansionPanelHeader` is available
directly on `OrigamExpansionPanel` (its props interface extends the header's).

```vue
<template>
    <origam-expansion-panels>
        <origam-expansion-panel
            title="With icons"
            content="Panel body."
            prepend-icon="mdi-folder"
            append-icon="mdi-star"
        />
    </origam-expansion-panels>
</template>
```

```vue
<template>
    <origam-expansion-panels>
        <origam-expansion-panel content="Panel body.">
            <template #title>
                <strong>Custom title</strong>
            </template>
        </origam-expansion-panel>
    </origam-expansion-panels>
</template>
```

## Content

`content` accepts a string or a component; for rich/slotted markup use the
default slot instead — every prop and slot documented on
`OrigamExpansionPanelContent` is likewise
forwarded from `OrigamExpansionPanel` (its props interface extends the
content's).

```vue
<template>
    <origam-expansion-panels>
        <origam-expansion-panel title="Rich content">
            <p>This content was inserted via the default slot.</p>
            <p>It supports arbitrary markup.</p>
        </origam-expansion-panel>
    </origam-expansion-panels>
</template>
```

By default the content is **lazy**: it doesn't mount until the panel is
opened for the first time, and unmounts again after the closing transition
ends (`useLazy`). Pass `eager` to keep it mounted (and hidden) at all times.

## Loading state

`loading` accepts a boolean, a 0–100 progress number, or an explicit
`{ type: 'line' | 'circular' | 'skeleton', … }` config, rendered above the
header (`line` / `circular`) or as three skeleton lines inside the content
(`skeleton`) — same contract as every other `ILoaderProps` component in the
design system.

```vue
<template>
    <origam-expansion-panels>
        <origam-expansion-panel :loading="true" title="Loading…" content="…" />
        <origam-expansion-panel :loading="42" title="42 % loaded" content="…" />
        <origam-expansion-panel :loading="{ type: 'skeleton' }" title="Skeleton" content="…" />
    </origam-expansion-panels>
</template>
```

## Disabled / readonly

`disabled` (or the parent's `disabled`) blocks interaction entirely and
dims the header. `readonly` keeps the panel visually interactive but
prevents the click handler from toggling it open/closed.

```vue
<template>
    <origam-expansion-panels>
        <origam-expansion-panel disabled title="Cannot open" content="…" />
        <origam-expansion-panel readonly title="Cannot toggle by click" content="…" />
    </origam-expansion-panels>
</template>
```

## Hover / active

`hover` and `active` follow the shared three-shape grammar (`undefined` =
reactive to pointer/click, `true` = forced on, or an object overriding
`color` / `bgColor` / `border` / `rounded` / `elevation` / `padding` /
`margin` while the state is engaged) — see `IHoverProps` / `IActiveProps`.

## Density / color / shape

`density` (`TDensity`), `color` / `bgColor` (`TColor`), `elevation`
(`TElevation`), `rounded` (+ per-corner variants), `border` (+ per-side
variants and `borderColor` / `borderStyle`) and `padding` / `margin` (+
per-side variants) follow the standard cross-cutting composables. When set
on the parent `OrigamExpansionPanels`, `density`, `color`, `bgColor`,
`rounded` and `border` cascade to every panel as **defaults** — a panel's
own prop still wins.

```vue
<template>
    <origam-expansion-panels density="compact" color="primary">
        <origam-expansion-panel title="Inherits compact + primary" content="…" />
        <origam-expansion-panel title="Overrides bg-color" bg-color="danger" content="…" />
    </origam-expansion-panels>
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Root HTML element |
| `title` | `string` | — | Header title text (also available as the `#title` slot) |
| `content` | `string \| Component` | — | Content body (also available as the default slot) |
| `expandIcon` | `TIcon` | `MDI_ICONS.CHEVRON_DOWN` (`'mdi:mdi-chevron-down'`) | Trailing icon shown when collapsed |
| `collapseIcon` | `TIcon` | `MDI_ICONS.CHEVRON_UP` (`'mdi:mdi-chevron-up'`) | Trailing icon shown when expanded |
| `hideActions` | `boolean` | `false` | Hides the trailing expand/collapse icon |
| `prependIcon` / `prependAvatar` | `TIcon` / `string` | — | Leading icon / avatar in the header |
| `appendIcon` / `appendAvatar` | `TIcon` / `string` | — | Trailing icon / avatar in the header (before the expand indicator) |
| `focusable` | `boolean` | `false` | Keeps the focus-visible overlay styling engaged while active |
| `static` | `boolean` | `false` | Prevents the header's min-height from growing when active |
| `readonly` | `boolean` | `false` | Disables the open/close click handler without dimming the panel |
| `disabled` | `boolean` | `false` | Disables the panel entirely (via the group item context) |
| `value` | `any` | — | Selection value registered with the parent group (`IGroupItemProps`) |
| `eager` | `boolean` | `false` | Keeps the content mounted even while collapsed |
| `loading` | `boolean \| number \| TLoaderConfig` | — | Loading state — see Loading state |
| `loadingText` | `string` | — | Declared on `ILoaderProps` but **not currently read** by the panel, header or content (see note below) |
| `selectedClass` | `string` | — | Declared on `IGroupItemProps` but **not currently read** by the panel (see note below) |
| `hover` | `boolean \| IHoverState` | — | Hover state override — see Hover / active |
| `active` | `boolean \| IActiveState` | — | Active state override — see Hover / active |
| `activeClass` | `string` | — | CSS class applied while active |
| `color` | `TColor` | — | Text color intent |
| `bgColor` | `TColor` | — | Background color intent |
| `density` | `TDensity` | — | Panel density |
| `elevation` | `TElevation` | — | Shadow rung |
| `rounded` | `boolean \| number \| string \| TRounded` | — | Corner radius (+ per-corner variants) |
| `border` | `boolean \| number \| string \| TDirectionBoth \| Array<TDirectionBoth>` | — | Border (+ per-side variants, `borderColor`, `borderStyle`) |
| `padding` | `boolean \| number \| string` | — | Padding (+ per-side variants) |
| `margin` | `boolean \| number \| string` | — | Margin (+ per-side variants) |
| `ripple` | `boolean \| { class: string }` | — | Header click-ripple override (forwarded to the header) |
| `fontFamily` / `fontSize` / `fontWeight` / `lineHeight` / `letterSpacing` | typography tokens | — | Header typography overrides (forwarded to the header) — see `OrigamExpansionPanelHeader` |

> **Known gap** — `loadingText` (from `ILoaderProps`) and `selectedClass`
> (from `IGroupItemProps`, the "class applied while selected" analogue of
> `Btn`/`ItemGroup`'s selected styling) are both part of
> `IExpansionPanelProps` but neither `OrigamExpansionPanel.vue`,
> `OrigamExpansionPanelHeader.vue` nor `OrigamExpansionPanelContent.vue`
> reads them. Passing either today has no effect — flagging this rather
> than guessing at intended behaviour.

## Emits

| Event | Payload | Description |
|---|---|---|
| `group:selected` | `{ value: boolean }` | Fired when the panel's membership in the parent's selected set changes |

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | — | Content body (used instead of `content`) |
| `header` | Every `OrigamExpansionPanel` prop except `class` / `id` / `style` / `tag` — bound from `expansionPanelHeaderProps = filterProps(props, ['class', 'id', 'style', 'tag'])` (`OrigamExpansionPanel.vue:31-34,234-236`). This is a different, larger object than the 5-key scope below — that one is `OrigamExpansionPanelHeader`'s own internal `slotProps`, only handed to its `prepend` / `append` slots. | Replaces the entire header |
| `title` | Same `{ collapseIcon, disabled, expanded, expandIcon, readonly }` object as `prepend` / `append` — `OrigamExpansionPanelHeader`'s own internal `slotProps` (`OrigamExpansionPanelHeader.vue:163-171`), **not** the `header` scope above. | Overrides just the header's title content |
| `prepend` | `{ collapseIcon, disabled, expanded, expandIcon, readonly }` — `OrigamExpansionPanelHeader`'s own internal `slotProps` (`OrigamExpansionPanelHeader.vue:163-171`), **not** the `header` scope above: `header` and `prepend`/`append` do not receive the same object. | Leading icon/avatar area of the header |
| `append` | Same `{ collapseIcon, disabled, expanded, expandIcon, readonly }` object as `prepend` (`OrigamExpansionPanelHeader.vue:163-171`) — again, different from `header`'s scope. | Trailing icon/avatar area of the header |
| `loader` | — | Custom loading indicator (line/circular loader replacement) |
| `wrapper` | `{ … content props }` | Replaces the entire content wrapper |

## Composition — the ExpansionPanel family

- `OrigamExpansionPanels` (`packages/ds/src/components/ExpansionPanel/OrigamExpansionPanels.vue`) —
  the required group wrapper. Owns `v-model` (selected panel value(s)),
  `multiple`, `mandatory`, `max`, and can render panels declaratively from an
  `items: IExpansionPanelProps[]` array instead of slotted
  `OrigamExpansionPanel` children. Also carries the `flat` / `accordion` /
  `popout` / `inset` layout variants. **No dedicated doc page exists for it
  yet** — flagging this gap rather than inventing one.
- `OrigamExpansionPanelHeader` — the
  clickable header row; rendered automatically by `OrigamExpansionPanel`
  from its own props, but can be overridden via the `#header` slot.
- `OrigamExpansionPanelContent` — the
  collapsible content region; rendered automatically by
  `OrigamExpansionPanel` from `content` / the default slot, throws if
  instantiated outside an `OrigamExpansionPanel` ancestor.

## Accessibility

- The header renders as a native `<button type="button">` (via
  `OrigamExpansionPanelHeader`), with `aria-expanded` and
  `aria-controls` pointing at the content region's id.
- The content region renders `role="region"` with `aria-labelledby`
  pointing at the header's id.
- Disabled panels set `tabindex="-1"` on the header and dim its overlay.

## CSS variables

| Variable | Default source | Description |
|---|---|---|
| `--origam-expansion-panel---background` | `color.surface.raised` | Seeded by the token build (`_light.scss:1777`) but **not read anywhere** — no `background`/`background-color` property in `OrigamExpansionPanel.vue`'s `<style>` block references it. Overriding it currently has no visible effect. |
| `--origam-expansion-panel---color` | `color.text.primary` | Same gap as above: generated (`_light.scss:1778`) but not consumed by `OrigamExpansionPanel.vue`, `OrigamExpansionPanelHeader.vue` or `OrigamExpansionPanelContent.vue` — no matching `var(...)` reference in any of the three. |
| `--origam-expansion-panel---border-radius` | `radius.sm` | Panel corner radius |
| `--origam-expansion-panel---divider-color` | `color.border.subtle` | Separator between stacked panels (non-accordion) |
| `--origam-expansion-panel---divider-opacity` | `opacity.12` | Separator opacity |
| `--origam-expansion-panel---active-margin-top` | `space.4` | Gap added above/below the active panel |
| `--origam-expansion-panel---disabled-color` | `color.text.disabled` | Header text color when disabled |
| `--origam-expansion-panel---disabled-overlay-opacity` | ≈`opacity.60` | Overlay opacity when disabled |
| `--origam-expansion-panel__shadow---box-shadow` | `shadow.sm` | Panel elevation shadow layer |
| `--origam-expansion-panel__header---font-size` | `0.9375rem` | Header font size |
| `--origam-expansion-panel__header---line-height` | `1` | Header line height |
| `--origam-expansion-panel__header---min-height` | `48px` | Header min height (collapsed) |
| `--origam-expansion-panel__header---min-height-active` | `64px` | Header min height (expanded) |
| `--origam-expansion-panel__header---focus-overlay-opacity` | `opacity.12` (fallback `calc(0.12 * 1)`) | Header focus/focus-visible overlay opacity |
| `--origam-expansion-panel__content---padding-block-start` / `-end` | `space.2` / `space.4` | Content vertical padding |
| `--origam-expansion-panel__content---padding-inline-start` / `-end` | `space.6` | Content horizontal padding |

> **Known gap** — `packages/ds/src/assets/css/tokens/light.css` (and
> `dark.css`) also declares a
> `--origam-expansion-panel__header---hover-overlay-opacity` variable, but
> `OrigamExpansionPanelHeader.vue`'s hover rule uses a hardcoded
> `opacity: calc(0.04 * 1)` with no matching `var(...)` — the token exists
> but isn't actually wired as a CSS custom property override point.
> Overriding that variable from a theme currently has no effect on hover.

Header-specific typography variables
(`--origam-expansion-panel__header---font-family` etc.) and the full content
token set are documented on
`OrigamExpansionPanelHeader` and
`OrigamExpansionPanelContent`.
