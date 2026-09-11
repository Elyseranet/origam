/**
 * Theme mode for `OrigamCode`.
 *
 * `AUTO` follows the host page's `<html data-theme="…">` attribute (or the
 * `prefers-color-scheme` media query when no attribute is set). `LIGHT`
 * and `DARK` force a specific shiki theme regardless of the page theme.
 */
export enum CODE_THEME {
    AUTO = 'auto',
    LIGHT = 'light',
    DARK = 'dark'
}
