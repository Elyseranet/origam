# OrigamClassIcon

`<OrigamClassIcon>` is the **font-class leaf** rendered when an icon name
maps to a CSS-class-driven font set (Material Design Icons via `mdi-*`,
Font Awesome via `fa-*`, etc.). It is selected automatically by
`OrigamIcon` when the resolved icon string is a class
name — you almost never instantiate it by hand, except in low-level
integrations or when registering a new icon set.

## Basic usage

```vue
<template>
    <!-- Direct usage — bypasses the dispatcher, useful inside a custom IIconSet -->
    <OrigamClassIcon icon="mdi-home" />
    <OrigamClassIcon icon="fa-solid fa-circle" />
</template>
```

The `icon` prop is **simply concatenated as a class** on the rendered
element. No alias resolution, no set-prefix stripping — that's the
dispatcher's job.

## Sizes

```vue
<template>
    <!-- Named sizes — share the same SCSS rule as the dispatcher -->
    <OrigamClassIcon icon="mdi-heart" size="x-small" />
    <OrigamClassIcon icon="mdi-heart" size="small"   />
    <OrigamClassIcon icon="mdi-heart" size="default" />
    <OrigamClassIcon icon="mdi-heart" size="large"   />
    <OrigamClassIcon icon="mdi-heart" size="x-large" />

    <!-- Numeric override — sets font-size + line-height in pixels -->
    <OrigamClassIcon icon="mdi-heart" :size="32" />
</template>
```

## Polymorphic tag

```vue
<template>
    <!-- Default tag is <i> -->
    <OrigamClassIcon icon="mdi-home" />

    <!-- Override -->
    <OrigamClassIcon icon="mdi-home" tag="span" />
</template>
```

## Custom icon sets

`<OrigamClassIcon>` is the recipe to bind your own font icons. Register a
new set in the createOrigam options, point its `component` to a wrapper
that prepends your set prefix, and you're done:

```ts
import { OrigamClassIcon } from '@origam/components'

export const fa: IIconSet = {
    component: (props: any) => h(OrigamClassIcon, {
        ...props,
        // Combine the set's namespace with the consumer's icon name
        class: 'fa'
    })
}
```

## Props (interface)

`OrigamClassIcon` accepts the same `IIconComponentProps` interface as
`OrigamIcon` but **only `icon`, `size`, `tag`, `class`, `style`** are
honoured at the leaf level. The other axes (color, border, padding,
margin) are wired by the dispatcher (`OrigamIcon`) — passing them to
`OrigamClassIcon` directly is a no-op.

```ts
interface IIconComponentProps {
    icon?: TIcon
    size?: TSize | number
    tag?: string
    class?: string | string[] | object
    style?: string | string[] | object
}
```

## Anatomy

```html
<i class="origam-icon origam-icon--size-default mdi mdi-home"></i>
```

## When to use

- **Almost never**, directly. Use `<OrigamIcon>` instead — it dispatches
  to the right leaf for you.
- When **registering a new font icon set** via `createOrigam({ sets: { … } })`.
  The set's `component` factory is the place to call `OrigamClassIcon`.

## Related

- `OrigamIcon` — the dispatcher (preferred entry-point).
- `createOrigam` — register
  custom icon sets.
