import type { IThemeChip, IThemePreviewTile } from '~/interfaces/themes-showcase.interface'

/**
 * Theme chips — Sobre first (current page theme), then alphabetical variants.
 * Rendered as a plain flex-wrap <ul> (no OrigamChipGroup slide behaviour).
 */
export const THEME_CHIPS: IThemeChip[] = [
    { key: 'sobre', labelKey: 'home.themes.chip_sobre', labelFallback: 'Sobre' },
    { key: 'glass', labelKey: 'home.themes.chip_glass', labelFallback: 'Glass' },
    { key: 'geek', labelKey: 'home.themes.chip_geek', labelFallback: 'Geek' },
    { key: 'cartoon', labelKey: 'home.themes.chip_cartoon', labelFallback: 'Cartoon' },
    { key: 'editorial', labelKey: 'home.themes.chip_editorial', labelFallback: 'Editorial' },
    { key: 'material', labelKey: 'home.themes.chip_material', labelFallback: 'Material' },
    { key: 'ecom', labelKey: 'home.themes.chip_ecom', labelFallback: 'Ecom' },
    { key: 'apple', labelKey: 'home.themes.chip_apple', labelFallback: 'Apple' },
]

/**
 * Tooling meta line — monospaced, grey, displayed below the chips as a
 * separate <p> row (NOT inside the chip group / carousel).
 */
export const THEMES_TOOLING_TEXT: IThemeChip[] = [
    { key: 'tokens-studio', labelKey: 'home.themes.tokens_studio', labelFallback: '→ tokens.studio compatible' },
    { key: 'style-dictionary', labelKey: 'home.themes.style_dictionary', labelFallback: '→ Style Dictionary v4' },
]

/**
 * Four preview tiles, each a REAL registered theme applied via
 * `<OrigamThemeProvider theme mode>`. The tile surface, button and skeleton
 * bars all come from that theme's tokens — no hardcoded hex, no per-tile CSS
 * overrides. (Brand themes are clean IOrigamTheme objects in src/themes/.)
 */
export const THEME_PREVIEW_TILES: IThemePreviewTile[] = [
    { key: 'light', labelKey: 'home.themes.preview_light', labelFallback: 'light', theme: 'light', mode: 'light' },
    { key: 'dark', labelKey: 'home.themes.preview_dark', labelFallback: 'dark', theme: 'dark', mode: 'dark' },
    { key: 'cartoon', labelKey: 'home.themes.chip_cartoon', labelFallback: 'Cartoon', theme: 'cartoon', mode: 'light' },
    { key: 'apple', labelKey: 'home.themes.chip_apple', labelFallback: 'Apple', theme: 'apple', mode: 'light' }
]
