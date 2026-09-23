import { CODE_LANG } from '../../enums'

/**
 * Languages bundled with the default shiki highlighter. Keep this list and
 * the `langs` argument of `createHighlighter()` in lockstep — see
 * `code.composable.ts`.
 */
export const SUPPORTED_LANGS: ReadonlyArray<CODE_LANG> = Object.freeze([
    CODE_LANG.PLAINTEXT,
    CODE_LANG.VUE,
    CODE_LANG.TS,
    CODE_LANG.JS,
    CODE_LANG.TSX,
    CODE_LANG.JSX,
    CODE_LANG.SCSS,
    CODE_LANG.CSS,
    CODE_LANG.JSON,
    CODE_LANG.BASH,
    CODE_LANG.HTML,
    CODE_LANG.XML,
    CODE_LANG.YAML,
    CODE_LANG.MD
])

/**
 * Maximum entries kept by the per-singleton LRU cache. 64 is large enough
 * for a page that renders dozens of small snippets, small enough that the
 * memory footprint stays under ~1 MB of pre-rendered HTML.
 */
export const CODE_CACHE_MAX_ENTRIES = 64

/**
 * Shiki themes used by `useCode`.
 *
 * ⛔ #535 — `github-light` / `github-dark` (the previous pair) fail WCAG AA
 * (4.5:1) on several token categories REGARDLESS of the surface they sit on:
 * measured against a background as light as pure `#ffffff`, the `github-light`
 * "parameter/property" hue (`#e36209`) tops out at 3.49:1 — it cannot reach
 * 4.5:1 by darkening or lightening the background alone, because the DS has
 * no per-syntax-category token to recolour it (Shiki paints via its own
 * `--shiki-light`/`--shiki-dark` inline vars, see `code.composable.ts`).
 * `keyword`/`comment`/`tag` were close misses (~3.9–4.4:1) for the same
 * reason. `github-light-high-contrast` / `github-dark-high-contrast` are
 * shiki's own accessibility-tuned variants of the same GitHub palette
 * (bundled by shiki, zero extra bytes — swapping one theme name for another).
 * Re-measured (Node, shiki 4.3.1, `codeToHtml` output — no DOM/var()
 * involved, these are the theme's literal per-token hex, see #535 PR):
 * worst case across all 8 token categories × 7 marketing brand surfaces ×
 * both modes is 4.23:1 (light, "comment" on 3 tinted brand backgrounds) —
 * closed by the companion `--origam-color__surface---raised` background fix
 * below (worst case then 4.77:1 light / 5.79:1 dark, Playwright-verified
 * against the built Histoire `OrigamCode` story).
 */
export const CODE_LIGHT_THEME = 'github-light-high-contrast'
export const CODE_DARK_THEME = 'github-dark-high-contrast'

/**
 * Default values used by `OrigamCode`. Centralised so the story / docs /
 * tests pull the same constants and any future drift stays visible.
 */
export const CODE_DEFAULTS = Object.freeze({
    lang: CODE_LANG.PLAINTEXT,
    lineNumbers: false,
    copyable: true,
    wrap: false,
    format: false,
    /**
     * Feedback duration for the "Copied!" pill, in ms. Matches the
     * snackbar default so the visual rhythm stays consistent.
     */
    copyFeedbackDurationMs: 2000
} as const)
