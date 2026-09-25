import { createApp, h } from 'vue'

import { createOrigam } from '../../../ds/src/origam'
import { origamTheme } from '../../../ds/src/themes/origam.theme'
import '../../../ds/src/assets/css/main.css'

/*********************************************************
 * Marketing's GLOBAL CSS cascade — `packages/marketing/nuxt.config.ts`'s own
 * `css: […]` array, same order. Every marketing page (the future /why-origam
 * included) loads ALL of these unconditionally, regardless of which theme is
 * active — they are plain `[data-theme="X"]`-selector stylesheets, entirely
 * separate from the `IOrigamTheme.vars`/`cssVars` this harness also installs
 * via `createOrigam()` below. The two mechanisms coexist and both declare
 * some of the SAME `--origam-*` custom properties (confirmed for `glass`:
 * `--origam-page---background-image`, the 4-blob gradient, exists ONLY here —
 * `glass.theme.ts`'s `cssVars` never sets it, it only mentions it in a
 * comment). Omitting these files would silently measure a `glass` that
 * cannot show its own signature background, which is not what a visitor of
 * a real marketing page sees.
 ********************************************************/
import '../../../marketing/src/assets/css/themes/_shared.css'
import '../../../marketing/src/assets/css/themes/geek.css'
import '../../../marketing/src/assets/css/themes/glass.css'
import '../../../marketing/src/assets/css/themes/cartoon.css'
import '../../../marketing/src/assets/css/themes/editorial.css'
import '../../../marketing/src/assets/css/themes/material.css'
import '../../../marketing/src/assets/css/themes/ecom.css'
import '../../../marketing/src/assets/css/themes/apple.css'
import '../../../marketing/src/assets/css/base.css'

import { appleThemes } from '../../../marketing/src/themes/apple.theme'
import { cartoonThemes } from '../../../marketing/src/themes/cartoon.theme'
import { ecomThemes } from '../../../marketing/src/themes/ecom.theme'
import { editorialThemes } from '../../../marketing/src/themes/editorial.theme'
import { geekThemes } from '../../../marketing/src/themes/geek.theme'
import { glassThemes } from '../../../marketing/src/themes/glass.theme'
import { materialThemes } from '../../../marketing/src/themes/material.theme'

import ProbeFocusSurface from './ProbeFocusSurface.vue'
import ProbeSurface from './ProbeSurface.vue'
import type { IProbeConfig } from './probe-matrix.interface'

/*********************************************************
 * Harness entry — root-scope only
 *
 * @description
 * The /why-origam demo re-themes the WHOLE page when the visitor switches
 * brand (not an isolated `<OrigamThemeProvider>` sub-tree) — that is the only
 * scope where `glass`'s page-level gradient backdrop (consumed by `<body>`,
 * outside any sub-tree) can even show up. So this harness only ever pins the
 * identity/mode on `<html>`, unlike `dark-contrast.audit.mjs` which also
 * covers a `subtree` scope for a different question (#871).
 *
 * ⛔ Pinning happens HERE, pre-render, not via Playwright's `addInitScript`:
 * that callback runs on an empty document where `document.documentElement`
 * is still `null` and the `setAttribute` throws silently (CLAUDE.md, #871
 * post-mortem — the exact failure mode that made the first pass of that
 * harness read "0 violations" on all 16 root configurations).
 ********************************************************/
const cfg = (window as unknown as { __ORIGAM_PROBE__?: IProbeConfig }).__ORIGAM_PROBE__

if (!cfg) throw new Error('why-origam-contrast: window.__ORIGAM_PROBE__ was not set before module evaluation.')

const html = document.documentElement
if (cfg.identity !== 'origam') html.setAttribute('data-theme', cfg.identity)
html.setAttribute('data-mode', cfg.mode)

/*********************************************************
 * `origamTheme` passed explicitly — required since #360/#877: a bare
 * `createOrigam()` installs NO theme at all (no `vars`, no per-component
 * `components` defaults). Every brand theme layers on top of it.
 ********************************************************/
const origam = createOrigam({
    themes: [
        ...origamTheme,
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

/*
 * #924 — the focus surface is opt-in via `surface: 'focus'`. Absent (the
 * historical shape) keeps mounting the text-contrast surface, so
 * `why-origam-contrast.audit.mjs`'s own numbers are untouched by this addition.
 */
const surface = cfg.surface === 'focus' ? ProbeFocusSurface : ProbeSurface

createApp({
    render: () => h(surface)
}).use(origam).mount(root)

;(window as unknown as { __ORIGAM_PROBE_READY__?: boolean }).__ORIGAM_PROBE_READY__ = true
