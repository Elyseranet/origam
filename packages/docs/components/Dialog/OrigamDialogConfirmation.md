# OrigamDialogConfirmation

⛔ **Written 2026-08-31 (issue #419)** — this file used to be a literal
stub ("This file is a stub. The component's prop surface is exercised in
stories/…"). `<OrigamDialogConfirmation>` wraps `<OrigamDialog>` with a
built-in Cancel/Validate footer and a validate-after-read accessibility
gate; it is not exercised only by its story, it has a real, documented
API below.

## Basic usage

```vue
<template>
    <OrigamDialogConfirmation v-model="open" title="Delete this item?">
        <template #activator="{ props: a }">
            <OrigamBtn v-bind="a">Delete</OrigamBtn>
        </template>
        <template #content>This action cannot be undone.</template>
    </OrigamDialogConfirmation>
</template>
```

## Props

`IDialogConfirmationProps extends IDialogProps` — every prop
`<OrigamDialog>` accepts (`fullscreen`, `scrollable`, `retainFocus`,
`persistent`, `size`, `status`, `color`/`bgColor`, `rounded`, `border*`,
`title`/`subtitle`/`text`/`image`, `width`/`height`, `closeLabel`, …, see
the `OrigamDialog` Props table) is forwarded to
the inner `<OrigamDialog>` via `filterProps`, plus its own props:

| Prop | Type | Default | Description |
|---|---|---|---|
| `cancellable` | `boolean` | `true` | Shows the Cancel button in the built-in footer. When `false`, only Validate is rendered. |
| `cancelTextKey` | `string` | `origam.dialog.confirmation.cancel` | **i18n key** for the Cancel label — not the final string. The component translates it. |
| `validateTextKey` | `string` | `origam.dialog.confirmation.validate` | **i18n key** for the Validate label. Same rule. |

> ⛔ **Changed.** Both labels used to be hardcoded in the template
> (`text="Cancel"`, `text="Validate"`) with no prop to change them — the
> interface exposed only `cancellable`. A non-English consumer could neither
> translate nor rename them except by replacing the **whole** footer through
> the `#footer` slot. On a confirmation dialog — the one asking the user to
> approve an action — that is the worst possible place for it.
>
> ⚠️ It survived because **no tool could see it**: the C8 detector of the
> inspection grid only scans `aria-label`, `title`, `placeholder` and `alt`,
> so a string passed as a *display prop* escapes it entirely. Three such cases
> existed in the whole repo; this is two of them.

## Emits

| Name | Payload | When |
|---|---|---|
| `validate` | `MouseEvent \| undefined` | The built-in Validate button is clicked. Closes the dialog (`isActive.value = false`) immediately after. |
| `cancel` | `MouseEvent \| undefined` | The built-in Cancel button is clicked (only reachable when `cancellable`). Closes the dialog immediately after. |
| `update:modelValue` | `boolean` | Forwarded from the inner `<OrigamDialog>` — open/close state. |

## Slots

Same chrome slots as `<OrigamDialog>` (`activator`, `default`, `loader`,
`header`, `header-prepend`, `header-title`, `header-subtitle`,
`header-content`, `header-append`, `asset`, `text`, `content`), all
forwarded as-is, plus:

| Slot | Description |
|---|---|
| `footer` | Overrides the built-in Cancel/Validate row entirely. When omitted, the default footer renders a Cancel button (if `cancellable`) and a Validate button that stays `disabled` until the validate-after-read gate opens (see below). |

`default` and `header-title` are forwarded **unscoped** here
(`<slot name="…"/>`, no `v-bind`), unlike `<OrigamDialog>`'s own scoped
versions of those two slots.

## Validate-after-read gate

The built-in Validate button starts `disabled` and only becomes
clickable once the inner `<OrigamDialog>` fires its `isRead` event —
i.e. once the dialog's scrollable content has been scrolled into view at
least once. This is the same "mark as read" accessibility pattern
`<OrigamDialog>` documents for terms-of-service / consent content: a
consumer cannot confirm a destructive or binding action without the
content actually having been shown. There is no prop to opt out of this
gate; a `footer` slot override bypasses it entirely (the override owns
its own button state).

## Accessibility

Inherits everything `<OrigamDialog>` provides (`role="dialog"`,
`aria-modal`, focus trap via `retainFocus`, `ESC` to close non-persistent
dialogs, `closeLabel` locale key on the built-in close button) — see
`OrigamDialog`'s Accessibility section (voir la doc `OrigamDialog`).
The Cancel/Validate footer buttons use plain `text` labels (not yet
routed through the DS `t()` locale mechanism — pass a `footer` slot
override if translated button labels are required today).

## Related

- `OrigamDialog` — the base modal this component wraps.
