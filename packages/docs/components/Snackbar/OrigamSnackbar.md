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

| CSS variable | Description |
|---|---|
| `--origam-snackbar---z-index` | Z-index. |
| `--origam-snackbar---margin` | Outer margin. |
| `--origam-snackbar__wrapper---min-height` | Minimum wrapper height. |
| `--origam-snackbar__wrapper---min-width` | Minimum wrapper width. |
| `--origam-snackbar__wrapper---max-width` | Maximum wrapper width. |
| `--origam-snackbar__content---font-size` | Text font size. |
| `--origam-snackbar__content---padding-block` | Text vertical padding. |
| `--origam-snackbar__content---padding-inline` | Text horizontal padding. |
| `--origam-snackbar__actions---margin-inline-end` | Actions trailing margin. |

## Accessibility

- The content area has `role="status"` and `aria-live="polite"` for screen-reader announcements.
- Swipe up to dismiss on touch devices.
- Hovering pauses the auto-dismiss timer.
