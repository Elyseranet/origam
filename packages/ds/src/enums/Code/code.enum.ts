/**
 * Supported syntax-highlighting languages for `OrigamCode`.
 *
 * Kept in lockstep with the `langs` array passed to `createHighlighter()`
 * inside `code.composable.ts`. Adding a value here is NOT enough — the
 * highlighter must be re-built with the new grammar. See the composable
 * for the bundling story (each lang costs ~50–100 KB of grammar JSON, so
 * we ship a curated subset rather than the full ~200 langs shiki supports).
 */
export enum CODE_LANG {
    PLAINTEXT = 'plaintext',
    VUE = 'vue',
    TS = 'ts',
    JS = 'js',
    TSX = 'tsx',
    JSX = 'jsx',
    SCSS = 'scss',
    CSS = 'css',
    JSON = 'json',
    BASH = 'bash',
    HTML = 'html',
    XML = 'xml',
    YAML = 'yaml',
    MD = 'md'
}

/**
 * Theme mode for `OrigamCode`.
 *
 * `AUTO` follows the host page's `<html data-theme="…">` attribute (or the
 * `prefers-color-scheme` media query when no attribute is set). `LIGHT`
 * and `DARK` force a specific shiki theme regardless of the page theme.
 *
 * The value set is the transverse `COLOR_MODE` vocabulary — re-exported
 * under its historical name rather than redeclared, so the two lists
 * cannot drift apart. `CODE_THEME.AUTO`, `` `${CODE_THEME}` `` and
 * `import { CODE_THEME } from 'origam/enums'` all keep working
 * unchanged.
 */
export { COLOR_MODE as CODE_THEME } from '../Commons/theme.enum'
