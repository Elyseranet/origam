# OrigamMessages

`<OrigamMessages>` renders a list of validation or hint messages below a form
field. Each message is wrapped in an `origam-messages__message` div and the
container has `aria-live="polite"` + `role="alert"` for screen-reader support.

Messages animate in/out with a slide-Y transition by default.

## Basic usage

```vue
<template>
    <OrigamMessages :messages="['This field is required.']" />
</template>
```

## Multiple messages

`messages` accepts a single string or an array of strings.

```vue
<template>
    <OrigamMessages :messages="['Too short.', 'Must contain a number.']" />
</template>
```

## Custom slot

Use the default slot to customise how each message is rendered.

```vue
<template>
    <OrigamMessages :messages="errors">
        <template #default="{ message }">
            <span class="my-error">{{ message }}</span>
        </template>
    </OrigamMessages>
</template>
```

## Active prop

`active` controls whether the transition runs on mount. When `false` (SSR default)
the messages appear without animation on first render.

```vue
<template>
    <OrigamMessages active :messages="hints" />
</template>
```

## Color

```vue
<template>
    <OrigamMessages color="danger" :messages="['Invalid value.']" />
</template>
```

## Slots

| Slot      | Scope              | Description                              |
|-----------|--------------------|------------------------------------------|
| `default` | `{ message: string }` | Custom render for each message string |

## Props — Typography

These props override the matching CSS variable via an inline custom property.
Each prop targets the surface that reads the corresponding token.

| Prop | Type | Values | CSS variable overridden | Surface |
|---|---|---|---|---|
| `fontSize` | `TFontSize` | `xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl` | `--origam-messages---font-size` | container root |
| `lineHeight` | `TLineHeight` | `none · tight · snug · normal · relaxed · loose` | `--origam-messages__message---line-height` | each `__message` child |

## Tokens

| Variable                                        | Default       | Used for                    |
|-------------------------------------------------|---------------|-----------------------------|
| `--origam-messages---color`                     | `currentColor`| message text colour         |
| `--origam-messages---font-size`                 | `12px`        | message font size           |
| `--origam-messages---min-height`                | `14px`        | container min-height        |
| `--origam-messages---min-width`                 | `1px`         | container min-width         |
| `--origam-messages---opacity`                   | `0.87`        | container opacity           |
| `--origam-messages---flex`                      | `1 1 auto`    | flex grow/shrink            |
| `--origam-messages__message---line-height`      | `12px`        | message line height         |
| `--origam-messages__message---transition-duration` | `0.15s`    | slide animation speed       |
