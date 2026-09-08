# OrigamSnackbar

`<OrigamSnackbar>` is a **toast notification** that slides into view for a
configurable timeout and then auto-dismisses. It supports status icons, a
progress timer bar, multi-line and vertical layouts, and custom action slots.

## Basic usage

```vue
<template>
    <OrigamBtn @click="open = true">Show snackbar</OrigamBtn>
    <OrigamSnackbar v-model="open" text="File saved successfully." />
</template>
```

## Location

Position the snackbar in any corner.

```vue
<template>
    <OrigamSnackbar v-model="open" location="top right" text="Top right!" />
</template>
```

## Timeout

Default 5 000 ms. Pass `-1` to keep it open indefinitely.

```vue
<template>
    <OrigamSnackbar v-model="open" :timeout="8000" text="Long message." />
</template>
```

## Timer bar

Show a linear progress bar counting down.

```vue
<template>
    <OrigamSnackbar v-model="open" timer text="5 seconds…" />
</template>
```

## Multi-line

```vue
<template>
    <OrigamSnackbar v-model="open" multi-line text="Very long notification text that wraps." />
</template>
```

## Vertical layout

Stacks the action below the text.

```vue
<template>
    <OrigamSnackbar v-model="open" vertical text="Choose an action.">
        <template #action="{ isActive }">
            <OrigamBtn @click="isActive.value = false">Dismiss</OrigamBtn>
        </template>
    </OrigamSnackbar>
</template>
```

## Status

```vue
<template>
    <OrigamSnackbar v-model="open" status="success" text="Done!" />
    <OrigamSnackbar v-model="open" status="danger" text="Error occurred." />
</template>
```

## Action slot

```vue
<template>
    <OrigamSnackbar v-model="open" text="Item deleted.">
        <template #action="{ isActive }">
            <OrigamBtn @click="undo(); isActive.value = false">Undo</OrigamBtn>
        </template>
    </OrigamSnackbar>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `prepend` | — | Icon / avatar before the text. Defaults to status icon. |
| `text` | — | Text area override. |
| `default` | — | Additional content after the text. |
| `action` | `{ isActive }` | Action button area. `isActive.value` closes the snackbar. |

## Events

| Name | Payload | When |
|---|---|---|
| `update:modelValue` | `boolean` | Snackbar opens or closes. |

## Design tokens

`<OrigamSnackbar>` owns the overlay shell, the wrapper box and the timer bar.
Everything inside the box — text, icon, actions, their font size, padding and
colours — is rendered by [`OrigamSnackbarItem`](/components/Snackbar/OrigamSnackbarItem) and
themed through the `--origam-snackbar-item---*` family documented there.

### Read by `OrigamSnackbar.vue`

| CSS variable | Description |
|---|---|
| `--origam-snackbar---z-index` | Z-index. |
| `--origam-snackbar---margin` | Outer margin. |
| `--origam-snackbar--absolute---z-index` | Z-index when `absolute` is set. |
| `--origam-snackbar__wrapper---min-height` | Minimum wrapper height. |
| `--origam-snackbar__wrapper---min-width` | Minimum wrapper width. |
| `--origam-snackbar__wrapper---max-width` | Maximum wrapper width. |
| `--origam-snackbar__wrapper---border-radius` | Wrapper corner radius. |
| `--origam-snackbar__wrapper---border-width` | Wrapper border width. |
| `--origam-snackbar__wrapper---border-style` | Wrapper border style. |
| `--origam-snackbar--multi-line---wrapper-min-height` | Minimum wrapper height in `multi-line` mode. |
| `--origam-snackbar--vertical---actions-margin-bottom` | Space under the actions row in `vertical` mode. |
| `--origam-snackbar--{status}---border` | Per-status border colour override (`success`, `info`, `warning`, `danger`); falls back to `--origam-color__feedback--{status}---border`. |
| `--origam-snackbar__timer---height` | Height of the timer bar. |
| `--origam-snackbar__timer---duration` | Timer animation duration. Set inline from `timeout` — override it in CSS and the inline value still wins. |
| `--origam-snackbar__timer-bar---background-color` | Timer-bar fill. |
| `--origam-snackbar__timer-bar---opacity` | Timer-bar opacity (default intent). |
| `--origam-snackbar__timer-bar---opacity-status` | Timer-bar opacity when a status is set. |

### Declared but not read

`--origam-snackbar__content---font-size`, `-font-weight`, `-letter-spacing`,
`-line-height`, `-padding-block`, `-padding-inline` and
`--origam-snackbar__actions---margin-inline-end` exist in `light.css` /
`dark.css` / `tokens.type.ts` but **no component reads them**. They predate
the extraction of the content chrome into `OrigamSnackbarItem`; overriding
one has no effect. Use the `--origam-snackbar-item---*` equivalents instead
(`---font-size`, `---padding`, `---gap`).

## Accessibility

- The content area has `role="status"` and `aria-live="polite"` for screen-reader announcements.
- Swipe up to dismiss on touch devices.
- Hovering pauses the auto-dismiss timer.
