# OrigamExpansionPanelHeader

> Sub-component of the matching parent. See its parent's docs (`Origam`) for full context.

This file is a stub. The component's prop surface is exercised in
`stories/components/stories/.../OrigamExpansionPanelHeader.story.vue`.

## Typography props

The following props override the matching `--origam-expansion-panel__header---*` CSS variable
on the header element with a primitive design token.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `fontSize` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl' \| '5xl'` | `undefined` | Overrides `--origam-expansion-panel__header---font-size`. Default is `0.9375rem`. |
| `lineHeight` | `'none' \| 'tight' \| 'snug' \| 'normal' \| 'relaxed' \| 'loose'` | `undefined` | Overrides `--origam-expansion-panel__header---line-height`. Default is `1`. |

## Slots

| Slot | Scope | Description |
|---|---|---|
| `title` | `{ collapseIcon, disabled, expanded, expandIcon, readonly }` | Overrides the title area. Falls back to the `default` slot, then to the `title` prop, when not provided. |
| `default` | `{ collapseIcon, disabled, expanded, expandIcon, readonly }` | Legacy override for the title area — kept for direct consumers of `OrigamExpansionPanelHeader` that predate the `title` slot. Prefer `title`; it's the name `OrigamExpansionPanel` and `OrigamExpansionPanels` forward into when a consumer passes their own `#title`. |
| `prepend` | `{ collapseIcon, disabled, expanded, expandIcon, readonly }` | Leading icon/avatar area, before the title. |
| `append` | `{ collapseIcon, disabled, expanded, expandIcon, readonly }` | Trailing icon/avatar area, before the expand/collapse indicator. |

`hasTitle` mounts the title `<span>` when any of `title` slot, `default` slot, or the
`title` prop is present — so a consumer relying purely on `#title` (no `title` prop)
now renders correctly, matching what `OrigamExpansionPanel`'s own `#title` slot has
always forwarded into this component.
