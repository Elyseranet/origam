# OrigamBtnGroup

`<OrigamBtnGroup>` packs several `<OrigamBtn>` elements into a single
horizontal segmented control. The group merges adjacent button borders,
applies a shared border-radius to the outer corners, and forwards the
group-level color / density tokens to each child.

Use it for filter toolbars, view switchers, segmented inputs, or any
"pick one of N" UI where the buttons are presentational only. If you
need single / multi selection, reach for the higher-level
`<OrigamBtnToggle>` (separate doc) which builds on top.

## Basic usage

Drop any number of `<OrigamBtn>` into the default slot — the group
takes care of the visual coupling.

```vue
<template>
    <OrigamBtnGroup>
        <OrigamBtn text="One"   />
        <OrigamBtn text="Two"   />
        <OrigamBtn text="Three" />
    </OrigamBtnGroup>
</template>
```

## Items prop

For data-driven lists, pass an array of button props via `items`. Each
entry is forwarded as `v-bind` to a child `<OrigamBtn>`. The group's
own `color` / `density` always wins over per-item overrides — that's
the contract: the group is the "shape", buttons are the cells.

```vue
<template>
    <OrigamBtnGroup :items="actions" />
</template>

<script setup lang="ts">
const actions = [
    { text: 'Save'   },
    { text: 'Cancel' },
    { text: 'Delete' },
]
</script>
```

## Density

Density translates into the group's `min-height` (and propagates to
each child). `compact` and `comfortable` adjust the rung by ±8px.

```vue
<template>
    <OrigamBtnGroup density="compact">
        <OrigamBtn text="A" />
        <OrigamBtn text="B" />
    </OrigamBtnGroup>
</template>
```

## Divided

By default, adjacent buttons share their borders. Set `divided` to
draw an explicit thin separator between cells — useful when the
buttons share a fill color and you still want a visible split.

```vue
<template>
    <OrigamBtnGroup divided color="primary">
        <OrigamBtn text="Bold"      />
        <OrigamBtn text="Italic"    />
        <OrigamBtn text="Underline" />
    </OrigamBtnGroup>
</template>
```

## Rounded & border

Both props are forwarded mixin-style. `rounded` pushes the outer
border-radius to a pill shape; `border` adds the outer thin frame.

```vue
<template>
    <OrigamBtnGroup rounded border>
        <OrigamBtn text="On"  />
        <OrigamBtn text="Off" />
    </OrigamBtnGroup>
</template>
```

## Slots

| Slot      | Purpose                                                       |
|-----------|---------------------------------------------------------------|
| `default` | Direct children. Replaces the items prop when provided.       |
| `item`    | Custom render for each entry of `items`. Receives `{ item, index }`. |

```vue
<template>
    <OrigamBtnGroup :items="actions">
        <template #item="{ item, index }">
            <OrigamBtn v-bind="item" :class="`my-cell-${index}`" />
        </template>
    </OrigamBtnGroup>
</template>
```

## Tokens

The component exposes its visual surface via these CSS variables:

| Variable                              | Default        | Used for                       |
|---------------------------------------|----------------|--------------------------------|
| `--origam-btn-group---height`         | `36px`         | base min-height before density |
| `--origam-btn-group---density`        | `0`            | density delta (±8px)           |
| `--origam-btn-group---border-radius`  | `var(--origam-radius---lg)` (12px) | outer corner rounding |
| `--origam-btn-group---border-width`   | `0`            | outer frame thickness          |
| `--origam-btn-group---border-style`   | `solid`        | outer frame style              |
| `--origam-btn-group---border-color`   | `currentColor` | outer frame color              |
| `--origam-btn-group---background-color` | `(unset)`    | shared fill                    |
| `--origam-btn-group---color`          | `(unset)`      | shared text color              |

Override them on the wrapper (`<style scoped>` works thanks to `:deep`)
or globally via `:root`.
