import type { TElevation, TMode, TTheme } from 'origam/types'

export interface IThemeChip {
    key: string
    labelKey: string
    labelFallback: string
}

export interface IThemePreviewTile {
    key: string
    labelKey: string
    labelFallback: string
    /**
     * Real registered DS theme id (see packages/ds/tokens/$themes.json) applied
     * to the tile sub-tree via <OrigamThemeProvider theme>. The tile surface
     * comes from THIS theme's `--origam-color__surface---default` — no hardcoded
     * hex. The matching `{theme}-{mode}.css` sheet must be loaded in nuxt.config.
     */
    theme: TTheme
    /** Color mode applied via <OrigamThemeProvider mode>. */
    mode: TMode
    /** Élévation de la tuile : `none` partout (maquette v12), `md` pour Cartoon dont l'ombre dure vient du thème. */
    elevation: TElevation
    /** Theme Builder deep link preloading this theme (`/theming?preset=...`). */
    href: string
}
