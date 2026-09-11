# origam

A Vue 3 design system with multi-theme design tokens, CSS-first components
and TypeScript types.

> 📖 **Full documentation & interactive theme builder:**
> [https://origam.dev](https://origam.dev) *(coming soon)* ·
> [GitHub repository](https://github.com/arnaudprioul/origam)

## Installation

```bash
npm install origam      # or: pnpm add origam, or: yarn add origam
```

| Peer dependency | Required | Used by                       |
|-----------------|----------|-------------------------------|
| `vue`           | `^3.5`   | Always.                       |
| `vue-i18n`      | optional | Locale composable.            |
| `vue-router`    | optional | Link components.              |
| `shiki`         | optional | `OrigamCode` syntax highlight.|

## Quick start

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

```vue
<template>
  <origam-btn color="primary" text="Save" />
</template>
```

### Nuxt

The package ships an official Nuxt module:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['origam/nuxt']
})
```

## Theming

- **Multi-theme, two axes** — `data-theme` (brand) × `data-mode`
  (light/dark), driven by design tokens (`primitive → semantic →
  component` tiers). `prefers-color-scheme` is honoured in auto mode.
- **Props-first** — a theme is an object configuring **component props
  first** (variant, rounded, density, elevation, …), then semantic
  tokens; raw CSS vars are the last resort.
- **CSS-first components** — modern CSS (`grid`, `:has()`, container
  queries, `color-mix()`) before JavaScript, with feature-detection
  fallbacks.

Token stylesheets are exposed as dedicated entries: `origam/styles`
(full aggregate), `origam/tokens/css/*` and `origam/tokens/scss/*`
(granular), plus typed sub-exports (`origam/components`,
`origam/composables`, `origam/enums`, `origam/types`, …).

## Links

- [Documentation & theme builder](https://origam.dev) *(coming soon)*
- [Changelog](https://github.com/arnaudprioul/origam/blob/main/CHANGELOG.md)
- [Issues](https://github.com/arnaudprioul/origam/issues)

## License

[MIT](https://github.com/arnaudprioul/origam/blob/main/LICENSE) © Prioul Arnaud
