# OrigamComponentIcon

`<OrigamComponentIcon>` is the **Vue-component wrapper leaf**: when the
`icon` prop is a Vue component (a `Component` ref, not a string), the
`OrigamIcon` dispatcher selects this leaf to render
the inner component inside an origam-styled wrapper.

The wrapper provides:
- A consistent block element with the `origam-icon origam-icon--component`
  class so the named-size CSS rule applies.
- A `default` slot to override the inner content entirely.

## Basic usage

```vue
<template>
    <!-- Pass a Vue icon component (lucide, hugeicons, custom SVG components, …) -->
    <OrigamComponentIcon :icon="LucideHomeIcon" />

    <!-- Or use the dispatcher (recommended) — same result -->
    <OrigamIcon :icon="LucideHomeIcon" />
</template>

<script setup>
    import { LucideHomeIcon } from 'lucide-vue-next'
</script>
```

## With a slot override

```vue
<template>
    <OrigamComponentIcon>
        <CustomSvgComponent stroke="2" />
    </OrigamComponentIcon>
</template>
```

When a `default` slot is provided, the `icon` prop is **ignored** and
the slot content takes over.

## Sizes

```vue
<template>
    <OrigamComponentIcon :icon="LucideHomeIcon" size="x-small" />
    <OrigamComponentIcon :icon="LucideHomeIcon" size="small"   />
    <OrigamComponentIcon :icon="LucideHomeIcon" size="default" />
    <OrigamComponentIcon :icon="LucideHomeIcon" size="large"   />
    <OrigamComponentIcon :icon="LucideHomeIcon" size="x-large" />

    <!-- Numeric size pins the wrapper width / height in pixels -->
    <OrigamComponentIcon :icon="LucideHomeIcon" :size="48" />
</template>
```

The size hits the wrapper's `font-size` (and `width` / `height` for
numeric values). Most modern Vue icon libraries size their internal
SVGs in `em` so they automatically follow the wrapper — verify with
your library's docs if the icon doesn't scale.

## Polymorphic tag

```vue
<template>
    <!-- Default tag is <div> -->
    <OrigamComponentIcon :icon="MyIcon" />

    <!-- Inline rendering -->
    <OrigamComponentIcon :icon="MyIcon" tag="span" />
</template>
```

## Slots

| Slot | Description |
|---|---|
| `default` | Override the inner icon component. When provided, the `icon` prop is ignored. |

## Props (interface)

```ts
interface IIconComponentProps {
    icon?: Component | string | …  // for this leaf, expect Component
    size?: TSize | number
    tag?: string
    class?: string | string[] | object
    style?: string | string[] | object
}
```

## Anatomy

```html
<div class="origam-icon origam-icon--component origam-icon--size-default">
    <!-- inner Vue component renders its own SVG / element here -->
</div>
```

## When to use

- **Almost never**, directly. Use `<OrigamIcon>` and pass the component as
  the `icon` prop — the dispatcher selects this leaf for you.
- When you need to **override the inner content via a slot**, this is the
  only leaf with a `default` slot.

## Theming notes

- The wrapper sets `color: currentColor` (via `.origam-icon`), so an inner
  SVG that uses `stroke="currentColor"` or `fill="currentColor"` becomes
  theme-aware automatically.
- Components that hardcode their own colour (raw hex inside the SVG)
  cannot be re-themed at runtime. Pick libraries that respect
  `currentColor` whenever possible.

## Related

- `OrigamIcon` — the dispatcher (preferred entry-point).
- `OrigamSvgIcon` — for inline SVG path data instead
  of a full Vue component.
