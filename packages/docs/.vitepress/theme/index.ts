import '@origam/assets/css/tokens/primitive.css'
import '@origam/assets/css/tokens/light.css'
import '@origam/assets/css/tokens/dark.css'

import './custom.css'

import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

export default {
  extends: DefaultTheme,
  async enhanceApp ({ app }) {
    // origam is registered CLIENT-SIDE ONLY. Statically importing it pulls the
    // whole library into VitePress' SSR bundle, where bundling its CJS-interop
    // dependencies produced `Unexpected token 'default'` at server render. The
    // live component demos only need origam in the browser (they hydrate), so a
    // dynamic import behind the SSR guard keeps origam out of the server pass.
    if (!import.meta.env.SSR) {
      const { createOrigam } = await import('@origam/origam')
      // ⛔ #360 (v3.0.0 harvest) — a bare `createOrigam()` installs no theme
      // any more. The live component demos need `origamTheme`'s per-component
      // prop defaults (ADR-005), so it is passed explicitly.
      const { origamTheme } = await import('@origam/themes')
      app.use(createOrigam({ themes: origamTheme }))
    }
  }
} satisfies Theme
