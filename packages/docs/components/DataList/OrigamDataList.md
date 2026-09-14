# OrigamDataList

`<OrigamDataList>` renders a definition list (`<dl>`) from a structured
`items` array. Two layouts are available, picked by the `mode` prop:

| `mode`         | Use case                                                                                  | Items shape           |
|----------------|-------------------------------------------------------------------------------------------|-----------------------|
| `"avatar"` (default) | Stacked title + multi-row text items, optionally with prepend/append icons or avatars | `IDataItem`           |
| `"kv"`         | PDF-aligned key / value rows — label on the left, value on the right                       | `IDataListKVItem`     |

## Props

### Own props

| Prop    | Type                                                              | Default    | Description                                                       |
|---------|-------------------------------------------------------------------|------------|-------------------------------------------------------------------|
| `mode`  | `TDataListMode` — `'avatar' \| 'kv'`                              | `'avatar'` | Selects the layout. `'kv'` switches to the key/value rows.         |
| `items` | `IDataItem[] \| Record<string, IDataItem> \| IDataListKVItem[] \| Record<string, IDataListKVItem>` | — | Source list. Shape is gated by `mode`. Keyed objects are flattened with `Object.values`. |

### Adjacent props (`IAdjacentProps`) — forwarded to each `OrigamDataTitle`

| Prop            | Type      | Description                        |
|-----------------|-----------|------------------------------------|
| `prependIcon`   | `TIcon`   | Icon before the title              |
| `appendIcon`    | `TIcon`   | Icon after the title               |
| `prependAvatar` | `string`  | Avatar image before the title      |
| `appendAvatar`  | `string`  | Avatar image after the title       |

> These four are only read in **avatar** mode — KV rows render no title
> component, so they have no effect when `mode="kv"`.

### Transversal props

All of these are consumed on the root `<dl>` through the shared composables.

| Group      | Props                                                                                                                             | Composable            |
|------------|-----------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| Color      | `color`, `bgColor`                                                                                                                | `useBothColor`        |
| Density    | `density`                                                                                                                          | `useDensity`          |
| Elevation  | `elevation`                                                                                                                        | `useElevation`        |
| Rounded    | `rounded`, `roundedTopLeft`, `roundedTopRight`, `roundedBottomLeft`, `roundedBottomRight`                                          | `useRounded`          |
| Border     | `border`, `borderTop`, `borderRight`, `borderBottom`, `borderLeft`, `borderBlock`, `borderInline`, `borderColor`, `borderStyle`, `borderTopColor`, `borderRightColor`, `borderBottomColor`, `borderLeftColor` | `useBorder` |
| Padding    | `padding`, `paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `paddingBlock`, `paddingInline`                           | `usePadding`          |
| Margin     | `margin`, `marginTop`, `marginRight`, `marginBottom`, `marginLeft`, `marginBlock`, `marginInline`                                  | `useMargin`           |
| Typography | `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing` — see [Typography props](#typography-props)                                | `useTypography` (×2)  |
| Commons    | `id`, `class`, `style`                                                                                                             | —                     |

## Avatar mode (default — back-compatible)

```vue
<template>
    <OrigamDataList :items="items" />
</template>

<script setup>
const items = [
    { title: { text: 'Status' }, text: [{ text: 'Active' }] },
    { title: { text: 'Created' }, text: [{ text: '2024-01-15' }] },
]
</script>
```

### Items structure

```ts
interface IDataItem {
    title?: IDataTitleProps   // term (<dt>)
    text?: IDataTextProps[]   // definition rows (<dd>)
}
```

Pass either an array or a keyed object.

### Prepend / append icons

```vue
<OrigamDataList :items="items" prepend-icon="mdi-information" />
```

Adjacent props (`prependIcon`, `appendIcon`, `prependAvatar`, `appendAvatar`)
are forwarded to each `OrigamDataTitle`.

### Density

```vue
<OrigamDataList :items="items" density="compact" />
```

## KV mode (PDF-aligned key/value rows)

```vue
<template>
    <OrigamDataList mode="kv" :items="kv" />
</template>

<script setup lang="ts">
import type { IDataListKVItem } from '@origam/interfaces'
import { OrigamChip } from '@origam/components'

const kv: IDataListKVItem[] = [
    { key: 'Status',     value: { component: OrigamChip, props: { text: 'Active', bgColor: 'success' } } },
    { key: 'Owner',      value: 'Arnaud Martin' },
    { key: 'Created at', value: 'Apr 12, 2026' },
]
</script>
```

### Items structure

```ts
interface IDataListKVItem {
    key: string
    value: string | number | VNode | IDataListKVItemValueComponent
    id?: string | number
}

interface IDataListKVItemValueComponent {
    component: string | object       // tag name OR imported component
    props?: Record<string, unknown>
    children?: string | number       // optional default-slot text
}
```

The component renders a `<dl>` with one `<dt>` (key) and one `<dd>`
(value) per row. Rows are stacked vertically with a 1px subtle divider
between them; the layout uses CSS grid with a fixed key column and a
fluid value column.

### Per-row test hooks

Each row carries `data-cy="data-list-kv-row-{kebab(key)}"` so e2e tests
can target specific rows without relying on text content order.

### Slots

#### Avatar mode

| Slot                      | Bindings           | Description                            |
|---------------------------|--------------------|----------------------------------------|
| `default`                 | `{ items }`        | Full list override                     |
| `item`                    | `{ item, index }`  | Custom item renderer                   |
| `item-{n}`                | `{ item, index }`  | Override for item at index `n`         |
| `item.title`              | `props`            | Custom title for every item            |
| `item-{n}.title`          | `props`            | Custom title for item at index `n`     |
| `item.title.prepend`      | —                  | Prepend slot for every title           |
| `item.title.append`       | —                  | Append slot for every title            |
| `item.text`               | —                  | Custom text renderer                   |
| `item-{n}.text`           | —                  | Custom text for item at index `n`      |
| `item.text.prepend`       | —                  | Prepend slot for every text row        |
| `item.text.append`        | —                  | Append slot for every text row         |

#### KV mode

| Slot               | Bindings                              | Description                              |
|--------------------|---------------------------------------|------------------------------------------|
| `default`          | `{ items }`                           | Full list override                       |
| `key`              | `{ key, item, index }`                | Custom key (`<dt>`) renderer for every row |
| `item-{n}.key`     | `{ key, item, index }`                | Override the key cell for row `n`        |
| `value`            | `{ key, value, item, index }`         | Custom value (`<dd>`) renderer for every row |
| `item-{n}.value`   | `{ key, value, item, index }`         | Override the value cell for row `n`      |

## Typography props

Control the font appearance of both the title (`__title`) and text (`__text`)
sub-elements. Custom properties cascade from the root `<dl>` to the child
elements where the matching SCSS rules consume them.

| Prop            | Type          | `__title` effect | `__text` effect | CSS variable emitted                             |
|-----------------|---------------|-----------------|-----------------|--------------------------------------------------|
| `fontSize`      | `TFontSize`   | font-size       | font-size       | `--origam-font__size---{value}`                  |
| `fontWeight`    | `TFontWeight` | font-weight     | —               | `--origam-font__weight---{value}`                |
| `lineHeight`    | `TLineHeight` | line-height     | line-height     | `--origam-font__lineHeight---{value}`            |
| `letterSpacing` | `TLetterSpacing` | letter-spacing | letter-spacing | `--origam-font__letterSpacing---{value}`         |

> `fontWeight` has a real visual effect only on `__title` (the SCSS reads
> `--origam-data-list__title---font-weight`). It still emits the `__text`
> var but the `__text` SCSS block has no `font-weight` rule, so it is
> effectively a no-op on the text rows.

## Emits

`OrigamDataList` is display-only — it does not emit events.

## Design tokens

Every variable below is read by `OrigamDataList.vue`'s own scoped SCSS and
declared in `packages/ds/src/assets/css/tokens/light.css` (and its `dark.css`
twin). Overriding one at the document root — or on any ancestor — re-skins
every list.

### Root (`<dl>`, both modes)

| Token                                     | Description                    |
|-------------------------------------------|--------------------------------|
| `--origam-data-list---display`            | Display mode of the `<dl>`     |
| `--origam-data-list---overflow`           | Overflow rule                  |
| `--origam-data-list---gap`                | Gap between items              |
| `--origam-data-list---padding`            | Padding of the `<dl>`          |
| `--origam-data-list---background-color`   | Background of the `<dl>`       |
| `--origam-data-list---color`              | Inherited text color           |
| `--origam-data-list---border-radius`      | Corner radius                  |

### Avatar mode — `__title` / `__text`

| Token                                        | Description            |
|----------------------------------------------|------------------------|
| `--origam-data-list__title---font-size`      | Title font size        |
| `--origam-data-list__title---font-weight`    | Title font weight      |
| `--origam-data-list__title---line-height`    | Title line height      |
| `--origam-data-list__title---letter-spacing` | Title letter spacing   |
| `--origam-data-list__title---color`          | Title color            |
| `--origam-data-list__text---font-size`       | Text row font size     |
| `--origam-data-list__text---line-height`     | Text row line height   |
| `--origam-data-list__text---letter-spacing`  | Text row letter spacing|
| `--origam-data-list__text---color`           | Text row color         |

### KV mode

The separator is `__kv` (BEM child), **not** `--kv`: `__kv` is the block's
child element, whereas `--` would designate a state variant. Copying a
`--origam-data-list--kv---*` spelling has no effect — the SCSS never reads it.

| Token                                        | Description                          |
|----------------------------------------------|--------------------------------------|
| `--origam-data-list__kv---display`           | Display of the `--mode-kv` root      |
| `--origam-data-list__kv---row-padding-block` | Vertical padding per row             |
| `--origam-data-list__kv---row-divider`       | Color of the 1px row divider         |
| `--origam-data-list__kv---key-width`         | Width reserved for the key column    |
| `--origam-data-list__kv---key-color`         | Key (label) text color               |
| `--origam-data-list__kv---key-font-size`     | Key font size                        |
| `--origam-data-list__kv---key-font-weight`   | Key font weight                      |
| `--origam-data-list__kv---key-line-height`   | Key line height                      |
| `--origam-data-list__kv---value-color`       | Value text color                     |
| `--origam-data-list__kv---value-font-size`   | Value font size                      |
| `--origam-data-list__kv---value-line-height` | Value line height                    |
| `--origam-data-list__kv---gap-key-value`     | Column gap between key and value     |
| `--origam-data-list__kv---value-inline-gap`  | Gap between inline value items (chips, …) |
