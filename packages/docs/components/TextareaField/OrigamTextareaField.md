# OrigamTextareaField

`<OrigamTextareaField>` is the multiline text input. It extends `<OrigamTextField>`
with auto-grow, manual row control, resize suppression, and a persistent-clear
button on top of the standard field mixin set.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const bio = ref('')
</script>

<template>
  <OrigamTextareaField v-model="bio" label="Bio" />
</template>
```

## Rows & max rows

```vue
<template>
  <OrigamTextareaField label="Short"     :rows="3" />
  <OrigamTextareaField label="Auto-grow" auto-grow :max-rows="8" />
</template>
```

## No resize

```vue
<template>
  <OrigamTextareaField label="Fixed"  no-resize />
</template>
```

## Counter

```vue
<template>
  <OrigamTextareaField label="Message" :counter="500" />
</template>
```

## Prefix & suffix

```vue
<template>
  <OrigamTextareaField label="Note" prefix=">" suffix="..." />
</template>
```

## States (disabled / readonly / error)

```vue
<template>
  <OrigamTextareaField label="Disabled" disabled />
  <OrigamTextareaField label="Readonly" readonly model-value="Cannot edit" />
  <OrigamTextareaField label="Error"    :error="true" error-messages="Too long" />
</template>
```

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | field props | Full body override |
| `label` | `ILabelProps` | Custom label |
| `floatingLabel` | `ILabelProps` | Custom floating label |
| `prefix` | — | Before textarea |
| `suffix` | — | After textarea |
| `prependInner` | — | Inside field before |
| `appendInner` | — | Inside field after |
| `prepend` | — | Outside field before |
| `append` | — | Outside field after |
| `loader` | — | Loading indicator |
| `counter` | `{ counter, max, value }` | Custom counter |
| `field` | `{ id, isDisabled, isDirty, isValid, isReadonly }` | Replace `<textarea>` |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Value changed |
| `update:height` | `number` | Auto-grow height updated |
| `focus` | `FocusEvent` | Input focused |
| `blur` | `FocusEvent` | Input blurred |
| `click:clear` | `MouseEvent` | Clear button clicked |
| `click:control` | `MouseEvent` | Control area clicked |
| `mousedown:control` | `MouseEvent` | Mousedown on control |
| `format` | `(command, value?)` | Rich-text command applied (toolbar click or keyboard shortcut). |

## Rich-text mode

Set `mode="rich"` to swap the underlying `<textarea>` for a lightweight
in-house editor based on `contenteditable`. The editor ships with no
external dependency (no TipTap, ProseMirror, Quill, …) — bundle cost is
roughly **5 KB gz** instead of the 150–300 KB that a full-featured
editor brings.

```vue
<script setup lang="ts">
import { ref } from 'vue'
const html = ref('<p>Start with some <strong>bold</strong></p>')
</script>

<template>
  <OrigamTextareaField
      v-model="html"
      mode="rich"
      output="html"
      label="Description"
  />
</template>
```

### Output formats

| `output`  | v-model value             | Notes |
|-----------|---------------------------|-------|
| `html`    | sanitised HTML            | Default. Round-trips losslessly. |
| `markdown`| CommonMark-flavoured text | Converts on emit; the editor surface still keeps HTML internally. |

When `output="markdown"`, set the **initial value** as HTML — the
editor seeds its DOM from the v-model verbatim. From then on, every
emit serialises to Markdown.

### Toolbar customisation

```vue
<OrigamTextareaField
    v-model="html"
    mode="rich"
    :toolbar="['bold', 'italic', 'link', 'list-bullet']"
    toolbar-position="floating"
/>
```

| Command          | Default keyboard shortcut | Icon |
|------------------|---------------------------|------|
| `bold`           | Cmd/Ctrl + B              | `mdi:format-bold` |
| `italic`         | Cmd/Ctrl + I              | `mdi:format-italic` |
| `underline`      | Cmd/Ctrl + U              | `mdi:format-underline` |
| `link`           | Cmd/Ctrl + K              | `mdi:link-variant` |
| `list-bullet`    | Cmd/Ctrl + Shift + 8      | `mdi:format-list-bulleted` |
| `list-ordered`   | Cmd/Ctrl + Shift + 7      | `mdi:format-list-numbered` |
| `heading`        | —                         | cycles H1 → H2 → H3 → P |
| `code-inline`    | Cmd/Ctrl + E              | `mdi:code-tags` |
| `clear-format`   | —                         | `mdi:format-clear` |

Pass `:toolbar="false"` to hide it entirely; the keyboard shortcuts
keep working.

`toolbarPosition` accepts `'top'` (default), `'bottom'`, `'floating'`
(sticky to the editor surface).

### Slots

```vue
<OrigamTextareaField v-model="html" mode="rich">
  <template #toolbar="{ format, isFormat }">
    <button :aria-pressed="isFormat('bold')" @click="format('bold')">B</button>
    <button :aria-pressed="isFormat('italic')" @click="format('italic')">I</button>
  </template>
</OrigamTextareaField>
```

### Sanitisation

Every emit (typing, paste, `setValue`, external `v-model` write) passes
through an in-house allowlist sanitiser.

**Allowed tags**: `p`, `br`, `strong`, `b`, `em`, `i`, `u`, `a`, `ul`,
`ol`, `li`, `h1`, `h2`, `h3`, `code`.

**Blocked tags** (subtree removed): `script`, `style`, `iframe`,
`object`, `embed`, `form`, `svg`, `math`, `link`, `meta`, `base`.
Anything else is **unwrapped** (children promoted, parent dropped) —
this preserves text content of disallowed wrappers.

**Allowed attributes**: `href` (on `<a>`, restricted to
`http:` / `https:` / `mailto:` / `tel:` schemes plus relative URLs);
`class` (whitelisted prefix `origam-rich--*` only). Every `on*`
handler is stripped before per-tag filtering.

External links are hardened automatically with
`rel="noopener noreferrer nofollow"` and `target="_blank"`.

### Accessibility

- The toolbar wrapper carries `role="toolbar"` + `aria-label` (i18n key
  `origam.textarea.rich.toolbar.aria-label`).
- Each command button is a real `<button>` with `aria-label` (i18n key
  per command) and `aria-pressed="true|false"` driven by the caret
  position.
- The editing surface is `role="textbox" aria-multiline="true"` and
  exposes `aria-disabled` / `aria-readonly` when applicable.
- `aria-label` falls back to the `placeholder` prop when set.

### Limitations

The in-house implementation deliberately ships a **minimal** subset:

- No structural **undo / redo** beyond the browser's native
  `Ctrl+Z` (which works because we use `execCommand`).
- No tables, images or embed support.
- No collaborative cursor / OT-CRDT integration.
- No syntax-highlighting inside `<code>` blocks (use `OrigamCode` for
  that).
- `execCommand` is technically deprecated by spec, but remains the
  pragmatic choice for a non-collaborative lightweight editor without a
  100 KB+ dependency. We accept the tradeoff and will revisit if a
  major browser drops it.

### Migration from TipTap / Quill

Drop the library, then map your stored value to either HTML or
Markdown. Sanitise once on read (`sanitizeHtml`) if your stored
content predates origam — the editor will then take over and keep
everything inside the allowlist.

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-field---border-color` | semantic border | Outline color |
| `--origam-field---bg-color` | surface | Background |
| `--origam-textarea---min-height` | `56px` | Minimum textarea height |
| `--origam-textarea-field__rich-toolbar---bg-color` | surface sunken | Toolbar background |
| `--origam-textarea-field__rich-toolbar---border-radius` | `radius.md` | Toolbar corner radius |
| `--origam-textarea-field__rich-toolbar-btn-active---bg-color` | action primary | Active button background |
| `--origam-textarea-field__rich-toolbar-btn-active---color` | action primary fg | Active button foreground |
| `--origam-textarea-field__rich-content---padding` | `space.3` | Inner padding of the editable surface |
| `--origam-textarea-field__rich-content---placeholder-color` | text secondary | Empty-state placeholder |
| `--origam-textarea-field__rich-code-inline---bg-color` | surface sunken | Inline `<code>` background |
| `--origam-textarea-field__rich-link---color` | action primary | Anchor color |
| `--origam-textarea-field__rich-heading---font-size-h1..h3` | `1.75/1.35/1.1rem` | Heading sizes |
