# OrigamClipboard

A headless-ish wrapper that adds the "copy to clipboard" behaviour
around any trigger — a button, an icon, a span — and exposes an
auto-resetting `copied` flag so consumers don't have to wire the
timeout. The copy pipeline uses `navigator.clipboard.writeText` and
falls back to a hidden-textarea + `document.execCommand('copy')` for
non-HTTPS contexts and pre-permissions Safari / WebView builds.

```vue
<template>
    <!-- Built-in trigger: icon + "Copied!" label flip on success -->
    <origam-clipboard :value="userEmail" />

    <!-- Custom trigger via scoped slot -->
    <origam-clipboard :value="apiKey">
        <template #default="{ copy, copied }">
            <origam-btn @click="copy">
                {{ copied ? 'Copied!' : 'Copy API key' }}
            </origam-btn>
        </template>
    </origam-clipboard>
</template>
```

When no slot is provided the component renders a single button
(`mdi:mdi-content-copy` icon) whose label appears next to the icon
and flips to `feedbackText` while `copied` is true. That's the only
feedback surface the component owns — there is no separate pill, no
mode prop, no double rendering. If you need a richer feedback (toast,
inline status, custom animation), pass a `#default` scoped slot and
render whatever you want from `{ copy, copied, error }`.

## Props

| Prop               | Type      | Default     | Notes                                                                                          |
|--------------------|-----------|-------------|------------------------------------------------------------------------------------------------|
| `value`            | `string`  | required    | Text written to the clipboard on `copy()`.                                                     |
| `feedbackDuration` | `number`  | `2000`      | Duration (ms) the `copied` flag stays true after a successful write.                           |
| `feedbackText`     | `string`  | `'Copied!'` | Label rendered in the built-in trigger while `copied` is true. Wrap with `t()` for full i18n.  |
| `successText`      | `string`  | `undefined` | Alias for `feedbackText`. Takes precedence when both are passed.                               |
| `disabled`         | `boolean` | `false`     | Disables the trigger; `copy()` short-circuits.                                                 |
| `tag`              | `string`  | `'span'`    | Root element tag.                                                                              |
| `fontSize`         | `TFontSize` | `undefined` | Font size token for the built-in trigger surface (`xs` · `sm` · `md` · `lg` · `xl` · …). Sets `--origam-clipboard__feedback---font-size`. Has no effect when the `#default` slot is used. |
| `fontWeight`       | `TFontWeight` | `undefined` | Font weight token for the built-in trigger surface (`regular` · `medium` · `semibold` · `bold` · `extrabold` · `black`). Sets `--origam-clipboard__feedback---font-weight`. |

## Emits

| Emit             | Payload          | When                                                                       |
|------------------|------------------|----------------------------------------------------------------------------|
| `copy`           | `(value: string)`| After a successful write (modern API or execCommand fallback).             |
| `error`          | `(err: Error)`   | After both paths failed (permissions denied, blocked context, …).          |

## Slot scoped API

The default slot exposes the following bindings:

| Binding  | Type                            | Notes                                                            |
|----------|---------------------------------|------------------------------------------------------------------|
| `copy`   | `() => Promise<boolean>`        | Triggers the pipeline. Resolves `true` on success.               |
| `copied` | `boolean`                       | True for `feedbackDuration` ms after a successful copy.          |
| `error`  | `Error \| null`                 | Set when the last attempt failed; null after a fresh successful attempt. |

## `useClipboard` composable

When you don't need any chrome, use the composable directly:

```ts
import { useClipboard } from '@origam/composables'

const { copy, copied, error, isSupported } = useClipboard({ feedbackDuration: 2000 })

async function onCopy () {
    await copy('text to copy')
    // copied.value === true for 2000 ms, then auto-resets to false
}
```

| Return       | Type                              | Notes                                                                                |
|--------------|-----------------------------------|--------------------------------------------------------------------------------------|
| `copy`       | `(text: string) => Promise<boolean>` | True on success, false on failure. Never throws.                                |
| `copied`     | `Ref<boolean>`                    | Self-resetting after `feedbackDuration` ms.                                          |
| `error`      | `Ref<Error \| null>`              | Cleared at the start of each new copy attempt.                                       |
| `isSupported`| `Ref<boolean>`                    | True when `navigator.clipboard.writeText` is available. False in SSR / blocked contexts. |

The composable auto-clears its pending timer on scope dispose
(`onScopeDispose`) — no manual cleanup needed when used inside a
`setup()` or an `effectScope()`.

## Fallback (`execCommand`)

The legacy `document.execCommand('copy')` path is used only when the
modern API is missing or rejects. It works in non-HTTPS contexts
(localhost included) and pre-permissions Safari. It will not work in:

- Sandboxed iframes without the `allow-same-origin` token.
- Background scripts / extension service workers (no `document`).
- Server-side rendering — the composable short-circuits via a `typeof
  document === 'undefined'` guard and returns false.

For production deployments on HTTPS with a modern browser, the modern
API is always preferred; the fallback exists for development /
embedded scenarios.

## Accessibility

- The default trigger is a native `<button>` — keyboard / focus /
  disabled semantics come for free.
- The label that appears next to the icon while `copied` is true is
  marked `aria-live="polite"` so screen readers announce the state
  change without interrupting the user.
- The default trigger's `aria-label` flips between
  `"Copy to clipboard"` and `"Value copied to clipboard"` to surface
  the state transition to assistive tech that does not pick up the
  visual label.
- Custom triggers passed through `#default` keep their own ARIA
  contract — make sure to add a label (`aria-label` or visible text)
  when the trigger is icon-only.

## Related

- `OrigamCode` — has its own internal copy button.
