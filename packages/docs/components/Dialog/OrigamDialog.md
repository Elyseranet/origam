# OrigamDialog

`<OrigamDialog>` is a **modal dialog** built on `OrigamOverlay` and `OrigamCard`. It
manages focus trapping, ARIA attributes, scroll blocking, and keyboard dismissal
(`ESC`). Use it for confirmation dialogs, forms, and informational messages.

## Basic usage

```vue
<template>
    <OrigamDialog v-model="open" title="Hello">
        <template #activator="{ props: a }">
            <OrigamBtn v-bind="a">Open</OrigamBtn>
        </template>
        <template #content>Dialog body text.</template>
        <template #footer>
            <OrigamBtn @click="open = false">Close</OrigamBtn>
        </template>
    </OrigamDialog>
</template>
```

## Fullscreen

```vue
<template>
    <OrigamDialog v-model="open" fullscreen title="Full screen dialog">…</OrigamDialog>
</template>
```

## Scrollable

Enables scrolling inside the content area when it overflows.

```vue
<template>
    <OrigamDialog v-model="open" scrollable title="Scrollable">…</OrigamDialog>
</template>
```

## Status / icon

Built-in status icons via the `status` prop.

```vue
<template>
    <OrigamDialog v-model="open" status="success" title="Saved!" />
</template>
```

## Persistent

```vue
<template>
    <OrigamDialog v-model="open" persistent title="Must confirm">…</OrigamDialog>
</template>
```

## Retain focus

Keep focus inside the dialog. Enabled by default (`retainFocus`).

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `activator` | `{ props }` | Element that opens the dialog. Spread `props`. |
| `default` | `{ isActive }` | Full content override (bypasses the inner card). |
| `loader` | — | Custom loader inside the card. |
| `header` | — | Replaces the card header. |
| `header-prepend` | — | Icon / avatar in the header. |
| `header-title` | — | Custom title markup. |
| `header-subtitle` | — | Custom subtitle markup. |
| `header-content` | — | Extra header body. |
| `header-append` | — | Replaces the built-in close button. |
| `asset` | — | Image / media banner. |
| `text` | — | Card text region. |
| `content` | — | Main scrollable body. |
| `footer` | — | Action row at the bottom. |

## Events

| Name | Payload | When |
|---|---|---|
| `update:modelValue` | `boolean` | Open / close. |
| `isRead` | `true` | Bottom of content scrolled into view (accessibility gate). |
| `click:outside` | `MouseEvent` | Click landed outside the content (non-persistent only). |

## Design tokens

| CSS variable | Description |
|---|---|
| `--origam-dialog---max-height` | Maximum height of the content container. |
| `--origam-dialog---max-width` | Maximum width of the content container. |
| `--origam-dialog---border-radius` | Dialog border radius. |
| `--origam-dialog---box-shadow` | Dialog shadow. |
| `--origam-dialog__fullscreen---max-width` | Full-screen override. |
| `--origam-dialog__fullscreen---max-height` | Full-screen override. |

## Accessibility

- `role="dialog"` and `aria-modal="true"` are set automatically.
- `aria-haspopup="dialog"` and `aria-expanded` are applied to the activator.
- Focus moves into the dialog on open and returns to the activator on close.
- `ESC` closes non-persistent dialogs.
- `retainFocus` (default `true`) loops focus inside the dialog with Tab / Shift+Tab.
