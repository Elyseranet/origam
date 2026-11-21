# Nuxt integration

origam ships an official Nuxt 3 / Nuxt 4 module that wires the design
system into a Nuxt application in one line: auto-imports for every
`Origam*` component and `useXxx` composable, SSR-safe resolution of both
theming axes — the brand `theme` (via cookie) and the color `mode` (via
cookie, else the system `prefers-color-scheme`) — and automatic injection of the
token stylesheets in the right order.

The module is published as a **sub-export of `origam`** — there is no
separate package to install. You get the components, the tokens, the
composables and the Nuxt module in a single dependency.

## Installation

```bash
npm install origam
```

## Setup

Register the module in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
    modules: ['origam/nuxt']
})
```

That is it. Every `Origam*` component and `useXxx` composable is now
auto-imported, the theme-invariant base sheets (primitive + utilities) are
loaded, the default brand theme is **installed as a runtime object**, and
both the active brand and color mode are resolved server-side so the first
paint already matches the user preference (no FOUC).

## Themes are installed as objects (ADR-004)

The module does **not** load a pre-generated CSS file per theme, and it does
**not** resolve preset names. Instead it **installs theme OBJECTS** the way an
external consumer would: it takes the `themes` option (already an
`IOrigamTheme[]`) and hands it to `createOrigam` in the plugins, which inject
each brand as a `[data-theme="…"][data-mode="…"]` scoped `--origam-*` block.
Only the theme-invariant `primitive` + `utilities` sheets are loaded as CSS.

> **ADR-004 (Implemented)**: the DS ships exactly one neutral identity (the
> origam baseline), installed implicitly by `createOrigam` when you pass no
> theme. Every brand theme lives in **your** app — you author it in plain
> semantic JSON (see [Theme authoring](theming-authoring.md)) and pass the
> objects in. There is no `origam/themes` preset registry and no
> `origam/tokens/css/{brand}-*` sheet to import — all brand sheets have been
> removed from the DS package.

**No-flash SSR**: the server plugin also emits every configured theme's
scoped block as a real `<style data-origam-theme-ssr>` in the rendered HTML
(via `useHead`), so the first paint is already themed — no flash of
unstyled content, and the page stays themed even if client hydration is
delayed. The client plugin then re-injects the same blocks (id-keyed per
`name×mode`, replacing in place) for runtime theme switching.

`themes` entries are **`IOrigamTheme` objects** (or arrays of them — e.g. a
brand that bundles its light + dark modes, or a Theme Builder export). You
import your own theme objects and list them:

```ts
import { glassLightTheme, glassDarkTheme } from './themes/glass.theme'
import { myBrand } from './themes/my-brand.theme' // your own / a Builder export

export default defineNuxtConfig({
    modules: ['origam/nuxt'],
    origam: {
        // DS baseline is implicit when omitted; list your brand themes here.
        themes: [glassLightTheme, glassDarkTheme, myBrand],
        defaultTheme: 'glass',
        defaultMode: 'auto'
    }
})
```

## Configuration

All options are optional. Place them under the top-level `origam` key:

```ts
import { glassLightTheme, glassDarkTheme } from './themes/glass.theme'

export default defineNuxtConfig({
    modules: ['origam/nuxt'],
    origam: {
        themes: [glassLightTheme, glassDarkTheme],
        defaultTheme: 'glass',
        modes: ['light', 'dark'],
        defaultMode: 'auto',
        cookieName: 'origam-theme',
        modeCookieName: 'origam-mode',
        cookieMaxAge: 60 * 60 * 24 * 365,
        autoImport: true,
        includeUtilities: true,
        prefix: 'Origam'
    }
})
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `themes` | `(IOrigamTheme \| IOrigamTheme[])[]` | the DS baseline (`origamTheme`) | Brand themes to install, as `IOrigamTheme` objects you author yourself (see [Theme authoring](theming-authoring.md)). Objects/arrays are injected as-is — no preset-name resolution, no per-theme CSS file. Omitting the option installs the DS neutral baseline; an explicit `themes: []` installs nothing at all (⛔ #360 — unlike `createOrigam()` called directly, which never auto-installs the baseline any more, this module still does when the option is left unset). |
| `defaultTheme` | `string` | `'auto'` | Active brand when no cookie is set. `'auto'` renders no `data-theme` (the default brand). |
| `modes` | `string[]` | `['light', 'dark']` | Color modes supported by the loaded token sheets. Used to validate the resolved mode. |
| `defaultMode` | `string` | `'auto'` | Active color mode when no cookie is set. `'auto'` leaves the mode to the system: the server omits `data-mode` and emits both modes, the dark one under `@media (prefers-color-scheme: dark)` (no flash on the first visit). `'light'` / `'dark'` pins it. |
| `cookieName` | `string` | `'origam-theme'` | Cookie that stores the user's chosen brand. |
| `modeCookieName` | `string` | `'origam-mode'` | Cookie that stores the user's chosen color mode. |
| `cookieMaxAge` | `number` | `31_536_000` (1 year) | Cookie lifetime in seconds (shared by both cookies). |
| `autoImport` | `boolean` | `true` | Auto-register components and composables as Nuxt auto-imports. |
| `includeUtilities` | `boolean` | `true` | Inject the utility-classes stylesheet (`origam-utilities.css`). |
| `locale` | `ILocaleOptions` | `undefined` (`en`) | Locale of Origam's built-in strings (aria-labels, button labels…). Serialisable: `{ locale, fallbackLocale, messages }`. See [Locale](#locale). |
| `icons` | `{ defaultSet?, aliases? }` | `undefined` | `defaultSet` and `aliases` of `createOrigam({ icons })` (e.g. `{ aliases: { info: 'mdi-information-outline' } }` so `<origam-icon icon="$info" />` resolves it). Serialisable subset only: aliases are strings (or path arrays), never components. `sets` (render functions) is **not** relayed. |
| `lite` | `boolean` | `false` | Build the app with `createOrigamCore` (`origam/core`): no `import *` of every component and directive, no MDI stylesheet. Same themes, PROPS-FIRST, locale and SSR styles. Components come from Nuxt's on-demand auto-import. Icons become opt-in: add `@mdi/font/css/materialdesignicons.css` to `css` yourself. See [Lightweight entry](#lightweight-entry). |
| `include` | `string[]` | `undefined` | With `lite` and `autoImport`: the only components Nuxt may auto-import (`['OrigamBtn', 'OrigamTitle']`). An unknown name fails the build. Omitted: every component is available on demand. |
| `prefix` | `string` | `'Origam'` | Reserved for future use. origam components already ship prefixed, so the active prefix is empty. |

## Locale

Origam's built-in strings (e.g. the `origam-code` scroller's `aria-label`) are
`en` by default. Set the locale, and optionally supply `messages`, in the module
options:

```ts
// nuxt.config.ts
import ja from './locales/origam-ja.json' // translated copy of origam/assets/locales/en.json

export default defineNuxtConfig({
    modules: ['origam/nuxt'],
    origam: {
        locale: {
            locale: 'ja',
            fallbackLocale: 'en',
            messages: { ja }
        }
    }
})
```

- The options are **serialisable** (they travel through `runtimeConfig`) and are
  passed identically to `createOrigam({ locale })` by the client and server
  plugins, so the SSR markup and the hydration render agree.
- `messages` are **merged** with the built-in `en` / `fr`: supply a full `ja`, or
  override a few `fr` keys. A missing key falls back to `fallbackLocale`.
- Origam does **not** follow `<html lang>` or `@nuxtjs/i18n`; wire your own
  locale into this option.
- The list of keys is `origam/assets/locales/en.json` — copy it as the template
  for a new language (see the [i18n guide](../guide/i18n.md#ajouter-une-langue-gabarit-de-traduction)).

## SSR — per-instance styles (`useStyle`)

Components that paint through a per-instance rule (`OrigamBtn`, `OrigamAvatar`,
`OrigamStepper`… — everything built on `useStyle()`) used to write that rule
into `<head>` from `onMounted`, which never runs on the server: the served HTML
carried the element but not its background, radius or colour, and the page
changed look at hydration.

On the server `useStyle()` now registers its rule in a per-app collector, and
the Nuxt server plugin pushes every collected rule into the head (one
`<style id="origam-style-…">` per instance) after the render, before the head is
serialised. Nothing to configure.

- The tag `id` comes from the instance's `useId()` value, identical on the
  server and at hydration, so the client **reuses** the server's `<style>`
  instead of adding a second one.
- A value containing `</style` cannot close the tag: it is escaped.
- ⚠️ Not verified: Nuxt's streaming SSR (`experimental.ssrStreaming`), where
  the head can be flushed before the whole tree has rendered.

### Plain Vue SSR (no Nuxt)

`createOrigam()` provides the collector on the server by itself. After the
render, read the rules back and put them in your `<head>`:

```ts
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createOrigam } from 'origam'
import { renderSsrStyles } from 'origam/utils'

const app = createSSRApp(App)
app.use(createOrigam({ themes, ssr: true }))

const html = await renderToString(app)
const styles = renderSsrStyles(app)   // '<style id="origam-style-…">…</style>…'

const page = `<!doctype html><html><head>${styles}</head><body><div id="app">${html}</div></body></html>`
```

Create the app (and so call `app.use(createOrigam(...))`) **per request**: the
collector belongs to the app, which is what keeps one request's rules out of
another's. `getSsrStyles(app)` returns the same rules as `{ id, css }[]` if you
assemble the head yourself.

Two apps mounted in the same document derive the same ids (ids are unique per
app, not per document). The second `useStyle` no longer shares the first one's
`<style>`: it gets a tag of its own. Give one of the apps its own
`app.config.idPrefix` to keep the **element** ids distinct as well.

## Token sheets per mode and theme CSS for the server (`origam/ssr`)

Authors who serve one brand and one colour mode should not ship the rest. `origam/tokens/css/light` and `origam/tokens/css/dark` stay as they are (primitive + light + dark = 651 KiB raw, 84 KiB gzip). The dark sheet holds its palette twice, once under `[data-mode="dark"]` and once under `@media (prefers-color-scheme: dark)`, so it is also published in two halves:

| Import | Holds | Use it when |
|---|---|---|
| `origam/tokens/css/primitive` | primitives | always |
| `origam/tokens/css/light` | light palette (the base, also the default) | always |
| `origam/tokens/css/dark-pinned` | dark under `[data-mode="dark"]` | the page pins its mode (`data-mode` on `<html>`) |
| `origam/tokens/css/dark-system` | dark under `@media (prefers-color-scheme: dark)` | the mode follows the system (`data-mode` absent) |
| `origam/tokens/css/dark` | both | the mode switches at runtime |

A page pinned to light needs `primitive` + `light` only (30 KiB gzip instead of 84). A pinned dark page needs `primitive` + `light` + `dark-pinned` (60 KiB).

The DS ships one theme (`origam`). The tokens of a brand are generated from its `IOrigamTheme`, so there is no static sheet per brand: `renderThemeCss` produces it, for the brand and the mode of the request only.

```ts
import { renderThemeCss, renderSsrStyles } from 'origam/ssr'

// brand and mode come from your cookies; `mode: 'auto'` (or omitted) = not pinned
const themeCss = renderThemeCss(themes, { theme: 'elysera', mode: 'dark' })
const head = `<style id="origam-theme-ssr">${themeCss}</style>${renderSsrStyles(app)}`
```

With Nuxt and **without** the module, in a server plugin:

```ts
import { getSsrStyles, renderThemeCss } from 'origam/ssr'

export default defineNuxtPlugin(({ vueApp, ssrContext }) => {
  useHead({ style: [{ key: 'origam-theme-ssr', innerHTML: renderThemeCss(themes, { theme, mode }) }] })
  vueApp.hook('app:rendered', () => {
    for (const { id, css } of getSsrStyles(vueApp)) ssrContext?.head.push({ style: [{ id, key: id, innerHTML: css }] })
  })
})
```

`origam/ssr` also exports `getSsrStyles`, `renderSsrStyles`, `isModePinned` and `knownBrand`. It replaces the internal paths `origam/utils/Commons/apply-theme.util.js` and `ssr-styles.util.js`. The Nuxt module calls the same `renderThemeCss`.

## SSR theme + mode resolution

The server plugin reads the `origam-theme` and `origam-mode` cookies
before the response is rendered and injects the resolved values as
`<html data-theme="…" data-mode="…">` via Nuxt's `useHead()`.

- **Brand (`data-theme`)** is driven by the `origam-theme` cookie, then
  `defaultTheme`. It is omitted when the brand resolves to `'auto'` (the
  DS default sheet's `:root` rules then apply).
- **Mode (`data-mode`)** is driven by the `origam-mode` cookie, then
  `defaultMode`. A `light` / `dark` value from either source PINS the mode:
  `data-mode` is written concrete and only that mode's block is inlined.
- **Mode not pinned** (no cookie, `defaultMode: 'auto'`): the server writes
  **no `data-mode`** and inlines both modes of the active brand — the light
  block under `@media not (prefers-color-scheme: dark)`, the dark one under
  `@media (prefers-color-scheme: dark)`. The selectors are root-only and carry
  `:not([data-mode])`, so a pinned mode always wins: as soon as the client
  writes a concrete `data-mode`, those blocks stop matching. The tokens are
  therefore right from the server paint, with no network round trip. Cost: one
  extra theme block per mode-scoped theme in the HTML.
- **Component props** (`theme.components`) cannot follow the `@media`: with the
  mode unpinned the server seeds them for **light**, the client hydrates with
  the same, then switches to the system mode right after hydration
  (`app:mounted`). A brand whose light and dark `components` differ therefore
  shows its light props for one frame on a dark system; the tokens do not flash.
- The `Sec-CH-Prefers-Color-Scheme` client hint is **not read**: no
  `Accept-CH` is emitted, so browsers never send it.

The client plugin then picks up the attributes already set by the server,
so the hydration boundary stays clean: no hydration mismatch warning.

## Changing the theme at runtime

Use `useTheme()` — it is auto-imported by the module:

```vue
<script setup lang="ts">
    const {theme, resolved, setTheme, toggle} = useTheme()
</script>

<template>
    <button @click="toggle">
        {{ resolved === 'dark' ? 'Light mode' : 'Dark mode' }}
    </button>
</template>
```

The client plugin watches the composable's `theme` ref and persists
every change to the configured cookie. No extra wiring needed.

## Deriving a switcher from the installed themes

`useInstalledThemes()` returns the brands that were actually installed,
so a theme switcher stays in sync with the `themes` option instead of a
hard-coded list. Each entry carries `name`, `modes`, and the UI metadata
the installed theme objects provided (`label` — falls back to `name` —
plus optional `description` and `swatch`):

```vue
<script setup lang="ts">
    const installed = useInstalledThemes()
    // → [{ name: 'sobre', modes: ['light','dark'], label: 'Sobre',
    //      description: 'Linear-style', swatch: 'linear-gradient(…)' }, …]
    const { theme, setTheme } = useTheme()
</script>

<template>
    <button
        v-for="brand in installed"
        :key="brand.name"
        :aria-pressed="theme === brand.name"
        @click="setTheme(brand.name)"
    >
        <span class="swatch" :style="{ background: brand.swatch }" />
        {{ brand.label }}
    </button>
</template>
```

The metadata comes from the `label` / `description` / `swatch` fields on
the installed `IOrigamTheme` objects. The brand-name list is also exposed
on `useRuntimeConfig().public.origam.themes` (names only) for SSR contexts.

## Lightweight entry

By default the plugins call `createOrigam`, which pulls in every component and the MDI font stylesheet. For a site that uses a few components, set `lite`:

```ts
export default defineNuxtConfig({
    modules: ['origam/nuxt'],
    origam: {
        lite: true,
        include: ['OrigamTitle', 'OrigamBtn'], // optional
        themes: [myTheme]
    }
})
```

No `build.transpile` entry is needed (the SSR build of a Nuxt 4.6 app with `lite: true` runs without it). The module's token stylesheets (`origam/tokens/css/*`) are still added to `css`: they are independent of `lite`.

## Opting out of auto-imports

If you need to namespace origam imports manually (conflict with another
design system, custom build pipeline, …) set `autoImport: false`:

```ts
export default defineNuxtConfig({
    modules: ['origam/nuxt'],
    origam: {autoImport: false}
})
```

You can then import explicitly:

```ts
import {OrigamBtn, OrigamCard} from 'origam/components'
import {useTheme} from 'origam/composables'
```

The plugins, CSS injection and SSR theme resolution still apply — only
the magic `auto-import everything` step is disabled.

## Migrating from a manual `createOrigam()` setup

If your app already calls `app.use(createOrigam(...))` in a custom
plugin, remove that plugin and add `'origam/nuxt'` to `modules` instead.
The module installs origam with sensible defaults; you only need to
keep your manual plugin if you pass non-trivial `createOrigam()` options
(custom icon `sets`, blueprint, …). In that case, set
`autoImport: false` to avoid double registration and keep your manual
plugin for the `createOrigam()` call.

## Requirements

- Nuxt **3.x or 4.x**
- Node **>= 22** (origam's own engine requirement)
