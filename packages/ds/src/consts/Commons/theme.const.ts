import type { InjectionKey } from 'vue'

import type { IDefault } from '../../interfaces'
import type { TInstalledThemes, TModeResolved } from '../../types'

export const ORIGAM_THEME_AUTO = 'auto'
export const ORIGAM_THEME_LIGHT = 'light'
export const ORIGAM_THEME_DARK = 'dark'

/**
 * App-level provide key carrying the list of brand themes installed via
 * `createOrigam({ themes })`. Read it through `useInstalledThemes()`.
 */
export const ORIGAM_THEMES_KEY: InjectionKey<TInstalledThemes> = Symbol.for('origam:themes')

/**
 * App-level provide key carrying a resolver that collapses the per-component
 * DEFAULT PROPS (`theme.components`) for a given brand×mode into a single
 * `IDefault` (baseline `origam` ⊕ the named brand, in install order).
 *
 * `createOrigam` provides the closure over the full install list;
 * `<OrigamThemeProvider theme="<brand>">` injects it to re-apply that brand's
 * default props to its SUB-TREE (via `provideDefaults`), so props-first theming
 * works in a scoped sub-tree exactly as it does at the document root — not just
 * the CSS-variable re-scoping done by `data-theme`.
 */
export const ORIGAM_THEME_DEFAULTS_KEY: InjectionKey<(brand: string, mode?: TModeResolved) => IDefault> = Symbol.for('origam:theme-defaults')

export const ORIGAM_THEME_STORAGE_KEY = 'origam-theme'
export const ORIGAM_THEME_ATTR = 'data-theme'

export const ORIGAM_MODE_AUTO = 'auto'
export const ORIGAM_MODE_LIGHT = 'light'
export const ORIGAM_MODE_DARK = 'dark'

export const ORIGAM_MODE_STORAGE_KEY = 'origam-mode'
export const ORIGAM_MODE_ATTR = 'data-mode'

export const ORIGAM_NUXT_DEFAULT_COOKIE_NAME = 'origam-theme'
export const ORIGAM_NUXT_DEFAULT_MODE_COOKIE_NAME = 'origam-mode'
export const ORIGAM_NUXT_DEFAULT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
export const ORIGAM_NUXT_DEFAULT_THEMES = ['light', 'dark'] as const
export const ORIGAM_NUXT_DEFAULT_MODES = ['light', 'dark'] as const
export const ORIGAM_NUXT_DEFAULT_THEME = 'auto'
export const ORIGAM_NUXT_DEFAULT_MODE = 'auto'
export const ORIGAM_NUXT_DEFAULT_PREFIX = 'Origam'
