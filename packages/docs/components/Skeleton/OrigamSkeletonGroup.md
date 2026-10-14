# OrigamSkeletonGroup

`<OrigamSkeletonGroup>` is the zone that holds the `<OrigamSkeleton>`
blocks of one loading area. It does two things a lone block cannot:

- **One announcement.** The group is a single live region
  (`role="status"`, `aria-busy="true"`, an `aria-label`). The blocks inside are
  `aria-hidden`, so a screen reader hears the loading once, not once per
  placeholder.
- **One animation clock.** In `pulse` the group container is what animates, so
  all its blocks breathe in phase, even when they mount at different moments.

## Basic usage

```vue
<template>
    <OrigamSkeletonGroup>
        <OrigamSkeleton variant="rectangular" height="120" />
        <OrigamSkeleton variant="text" width="70%" />
        <OrigamSkeleton variant="text" />
        <OrigamSkeleton variant="pill" />
    </OrigamSkeletonGroup>
</template>
```

The group is a grid with a gap (`--origam-skeleton---gap`). Override its layout
with a class or a style when your anatomy needs rows.

## Animation

`animation` applies to the whole group; blocks inherit it unless they set their
own.

| Value | Behaviour |
|---|---|
| `pulse` (default) | The group container pulses; its blocks do not animate on their own. |
| `wave` | Each block sweeps its own highlight (all start together). |
| `none` | Static. |

Like a lone block, the group stops after about 10 s (finite iteration count) and
does not animate under `prefers-reduced-motion: reduce`.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `animation` | `'pulse' \| 'wave' \| 'none'` | `'pulse'` | Motion of the whole group. |
| `label` | `string` | `'origam.loading'` | Locale key of the one announcement. |

## Emits

None.

## Slots

| Slot | Description |
|---|---|
| `default` | The `<OrigamSkeleton>` blocks of the zone. |

## Accessibility

The group is the only element of the zone exposed to assistive technology
(`role="status"`, `aria-busy="true"`, `aria-label` from `label`). Remove the
group, or switch the area to its real content, when loading ends.
