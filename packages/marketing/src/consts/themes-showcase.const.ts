import type { IThemeChip, IThemePreviewTile } from '~/interfaces/themes-showcase.interface'

/**
 * Route to the live Theme Builder (see src/pages/theming.vue) — lets a
 * visitor configure props + tokens visually instead of taking the section's
 * claims on faith (#28).
 */
export const HOME_THEMES_BUILDER_HREF = '/theming'

/**
 * Tooling meta line — monospaced, grey, displayed as a separate <p> row.
 */
export const THEMES_TOOLING_TEXT: IThemeChip[] = [
    { key: 'theming', labelKey: 'home.themes.tooling_theming', labelFallback: '→ props first, whole catalogue' },
    { key: 'tokens', labelKey: 'home.themes.tooling_tokens', labelFallback: '→ plain CSS/SCSS tokens, no build step' },
]

/**
 * Four preview tiles, each a REAL registered theme applied via
 * `<OrigamThemeProvider theme mode>`. The tile surface, button and skeleton
 * bars all come from that theme's tokens — no hardcoded hex, no per-tile CSS
 * overrides. (Brand themes are clean IOrigamTheme objects in src/themes/.)
 */
export const THEME_PREVIEW_TILES: IThemePreviewTile[] = [
    { key: 'light', labelKey: 'home.themes.preview_light', labelFallback: 'light', theme: 'light', mode: 'light', elevation: 'none', href: `${HOME_THEMES_BUILDER_HREF}?preset=origam&mode=light` },
    { key: 'dark', labelKey: 'home.themes.preview_dark', labelFallback: 'dark', theme: 'dark', mode: 'dark', elevation: 'none', href: `${HOME_THEMES_BUILDER_HREF}?preset=origam&mode=dark` },
    { key: 'cartoon', labelKey: 'home.themes.chip_cartoon', labelFallback: 'Cartoon', theme: 'cartoon', mode: 'light', elevation: 'md', href: `${HOME_THEMES_BUILDER_HREF}?preset=cartoon` },
    { key: 'apple', labelKey: 'home.themes.chip_apple', labelFallback: 'Apple', theme: 'apple', mode: 'light', elevation: 'none', href: `${HOME_THEMES_BUILDER_HREF}?preset=apple` }
]
