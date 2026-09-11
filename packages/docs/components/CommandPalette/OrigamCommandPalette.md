# OrigamCommandPalette

`<OrigamCommandPalette>` is a **⌘K-style command launcher** in the spirit
of Linear, Vercel and [cmdk.paco.me](https://cmdk.paco.me). It opens an
overlay, exposes a search input, fuzzy-matches a registered list of
actions, and lets the user trigger one with a single keystroke.

The palette is keyboard-first:

- Global hotkey toggles it open (defaults to `⌘+K` on macOS, `Ctrl+K` on
  Windows / Linux).
- `↑` / `↓` move the highlighted command.
- `Enter` runs the highlighted command.
- `Esc` closes the palette.
- Focus is trapped inside the dialog while it is open and restored to
  the previously focused element on close.

## Quick start

### Declarative (props)

```vue
<template>
    <OrigamBtn text="Open palette" @click="open = true"/>
    <OrigamCommandPalette v-model="open" :commands="commands"/>
</template>

<script setup lang="ts">
    import { ref } from 'vue'
    import type { ICommand } from '@origam/interfaces'

    const open = ref(false)

    const commands: ICommand[] = [
        {
            id: 'goto-settings',
            label: 'Go to settings',
            icon: 'mdi:cog',
            kbd: ['meta', 'shift', 's'],
            group: 'Navigation',
            perform: () => router.push('/settings')
        },
        {
            id: 'toggle-theme',
            label: 'Toggle theme',
            description: 'Switch between light and dark',
            kbd: ['meta', 'shift', 't'],
            group: 'Settings',
            keywords: ['dark', 'light'],
            perform: () => theme.toggle()
        }
    ]
</script>
```

### Composable (global registry)

For commands that originate in feature code, register them through
`useCommand()`. Entries are auto-unregistered when the surrounding
component unmounts.

```ts
import { useCommand } from '@origam/composables'

const { register, open } = useCommand()

register({
    id: 'project.create',
    label: 'Create project',
    icon: 'mdi:plus',
    kbd: ['meta', 'shift', 'p'],
    group: 'Actions',
    perform: () => createProject()
})

// Open the palette imperatively from anywhere.
open()
```

When `<OrigamCommandPalette>` is mounted **without** an explicit
`commands` prop, it reads from the global registry. Multiple components
addressing the same singleton share the same command list — by design,
the registry is process-wide.

## Typography

`fontSize` drives the font size of two BEM surfaces simultaneously. The
prop maps a primitive font token key to the matching component CSS
variable via `useTypography`.

| Surface | CSS variable | Effective props |
|---|---|---|
| `__input` (search field) | `--origam-command-palette__input---font-size` | `fontSize` |
| `__group-title` (group header) | `--origam-command-palette__group-title---font-size` | `fontSize` |

`fontWeight` and `letterSpacing` have hardcoded values in the SCSS
(`600` and `0.04em` on `__group-title`) — they are NOT token-driven and
passing those props has no visual effect.

```vue
<OrigamCommandPalette v-model="open" :commands="commands" font-size="sm"/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `boolean` | `false` | Whether the palette is open. v-model. |
| `hotkey` | `string[] \| string[][] \| null` | `[['meta','k'],['ctrl','k']]` | Global hotkey(s) that toggle the palette. Pass `null` to disable. |
| `commands` | `ICommand[]` | — | Static command list. Falls back to the global registry when omitted. |
| `placeholder` | `string` | `'Search…'` | Placeholder of the search input. Pre-translate via `useT()`. |
| `emptyText` | `string` | `'No results'` | Empty-state message when no command matches the query. |
| `maxHeight` | `number \| string` | `480` | Max height of the result list (px when number). |
| `width` | `number \| string` | `640` | Width of the palette dialog (px when number). |
| `loading` | `boolean` | `false` | Display a loader inside the result list. |
| `closeOnSelect` | `boolean` | `true` | Close the palette automatically when a command is selected. |
| `closeOnEscape` | `boolean` | `true` | Close on `Escape`. |
| `closeOnBackdrop` | `boolean` | `true` | Close when the user clicks the backdrop. |
| `fontSize` | `TFontSize` | — | Font size token applied to both `__input` and `__group-title` surfaces. |
| `fontFamily` | `TFontFamily` | — | Font family token (emitted but no SCSS rule on these surfaces — no visual effect). |
| `fontWeight` | `TFontWeight` | — | Font weight token (emitted but hardcoded in SCSS — no visual effect). |
| `lineHeight` | `TLineHeight` | — | Line-height token (emitted but no SCSS rule on these surfaces — no visual effect). |
| `letterSpacing` | `TLetterSpacing` | — | Letter-spacing token (emitted but hardcoded in SCSS — no visual effect). |

## Events

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `boolean` | Open/close state change. |
| `select` | `ICommand` | Fired when the user runs a command (click or `Enter`). |
| `query` | `string` | Fired on every input keystroke — connect to a debounced async fetch. |

## Slots

| Slot | Props | Description |
|---|---|---|
| `item` | `{ command, isActive }` | Replace a single command row. Useful for avatars / rich rendering. |
| `empty` | — | Replace the default empty state. |
| `footer` | — | Replace the default footer hints. |

## `ICommand` interface

```ts
interface ICommand {
    id: string                  // stable id, dedup key in the registry
    label: string               // primary label
    description?: string        // secondary line under the label
    icon?: TIcon                // prepend icon
    kbd?: string[]              // shortcut shown through <OrigamKbd>
    group?: string              // e.g. 'Navigation' — drives the group subheader
    keywords?: string[]         // extra search terms
    perform: () => void | Promise<void>
    disabled?: boolean
}
```

## Composable — `useCommand()`

```ts
const {
    register,    // (cmd) => unregister closure; auto-cleans on scope dispose
    unregister,  // (id) => void
    commands,    // ComputedRef<readonly ICommand[]>
    open,        // () => void
    close,       // () => void
    isOpen       // Ref<boolean>
} = useCommand()
```

- The registry is a **process-wide singleton**. Every caller sees the
  same list. Re-registering with an existing `id` replaces the entry —
  no duplicates.
- When `register()` is called inside a Vue effect scope (component
  setup, custom scope), the entry is **automatically unregistered**
  when the scope disposes (component unmount, route leave, …). Outside
  a scope, you must call `unregister(id)` yourself or invoke the
  closure returned by `register()`.

## Fuzzy matching

The palette ships with a built-in subsequence-based matcher
(`fuzzyMatch` in `src/utils/CommandPalette/fuzzy-match.util.ts`). It
walks the query character-by-character against the haystack
(`label + keywords + description`) and computes a score from:

- **Consecutive-run bonus** — runs of contiguous query chars in the
  haystack rank higher than spread-out matches.
- **First-label-hit bonus** — earlier matches in the label outrank
  late matches.
- **Label-prefix bonus** — labels that start with the query get a flat
  bonus on top.

Ties fall back to registration order (stable). Empty query short-circuits
to "return everything in declaration order" so the user always has a
list to navigate.

No external dependency — `fuse.js` / `match-sorter` would add ~20 KB
gzipped for a feature we can match in 100 lines of pure TS.

## Hotkey configuration

| Platform | Default trigger |
|---|---|
| macOS | `⌘ + K` (`['meta', 'k']`) |
| Windows / Linux | `Ctrl + K` (`['ctrl', 'k']`) |

The component installs both by default — `useHotkey` itself normalises
`meta` vs `ctrl` per platform, but binding both forms is safe and
covers fringe input-method combinations.

Override:

```vue
<!-- Single combination -->
<OrigamCommandPalette v-model="open" :hotkey="['meta', 'shift', 'p']"/>

<!-- Multiple combinations -->
<OrigamCommandPalette v-model="open" :hotkey="[['meta', 'k'], ['meta', 'shift', 'p']]"/>

<!-- Disable the global listener -->
<OrigamCommandPalette v-model="open" :hotkey="null"/>
```

The listener is **NOT triggered when focus is inside an `INPUT`,
`TEXTAREA` or contentEditable element** — this matches the behaviour of
`useHotkey({ inputs: false })`. ⌘K typed in a regular text field never
hijacks the user.

## Accessibility

The palette implements the ARIA combobox pattern.

| Element | Roles / attributes |
|---|---|
| Overlay root | `role="dialog"` + `aria-modal="true"` + `aria-labelledby` pointing at the input |
| Search input | `role="combobox"` + `aria-expanded` + `aria-controls` + `aria-activedescendant` + `aria-autocomplete="list"` |
| Results container | `role="listbox"` |
| Each command | `role="option"` + `aria-selected` + `aria-disabled` |

The dialog also:

- Traps `Tab` focus inside the palette (Tab returns to the input —
  there is no escape route while open).
- Restores focus to the element that was focused **before** the palette
  opened when it closes — same pattern as `OrigamDialog`.
- Honours `prefers-reduced-motion` by collapsing the fade-in transition.

## Design tokens

| CSS variable | Description |
|---|---|
| `--origam-command-palette---z-index` | Stacking order (default `modal`). |
| `--origam-command-palette---width` | Dialog width. |
| `--origam-command-palette---max-height` | Max height of the result list. |
| `--origam-command-palette---background-color` / `---color` / `---border-color` / `---border-radius` / `---box-shadow` | Dialog surface tokens. |
| `--origam-command-palette__input---padding` / `---font-size` / `---icon-color` / `---placeholder-color` | Search input tokens. |
| `--origam-command-palette__item---padding` / `---height` / `---border-radius` | Result item tokens. |
| `--origam-command-palette__item---background-color-active` / `---color-active` | Active-row styling. |
| `--origam-command-palette__group-title---color` / `---font-size` / `---padding` | Group header tokens. |
| `--origam-command-palette__empty---color` | Empty state color. |
| `--origam-command-palette__footer---padding` / `---color` / `---border-color` | Footer tokens. |
| `--origam-command-palette--backdrop---background-color` / `---backdrop-filter` | Overlay backdrop. |
