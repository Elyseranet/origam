import { createApp, h } from 'vue'

import { createOrigam } from '../../../ds/src/origam'
import OrigamThemeProvider from '../../../ds/src/components/ThemeProvider/OrigamThemeProvider.vue'
import '../../../ds/src/assets/css/main.css'

import { appleThemes } from '../../../marketing/src/themes/apple.theme'
import { cartoonThemes } from '../../../marketing/src/themes/cartoon.theme'
import { ecomThemes } from '../../../marketing/src/themes/ecom.theme'
import { editorialThemes } from '../../../marketing/src/themes/editorial.theme'
import { geekThemes } from '../../../marketing/src/themes/geek.theme'
import { glassThemes } from '../../../marketing/src/themes/glass.theme'
import { materialThemes } from '../../../marketing/src/themes/material.theme'

import ProbeSurface from './ProbeSurface.vue'
import { PROBE_IDENTITIES, PROBE_MODES } from './probe-matrix.const'
import type { IProbeConfig } from './probe-matrix.interface'

/*********************************************************
 * Harness entry
 *
 * @description
 * Two scopes, driven by `window.__ORIGAM_PROBE__` which Playwright writes with
 * `addInitScript` — i.e. BEFORE the document is parsed, so no element is ever
 * mutated after render (CLAUDE.md: an already-rendered element does not
 * recalculate).
 *
 *   - `root`    : one identity × mode pinned on `<html>`, ONE surface.
 *   - `subtree` : `<html data-mode="light">` and the 16 identity × mode
 *                 combinations rendered as `<OrigamThemeProvider>` sub-trees.
 *
 * ⛔ Every configuration carries ITS OWN themed surface (`ProbeSurface.vue` paints
 * `--origam-color__surface---default`). Without that, a dark sub-tree sits on
 * the page's light body and the probe reports violations the DS never
 * produces — the artefact that inflated the first pass of #871 by 101.
 ********************************************************/

const cfg = (window as unknown as { __ORIGAM_PROBE__?: IProbeConfig }).__ORIGAM_PROBE__
        ?? { scope: 'subtree' }

/*********************************************************
 * Pin the axes on <html> BEFORE the first mount
 *
 * @description
 * ⛔ This cannot be done from Playwright's `addInitScript`: that script runs
 * on an EMPTY document, where `document.documentElement` is still `null`, so
 * the `setAttribute` throws and the attribute is silently never written. The
 * first pass of this harness measured its 16 "root" configurations that way
 * and they ALL rendered light — 0 violations, a clean-looking result that was
 * pure artefact.
 *
 * Writing them here is pre-render (Vue has not mounted), which is also what a
 * real anti-flash SSR plugin does (`applyThemeSync` / `applyModeSync`).
 ********************************************************/
const html = document.documentElement
if (cfg.scope === 'root') {
    if (cfg.identity && cfg.identity !== 'native') html.setAttribute('data-theme', cfg.identity)
    if (cfg.mode) html.setAttribute('data-mode', cfg.mode)
} else {
    html.setAttribute('data-mode', 'light')
}

const origam = createOrigam({
    themes: [
        ...appleThemes,
        ...cartoonThemes,
        ...ecomThemes,
        ...editorialThemes,
        ...geekThemes,
        ...glassThemes,
        ...materialThemes
    ]
})

const root = document.getElementById('app')!

if (cfg.scope === 'root') {
    createApp({
        render: () => h(ProbeSurface)
    }).use(origam).mount(root)
} else {
    createApp({
        render: () => PROBE_IDENTITIES.flatMap((identity) =>
            PROBE_MODES.map((mode) => h(
                OrigamThemeProvider,
                {
                    'theme': identity === 'native' ? 'auto' : identity,
                    'mode': mode,
                    'data-probe-config': `${identity}|${mode}`,
                    'key': `${identity}|${mode}`
                },
                { default: () => h(ProbeSurface) }
            ))
        )
    }).use(origam).mount(root)
}

;(window as unknown as { __ORIGAM_PROBE_READY__?: boolean }).__ORIGAM_PROBE_READY__ = true
