# OrigamFileFieldListItem

`<OrigamFileFieldListItem>` renders a single file as a row (icon, name,
size, optional progress bar, remove button). Used internally by
`OrigamFileField` for its `list` display mode and the multi-file dropzone
list; also reachable through the `item` slot for full customisation.

## Basic usage

```vue
<template>
    <ul>
        <OrigamFileFieldListItem
            v-for="(file, index) in files"
            :key="index"
            :file="file"
            :index="index"
            show-size
            @click:remove="onRemove"
        />
    </ul>
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `file` | `File` | — (required) | The file to render |
| `index` | `number` | — (required) | Position in the file list, forwarded on `click:remove` |
| `progress` | `number` | `undefined` | Upload progress (0–100); the progress bar renders only when set |
| `fileIcon` | `string` | `mdi-file` | Icon shown before the file name |
| `removeIcon` | `string` | `mdi-close` | Icon for the remove button |
| `disabled` | `boolean` | `undefined` | Disables the remove button |
| `readonly` | `boolean` | `undefined` | Disables the remove button (read-only mode) |
| `showSize` | `boolean \| 1000 \| 1024` | `false`\* | `false` hides the size line; `true` picks an auto unit; `1000`/`1024` force SI (kB) / IEC (KiB) |
| `color` | `TColor` | `undefined` | Progress bar color |
| `fontSize` | `TFontSize` | `undefined` | File name font size (bound on the `__name` surface) |
| `fontWeight` | `TFontWeight` | `undefined` | File name font weight (bound on the `__name` surface) |

## Emits

| Event | Payload | Description |
|---|---|---|
| `click:remove` | `{ file: File, index: number }` | Remove button clicked |

## Slots

| Slot | Description |
|---|---|
| `default` | Replaces the entire row content (icon, name, meta, progress, remove button) |

\* No `default` is declared for `showSize` — but Vue's Boolean-prop
coercion resolves an unset prop whose type includes `boolean` to `false` at
runtime, so leaving it unset behaves exactly like passing `false`.

## Behaviour notes

- The remove button carries a translated `aria-label` ("Remove {file name}",
  `origam.file_field.remove_aria_label`) — it never renders as an unlabelled
  icon-only button.
- `disabled` and `readonly` both disable the remove button; neither is
  forwarded to a native disabled attribute on the row itself (there is no
  native control on the row besides the button).

## Design tokens

| Token | Description |
|---|---|
| `--origam-file-field-list-item---background-color` | Row background |
| `--origam-file-field-list-item---border-color` | Row border color |
| `--origam-file-field-list-item---border-radius` | Row border radius |
| `--origam-file-field-list-item---gap` | Gap between icon / content / actions |
| `--origam-file-field-list-item__icon---color` | File icon color |
| `--origam-file-field-list-item__name---font-size` | File name font size (theme default; overridden by the `fontSize` prop) |
| `--origam-file-field-list-item__meta---color` | Size line color |
