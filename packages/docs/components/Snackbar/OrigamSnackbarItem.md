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

All five `ITypographyProps` props paint (origam#501):

- `fontSize` overrides the font-size of the entire item surface via
  `--origam-snackbar-item---font-size`. When unset, the SCSS default
  (`0.875rem`) applies.
- `lineHeight` and `letterSpacing` override the root's line-height / letter-
  spacing via `--origam-snackbar-item---line-height` /
  `--origam-snackbar-item---letter-spacing`, inherited by `__title` and
  `__message` normally (both are CSS-inherited properties). Unset, they fall
  back to the existing defaults — `1.4` for line-height, and the ambient
  inherited value for letter-spacing (there was no `letter-spacing` rule at
  all before this prop was wired, so `inherit` reproduces that exactly).
- `fontWeight` is **generic-first**: the root's
  `--origam-snackbar-item---font-weight` (only set when the prop is passed)
  overrides the BEM-child defaults that otherwise drive the title/message
  hierarchy (`__title` at `600`, `__message` at `400`) — same convention as
  the per-size override documented in `typography.composable.ts`. Passing
  `fontWeight` makes both the title and the message adopt that single
  weight; leaving it unset preserves the built-in hierarchy.
- `fontFamily` is intentionally **not** wired. This component has no
  font-family rule at all — it inherits the surrounding app's font — and
  origam#501 classifies `fontFamily` as global-by-default: a bare override
  here would have no named reason to diverge, unlike `OrigamCode` /
  `OrigamKbd` (monospace) or `OrigamBlockquote` (editorial serif).

> None of these four vars (`font-weight`, `line-height`, `letter-spacing` at
> the generic/root level) are backed by a themed default in
> `packages/ds/tokens/component/` — this component has no token file at all
> (tracked under origam#503, out of scope for this change). They resolve
> purely from the literal SCSS fallback unless a consumer passes the prop.
> The root `font-weight` channel additionally must never gain a themed
> default on its own: doing so would always resolve and silently collapse
> the title/message weight distinction, the same failure mode the Chip/Kbd
> per-size `font-size` fix avoided (see `typography.composable.ts`'s
> generic-first convention).

```vue
<template>
    <OrigamSnackbarItem
        intent="info"
        title="Large text"
        message="Body at xl scale, tracked out, single weight."
        font-size="xl"
        font-weight="bold"
        line-height="relaxed"
        letter-spacing="wide"
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
| `fontSize` | `TFontSize` | — | `--origam-snackbar-item---font-size` | Root reads this var directly. |
| `fontWeight` | `TFontWeight` | — | `--origam-snackbar-item---font-weight` | Generic-first override read by both `__title` and `__message`, ahead of their own namespaced defaults (`600` / `400`). |
| `lineHeight` | `TLineHeight` | — | `--origam-snackbar-item---line-height` | Root reads this var directly (default `1.4`). |
| `letterSpacing` | `TLetterSpacing` | — | `--origam-snackbar-item---letter-spacing` | Root reads this var directly (default `inherit`). |
| `fontFamily` | `TFontFamily` | — | — | **Not wired.** No font-family rule exists on this component; see the Typography section above. |

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
| `--origam-snackbar-item---font-weight` | Generic title+message weight override (unset by default — see Typography). |
| `--origam-snackbar-item---line-height` | Item line-height (default `1.4`). |
| `--origam-snackbar-item---letter-spacing` | Item letter-spacing (default `inherit`). |
| `--origam-snackbar-item---background-color` | Surface background. |
| `--origam-snackbar-item---border-color` | Surface border. |
| `--origam-snackbar-item---color` | Foreground / text colour. |
| `--origam-snackbar-item---box-shadow` | Drop shadow. |
| `--origam-snackbar-item---border-radius` | Corner radius. |
| `--origam-snackbar-item__title---font-weight` | Title weight fallback (default `600`, overridden by the generic var above when set). |
| `--origam-snackbar-item__message---font-weight` | Message weight fallback (default `400`, overridden by the generic var above when set). |
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
