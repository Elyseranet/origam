/*********************************************************
 * origam/ssr (#1386)
 *
 * @description
 * Documented, lean server-side theme/style helpers. Replaces the internal
 * `origam/utils/Commons/{apply-theme,ssr-styles}.util.js` paths.
 ********************************************************/
export { renderThemeCss } from './utils/Commons/theme-ssr.util'
export { getSsrStyles, renderSsrStyles } from './utils/Commons/ssr-styles.util'
export { isModePinned, knownBrand } from './utils/Commons/apply-theme.util'
export type { IRenderThemeCssOptions } from './interfaces/Commons/theme.interface'
