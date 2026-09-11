# OrigamInlineEdit

Edit-in-place pattern. The user clicks a label / title / cell, an
input appears prefilled with the current value, and `Enter` confirms
while `Escape` cancels. Common use cases: renaming a section header,
editing a card title, tweaking a label in a list — anywhere a full
modal form would feel heavy.

```vue
<template>
    <origam-inline-edit
            v-model="title"
            placeholder="Untitled"
            :validate="(v) => v.length >= 3 || 'Min 3 chars'"
    />
</template>
```

When no `#display` slot is provided, the component renders a
button-styled span carrying the current value (or the placeholder
when the value is empty). When no `#edit` slot is provided, it
renders an `<OrigamTextField>` (or `<OrigamTextareaField>` when
`multiline` is true). When `showActions=true`, the Confirm and Cancel
buttons are placed inside the field via its `appendInner` slot.

## Quick start

```vue
<origam-inline-edit v-model="userName" placeholder="Full name" />

<origam-inline-edit
        v-model="description"
        :multiline="true"
        :confirm-on-enter="false"
        placeholder="Add a description"
/>

<origam-inline-edit
        v-model="email"
        input-type="email"
        :validate="(v) => /^.+@.+\..+$/.test(v) || 'Invalid email'"
/>
```

## Props — Typography

These props set CSS custom properties on the **root element** so they cascade
to the BEM surfaces that read them. Only props with a real visual effect are
exposed (`fontFamily`, `letterSpacing`, `lineHeight` have no rule in the SCSS).

| Prop | Type | Values | Effect |
|---|---|---|---|
| `fontSize` | `TFontSize` | `xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl` | `--origam-inline-edit__error---font-size` (error message) **and** `--origam-inline-edit__action-btn---font-size` (action buttons) |
| `fontWeight` | `TFontWeight` | `regular · medium · semibold · bold · extrabold · black` | `--origam-inline-edit__error---font-weight` (error message only — action-btn weight is hardcoded 600) |

## Props

| Prop               | Type                                        | Default           | Notes                                                          |
|--------------------|---------------------------------------------|-------------------|----------------------------------------------------------------|
| `modelValue`       | `string \| number`                          | required          | v-model target. Numbers round-trip as numbers.                 |
| `placeholder`      | `string`                                    | `'Click to edit'` | Shown on the input and on the empty display.                   |
| `rules`            | `Array<(v: string) => true \| string \| Promise<…>>` | `undefined` | Array of validation rules — same contract as all DS form fields. Rules are evaluated sequentially; first failure surfaces the error and blocks the commit. Evaluated before `validate`. |
| `validate`         | `(v: string) => true \| string \| Promise<…>` | `undefined`     | Sync or async validator. Returning a string surfaces it as an error and keeps the editor open. Only runs if all `rules` pass. |
| `autoFocus`        | `boolean`                                   | `true`            | Auto-focus the input on edit entry.                            |
| `selectOnFocus`    | `boolean`                                   | `true`            | Select all text after auto-focus.                              |
| `confirmOnBlur`    | `boolean`                                   | `true`            | Commit on blur. Disable to require an explicit Enter / button. |
| `confirmOnEnter`   | `boolean`                                   | `true`            | Confirm on `Enter`. In multiline mode, this becomes Cmd/Ctrl+Enter. |
| `cancelOnEscape`   | `boolean`                                   | `true`            | Revert on `Escape`.                                            |
| `disabled`         | `boolean`                                   | `false`           | Display becomes non-interactive; `edit()` short-circuits.      |
| `multiline`        | `boolean`                                   | `false`           | Render a `<textarea>` instead of `<input>`.                    |
| `trim`             | `boolean`                                   | `true`            | Strip surrounding whitespace before validate + emit.           |
| `inputType`        | `'text' \| 'number' \| 'email' \| 'tel'`    | `'text'`          | Native HTML input type in single-line mode.                    |
| `loadingOnConfirm` | `boolean`                                   | `false`           | Adds a CSS hook (`.origam-inline-edit--loading-on-confirm`) while a Promise validator is in flight. `aria-busy` is set regardless. |
| `showActions`      | `boolean`                                   | `false`           | Render built-in Edit / Confirm / Cancel buttons. See "Action buttons" section below. |
| `tag`              | `string`                                    | `'span'`          | Root element tag.                                              |

## Emits

| Emit              | Payload                | When                                                                  |
|-------------------|------------------------|-----------------------------------------------------------------------|
| `update:modelValue` | `(value)`            | After successful validation. Preserves the v-model shape (string vs number). |
| `edit`            | —                      | Editor entered edit mode (display → input transition).                |
| `cancel`          | —                      | Editor exited via Esc / cancel — the draft was discarded.             |
| `confirm`         | `(value)`              | Fires AFTER validation passes, BEFORE `update:modelValue`. Useful for server-side persistence. |
| `validate-error`  | `(message: string)`    | Validator returned an error message (sync or async).                  |

## Slots scoped

### `#display` — `{ value, edit, isEmpty, placeholder, disabled }`

Render any affordance you like (heading, badge, list-item cell, …).
Call `edit()` to enter edit mode.

```vue
<origam-inline-edit v-model="title">
    <template #display="{ value, edit, isEmpty, placeholder }">
        <h2 :class="{ 'is-empty': isEmpty }" @click="edit">
            {{ isEmpty ? placeholder : value }}
        </h2>
    </template>
</origam-inline-edit>
```

### `#edit` — `{ value, setValue, confirm, cancel, error, isPending }`

Render any custom input layout. Wire keyboard handlers yourself —
the slot is a complete take-over.

```vue
<template #edit="{ value, setValue, confirm, cancel, error }">
    <input
        :value="value"
        @input="setValue(($event.target as HTMLInputElement).value)"
        @keydown.enter.prevent="confirm()"
        @keydown.esc.prevent="cancel()"
    >
    <span v-if="error" role="alert">{{ error }}</span>
</template>
```

### `#actions` — `{ confirm, cancel, isPending }`

Render custom confirm / cancel buttons. When `showActions=true`, the
slot content is placed inside the field's `appendInner` slot (after
the text area). When `showActions=false`, the slot is not rendered
unless you provide it explicitly — in which case it renders as a
sibling of the field. Use `@mousedown.prevent` on the buttons when
`confirmOnBlur=true` to prevent the input blur from triggering an
unwanted commit before the click fires.

## Action buttons

By default, `OrigamInlineEdit` is keyboard-driven: click the display to
enter edit mode, press `Enter` to confirm, `Escape` to cancel. This is
intentional for power users and data-dense UIs.

For mouse-first or touch-first contexts, pass `showActions` to render
three built-in icon buttons:

```vue
<origam-inline-edit
    v-model="title"
    :show-actions="true"
    :confirm-on-blur="false"
    placeholder="Click to edit"
/>
```

### Behaviour with `showActions=true`

| Mode | Buttons visible | Button hidden |
|---|---|---|
| Display | Edit (&#9998;) next to the display label | Confirm, Cancel |
| Edit | Confirm (&#10003;), Cancel (&#10005;) **inside the field** | Edit |

- Clicking **Edit** is equivalent to clicking the display affordance.
- Clicking **Confirm** is equivalent to pressing `Enter`.
- Clicking **Cancel** is equivalent to pressing `Escape`.
- Keyboard shortcuts (`Enter` / `Escape`) continue to work in parallel — `showActions` is purely additive.
- When `disabled` is `true`, all three buttons are also disabled.

### DOM structure in edit mode

When `showActions=true`, the Confirm and Cancel buttons are rendered
**inside the field** via the `appendInner` slot of `OrigamTextField`
(or `OrigamTextareaField` in multiline mode). They are **not** siblings
of the field element. This guarantees visual alignment and prevents
layout overflow issues when the component is used in constrained containers.

```html
<!-- single-line (showActions=true, isEditing=true) -->
<span class="origam-inline-edit origam-inline-edit--editing origam-inline-edit--show-actions">
  <div class="origam-text-field origam-inline-edit__field" data-cy="origam-inline-edit-input">
    <!-- OrigamTextField internals -->
    <div class="origam-field__append-inner">
      <button data-cy="origam-inline-edit-action-confirm">&#10003;</button>
      <button data-cy="origam-inline-edit-action-cancel">&#10005;</button>
    </div>
  </div>
</span>
```

### Combining `showActions` and `confirmOnBlur`

When rendering explicit action buttons, you typically want to disable
`confirmOnBlur` so that clicking a button does not first trigger a blur
commit on the input:

```vue
<origam-inline-edit
    v-model="label"
    :show-actions="true"
    :confirm-on-blur="false"
/>
```

The built-in buttons use `@mousedown.prevent` internally to avoid
stealing focus from the input before the click handler runs.

### Using the `#actions` slot instead

If you need a fully custom button layout, use the `#actions` slot — it
takes precedence over the built-in buttons even when `showActions` is
`true`. The slot is only rendered while in edit mode:

```vue
<origam-inline-edit v-model="label" :confirm-on-blur="false">
    <template #actions="{ confirm, cancel, isPending }">
        <button :disabled="isPending" @mousedown.prevent @click="confirm()">Save</button>
        <button @mousedown.prevent @click="cancel()">Discard</button>
    </template>
</origam-inline-edit>
```

## Validation patterns

### Sync — instantaneous verdict

```ts
const validate = (v: string): true | string =>
    v.length >= 3 || 'Min 3 chars'
```

### Async — server-side uniqueness check

```ts
const validate = async (v: string): Promise<true | string> => {
    const taken = await api.checkAvailability(v)
    return taken ? `"${v}" is already taken` : true
}
```

While the Promise is in flight, the component sets `aria-busy="true"`
on the root and `aria-disabled` on the input. With
`loadingOnConfirm=true`, an additional CSS hook is exposed so you
can render a spinner overlay if needed.

### Rules array — standard DS contract

```vue
<origam-inline-edit
    v-model="title"
    :rules="[
        (v) => v.trim().length > 0 || 'Value cannot be empty',
        (v) => v.length >= 5   || 'Min 5 characters required',
    ]"
/>
```

Rules follow the same signature as `OrigamTextField` / `OrigamInput`
rules: a function receiving the current string value and returning
`true` (pass) or an error message string (fail). Async rules
(returning a `Promise`) are supported.

### Coexistence of `rules` and `validate`

Both props can be used simultaneously. Evaluation order:

1. `rules` are evaluated first, sequentially. The first failing rule
   stops evaluation and surfaces its message.
2. `validate` is only called if all rules pass.

Only the first error message is ever displayed — the editor remains
open and the commit is blocked until the value satisfies both.

```vue
<origam-inline-edit
    v-model="email"
    :rules="[
        (v) => v.trim().length > 0 || 'Required',
        (v) => v.includes('@')     || 'Must contain @',
    ]"
    :validate="async (v) => {
        const taken = await api.checkEmail(v)
        return taken ? 'Email already in use' : true
    }"
/>
```

### Error UX

When the validator returns a string, the component:
- Keeps the editor open so the user can correct without re-clicking.
- Renders the message inside a `<span role="alert">` so screen
  readers announce it immediately.
- Sets `aria-invalid="true"` on the input.
- Clears the error as soon as the user types again (the next
  validation cycle starts fresh).

## Accessibility

- **Display affordance** — the default render is a native `<button>`
  with an `aria-label` of `"Edit {value or placeholder}"`. Keyboard
  users get focus / Enter / Space semantics for free.
- **Edit affordance** — the native `<input>` / `<textarea>` is
  decorated with `aria-invalid` and `aria-describedby` (pointing to
  the inline error) when a validator fails.
- **Live region** — the error message is wrapped in a `role="alert"`
  element, which screen readers announce immediately without
  interrupting the current speech.
- **`aria-busy`** — the root sets `aria-busy="true"` while an async
  validator is pending. This pauses incremental announcements on
  some readers.
- **Focus management** — on edit entry, the input is focused
  automatically (`autoFocus=true`) and its content is selected
  (`selectOnFocus=true`). On confirm / cancel the focus naturally
  flows back to the display button.
- **Custom slots** — when you supply `#display` or `#edit`, you take
  ownership of the ARIA contract. Pass an `aria-label` on the
  trigger and forward `aria-invalid` / `aria-describedby` to the
  input.

## `useInlineEdit` composable

For headless consumers (custom widgets, data-grid cells, …) use the
composable directly:

```ts
import { ref } from 'vue'
import { useInlineEdit } from '@origam/composables'

const model = ref('hello')
const {
    isEditing, draft, error, isPending,
    edit, confirm, cancel, setValue
} = useInlineEdit(model, {
    validate: (v) => v.length >= 3 || 'Min 3 chars',
    trim: true,
    onConfirm: (v) => (model.value = v),
})
```

| Return       | Type                            | Notes                                                            |
|--------------|---------------------------------|------------------------------------------------------------------|
| `isEditing`  | `Ref<boolean>`                  | True while in edit mode.                                         |
| `draft`      | `Ref<string>`                   | Live draft value. Mutate via `setValue`.                         |
| `error`      | `Ref<string \| null>`           | Last validation error message.                                   |
| `isPending`  | `Ref<boolean>`                  | True while an async validator is in flight.                      |
| `edit`       | `() => void`                    | Snapshot the model into the draft and switch to edit mode.       |
| `confirm`    | `() => Promise<boolean>`        | Run the validator and (if it passes) commit. Resolves true on success. |
| `cancel`     | `() => void`                    | Discard the draft and revert.                                    |
| `setValue`   | `(next: string) => void`        | Programmatic draft update — also clears any stale error.         |

Stale Promise verdicts are automatically discarded: if the user
cancels (or fires another confirm) while a validator is still in
flight, the late resolution is ignored — no double-commit, no race.

## Related

- `OrigamTextField` — the full-fledged single-line form field. Use it
  when you need labels, prepend / append slots, prefixes, validation
  rules from a Form, … `OrigamInlineEdit` uses it internally in
  single-line edit mode.
- `OrigamTextareaField` — multi-line variant. Used internally by
  `OrigamInlineEdit` in `multiline=true` edit mode.
- `OrigamClipboard` — same "lightweight affordance" philosophy
  applied to copy-to-clipboard.
