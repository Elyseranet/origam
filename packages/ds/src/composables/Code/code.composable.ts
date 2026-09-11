import type { IUseCodeReturn } from '../../interfaces'
import type { TCodeLang } from '../../types'

import { CODE_CACHE_MAX_ENTRIES, CODE_DARK_THEME as DARK_THEME, CODE_LIGHT_THEME as LIGHT_THEME, SUPPORTED_LANGS } from '../../consts/Code/code.const'
import { CODE_LANG } from '../../enums'

/**
 * `useCode()` — singleton shiki highlighter.
 *
 * shiki is heavy (~3 MB of grammar + theme JSON when the full default set
 * is bundled). We therefore:
 *   1. Lazy-import the module on the first `highlight()` call so the cost
 *      is paid only when a `<OrigamCode>` actually mounts.
 *   2. Restrict the loaded langs to the curated origam subset
 *      (see `SUPPORTED_LANGS`). Two themes (light + dark) are embedded so
 *      shiki can emit dual-colour CSS vars and the rendered HTML works
 *      across both light and dark surfaces without re-tokenising.
 *   3. Cache the per-call HTML result in a tiny LRU keyed by
 *      `(code, lang)` so re-renders / re-hovers never re-tokenise.
 *
 * The singleton is module-scoped — every `useCode()` consumer in the app
 * shares the same highlighter promise. `resetCacheForTesting()` is the
 * only test-only escape hatch.
 *
 * Theme integration (shiki v1+):
 * We call `codeToHtml(code, { themes: { light, dark }, defaultColor: false })`.
 * shiki then emits, on every token span:
 *     `style="--shiki-light:#xxx;--shiki-dark:#yyy"`
 * with NO inline `color:` declaration. The component SCSS consumes the
 * matching variable based on `<html data-theme="…">`, so theme switching
 * is a pure CSS cascade (no JS re-render).
 */

type ShikiHighlighter = {
    codeToHtml: (code: string, opts: {
        lang: string
        themes?: { light: string, dark: string }
        defaultColor?: false | string
    }) => string
}

let _highlighterPromise: Promise<ShikiHighlighter> | null = null
let _highlighterReady = false
// `shiki` is an OPTIONAL peer dependency. When it is not installed, the dynamic
// import below throws — we degrade to plain, un-highlighted code instead of
// breaking the component. Consumers who want syntax colouring add `shiki` to
// their own dependencies.
let _highlighterUnavailable = false
let _unavailableWarned = false
const _cache = new Map<string, string>()
let _unsupportedLangWarned = new Set<string>()

/** Minimal HTML escaping for the plain (no-shiki) fallback path. */
function escapeHtml (s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function makeCacheKey (code: string, lang: string): string {
    return `${lang}::${code}`
}

function lruGet (key: string): string | undefined {
    const hit = _cache.get(key)
    if (hit === undefined) return undefined
    // Re-insert to move the entry to the tail (most-recent slot). Map
    // preserves insertion order, which is exactly the LRU we want.
    _cache.delete(key)
    _cache.set(key, hit)
    return hit
}

function lruSet (key: string, value: string): void {
    if (_cache.size >= CODE_CACHE_MAX_ENTRIES) {
        // Evict the oldest entry — Map iteration order is insertion order,
        // so `keys().next().value` is the LRU victim.
        const oldest = _cache.keys().next().value
        if (oldest !== undefined) _cache.delete(oldest)
    }
    _cache.set(key, value)
}

async function loadHighlighter (): Promise<ShikiHighlighter | null> {
    if (_highlighterUnavailable) return null
    if (_highlighterPromise) return _highlighterPromise

    _highlighterPromise = (async () => {
        // Dynamic import keeps shiki out of the initial bundle. We embed
        // BOTH a light and a dark theme so the dual-colour CSS-var output
        // works without re-tokenising on theme switch.
        //
        // `/* @vite-ignore */` is REQUIRED for VitePress builds: without
        // it, Rollup follows the dep graph into shiki's WASM loader and
        // emits an invalid virtual chunk `wasm.!~{001}~.js` containing
        // `{ __proto__: null, default }` shorthand — `default` is a
        // reserved word so esbuild rejects the chunk during transpile.
        // The comment tells Vite to leave the specifier alone and load
        // shiki at runtime via the host's `import()` (Node ESM /
        // browser native), which is exactly what we want anyway since
        // shiki is heavy and only needed once a code-block actually
        // renders.
        const shiki = await import(/* @vite-ignore */ 'shiki')
        const highlighter = await shiki.createHighlighter({
            themes: [LIGHT_THEME, DARK_THEME],
            langs: [...SUPPORTED_LANGS]
        })
        _highlighterReady = true
        return highlighter as unknown as ShikiHighlighter
    })()

    // shiki not installed (optional peer) or failed to load → degrade to plain.
    return _highlighterPromise.catch((err: unknown) => {
        _highlighterUnavailable = true
        _highlighterPromise = null
        if (!_unavailableWarned) {
            _unavailableWarned = true
            console.warn(
                '[origam] OrigamCode: `shiki` is not installed — rendering plain, ' +
                'unhighlighted code. Add `shiki` to your dependencies to enable ' +
                'syntax highlighting.',
                err
            )
        }
        return null
    })
}

function resolveLang (lang: TCodeLang): string {
    if ((SUPPORTED_LANGS as ReadonlyArray<string>).includes(lang)) return lang
    if (!_unsupportedLangWarned.has(lang)) {
        _unsupportedLangWarned.add(lang)

        console.warn(
            `[origam] OrigamCode: lang="${lang}" is not in the bundled grammar set. ` +
            `Falling back to "${CODE_LANG.PLAINTEXT}". ` +
            `Supported: ${SUPPORTED_LANGS.join(', ')}.`
        )
    }
    return CODE_LANG.PLAINTEXT
}

/**
 * Public hook — see `IUseCodeReturn` for the surface contract.
 */
export function useCode (): IUseCodeReturn {
    async function highlight (
        code: string,
        lang: TCodeLang
    ): Promise<string> {
        const resolvedLang = resolveLang(lang)
        const key = makeCacheKey(code, resolvedLang)
        const cached = lruGet(key)
        if (cached !== undefined) return cached

        const highlighter = await loadHighlighter()
        if (!highlighter) {
            // shiki unavailable → plain, escaped code. `paintIntoDom` still
            // splits on `\n` and wraps each line in a `.origam-code__row`, so
            // line numbers / highlight-lines / copy keep working — only the
            // syntax colours are absent.
            const plain = escapeHtml(code)
            lruSet(key, plain)
            return plain
        }
        const opts = {
            lang: resolvedLang,
            themes: { light: LIGHT_THEME, dark: DARK_THEME },
            defaultColor: false as const
        }
        let html: string
        try {
            html = highlighter.codeToHtml(code, opts)
        } catch (err) {
            // shiki throws on truly malformed input. Degrade gracefully to
            // an escaped plaintext `<pre>` so the consumer never breaks.

            console.warn('[origam] OrigamCode: shiki failed to tokenise, falling back to plaintext.', err)
            html = highlighter.codeToHtml(code, { ...opts, lang: CODE_LANG.PLAINTEXT })
        }
        lruSet(key, html)
        return html
    }

    async function prime (): Promise<void> {
        await loadHighlighter()
    }

    function isReady (): boolean {
        return _highlighterReady
    }

    function resetCacheForTesting (): void {
        _cache.clear()
        _unsupportedLangWarned = new Set<string>()
    }

    return { highlight, prime, isReady, resetCacheForTesting }
}

/**
 * Test-only: drop the singleton so a fresh dynamic import runs next call.
 * Production code should never need this.
 */
export function resetCodeHighlighterForTesting (): void {
    _highlighterPromise = null
    _highlighterReady = false
    _highlighterUnavailable = false
    _unavailableWarned = false
    _cache.clear()
    _unsupportedLangWarned = new Set<string>()
}
