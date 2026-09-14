# OrigamMessages

`<OrigamMessages>` renders a list of validation or hint messages below a form
field. Each message is wrapped in an `origam-messages__message` div and the
container has `aria-live="polite"` + `role="status"` for screen-reader support.

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

## Color

```vue
<template>
    <OrigamMessages color="danger" :messages="['Invalid value.']" />
</template>
```

## Elevation

`elevation` (from `IElevationProps`) drops a shadow under the message
block. It accepts the origam rungs (`none` · `xs` · `sm` · `md` · `lg` ·
`xl` · `2xl` · `3xl`), a Material level (`0`…`24`, mapped onto the same
ladder), or a free-form `box-shadow` string passed through verbatim.

The component emits both channels: the `origam-messages--elevated` state
class plus the `.origam--shadow-{rung}` utility when the rung has one,
and the `box-shadow: var(--origam-shadow---{rung})` declaration that
actually paints.

```vue
<template>
    <OrigamMessages elevation="md" :messages="['Saved.']" />
    <OrigamMessages :elevation="8" :messages="['Saved.']" />
    <OrigamMessages elevation="0 4px 12px rgba(0,0,0,.24)" :messages="['Saved.']" />
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

## Caveats

- **`active` has no effect** (#550, critère C1). Visibility of the transition
  is driven entirely by `messages` being non-empty, never by this prop —
  wiring a fake "run the transition on mount" behaviour was rejected the same
  way it was on the Chart family (#426/#545 decision): neither inventing a
  behaviour nor silently removing a prop a consumer's type may already
  reference was on the table. Passing `active` (any value, including
  `false`) logs `[origam] <OrigamMessages> prop "active" has no effect on
  this component: visibility is driven by \`messages\` being non-empty,
  never by this prop.` once to the console in dev builds (silent in
  production).
