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
