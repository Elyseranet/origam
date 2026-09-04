# origam

[![npm](https://img.shields.io/npm/v/origam.svg)](https://www.npmjs.com/package/origam)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![build](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)

A Vue 3 design system built on modern CSS, design tokens, and a CSS-first
philosophy. Multi-theme out of the box, token-driven utility classes, and
~80 production-ready components.

This repository is a **monorepo** that works with **npm, pnpm and yarn
workspaces**. The published package (`origam` on npm) lives in
`packages/ds/`; the surrounding packages host the docs site, Histoire
stories, end-to-end tests, marketing site and the companion Figma plugin.

---

## Installation (as a consumer)

```bash
npm install origam      # or: pnpm add origam, or: yarn add origam
```

Peer dependencies — pulled in by default, but you can dedupe in your app:

| Package      | Required | Used by                       |
|--------------|----------|-------------------------------|
| `vue`        | `^3.5`   | Always.                       |
| `vue-i18n`   | `^11.1`  | Optional — locale composable. |
| `vue-router` | `^4.5 \|\| ^5`   | Optional — link components.   |

Node >= 22 is required to **build** the package from source. Consumers only
need Vue 3.5+ at runtime.

---

## Quick start

### 1. Register the plugin

```ts
// main.ts
import { createApp } from 'vue'
import { createOrigam } from 'origam'

import 'origam/tokens/css/primitive'
import 'origam/tokens/css/light'
import 'origam/tokens/css/utilities'

import App from './App.vue'

const origam = createOrigam()

createApp(App).use(origam).mount('#app')
```

`createOrigam()` accepts an options bag (`icons`, `locale`, `display`,
`date`, `goTo`, `aliases`, `components`, `directives`, `ssr`, `blueprint`).
All keys are optional — the defaults register every component and every
directive globally.

### 2. Use a component

```vue
<template>
  <OrigamBtn intent="primary" @click="onClick">
    Save
  </OrigamBtn>
</template>

<script setup lang="ts">
const onClick = () => console.log('clicked')
</script>
```

Tokenised props (`intent`, `rounded`, `elevation`, `size`) emit
utility classes (`.origam--bg-primary`, `.origam--shadow-md`, ...).
Custom values (`color="#ff0080"`) fall back to inline styles. See the
[classes-first conventions](./CLAUDE.md) section in `CLAUDE.md` for
details.

---

## Theming

origam ships three built-in modes: `light`, `dark`, and `auto`
(follows `prefers-color-scheme`).

### Static switch

```html
<html data-theme="dark">
```

Omit the attribute to fall back to `auto`. Brand themes are registered at
runtime as an `IOrigamTheme` object passed to `createOrigam()` (props
first, CSS vars only for what props can't express — see "Multi-theme" in
`CLAUDE.md`). A brand that needs its own stylesheet instead hand-writes a
`[data-theme="brand-{name}"]` block — there is no generator that emits
one from a token file.

### Runtime switch

```ts
import { useTheme } from 'origam'

const { theme, set, toggle } = useTheme()

set('dark')      // 'light' | 'dark' | 'auto' | 'brand-x'
toggle()         // cycles light <-> dark
```

`useTheme()` is a module-level singleton — every call shares the same
`Ref`, persisted in `localStorage` under `origam-theme`.

### Scoped override

```vue
<OrigamThemeProvider theme="dark">
  <OrigamCard>I am dark, even on a light page.</OrigamCard>
</OrigamThemeProvider>
```

Don't forget to import the matching token sheet (`origam/tokens/css/dark`)
once at boot — the provider only flips the `data-theme` attribute on the
sub-tree.

---

## Design tokens

Three tiers, in order of specificity:

| Tier         | Lives in                                                    | Example CSS variable                       |
|--------------|---------------------------------------------------------------|--------------------------------------------|
| Primitive    | `packages/ds/src/assets/css/tokens/primitive.css`             | `--origam-color-neutral-500`               |
| Semantic     | `packages/ds/src/assets/css/tokens/light.css` / `dark.css`    | `--origam-color-surface-default`           |
| Component    | `packages/ds/src/assets/css/tokens/light.css` / `dark.css`    | `--origam-btn---background-color`          |

Semantic tokens reference primitives. Components reference semantics. App
code should consume **semantic** tokens or component variables — never
primitives directly.

The `origam-utilities.css` sheet generates 66 utility classes
(`.origam--bg-*`, `.origam--color-*`, `.origam--shadow-*`,
`.origam--rounded-*`, ...) that map 1:1 to semantic tokens.

There is **no token build step**. The Tokens Studio / Style Dictionary
pipeline was removed on 2026-08-31; the stylesheets under
[`packages/ds/src/assets/css/tokens/`](./packages/ds/src/assets/css/tokens)
(and their SCSS twins) are now plain hand-maintained source that you edit
directly. See the "Design tokens" section of [`CLAUDE.md`](./CLAUDE.md).

---

## Components

Around 80 component families, all prefixed `Origam*`:

| Family       | Examples                                                                  |
|--------------|---------------------------------------------------------------------------|
| Forms        | `OrigamTextField`, `OrigamSelect`, `OrigamCheckbox`, `OrigamRadio`, `OrigamSwitch`, `OrigamSliderField`, `OrigamRatingField`, `OrigamDatePickerField`, `OrigamColorPickerField`, `OrigamFileField`, `OrigamPasswordField`, `OrigamOtpInputField`, `OrigamNumberField`, `OrigamForm` |
| Navigation   | `OrigamToolbar`, `OrigamBottomNav`, `OrigamBreadcrumb`, `OrigamDrawer`, `OrigamPagination`, `OrigamStepper`, `OrigamTreeview` |
| Layout       | `OrigamApp`, `OrigamMain`, `OrigamLayout`, `OrigamGrids`, `OrigamDivider`, `OrigamSystemBar` |
| Feedback     | `OrigamAlert`, `OrigamSnackbar`, `OrigamProgress`, `OrigamLoader`, `OrigamSkeleton`, `OrigamBadge`, `OrigamMessages` |
| Overlay      | `OrigamDialog`, `OrigamMenu`, `OrigamTooltip`, `OrigamSheet`, `OrigamContextualMenu`, `OrigamOverlay`, `OrigamConfirmWrapper` |
| Data         | `OrigamDataTable`, `OrigamDataList`, `OrigamTable`, `OrigamCarousel`, `OrigamTimeline`, `OrigamExpansionPanel`, `OrigamVirtualScroll`, `OrigamInfiniteScroll` |
| Display      | `OrigamCard`, `OrigamChip`, `OrigamAvatar`, `OrigamIcon`, `OrigamImg`, `OrigamKbd`, `OrigamTitle`, `OrigamLabel` |

The full catalogue lives in [`packages/ds/src/components/index.ts`](./packages/ds/src/components/index.ts).

---

## Composables

A library of ~80 composables. The ones you'll touch most often:

| Composable          | Purpose                                                            |
|---------------------|--------------------------------------------------------------------|
| `useTheme`          | Read / set / toggle the active theme.                              |
| `useColor`          | Resolve a tokenised intent into class + style outputs.             |
| `useBackgroundColor`| Same, scoped to `background-color`.                                |
| `useTextColor`      | Same, scoped to `color`.                                           |
| `useColorEffect`    | Hover / active / disabled state on top of `useColor`.              |
| `useRounded`        | Tokenised `border-radius`.                                         |
| `useElevation`      | Tokenised box shadow.                                              |
| `useBorder`         | Tokenised border width + color.                                    |
| `useSize`           | Tokenised dimensions.                                              |
| `useMargin`         | Tokenised margin (utility classes).                                |
| `usePadding`        | Tokenised padding (utility classes).                               |
| `useDensity`        | Density modifier (compact / comfortable / default).                |
| `useCssSupport`     | Reactive feature-detection — gate CSS paths vs JS fallbacks.       |
| `useDisplay`        | Reactive viewport / breakpoints.                                   |
| `useLocale`         | Locale provider (RTL-aware).                                       |
| `useGoTo`           | Smooth-scroll helper, configurable per-locale.                     |
| `useDefaults`       | Read the component-defaults injected by `<OrigamDefaultsProvider>`.|

Full list in [`packages/ds/src/composables/index.ts`](./packages/ds/src/composables/index.ts).

---

## CSS-first principle

origam treats modern CSS as a first-class platform. Container queries,
`:has()`, `color-mix()`, `subgrid`, `view-transition-name`, and
`aspect-ratio` are preferred over JS equivalents. Components branch to a
JS fallback **only** when feature detection fails:

```ts
const { css } = useCssSupport()

if (css.value.containerQueries) {
  // CSS path
} else {
  // ResizeObserver fallback
}
```

The full feature matrix lives in
[`packages/ds/src/composables/Commons/cssSupport.composable.ts`](./packages/ds/src/composables/Commons/cssSupport.composable.ts).
Never call `CSS.supports()` directly — always go through `useCssSupport()`
so the matrix stays auditable.

---

## Nuxt integration

origam ships an official Nuxt 3 / Nuxt 4 module as a sub-export — no
separate package to install. Add `'origam/nuxt'` to your `modules` and
get auto-imports for every component and composable, SSR-safe theme
resolution (cookie + `Sec-CH-Prefers-Color-Scheme` — no FOUC, no
hydration mismatch) and the right token stylesheets injected in order.

```ts
export default defineNuxtConfig({
    modules: ['origam/nuxt'],
    origam: {
        themes: ['light', 'dark'],
        defaultTheme: 'auto'
    }
})
```

Full reference: [`packages/docs/integrations/nuxt.md`](./packages/docs/integrations/nuxt.md).

---

## Browser support

| Browser         | Minimum    |
|-----------------|------------|
| Chrome / Edge   | last 2     |
| Firefox         | last 2     |
| Safari          | 16+        |

Older browsers still receive a degraded but functional experience through
the `useCssSupport()` fallback paths. Building the package locally
requires **Node >= 22** (see [`.nvmrc`](./.nvmrc)).

---

## Repository layout

The repo is a pnpm monorepo with six packages.

| Package | Purpose | Published? |
|---|---|---|
| [`packages/ds`](./packages/ds) | Vue 3 design system — components, composables, tokens. | ✅ npm: `origam` |
| [`packages/marketing`](./packages/marketing) | Nuxt 4 marketing site (landing, showcase, playground). | private |
| [`packages/stories`](./packages/stories) | Histoire stories (~208 specs, used as the visual sandbox). | private |
| [`packages/docs`](./packages/docs) | VitePress documentation site. | private |
| [`packages/tests`](./packages/tests) | Vitest (unit) + Playwright (e2e + a11y) suites. | private |

Cross-package dependencies use pnpm's `workspace:*` protocol.
`packages/ds` is the only package published to npm; tags trigger
`release.yml` which publishes from that directory exclusively.

---

## Contributing

Engineering principles, naming conventions, the classes-first contract,
and the "test-as-you-build" rule live in [`CLAUDE.md`](./CLAUDE.md).
Token authoring is now direct editing of the stylesheets under
[`packages/ds/src/assets/`](./packages/ds/src/assets) — see the "Design
tokens" section of [`CLAUDE.md`](./CLAUDE.md).

### Local setup (~5 min on a fresh clone)

The repo declares **both** `"workspaces": ["packages/*"]` (npm / yarn
syntax) and ships a `pnpm-workspace.yaml` so any of the three package
managers works. Internal cross-package refs use the plain `"*"` version
range (no `workspace:*` protocol), keeping every PM happy.

| PM | Install | Run a script in a package |
|---|---|---|
| **pnpm** (recommended — fastest install, the only lockfile we commit) | `corepack enable && pnpm install` | `pnpm -F <pkg> <script>` |
| **npm** | `npm install` | `npm run <script> --workspace=<pkg>` |
| **yarn** (1.x) | `yarn install` | `yarn workspace <pkg> <script>` |

Only `pnpm-lock.yaml` is committed. `package-lock.json` and `yarn.lock`
are git-ignored, so the three lockfiles never drift against each other
in version control.

```bash
git clone https://github.com/Elyseranet/origam.git
cd origam

# Recommended:
corepack enable                # pnpm@9.15.0
pnpm install

# Or equivalent:
# npm install
# yarn install

pnpm -F origam build           # build the library
pnpm -F @origam/stories dev    # http://localhost:6006 — Histoire sandbox
pnpm -F @origam/docs dev       # VitePress documentation
pnpm -F @origam/marketing dev  # http://localhost:3000 — marketing site
```

### Common commands

The root scripts are pnpm-flavoured for brevity, but every script
delegates to a workspace package so the equivalent npm / yarn invocation
also works.

| Goal | pnpm | npm | yarn |
|---|---|---|---|
| Build the library | `pnpm -F origam build` | `npm run build --workspace=origam` | `yarn workspace origam build` |
| Build every package | `pnpm -r build` | `npm run build --workspaces` | `yarn workspaces run build` |
| Run unit tests | `pnpm -F @origam/tests test:unit:run` | `npm run test:unit:run --workspace=@origam/tests` | `yarn workspace @origam/tests test:unit:run` |
| Run e2e tests | `pnpm -F @origam/tests test:e2e` | (idem) | (idem) |
| Run a11y tests | `pnpm -F @origam/tests test:a11y` | (idem) | (idem) |
| Lint (auto-fix) | `pnpm run lint:fix` | `npm run lint:fix` | `yarn lint:fix` |

Node ≥ 22 is mandatory (see [`.nvmrc`](./.nvmrc)). See
[`CLAUDE.md`](./CLAUDE.md) → *Monorepo workflow* for the full convention
on adding deps and authoring stories/docs in sync with components.

---

## License

[MIT](./LICENSE) (c) 2024 Prioul Arnaud
