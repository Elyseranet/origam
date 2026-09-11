# OrigamListSubheader

`<OrigamListSubheader>` is a labelling element placed inside an `OrigamList` to
visually separate groups of list items. It renders as a `<div>` by default and
supports inset, sticky, border, spacing, color and typography props.

## Basic usage

```vue
<template>
    <OrigamList>
        <OrigamListSubheader title="Section A" />
        <OrigamListItem title="Item one" />
        <OrigamListItem title="Item two" />
    </OrigamList>
</template>
```

## Inset

`inset` adds left padding so the subheader text aligns with inset list items.

```vue
<template>
    <OrigamList>
        <OrigamListSubheader inset title="Inset section" />
    </OrigamList>
</template>
```

## Sticky

`sticky` keeps the subheader visible at the top of a scrollable list.

```vue
<template>
    <OrigamList style="max-height: 200px; overflow-y: auto;">
        <OrigamListSubheader sticky title="Sticky header" />
        <OrigamListItem v-for="n in 10" :key="n" :title="`Item ${n}`" />
    </OrigamList>
</template>
```

## Typography

```vue
<template>
    <OrigamListSubheader
        title="Styled header"
        font-size="sm"
        font-weight="semibold"
        line-height="normal"
    />
</template>
```

## Props

| Prop      | Type      | Default | Description                          |
|-----------|-----------|---------|--------------------------------------|
| `title`   | `string`  | —       | Subheader text (also available as the default slot) |
| `inset`   | `boolean` | `false` | Adds left-indent padding             |
| `sticky`  | `boolean` | `false` | Sticky positioning within the list   |
| `tag`     | `string`  | `'div'` | Root HTML element                    |

### Typography props

| Prop         | Type           | Default | Description                                                               |
|--------------|----------------|---------|---------------------------------------------------------------------------|
| `fontSize`   | `TFontSize`    | —       | Font-size token (xs · sm · md · lg · xl · 2xl · …). Sets `--origam-list-subheader---font-size`. When unset the theme default (0.875rem) applies. |
| `fontWeight` | `TFontWeight`  | —       | Font-weight token (regular · medium · semibold · bold · …). Sets `--origam-list-subheader---font-weight`. When unset the theme default (400) applies. |
| `lineHeight` | `TLineHeight`  | —       | Line-height token (none · tight · snug · normal · relaxed · loose). Sets `--origam-list-subheader---line-height`. When unset the theme default (1.375rem) applies. |

## Slots

| Slot      | Scope           | Description                     |
|-----------|-----------------|---------------------------------|
| `default` | `{ title }`     | Custom subheader content        |

## Tokens

| Variable                                          | Default                          | Used for                   |
|---------------------------------------------------|----------------------------------|----------------------------|
| `--origam-list-subheader---color`                 | `--origam-color__text---secondary` | label text color         |
| `--origam-list-subheader---font-size`             | `0.875rem`                       | label font size            |
| `--origam-list-subheader---font-weight`           | `400`                            | label font weight          |
| `--origam-list-subheader---line-height`           | `1.375rem`                       | label line height          |
| `--origam-list-subheader---min-height`            | `40px`                           | minimum row height         |
| `--origam-list-subheader---padding-inline-end`    | `16px`                           | right padding              |
| `--origam-list-subheader---inset-indent-padding`  | `32px`                           | inset left indent          |
