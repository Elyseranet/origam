# OrigamSnackbarItem

`<OrigamSnackbarItem>` is the pure visual layer of a single toast notification.
It owns intent theming (surface colour, border, icon tinting), icon + title +
message layout, action buttons, dismiss button, and ARIA semantics. Positioning,
transitions, overlay, and auto-dismiss logic belong to the parent
(`OrigamSnackbar` or `OrigamSnackbarGroup`).

Both `OrigamSnackbar` and `OrigamSnackbarGroup` consume this component so all
visual intent and layout logic lives in one place.

## Basic usage

```vue
<template>
    <OrigamSnackbarItem
        intent="success"
        title="Saved"
        message="Your changes have been saved."
    />
</template>
```

## Intent

`intent` drives the surface colour and icon via the
`--origam-color__feedback--{intent}---*` semantic tokens.

```vue
<template>
    <OrigamSnackbarItem intent="info"    title="Info"    message="For your information." />
    <OrigamSnackbarItem intent="success" title="Success" message="Operation completed."  />
    <OrigamSnackbarItem intent="warning" title="Warning" message="Please review."        />
    <OrigamSnackbarItem intent="danger"  title="Error"   message="Something went wrong." />
</template>
```

## Actions

Pass an `actions` array to render inline action buttons after the text block.
Each action fires its `handler()` on click.

```vue
<template>
    <OrigamSnackbarItem
        intent="warning"
        title="Item deleted"
        message="A row was removed from your list."
        :actions="[{ label: 'Undo', intent: 'primary', handler: () => undo() }]"
        @action="onAction"
    />
</template>
```

## Dismiss

The dismiss (✕) button is shown by default. Pass `dismissible=false` to hide it.

```vue
<template>
    <OrigamSnackbarItem message="Cannot be dismissed." :dismissible="false" />
</template>
```

## Typography

`fontSize` overrides the font-size of the entire item surface via
`--origam-snackbar-item---font-size`. When unset the SCSS default (`0.875rem`)
applies.

> Note: `fontWeight` in `ITypographyProps` is typed and emits its CSS var, but
> the SCSS scopes font-weight per BEM child (`__title` at `600`,
> `__message` at `400`). A single `useTypography('snackbar-item')` call cannot
> target those sub-surfaces; per-child control requires dedicated story props.
> In this release only `fontSize` is exposed in the story controls.

```vue
<template>
    <OrigamSnackbarItem
        intent="info"
        title="Large text"
        message="Body at xl scale."
        font-size="xl"
    />
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Extra content appended after the message block. |
| `prepend` | — | Custom icon replacing the default intent icon. |
| `title` | — | Custom title rendering. |
| `message` | — | Custom message rendering. |
| `actions` | — | Custom action area replacing the `actions` prop. |

## Events

| Event | Payload | Description |
|---|---|---|
| `dismiss` | — | Fired when the dismiss (✕) button is clicked. |
| `action` | `ISnackbarGroupItemAction` | Fired when an action button is clicked. |

## Props (interface)

```ts
interface ISnackbarItemProps extends ICommonsComponentProps, ITypographyProps {
    intent?: TIntent
    title?: string
    message?: string
    icon?: TIcon | false
    actions?: ReadonlyArray<ISnackbarGroupItemAction>
    dismissible?: boolean
    dismissLabel?: string
    role?: 'status' | 'alert'
    ariaLive?: 'polite' | 'assertive'
    dataCy?: string
}
```

### Typography props

| Prop | Type | Default | Effect | Note |
|---|---|---|---|---|
| `fontSize` | `TFontSize` | — | `--origam-snackbar-item---font-size` | Real visual effect — root reads this var. |
| `fontWeight` | `TFontWeight` | — | `--origam-snackbar-item---font-weight` | Emitted but **not read** at root level; `__title`/`__message` use their own namespaced vars. |
| `lineHeight` | `TLineHeight` | — | `--origam-snackbar-item---line-height` | Emitted but not read — root `line-height` is hardcoded `1.4`. |
| `letterSpacing` | `TLetterSpacing` | — | `--origam-snackbar-item---letter-spacing` | Emitted but not read — no `letter-spacing` SCSS rule on the item. |

## Anatomy

```html
<div class="origam-snackbar-item origam-snackbar-item--intent-{intent}">
    <div class="origam-snackbar-item__content">
        <div class="origam-snackbar-item__prepend"><!-- icon --></div>
        <div class="origam-snackbar-item__text">
            <div class="origam-snackbar-item__title"><!-- title --></div>
            <div class="origam-snackbar-item__message"><!-- message --></div>
        </div>
    </div>
    <div class="origam-snackbar-item__actions"><!-- action buttons --></div>
    <!-- dismiss button -->
</div>
```

## Design tokens consumed

| CSS variable | Purpose |
|---|---|
| `--origam-snackbar-item---font-size` | Item font-size (default `0.875rem`). |
| `--origam-snackbar-item---background-color` | Surface background. |
| `--origam-snackbar-item---border-color` | Surface border. |
| `--origam-snackbar-item---color` | Foreground / text colour. |
| `--origam-snackbar-item---box-shadow` | Drop shadow. |
| `--origam-snackbar-item---border-radius` | Corner radius. |
| `--origam-snackbar-item__title---font-weight` | Title weight (default `600`). |
| `--origam-snackbar-item__message---font-weight` | Message weight (default `400`). |
| `--origam-color__feedback--{intent}---bgSubtle` | Per-intent background. |
| `--origam-color__feedback--{intent}---border` | Per-intent border. |
| `--origam-color__feedback--{intent}---fgSubtle` | Per-intent foreground. |

## Accessibility

- `role` defaults to `'status'` for neutral/info/success intents and `'alert'`
  for `warning`/`danger` — set explicitly to override.
- `aria-live` defaults to `'polite'` / `'assertive'` following the same logic.
- `aria-atomic="true"` is always present.
- Provide a localised `dismissLabel` for the dismiss button when the default
  "Dismiss notification" text does not suit the language.

## Related

- `OrigamSnackbar` — single-item managed toast with positioning and auto-dismiss.
- `OrigamSnackbarGroup` — teleported stack of `OrigamSnackbarItem`s.
