# OrigamFileField

`<OrigamFileField>` is a file input that supports single and multiple selection, chip display, drag-and-drop mode, file size display, and download/remove actions.

## Basic usage

```vue
<template>
    <OrigamFileField v-model="files" label="Upload" />
</template>

<script setup>
import { ref } from 'vue'
const files = ref(null)
</script>
```

## Multiple files and chips

```vue
<template>
    <OrigamFileField v-model="files" multiple chips show-size />
</template>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `multiple` | `boolean` | `false` | Allow multiple file selection |
| `chips` | `boolean` | `false` | Display files as chips |
| `showSize` | `TFileSize` | `false` | Show file size next to name |
| `chipProps` | `IChipProps` | `undefined` | Props forwarded to chip elements |
| `divider` | `string` | `','` | Separator between file names in text mode |

## Drag-and-drop mode

When `dragndrop` is set, the field renders as a dropzone instead of a standard field input.

```vue
<template>
    <OrigamFileField v-model="files" dragndrop multiple />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `dragndrop` | `boolean` | Enable drag-and-drop dropzone mode |
| `dragndropIcon` | `string` | Icon shown in the dropzone |
| `dropzoneTitle` | `string` | i18n key for the dropzone title |
| `dropzoneSubtitle` | `string` | i18n key for the dropzone subtitle |

## File actions

```vue
<template>
    <OrigamFileField v-model="files" downloadable :progress="[50, 100]" />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `downloadable` | `boolean` | Show a download button per file |
| `progress` | `number[]` | Upload progress (0–100) per file index |
| `fileIcon` | `string` | Icon for generic files |
| `removeIcon` | `string` | Remove button icon |
| `downloadIcon` | `string` | Download button icon |

## Validation

```vue
<template>
    <OrigamFileField v-model="files" :max-file-size="2097152" />
</template>
```

| Prop | Type | Description |
|---|---|---|
| `maxFileSize` | `number` | Max file size in bytes; larger files are rejected |
| `counter` | `boolean` | Show file count in the details area |
| `persistentCounter` | `boolean` | Always show the counter |

## Slots

| Slot | Bindings | Description |
|---|---|---|
| `prepend` | — | Content before the field |
| `append` | — | Content after the field |
| `field` | `{ id, isDisabled, isDirty, isValid, isReadonly }` | Full field body override |
| `dropzone` | `{ isDragging, browse }` | Custom dropzone content |
| `item` | `{ file, index, progress, remove, download }` | Custom file item (list or dropzone) |
| `chip` | `{ fileNames, totalBytes, totalBytesReadable, props }` | Custom chip renderer |
| `selection` | — | Custom selection text |
| `loader` | — | Custom loader |
| `counter` | `{ counter, value, max }` | Custom counter |
| `details` | — | Details row override |
| `messages` | `{ hasMessages, messages }` | Messages override |

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `File \| File[] \| null` | File selection changed |
| `click:control` | `MouseEvent` | The field control was clicked |
| `mousedown:control` | `MouseEvent` | Mousedown on the field control |
| `click:remove` | `{ file, index }` | Remove button clicked |
| `click:download` | `{ file, index }` | Download button clicked |
| `drop` | `{ files, event }` | Files dropped on the dropzone |
| `error:max-size` | `{ files, maxFileSize, message }` | Files exceeded `maxFileSize` |

## Composition

The drag-and-drop mode uses two sub-components internally:
- `OrigamFileFieldDragNDropItem` — renders a single file inside the dropzone
- `OrigamFileFieldListItem` — renders a file in the list below the dropzone

Both are exposed via the `item` slot for full customisation.

## Design tokens

| Token | Description |
|---|---|
| `--origam-file-field__dropzone---border-width` | Dropzone border width |
| `--origam-file-field__dropzone---border-style` | Dropzone border style |
| `--origam-file-field__dropzone---min-height` | Minimum dropzone height |
| `--origam-file-field__dropzone--dragging---background-color` | Background when dragging over |
| `--origam-file-field---list-gap` | Gap between file list items |
