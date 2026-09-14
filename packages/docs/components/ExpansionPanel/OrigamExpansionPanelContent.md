# OrigamExpansionPanelContent

`<OrigamExpansionPanelContent>` is the collapsible body of a single
`<OrigamExpansionPanel>`. It renders inside an `<OrigamExpandY>`
transition, so opening and closing animate the region's height.

> **Runtime requirement** — the component `inject`s the panel context
> published under `ORIGAM_EXPANSION_PANEL_KEY` by
> `<OrigamExpansionPanel>`. Rendered outside one it throws
> `[Origam] expansion-panel-content needs to be placed inside expansion-panel`.
> You rarely mount it yourself: `<OrigamExpansionPanel>` already renders
> one, forwarding the content-shaped half of its own props.

## Basic usage

```vue
<template>
    <origam-expansion-panels>
        <origam-expansion-panel>
            <origam-expansion-panel-header title="Details"/>
            <origam-expansion-panel-content content="Panel body."/>
        </origam-expansion-panel>
    </origam-expansion-panels>
</template>
```

## Content — prop or slot

`content` accepts a plain string **or** a component definition; anything
that isn't a string is rendered through `<component :is>`. The `default`
slot wins over the prop when both are present.

```vue
<template>
    <origam-expansion-panel-content>
        <p>Rich body content.</p>
        <ul><li>One</li><li>Two</li></ul>
    </origam-expansion-panel-content>
</template>
```

## Props

### Content

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `string \| Component` | `undefined` | Body content. A non-string value is mounted via `<component :is>`. Ignored when the `default` slot is filled. |
| `tag` | `string` | `'div'` | Element rendered for the content region. |

### Loading & lazy mount

| Prop | Type | Default | Description |
|---|---|---|---|
| `eager` | `boolean` | `undefined` | Render the body immediately instead of waiting for the first expand (`useLazy`). Without it the body mounts on first open and is unmounted again once the collapse transition has finished (`onAfterLeave`); with it the body is mounted from the start and never unmounted. |
| `loading` | `boolean \| number \| TLoaderConfig` | `undefined` | Loading state. `true` → indeterminate; a number `0..100` → determinate; an object `{ type: 'line' \| 'circular' \| 'skeleton', … }` → explicit renderer plus per-instance overrides. The component's preferred kind is `line`. |
| `loadingText` | `string` | `undefined` | Locale key passed as the `label` of the active loading renderer, which resolves it into its own `aria-label` (default `origam.loading`). |

While `loading` is active with `kind === 'skeleton'`, three
`<origam-skeleton variant="text">` rows replace the body. Any other kind
renders an `<origam-progress>` above the body. Both are replaceable
through the `loader` slot.

### Surface

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | `undefined` | Foreground colour. |
| `bgColor` | `TColor` | `undefined` | Background colour. |
| `rounded` | `boolean \| number \| string \| TRounded` | `undefined` | Corner radius. |
| `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`, `borderBlock`, `borderInline` | `boolean \| number \| string` | `undefined` | Border widths, per edge or per axis. |
| `borderColor` | `string` | `undefined` | Border colour for every edge. |
| `borderStyle` | `string` | `undefined` | Border style (`solid`, `dashed`, …). |
| `borderTopColor`, `borderRightColor`, `borderBottomColor`, `borderLeftColor` | `TColor` | `undefined` | Per-edge border colour. |
| `density` | `TDensity` | `undefined` | Density modifier. |

### Spacing

| Prop | Type | Default | Description |
|---|---|---|---|
| `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `paddingBlock`, `paddingInline` | `boolean \| number \| string` | `undefined` | Padding on the content region. |
| `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `marginBlock`, `marginInline` | `boolean \| number \| string` | `undefined` | Margin on the content region. |

### Common

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | generated | DOM id of the content region. Published to the sibling header so its `aria-controls` points at the real id (#519, #520). Falls back to `expansion-panel-content-{panelId}`. |
| `class` | `string \| string[] \| object` | `undefined` | Extra classes on the content region. |
| `style` | `string \| string[] \| object \| StyleValue` | `undefined` | Extra inline styles. |

## Emits

`<OrigamExpansionPanelContent>` emits nothing — `IExpansionPanelContentEmits`
is empty. Expand / collapse is owned by the header and the panel group.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | — | Body content. Replaces the `content` prop. |
| `loader` | — | Replaces the built-in skeleton / progress renderer while `loading` is active. |

## Accessibility

- The content region renders `role="region"` and
  `aria-labelledby="{header id}"`, read from the shared panel context —
  the real resolved id, not a guess at the generated naming scheme.
- Collapsed content is **not** in the DOM by default: `useLazy` mounts it
  on the first expand and drops it again after the collapse transition
  ends, so in-page find and crawlers do not reach it. Pass `eager` when
  the body must always be present.

## Design tokens

| CSS variable | Default |
|---|---|
| `--origam-expansion-panel__content---display` | `flex` |
| `--origam-expansion-panel__content---flex` | `1 1 auto` |
| `--origam-expansion-panel__content---max-width` | `100%` |
| `--origam-expansion-panel__content---padding-block-start` | `8px` |
| `--origam-expansion-panel__content---padding-block-end` | `16px` |
| `--origam-expansion-panel__content---padding-inline-start` | `24px` |
| `--origam-expansion-panel__content---padding-inline-end` | `24px` |

The padding tokens sit on the inner `__wrapper`; `padding` /
`paddingInline` / … apply to the region itself, so the two compose
rather than replace each other.

## Examples

### Determinate loading

```vue
<template>
    <origam-expansion-panel-content :loading="42" content="Importing…"/>
</template>
```

### Skeleton while fetching

```vue
<script setup lang="ts">
    const pending = ref(true)
</script>

<template>
    <origam-expansion-panel-content :loading="pending && { type: 'skeleton' }">
        {{ body }}
    </origam-expansion-panel-content>
</template>
```

### Custom loader

```vue
<template>
    <origam-expansion-panel-content loading>
        <template #loader>
            <origam-progress type="circular" :active="true" indeterminate/>
        </template>
    </origam-expansion-panel-content>
</template>
```

## Related

- `OrigamExpansionPanel` — the panel that owns this content region.
- `OrigamExpansionPanelHeader` — the toggling header above it.
- `OrigamExpansionPanels` — the accordion container.
