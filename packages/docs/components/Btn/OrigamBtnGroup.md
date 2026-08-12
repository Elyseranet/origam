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

## Variants

Like `<OrigamBtn>`, `variant` is a **props preset** (ADR-005 —
`docs/internal/adr-005-variant-as-props-preset.md`) resolved via
`BTN_GROUP_VARIANT_PRESETS` (`consts/Btn/btn-group-variant.const.ts`), the
same weakest-tier `useDefaults` mechanism, same 7 values
(`text`/`flat`/`elevated`/`tonal`/`outlined`/`plain`/`ghost`). The group's
own resolved `variant` — whether passed here explicitly or resolved from a
theme's `origam-btn-group` defaults — is also forwarded, unconditionally, to
every child `<OrigamBtn>` so the whole strip reads as one themed surface.

```vue
<template>
    <OrigamBtnGroup variant="outlined">
        <OrigamBtn text="One" />
        <OrigamBtn text="Two" />
    </OrigamBtnGroup>
</template>
```

An explicit `bgColor` at the call site outranks the preset, same as
`OrigamBtn`:

```vue
<template>
    <OrigamBtnGroup variant="outlined" bg-color="primary">
        <OrigamBtn text="Filled" />
        <OrigamBtn text="Group"  />
    </OrigamBtnGroup>
</template>
```

`ghost` additionally accepts `backdropBlur` (`IBackdropProps`), same
contract as `OrigamBtn`. The group has no `active`/`hover` state-preset
axis — `useStateEffect` on the group's own surface is called without state
arguments, so `hover`/`active` on `IBtnGroupProps` exist only to be
forwarded to children, never to restyle the group itself.

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
| `--origam-btn-group---border-radius`  | `4px`          | outer corner rounding          |
| `--origam-btn-group---border-width`   | `0`            | outer frame thickness          |
| `--origam-btn-group---border-style`   | `solid`        | outer frame style              |
| `--origam-btn-group---border-color`   | `currentColor` | outer frame color              |
| `--origam-btn-group---background-color` | `(unset)`    | shared fill                    |
| `--origam-btn-group---color`          | `(unset)`      | shared text color              |

Override them on the wrapper (`<style scoped>` works thanks to `:deep`)
or globally via `:root`.
