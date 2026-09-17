# useTheme

Reactive handle on the two orthogonal theming axes:

- **theme** — the *brand* identity, applied as `data-theme` on `<html>`
  (`'default'`, `'brand-a'`, …).
- **mode** — the *color mode*, applied as `data-mode` on `<html>`
  (`'light'`, `'dark'`, `'auto'`).

Any brand can be rendered in either mode — the two axes never collide.
`useTheme()` wraps singleton refs so every call across the app reads the
same state, persists changes to `localStorage`, and applies both
attributes automatically.

## Basic usage

```vue
<script setup lang="ts">
import { useTheme } from 'origam/composables'

const { theme, mode, resolvedMode, setTheme, setMode, toggleMode } = useTheme()
</script>

<template>
    <div>
        <p>Brand: {{ theme }} — mode: {{ mode }} (effective: {{ resolvedMode }})</p>
        <OrigamBtn @click="toggleMode" text="Toggle light/dark" />
        <OrigamBtn @click="setMode('auto')" text="Follow system" />
        <OrigamBtn @click="setTheme('brand-a')" text="Brand A" />
    </div>
</template>
```

## API

```ts
function useTheme(): {
    // ── Brand axis (data-theme) ──────────────────────────────────────────
    /** Current brand setting. Read-only — call `setTheme` to mutate. */
    theme: Readonly<Ref<TTheme>>

    /**
     * Effective brand after resolving `'auto'` against
     * `prefers-color-scheme`. Useful when an SVG asset / image needs to
     * mirror the active theme without reading the system query yourself.
     */
    resolved: Readonly<Ref<TThemeResolved>>

    /** Imperative brand setter. Persists + applies `data-theme`. */
    setTheme: (next: TTheme) => void

    /**
     * Convenience: flips the brand `light` ↔ `dark`. Kept for back-compat
     * with the legacy single-axis API. For light/dark switching prefer
     * `toggleMode()`.
     */
    toggle: () => void

    // ── Mode axis (data-mode) ────────────────────────────────────────────
    /** Current color mode. Read-only — call `setMode` to mutate. */
    mode: Readonly<Ref<TMode>>

    /** Effective mode after resolving `'auto'` against `prefers-color-scheme`. */
    resolvedMode: Readonly<Ref<TModeResolved>>

    /** Imperative mode setter. Persists + applies `data-mode`. */
    setMode: (next: TMode) => void

    /** Flips the color mode `light` ↔ `dark` (treats `'auto'` as the current system preference). */
    toggleMode: () => void
}

type TTheme = 'auto' | 'light' | 'dark' | (string & {})
type TThemeResolved = Exclude<TTheme, 'auto'>
type TMode = 'auto' | 'light' | 'dark'
type TModeResolved = Exclude<TMode, 'auto'>
```

> **Migration note.** Before the 2-axis split, light/dark was carried by
> the `theme` axis (`setTheme('dark')`). That call still works and still
> writes `data-theme="dark"` for back-compat, but new code should drive
> light/dark through `mode` / `setMode` / `toggleMode` and reserve `theme`
> for the brand.

## Behaviour

- **`data-mode` is always concrete**: `mode` may be `'auto'` (the user
  intent), but the `data-mode` attribute on `<html>` ALWAYS carries a
  concrete `'light'` / `'dark'` (the *resolved* mode). The token sheets are
  scoped to concrete `[data-mode]` values and have no mode-less fallback,
  so the attribute is never removed. `data-theme`, by contrast, is removed
  when the brand is `'auto'` (the default sheet's `:root` rules take over).
- **SSR-safe**: no `window` / `document` access on the server. The Nuxt
  module writes a concrete `data-mode` server-side (safe default `'light'`
  when the user expressed no preference) and the client upgrades it to the
  real `prefers-color-scheme` at mount — see the Nuxt integration.
- **Persistence**: `setTheme(...)` writes `localStorage['origam-theme']`,
  `setMode(...)` writes `localStorage['origam-mode']`. The first
  `useTheme()` call on hydration reads both back. Both writes happen in a
  `watch`, so they land on the **next tick**, not synchronously inside the
  setter — a test that asserts on `localStorage` right after `setTheme()`
  reads the previous value.
- **The two axes do not persist symmetrically on the first call.** The brand
  watcher is `immediate: true`, the mode watcher is not. Measured on a clean
  `localStorage`, right after the first `useTheme()`:
  `origam-theme` is `"auto"`, `origam-mode` is still absent, `data-theme` is
  absent and `data-mode` is `"light"`. The mode key only appears once
  `setMode()` has been called.
- **`prefers-color-scheme`**: when `mode === 'auto'` (or `theme === 'auto'`),
  the composable attaches a `change` listener on
  `window.matchMedia('(prefers-color-scheme: dark)')` and updates
  `resolvedMode` / `resolved` reactively when the OS-level theme changes.
- **Singleton**: every component shares the same refs, so toggling the
  mode in a header instantly reflows every consumer. Measured: a second
  `useTheme()` call returns the *same ref object* (`t2.theme === t.theme`),
  not a copy. On the client the singleton is anchored on `globalThis` so it
  survives a duplicated module instance (#275); on the server it is a plain
  module-level object on purpose, because `globalThis` would leak per-request
  theme state across concurrent SSR requests.
- **`theme` and `mode` are `readonly()`.** Assigning to `theme.value` logs
  `[Vue warn] Set operation on key "value" failed: target is readonly` and
  changes nothing. Go through `setTheme` / `setMode`.
- **`resolved` treats any unknown brand as light-like.** Measured:
  `setTheme('brand-a')` → `resolved === 'light'`; only the literal `'dark'`
  resolves to `'dark'`. `resolved` is about the *brand* axis and its legacy
  light/dark aliases — for the actual colour mode, read `resolvedMode`.

## Custom brands

Any string is a valid `TTheme`. Install the brand as a runtime object via
`createOrigam` (see below) — or, for a Histoire/standalone setup, drop a
matching CSS file — then call `setTheme('brand-a')`: the document root grows
`data-theme="brand-a"` and the matching scoped block takes over.

```ts
const { setTheme, setMode } = useTheme()
setTheme('brand-a')
setMode('dark')
// → <html data-theme="brand-a" data-mode="dark">
```

## Installing themes (objects)

Brands are installed as **objects** through `createOrigam({ themes })` — the
consumer install path (ADR-004). Each `IOrigamTheme` is injected as a
`[data-theme][data-mode]` scoped `--origam-*` block; no per-theme CSS file is
needed.

An `IOrigamTheme` is **plain JSON** with exactly three authoring surfaces:

| key | what it carries |
|---|---|
| `components` | **per-component default props** — `{ global, 'origam-btn', … }` |
| `vars` | design tokens, nested by group (`color`, `rounded`, `border`, `typo`, `shadow`, `spacing`, `motion`) — never `--origam-*` strings |
| `cssVars` | the escape hatch: a flat map of raw `--origam-*` properties, for a var with no slot in `vars`. Wins over `vars` on collision |

⛔ **`components` comes first.** A component is configured through its
**props**; you drop to tokens only for what a prop cannot express, and to raw
`cssVars` only as a last resort. A theme made of `cssVars` alone, with no
`components` block, is not how this design system is meant to be configured.

```ts
const myLight = {
    name: 'mybrand',
    mode: 'light',
    label: 'My Brand',

    // 1 — props first
    components: {
        global: { density: 'comfortable' },
        'origam-btn': { variant: 'flat', color: 'primary', rounded: 'lg' }
    },

    // 2 — then semantic tokens
    vars: {
        color: {
            surface: { default: '#ffffff' },
            text: { primary: '#171717', secondary: '#737373' },
            action: { primary: { bg: '#7c3aed', fg: '#ffffff' } }
        },
        rounded: { md: '0.5rem' }
    }
}

createOrigam({ themes: [myLight /*, myDark */] })
```

A color leaf accepts any CSS color **or a gradient** (there is no dedicated
gradient group). The full authoring surface and the resolved `--origam-*` names
are documented in **[Theme authoring](../integrations/theming-authoring.md)**;
how the `components` block reaches a component's props is
[ADR-005](./installThemePropsResolver.md).

### What "no theme supplied" actually installs

`createOrigam()` always prepends the two built-in objects exported from
`packages/ds/src/themes/origam.theme.ts` — `origamLightTheme` (no `name`, no
`mode`, injected at `:root`) and `origamDarkTheme` (`mode: 'dark'`, injected at
`[data-mode="dark"]`). Both are labelled `Origam`; the source comment nicknames
that identity *"sobre"*, but **no theme object carries `name: 'sobre'`**, and
`'sobre'` is not a value you can pass to `setTheme()`.

Because both built-ins are **nameless**, they are not brands: measured,
`createOrigam({})` leaves `useInstalledThemes()` returning `[]`.

Read the installed brands back with [`useInstalledThemes()`](#installed-themes)
to drive a switcher. Under Nuxt the `origam/nuxt` module does this install for
you from its `themes` option — see the [Nuxt integration](../integrations/nuxt.md).

## Installed themes

`useInstalledThemes(): TInstalledThemes` returns the distinct **named** brands
installed via `createOrigam({ themes })` — one entry per `name`, collapsing the
per-mode objects into a single `modes` list:

```ts
import { useInstalledThemes } from 'origam/composables'

const installed = useInstalledThemes()
```

Measured, for
`createOrigam({ themes: [ {name:'mybrand', mode:'light', label:'My Brand', swatch:'#7c3aed', …}, {name:'mybrand', mode:'dark', …}, {name:'nolabel', mode:'light', …} ] })`:

```json
[
  { "name": "mybrand", "modes": ["light", "dark"], "label": "My Brand", "swatch": "#7c3aed" },
  { "name": "nolabel", "modes": ["light"], "label": "nolabel" }
]
```

Each entry carries `name`, `modes`, and the UI metadata the installed objects
provided: `label` (falling back to `name`, as `nolabel` shows), plus optional
`description` and `swatch` — **omitted entirely** when not provided, rather
than set to `undefined`.

⚠️ **A theme object with no `name` is skipped**, which is why the two built-ins
never appear. It returns `[]` when nothing named was installed, and `[]` again
outside a `createOrigam` app (it is a plain `inject` with `[]` as the default),
so a switcher can map over it without a null-guard.

The list is a **static snapshot** taken at install time; pair it with
`useTheme()` to read and change the active brand and mode.

## Sub-tree overrides

The global `<html data-theme>` / `<html data-mode>` are page-wide. To
theme a single sub-tree (e.g. a marketing card embedded in a neutral
admin page), use `<OrigamThemeProvider>`:

```vue
<template>
    <main>
        <p>Page chrome — neutral, follows the document mode.</p>

        <OrigamThemeProvider theme="brand-a" mode="dark">
            <OrigamCard>Brand-A card, pinned to dark.</OrigamCard>
        </OrigamThemeProvider>
    </main>
</template>
```

## No-flash on load

Without it, the first paint shows the default theme briefly before
JavaScript hydrates. The fix is to write both attributes synchronously in
a small inline script before any CSS loads:

```html
<script>
    try {
        const t = localStorage.getItem('origam-theme')
        if (t && t !== 'auto') {
            document.documentElement.setAttribute('data-theme', t)
        }
        const m = localStorage.getItem('origam-mode')
        if (m && m !== 'auto') {
            document.documentElement.setAttribute('data-mode', m)
        }
    } catch (_) { /* private mode, etc. */ }
</script>
```

Drop this into your `index.html` head, **before** any stylesheet. Under
Nuxt the official `origam/nuxt` module handles this SSR-side — see the
[Nuxt integration](../integrations/nuxt.md).

## Imperative helpers

```ts
import {
    applyThemeSync, applyModeSync,
    readPersistedTheme, readPersistedMode
} from 'origam/composables'

// Read the persisted values without mounting a component.
const brand = readPersistedTheme() // 'auto' | 'light' | 'dark' | string
const mode  = readPersistedMode()  // 'auto' | 'light' | 'dark'

// Apply synchronously (no Vue lifecycle required).
applyThemeSync('brand-a')
applyModeSync('dark')
```

These power the no-flash plugin pattern above and are exported for custom
integrations.

⚠️ They apply to the document and **do not persist**: measured,
`applyThemeSync('brand-z')` sets `data-theme="brand-z"` and leaves
`localStorage['origam-theme']` untouched. Persistence is `setTheme` /
`setMode`'s job. `applyThemeSync('auto')` *removes* `data-theme`;
`applyModeSync('auto')` resolves against `prefers-color-scheme` and always
writes a concrete `data-mode` (falling back to `'light'` where `matchMedia` is
unavailable).

Neither helper instantiates `useTheme()` — `readPersistedTheme()` /
`readPersistedMode()` create no ref and touch no singleton, and return
`'auto'` when nothing is persisted or when there is no `window`.

## Test helper

```ts
function _resetThemeForTesting (): void
```

Clears the module singletons (`theme`, `mode`, `systemPrefersDark`,
`mediaInitDone`) so each spec starts from a clean state. **Not public API** —
the leading underscore is the marker. Its only caller is
`packages/tests/TU/composables/Commons/theme.composable.spec.ts`. It does not
clear `localStorage` or the `<html>` attributes; a spec that needs those reset
must do it itself.

## Tests

`packages/tests/TU/composables/Commons/theme.composable.spec.ts` covers (not
exhaustively):

- Default `'auto'` for both axes when no persisted value.
- Reading from / writing to `localStorage` on both keys.
- Toggling `data-theme` and `data-mode` on the document root, including
  `data-mode` staying concrete when the mode is `'auto'`.
- `toggle()` (brand) and `toggleMode()` (mode) flipping light ↔ dark.
- `applyThemeSync` / `applyModeSync` / `readPersistedMode` outside Vue's
  lifecycle.
- The two axes not interfering (brand + mode applied together).
- Custom theme strings (`'brand-a'`).
- #275 — the singleton anchored on `globalThis` surviving module duplication.

`packages/tests/TU/ssr-smoke.spec.ts` additionally exercises the four
imperative helpers in a server-like context.

## Related

- [`<OrigamThemeProvider>`](../components/ThemeProvider/OrigamThemeProvider.md) — sub-tree theme/mode override.
- [`installThemePropsResolver`](./installThemePropsResolver.md) — how a theme's
  `components` block reaches every component's props (ADR-005). Theming is
  props-first; CSS variables are the fallback, not the entry point.
- [`useDefaults`](./useDefaults.md) — the provider side of the same defaults map.
- [`useColor`](./useColor.md) — the intent tokens that resolve against these axes.
- [Nuxt integration](../integrations/nuxt.md) — SSR no-flash for both axes.
- [Theme authoring](../integrations/theming-authoring.md) — the full
  `IOrigamTheme` surface and the `--origam-*` names it resolves to.
