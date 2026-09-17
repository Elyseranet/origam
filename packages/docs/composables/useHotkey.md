# useHotkey

Registers a global keyboard shortcut on `window` — a **combination**
(`ctrl+k`) or a **sequence** of combinations (`g-g`), with a platform-aware
reading of `cmd` / `meta`, and an input-focus guard.

## ⛔ The sequence separator is a hyphen, not a space

The banner in the source announced `"g g"` for months, and the generated
`Commons.md` republished it. It is false. Measured:

```
splitKeySequence('g g')      →  ["g g"]        ← one group
splitKeySequence('g-g')      →  ["g","g"]      ← two groups
splitKeySequence('ctrl+k-p') →  ["ctrl+k","p"]
splitKeyCombination('g g')   →  ["g g"]
```

A `"g g"` shortcut resolves to a single group whose `actualKey` is the literal
string `"g g"`, which no `e.key` ever equals. It is **silently dead** — two
`keydown` on `g` fire nothing, with no warning. Measured, same component, same
callback:

| `keys` | two `keydown` on `g` |
|:---|:---|
| `'g-g'` | fires once, on the second key |
| `'g g'` | fires **zero** times |

The repository's own specs use the correct form (`a-b`).

## API

```ts
function useHotkey (
    keys: MaybeRef<string | undefined>,
    callback: (e: KeyboardEvent) => void,
    options: IHotkeyOptions = {}
): () => void
```

| Option | Default | Role |
|:---|:---|:---|
| `event` | `'keydown'` | The window event listened to. Reactive — changing it re-registers. |
| `inputs` | `false` | When true, the shortcut also fires while an input has focus. |
| `preventDefault` | `true` | `e.preventDefault()` on a match. |
| `sequenceTimeout` | `HOTKEY_SEQUENCE_TIMEOUT` = **1000** ms | Inactivity window between two groups. |

Returns the `cleanup` function — remove the listener and clear the pending
sequence timer.

## Platform mapping

`isMac` is `navigator.userAgent.includes(MACINTOSH_UA_TOKEN)`. A combination
naming `cmd` or `meta` expects **`metaKey`** on a Mac and **`ctrlKey`**
elsewhere:

```ts
expectCtrl = modifiers.ctrl || (!isMac && (modifiers.cmd || modifiers.meta))
expectMeta = isMac && (modifiers.cmd || modifiers.meta)
```

The match is strict on all four modifiers — `e.ctrlKey === expectCtrl &&
e.metaKey === expectMeta && e.shiftKey === modifiers.shift && e.altKey ===
modifiers.alt` — so `ctrl+k` does **not** fire on `⌘K` on a non-Mac. Measured.

## The input guard

`isInputFocused()` returns true when `document.activeElement` is an `INPUT`, a
`TEXTAREA`, or contenteditable — unless `toValue(options.inputs)` is true, in
which case it always returns false. A matching key is then simply ignored.
Measured: with an `<input>` focused, `ctrl+k` does not fire.

## Cleanup

Inside a Vue `setup()`, `onBeforeUnmount(cleanup)` is registered automatically.
Measured: after unmounting the host, the shortcut no longer fires, and no
warning was emitted during setup.

::: warning Outside `setup()`, cleanup is yours
`getCurrentInstance('useHotkey')` throws, the `catch` emits
`HOTKEY_NO_AUTO_CLEANUP_WARNING` — the literal string `Can't cleanup`, rendered
through `consoleWarn`, i.e. Vue's `warn()`, so what reaches the console is
`[Vue warn]: Origam: Can't cleanup` — and **you must call the returned
`cleanup()` yourself**. Measured: exactly one warning, and the return value is
a function.
:::

Outside a browser (`!IN_BROWSER`), the function returns an empty function
immediately: no listener, no warning, no error.

## Usage

```ts
import { onBeforeUnmount, ref } from 'vue'
import { useHotkey } from 'origam/composables/Commons/hotkey.composable'

const keys = ref('ctrl+k')

const cleanup = useHotkey(keys, (e) => {
    // eslint-disable-next-line no-console
    console.log('palette', e.key)
}, { inputs: false })

onBeforeUnmount(cleanup)   // redundant inside setup(), required outside it
```

A two-step sequence, `g` then `g`:

```ts
import { useHotkey } from 'origam/composables/Commons/hotkey.composable'

useHotkey('g-g', () => {
    // navigates home
})
```

## ⚠️ It is not reachable from the published package — #844

`useHotkey` is **not** re-exported by `packages/ds/src/composables/index.ts`,
and `packages/ds/package.json` declares `"./composables"` with **no wildcard
subpath**. An application installing `origam` therefore cannot import it at all
— neither from `origam/composables` nor from a deep path. Inside the library it
is reached by relative import only. The example above uses the internal path for
that reason.

## Behaviour notes

- Reactivity: `watch(() => toValue(keys), …, { immediate: true })` re-splits and
  re-registers on every change, after a full `cleanup()`. A second watch on
  `toValue(event)` swaps the listener when the event type changes — but only
  when groups are already parsed.
- The parse is defensive: `splitKeyCombination` returns `[]` on an invalid
  structure, which yields `actualKey: undefined` and therefore no match ever.
  Some invalid forms warn through `consoleWarn`, others resolve to a group that
  simply never matches.
- The sequence timer is a `window.setTimeout` cleared by `clearTimer()`, which
  `cleanup()` calls — so a pending sequence does not outlive the component.

## Consumers

**1** component, verified by import: `OrigamCommandPalette`. Plus one unit spec.

## Source

- `packages/ds/src/composables/Commons/hotkey.composable.ts`
- `packages/ds/src/utils/Commons/hotkey.util.ts` — `splitKeySequence` /
  `splitKeyCombination`.
- `packages/ds/src/consts/Commons/hotkey.const.ts` — timeouts, modifiers,
  warning text.
