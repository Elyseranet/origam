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

> `fontFamily` is part of `ITypographyProps` but is not read by the `__title`
> SCSS — it emits its var but has no visual effect on this component.

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
