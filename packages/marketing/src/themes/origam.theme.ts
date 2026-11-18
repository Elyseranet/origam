import type { IOrigamTheme } from 'origam/interfaces'
// Import the DS baseline from SOURCE (not the `origam/themes` package subpath,
// which resolves to `dist/`). `nuxt.config.ts` pulls this file in at config-load
// time (jiti) — before any Vite alias applies and before the DS lib is built —
// so a `dist`-bound import breaks `nuxt prepare` when the lib isn't compiled
// (e.g. the docs-fixtures workflow). The relative source path resolves at both
// config-load and runtime, mirroring the `origam/* → ../ds/src` aliases.
import { origamDarkTheme as baseDark, origamLightTheme as baseLight } from '../../../ds/src/themes/origam.theme'

import { ORIGAM_COMPONENT_RESET_DARK, ORIGAM_COMPONENT_RESET_LIGHT } from '../consts/origam-reset.const'

/**
 * Origam — NAMED reset theme for the /theming playground.
 *
 * PROPS-FIRST, DS-first: the neutral identity (semantic tokens in `vars`,
 * per-component default props in `components`) is REUSED verbatim from the DS
 * baseline `origam` theme (`origam/themes`) — no duplication. We only re-tag it
 * with `name: 'origam'` so the DS emits a `[data-theme="origam"]` block (the DS
 * baseline is ROOT-scoped and never matches a nested `data-theme`).
 *
 * Why the generated `cssVars` reset (origam-reset.const.ts):
 * A `[data-theme="origam"]` SUB-TREE (the preview provider) only re-declares the
 * vars IT lists. Component-level vars (`--origam-btn---*`, `--origam-card---*`, …)
 * that a brand (or a DS-registered theme block) defines at the document root
 * would otherwise INHERIT into the preview and leak the ambient brand's look
 * (seen live: cartoon's `--origam-btn---background-color-tonal: #fff3d6` leaked
 * into a Glass preview). A hand-curated list can never keep up (~2700 component
 * vars per mode), so the COMPLETE baseline reset is GENERATED from the DS
 * light.css / dark.css sheets — regenerate with
 * `pnpm -F @origam/marketing theme:reset:generate` after a DS token rebuild.
 *
 * Component DEFAULT PROPS reset is handled by `OrigamThemeProvider` (which now
 * applies `theme.components` to its sub-tree) — this file supplies the CSS-var
 * side that props cannot express.
 */
export const origamLightTheme: IOrigamTheme = {
    ...baseLight,
    name: 'origam',
    cssVars: ORIGAM_COMPONENT_RESET_LIGHT
}

export const origamDarkTheme: IOrigamTheme = {
    ...baseDark,
    name: 'origam',
    cssVars: ORIGAM_COMPONENT_RESET_DARK
}

export const origamThemes = [origamLightTheme, origamDarkTheme]
