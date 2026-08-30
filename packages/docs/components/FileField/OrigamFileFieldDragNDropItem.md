# OrigamFileFieldDragNDropItem

`<OrigamFileFieldDragNDropItem>` renders a single file as a collapsed card
inside a dropzone (icon, name, size, optional progress bar, remove button).
Used internally by `OrigamFileField` when `dropzone`/`dragndrop` is set and
exactly one file is selected; also reachable through the `item` slot for
full customisation.

## Basic usage

```vue
<template>
    <OrigamFileFieldDragNDropItem
        :file="file"
        :index="0"
        show-size
        @click:remove="onRemove"
    />
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
| `default` | Replaces the entire card content (icon, name, meta, progress, remove button) |

\* No `default` is declared for `showSize` — but Vue's Boolean-prop
coercion resolves an unset prop whose type includes `boolean` to `false` at
runtime, so leaving it unset behaves exactly like passing `false`.

## Behaviour notes

- The remove button carries a translated `aria-label` ("Remove {file name}",
  `origam.file_field.remove_aria_label`) — it never renders as an unlabelled
  icon-only button.
- `disabled` and `readonly` both disable the remove button; neither is
  forwarded to a native disabled attribute on the card itself (there is no
  native control on the card besides the button).

## Design tokens

| Token | Description |
|---|---|
| `--origam-file-field-dragndrop-item---gap` | Gap between icon / content / actions |
| `--origam-file-field-dragndrop-item__icon---color` | File icon color |
| `--origam-file-field-dragndrop-item__name---font-size` | File name font size (theme default; overridden by the `fontSize` prop) |
| `--origam-file-field-dragndrop-item__meta---color` | Size line color |
