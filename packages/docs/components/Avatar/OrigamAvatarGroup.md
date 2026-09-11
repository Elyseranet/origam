# OrigamAvatarGroup

`<OrigamAvatarGroup>` displays a cluster of `OrigamAvatar` chips with
controlled overlap and an automatic "+N" rest counter. The cluster can
expand on hover or click so users can browse the full member list
without leaving the surface.

## Basic usage

Pass an array of avatar prop objects through `items`. Anything beyond
`max` (default `5`) is collapsed into a single overflow avatar that
displays `+N`.

```vue
<template>
    <OrigamAvatarGroup
        :items="[
            { text: 'AP' },
            { text: 'JC' },
            { text: 'MS' },
            { text: 'KL' },
            { text: 'RT' },
            { text: 'NB' },
            { text: 'OT' }
        ]"
    />
</template>
```

## Direction

`direction` accepts `'horizontal'` (default) or `'vertical'`. Both
flavours reuse the same overlap math — only the axis differs.

```vue
<template>
    <OrigamAvatarGroup direction="horizontal" :items="people" />
    <OrigamAvatarGroup direction="vertical"   :items="people" />
</template>
```

## Max

`max` controls how many avatars are shown before the overflow chip
kicks in. Setting `max` to a value greater than or equal to the items
length renders every avatar without an overflow chip.

```vue
<template>
    <OrigamAvatarGroup :items="people" :max="3" />
</template>
```

## Expand on hover / click

Either toggles the `max` cap to the full length when triggered. They
are mutually compatible — wire both if you want a click-to-pin
behaviour after a hover preview.

```vue
<template>
    <OrigamAvatarGroup :items="people" expand-on-hover />
    <OrigamAvatarGroup :items="people" expand-on-click />
</template>
```

## Density

The density mixin reaches every avatar in the cluster and tightens the
overlap accordingly (compact / comfortable both shave 8 pixels).

```vue
<template>
    <OrigamAvatarGroup :items="people" density="compact" />
</template>
```

## Forwarded avatar props

Any avatar-level prop set directly on the group is propagated to every
member through `mergeProps`. This is the recommended way to keep the
cluster visually consistent (same `size`, `rounded`, `border`).

```vue
<template>
    <OrigamAvatarGroup
        :items="people"
        size="small"
        rounded
        border
    />
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `avatar` | `{ item, index }` | Override the rendering of a single member. |
| `rest` | `{ rest, length }` | Override the overflow chip. |
| `default` | — | Override the overflow chip *content* (label) only. |

## Events

| Event | Payload | Description |
|---|---|---|
| `update:active` | `boolean` | Active toggled by click. |
| `update:hover` | `boolean` | Hover toggled on mouse enter / leave. |

## Props (interface)

```ts
interface IAvatarGroupProps extends ICommonsComponentProps,
    IDirectionProps, IDensityProps, IRoundedProps, ISizeProps,
    ITagProps, IColorProps, IPaddingProps, IMarginProps, IBorderProps,
    IElevationProps, IHoverProps, IActiveProps {
    items?: Array<IAvatarProps>
    max?: number
    expandOnHover?: boolean
    expandOnClick?: boolean
}
```

## Anatomy

```html
<div class="origam-avatar-group origam-avatar-group--horizontal
            origam-avatar-group--expand-on-hover">
    <div class="origam-avatar origam-avatar-group__item">…</div>
    <div class="origam-avatar origam-avatar-group__item">…</div>
    <div class="origam-avatar origam-avatar-group__rest">+3</div>
</div>
```

## Design tokens consumed

| CSS variable | Purpose |
|---|---|
| `--origam-avatar-group---flex-direction` | `row` / `column` driven by `direction`. |
| `--origam-avatar-group---density` | Density shaving propagated to children. |
| `--origam-avatar-group__avatar---transition` | Transition used on hover / active expansion. |
| `--origam-avatar-group---margin-inline-start` | Negative margin between siblings (horizontal). |
| `--origam-avatar-group---margin-block-start` | Negative margin between siblings (vertical). |
| `--origam-avatar-group__item---outline-color` | Separation-ring color on every stacked `__item` / `__rest` chip. Default: `color.surface.default`. |
| `--origam-avatar-group__item---outline-width` | Separation-ring width. Default: `2px`. |
| `--origam-avatar-group__item---outline-style` | Separation-ring style. Default: `solid`. |

The full list lives in `tokens/component/avatar-group.json`.

## Accessibility

- The wrapper carries `role="group"` so screen readers announce a
  cohesive entity instead of disjoint avatars.
- When `expandOnHover` is on, also wire `expandOnClick` so keyboard
  users can reach the full list — pure-hover affordances are not
  reachable from the keyboard.
- The overflow chip is purely visual; if its content matters
  (e.g. the literal count), wrap the cluster in an
  `aria-label="N collaborators"` container.

## Theming notes

- Theme switching propagates through every member automatically — the
  cluster does not cache anything.
- Visual-token props (`border`, `rounded`, `elevation`, `color`, `bgColor`,
  `density`, `size`, `borderColor`, `borderStyle`) set on
  `<origam-avatar-group>` are forwarded to every child `<origam-avatar>` as
  *defaults* — a prop the group never received falls through to whatever an
  ancestor `<OrigamDefaultsProvider>` or the active theme's
  `components['origam-avatar']` block defines (e.g. a brand theme's
  `border: true`), instead of silently overriding it. Only a prop the
  CONSUMER actually set on the group wins over the theme (issue #263).
- The group-level override applied at the group root is the `box-shadow`
  when `elevated`.
- **Separation ring**: every stacked child (`__item` and the `__rest`
  overflow chip) gets a structural `outline` — a distinct CSS property
  from each avatar's own `box-shadow`/`border`, so the two never collide
  or need to be layered — that keeps overlapping avatars legible against
  whatever surface the group sits on. It is themable via the dedicated
  `--origam-avatar-group__item---outline-*` cssVars above and defaults to
  `color.surface.default`; only avatars rendered *inside* an
  `<origam-avatar-group>` get it — a standalone `<origam-avatar>` never
  does.

## Related

- `OrigamAvatar` — single chip; the group is just an arranger.
- `OrigamChip` — labelled, removable counterpart.
