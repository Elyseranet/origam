/**
 * Runtime theme (brand) name applied to `<html data-theme="…">` (or to a
 * sub-tree via `<OrigamThemeProvider>`).
 *
 * The theme axis carries the **brand** identity (`'default'`, `'brand-a'`,
 * …). It is orthogonal to the light/dark `mode` axis (`data-mode`).
 *
 * - `'auto'`  : no `data-theme` attribute set; children resolve against the
 *               closest ancestor (or the default brand at document root).
 * - `'light'` : legacy alias kept for back-compat (was the default brand).
 * - `'dark'`  : legacy alias kept for back-compat.
 * - any other string is treated as a custom theme (e.g. `'brand-a'`) — the
 *   matching CSS file must be loaded by the consumer.
 */
export type TTheme = 'auto' | 'light' | 'dark' | (string & {})

/**
 * Concrete (resolved) theme — what `data-theme` actually equals after
 * resolving `'auto'`. Useful for components that need to know the
 * effective theme (e.g. switching an SVG asset).
 */
export type TThemeResolved = Exclude<TTheme, 'auto'>

/**
 * Runtime color mode applied to `<html data-mode="…">` (or to a sub-tree
 * via `<OrigamThemeProvider mode="…">`).
 *
 * The mode axis is orthogonal to the brand `theme` axis: any brand can be
 * rendered in light or dark.
 *
 * - `'auto'`  : no `data-mode` attribute set; the browser/tokens pick
 *               light/dark from `prefers-color-scheme`.
 * - `'light'` : forced light mode.
 * - `'dark'`  : forced dark mode.
 */
export type TMode = 'auto' | 'light' | 'dark'

/**
 * Concrete (resolved) mode — what `data-mode` actually equals after
 * resolving `'auto'` against `prefers-color-scheme`.
 */
export type TModeResolved = Exclude<TMode, 'auto'>
