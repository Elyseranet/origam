# OrigamAlert

`<OrigamAlert>` is a contextual feedback banner. It renders as a `<div>` with
`role="alert"` and supports status icons, a title, body text, a close button,
elevation, hover effects, and all colour/density/rounded mixins.

The component is visible only when `modelValue` is `true` (default). The close
button sets it to `false` and emits `click:close`.

## Basic usage

```vue
<template>
    <OrigamAlert text="Something went wrong." />
</template>
```

## Status / intent

Use `status` for semantic colouring with a matching icon.

```vue
<template>
    <OrigamAlert status="success" title="Done!"    text="Your file was saved."       />
    <OrigamAlert status="info"    title="Heads up"  text="A new version is available." />
    <OrigamAlert status="warning" title="Warning"   text="Storage almost full."        />
    <OrigamAlert status="error"   title="Error"     text="Connection timed out."        />
</template>
```

## Closable

```vue
<template>
    <OrigamAlert v-model="visible" closable text="Dismiss me." />
</template>

<script setup lang="ts">
import { ref } from 'vue'
const visible = ref(true)
</script>
```

## Title

```vue
<template>
    <OrigamAlert title="Custom title" text="Alert body text." />
</template>
```

## Color

```vue
<template>
    <OrigamAlert color="primary" text="Primary alert" />
</template>
```

## Density

```vue
<template>
    <OrigamAlert density="compact"     text="Compact"     />
    <OrigamAlert density="default"     text="Default"     />
    <OrigamAlert density="comfortable" text="Comfortable" />
</template>
```

## Typography (title surface)

`fontSize`, `fontWeight`, `letterSpacing`, and `lineHeight` override the
corresponding CSS variables on the `__title` BEM child (`<span class="origam-alert__title">`).
The styles are bound inline on that element via `useTypography(props, 'alert__title')`.

> `fontFamily` is not part of this component's typed surface — `IAlertProps`
> narrows `ITypographyProps` to the props the `__title` SCSS actually reads
> (issue #501). `fontFamily` is a project-level setting (configured once on
> `OrigamApp`), not a per-instance override.

```vue
<template>
    <OrigamAlert
        title="Bold large title"
        text="Body text remains at theme size."
        font-size="xl"
        font-weight="bold"
        letter-spacing="wide"
        line-height="loose"
    />
</template>
```

### Typography props

| Prop | Type | CSS variable set | Effect |
|---|---|---|---|
| `fontSize` | `TFontSize` | `--origam-alert__title---font-size` | Title font-size token. |
| `fontWeight` | `TFontWeight` | `--origam-alert__title---font-weight` | Title font-weight token. |
| `letterSpacing` | `TLetterSpacing` | `--origam-alert__title---letter-spacing` | Title letter-spacing token. |
| `lineHeight` | `TLineHeight` | `--origam-alert__title---line-height` | Title line-height token. |

## Props

`IAlertProps` declares six props of its own and inherits the rest from the
`Commons` interfaces. The tables below are grouped the same way the story's
`#controls` panel is, so a control you see in Histoire maps to a row here.

### Content & behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `boolean` | `true` | Visibility. The close button sets it to `false`. |
| `title` | `string` | — | Title rendered in the `__title` BEM child. Overridden by the `title` slot. |
| `text` | `string` | — | Body text. Overridden by the `text` slot. |
| `closable` | `boolean` | `false` | Renders the close button. |
| `closeIcon` | `TIcon` | `MDI_ICONS.CLOSE` | Icon of the close button. |
| `closeLabel` | `string` | `'origam.close'` | Translation **key** resolved through `useLocale()` for the close button's `aria-label`. Pass a key, not a literal. |

### Status & icons

| Prop | Type | Default | Description |
|---|---|---|---|
| `status` | `TStatus` | — | Semantic intent (`info`, `success`, `warning`, `error`). Paints the surface and selects the default icon. |
| `statusIconPosition` | `TStatusPosition` | — | Which adjacent slot the status icon occupies. |
| `icon` | `TIcon` | — | Explicit icon, overriding the one implied by `status`. |
| `prependIcon` | `TIcon` | — | Icon in the prepend (left) column. |
| `appendIcon` | `TIcon` | — | Icon in the append (right) column. |
| `prependAvatar` | `string` | — | Avatar image URL in the prepend column. |
| `appendAvatar` | `string` | — | Avatar image URL in the append column. |

### Colour

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | — | Foreground / accent intent. |
| `bgColor` | `TColor` | — | Background intent. |

> Because Alert binds `useActive(props, 'modelValue')`, `useColorEffect` returns
> no utility class while the alert is visible — the surface is painted by the
> inline `colorStyles`. Assert on `getComputedStyle`, not on `.origam--color-*`.

### Border

| Prop | Type | Default | Description |
|---|---|---|---|
| `border` | `boolean \| number \| string \| TDirectionBoth \| Array<TDirectionBoth>` | — | Border shorthand. |
| `borderTop` / `borderRight` / `borderBottom` / `borderLeft` | `boolean \| number \| string` | — | Per-side width. |
| `borderBlock` / `borderInline` | `boolean \| number \| string` | — | Logical axis width. |
| `borderColor` | `string` | — | Border colour for every side. |
| `borderTopColor` / `borderRightColor` / `borderBottomColor` / `borderLeftColor` | `TColor` | — | Per-side colour. |
| `borderStyle` | `string` | — | `solid`, `dashed`, … |

### Rounded

| Prop | Type | Default | Description |
|---|---|---|---|
| `rounded` | `boolean \| number \| string \| TRounded \| null` | — | Radius shorthand. |
| `roundedTopLeft` / `roundedTopRight` / `roundedBottomLeft` / `roundedBottomRight` | `boolean \| number \| string` | — | Per-corner radius. |

### Spacing

| Prop | Type | Default | Description |
|---|---|---|---|
| `padding` | `boolean \| number \| string` | — | Padding shorthand. |
| `paddingTop` / `paddingRight` / `paddingBottom` / `paddingLeft` | `boolean \| number \| string` | — | Per-side padding. |
| `paddingBlock` / `paddingInline` | `boolean \| number \| string` | — | Logical axis padding. |
| `margin` | `boolean \| number \| string` | — | Margin shorthand. |
| `marginTop` / `marginRight` / `marginBottom` / `marginLeft` | `boolean \| number \| string` | — | Per-side margin. |
| `marginBlock` / `marginInline` | `boolean \| number \| string` | — | Logical axis margin. |

### Dimension

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` / `height` | `number \| string` | — | Fixed size. Bare numbers become `px`. |
| `minWidth` / `minHeight` | `number \| string` | — | Lower bound. |
| `maxWidth` / `maxHeight` | `number \| string` | — | Upper bound. |

### Layout & elevation

| Prop | Type | Default | Description |
|---|---|---|---|
| `density` | `TDensity` | `'default'` | `compact` / `default` / `comfortable`. |
| `elevation` | `TElevation` | — | Shadow rung (`xs`…`xl`). Never hardcode a shadow per instance. |
| `position` | `TPosition` | — | CSS positioning scheme. |
| `top` / `right` / `bottom` / `left` | `number \| string` | — | Offsets, applied when `position` is set. |
| `location` | `TAnchor` | — | Anchor shorthand resolved by `useLocation()`. |
| `hover` | `boolean \| IHoverState` | `true` | Enables the hover surface, or configures it explicitly. |

### Typography

`fontSize`, `fontWeight`, `letterSpacing` and `lineHeight` target the `__title`
BEM child — see [Typography props](#typography-props) above. `fontFamily` is
not part of this component's props (project-level setting, see issue #501).

### Identity

| Prop | Type | Default | Description |
|---|---|---|---|
| `tag` | `string` | `'div'` | Root element. |
| `id` | `string` | — | Root `id`. |
| `class` | `string \| Array<string> \| object` | — | Merged into the root class list. |
| `style` | `string \| Array<string> \| object \| StyleValue` | — | Merged into the root style. |

## Emits

| Event              | Payload      | Description                                     |
|--------------------|--------------|-------------------------------------------------|
| `click:close`      | `MouseEvent` | Close button was clicked                        |
| `update:modelValue`| `boolean`    | Alert visibility changed                        |
| `update:hover`     | `boolean`    | Hover state changed                             |

## Slots

| Slot      | Description                                                  |
|-----------|--------------------------------------------------------------|
| `default` | Additional content rendered below title + text               |
| `prepend` | Custom content in the prepend (left) column                  |
| `append`  | Custom content in the append (right) column                  |
| `title`   | Override the title span                                      |
| `text`    | Override the body text                                       |
| `close`   | Override the close button entirely                           |
| `wrapper` | Full layout override (replaces all inner structure)          |

## Tokens

| Variable                                | Default     | Used for                    |
|-----------------------------------------|-------------|-----------------------------|
| `--origam-alert---background-color`     | (unset)     | alert fill                  |
| `--origam-alert---color`                | (unset)     | alert text colour           |
| `--origam-alert---border-radius`        | (unset)     | corner rounding             |
| `--origam-alert---border-width`         | (unset)     | border thickness            |
| `--origam-alert---density`              | `0px`       | padding density delta       |
| `--origam-alert---padding-block-start`  | (unset)     | top padding                 |
| `--origam-alert---padding-block-end`    | (unset)     | bottom padding              |
| `--origam-alert---padding-inline-start` | (unset)     | left padding                |
| `--origam-alert---padding-inline-end`   | (unset)     | right padding               |
| `--origam-alert__title---font-size`     | (unset)     | title font size             |
| `--origam-alert__title---font-weight`   | (unset)     | title font weight           |
| `--origam-alert--warning---bg`          | orange      | warning background          |
| `--origam-alert--success---bg`          | green       | success background          |
| `--origam-alert--info---bg`             | blue        | info background             |
| `--origam-alert--danger---bg`           | red         | error/danger background     |
