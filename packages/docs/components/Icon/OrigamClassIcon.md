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

`OrigamClassIcon` accepts the full `IIconComponentProps` interface, and
resolves every surface axis itself.

| Prop | Type | Description |
|---|---|---|
| `icon` | `TIcon` | Icon class name, e.g. `mdi-account`. |
| `size` | `TSize \| number` | Named token, or a number applied as both `font-size` and `line-height`. |
| `tag` | `string` | Root element. |
| `color` / `bgColor` | `TColor` | Foreground / background intent. |
| `border` (+ per-side, `borderColor`, `borderStyle`) | see `OrigamAlert` | Border axis. |
| `rounded` (+ per-corner) | `boolean \| number \| string \| TRounded` | Radius axis. |
| `padding` / `margin` (+ per-side, block, inline) | `boolean \| number \| string` | Spacing axes. |
| `width` / `height` / `min*` / `max*` | `number \| string` | Dimension axis. |
| `class` | `string \| string[] \| object` | Merged into the root class list. |
| `style` | `string \| string[] \| object` | Merged into the root style. |
| `disabled` | `boolean` | **Declared but not consumed** — see the note below. |

::: tip Behaviour change
These axes used to be a no-op at the leaf level: `OrigamIcon` resolved them
and handed the result down as `class` / `style`, so they only worked when the
icon was reached *through* the dispatcher. Since the leaves are exported on
the public barrel too, `<origam-class-icon padding="8px">` written directly
got nothing at all.

The leaf now consumes the same composables itself, so both paths work. There
is no double application — the dispatcher forwards only `icon`, `size`,
`tag`, `class` and `style`.
:::

::: warning `disabled` does nothing
`disabled` reaches this component through `IIconComponentProps` but is not
read anywhere — no class, no attribute, no style. The same holds for
`OrigamIcon`, `OrigamSvgIcon`, `OrigamLigatureIcon` and `OrigamComponentIcon`;
all five are recorded in the `unconsumed-props` guard baseline. To grey out an
icon, drive `color` or wrap it in the disabled control that owns it.
:::

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
