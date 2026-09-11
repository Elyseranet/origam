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
  `useTheme()` call on hydration reads both back.
- **`prefers-color-scheme`**: when `mode === 'auto'` (or `theme === 'auto'`),
  the composable attaches a `change` listener on
  `window.matchMedia('(prefers-color-scheme: dark)')` and updates
  `resolvedMode` / `resolved` reactively when the OS-level theme changes.
- **Singleton**: every component shares the same refs, so toggling the
  mode in a header instantly reflows every consumer.

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

A theme is **plain JSON** authored by intention — `colors`, `radius`,
`typography`, `shadow`, `spacing`, `animation` — never `--origam-*` strings.
The DS ships one built-in theme, `sobre`; you write your own brands in the same
format and pass them in:

```ts
const myLight = {
  name: 'mybrand', mode: 'light',
  colors: {
    surface: { default: '#ffffff' },
    text:    { primary: '#171717', secondary: '#737373' },
    action:  { primary: { bg: '#7c3aed', fg: '#ffffff' } }
  },
  radius: { md: '0.5rem' }
}

createOrigam({ themes: [myLight, /* myDark */] })
```

A color slot accepts any CSS color **or a gradient** (there is no dedicated
gradient group). The full authoring surface and the resolved `--origam-*` names
are documented in **[Theme authoring](../integrations/theming-authoring.md)**.
When you supply no theme, `createOrigam` installs `sobre` for you.

Read the installed brands back with [`useInstalledThemes()`](#installed-themes)
to drive a switcher. Under Nuxt the `origam/nuxt` module does this install for
you from its `themes` option — see the [Nuxt integration](../integrations/nuxt.md).

## Installed themes

`useInstalledThemes()` returns the distinct brands installed via
`createOrigam({ themes })` — one entry per `name`, each listing its modes:

```ts
import { useInstalledThemes } from 'origam/composables'

const installed = useInstalledThemes()
// → [{ name: 'sobre', modes: ['light', 'dark'], label: 'Sobre', swatch: '…' }, …]
```

Each entry carries `name`, `modes`, and the UI metadata the installed theme
objects provided: `label` (falls back to `name`), and optional `description`
and `swatch`. It returns `[]` when nothing was installed (or outside a
`createOrigam` app), so a switcher can map over it without a null-guard.

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

## Tests

The composable ships with [`theme.composable.spec.ts`][1] covering:

- Default `'auto'` for both axes when no persisted value.
- Reading from / writing to localStorage (both cookies/keys).
- Toggling `data-theme` and `data-mode` on the document root.
- `toggle()` (brand) and `toggleMode()` (mode) flipping light ↔ dark.
- `applyThemeSync` / `applyModeSync` writing to `<html>` outside Vue's lifecycle.
- The two axes not interfering (brand + mode applied together).
- Custom theme strings (`'brand-a'`).

[1]: https://github.com/your-org/origam/blob/main/src/composables/Theme/theme.composable.spec.ts

## Related

- [`<OrigamThemeProvider>`](../components/ThemeProvider/OrigamThemeProvider.md) — sub-tree theme/mode override.
- [`useCssSupport`](./useCssSupport.md) — feature detection, used together
  with `useTheme` to gate dark-mode-specific CSS features.
- [Nuxt integration](../integrations/nuxt.md) — SSR no-flash for both axes.
- [Design tokens guide](../guide/design-tokens.md) — how `data-theme` /
  `data-mode` compose with the generated CSS layers.
