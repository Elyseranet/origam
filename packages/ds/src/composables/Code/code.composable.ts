import { inject } from 'vue'

import type { IUseCodeReturn } from '../../interfaces/Code/code.interface'
import type { TCodeLang } from '../../types/Code/code.type'
import type { TShikiHighlighter, TShikiHighlighterLoader, TShikiModule } from '../../types/Code/code.type'

import { CODE_CACHE_MAX_ENTRIES, CODE_DARK_THEME as DARK_THEME, CODE_LIGHT_THEME as LIGHT_THEME, ORIGAM_CODE_KEY, SUPPORTED_LANGS } from '../../consts/Code/code.const'
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
 * Custom highlighter (`createOrigam({ code: { highlighter } })`):
 * An app can replace WHAT gets dynamically imported — see `loadHighlighter()`
 * below — with its own shiki-compatible module (`TShikiModule`: anything
 * exposing `createHighlighter`), e.g. `shiki/core` + a JS regex engine
 * instead of the full `shiki` package (no WASM loader, no oniguruma
 * binary). Because the highlighter stays a page-wide singleton, the loader
 * is read once — via `inject(ORIGAM_CODE_KEY, …)`, synchronously inside
 * `useCode()` — by whichever `<OrigamCode>` instance mounts first; every
 * other instance, under this or another `createOrigam()` ancestor, reuses
 * that same highlighter for the rest of the page's life. Absent, nothing
 * changes: `loadHighlighter()` keeps importing `shiki` exactly as before.
 *
 * Theme integration (shiki v1+):
 * We call `codeToHtml(code, { themes: { light, dark }, defaultColor: false })`.
 * shiki then emits, on every token span:
 *     `style="--shiki-light:#xxx;--shiki-dark:#yyy"`
 * with NO inline `color:` declaration. The component SCSS consumes the
 * matching variable based on `<html data-theme="…">`, so theme switching
 * is a pure CSS cascade (no JS re-render).
 */

let _highlighterPromise: Promise<TShikiHighlighter> | null = null
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

async function loadHighlighter (loader?: TShikiHighlighterLoader): Promise<TShikiHighlighter | null> {
    if (_highlighterUnavailable) return null
    if (_highlighterPromise) return _highlighterPromise

    /*********************************************************
     * Resolving `shiki`
     *
     * @description
     * Embed BOTH a light and a dark theme so the dual-colour CSS-var output
     * works without re-tokenising on theme switch — true on either branch
     * below.
     *
     * @description
     * `loader` branch — app-supplied module (`createOrigam({ code:
     * { highlighter } })`). We never touch the bare `'shiki'` specifier on
     * this branch, so the `@vite-ignore` reasoning below does not apply
     * here: whatever Rollup makes of the app's own loader is the app's own
     * bundler concern, not this DS's. The cast to `TShikiModule` is not
     * needed either — `TShikiHighlighterLoader` already returns one.
     *
     * @description
     * Default branch — dynamic import keeps shiki out of the initial
     * bundle. `/* @vite-ignore *\/` is REQUIRED for VitePress builds:
     * without it, Rollup follows the dep graph into shiki's WASM loader and
     * emits an invalid virtual chunk `wasm.!~{001}~.js` containing
     * `{ __proto__: null, default }` shorthand — `default` is a reserved
     * word so esbuild rejects the chunk during transpile. The comment tells
     * Vite to leave the specifier alone and load shiki at runtime via the
     * host's `import()` (Node ESM / browser native), which is exactly what
     * we want anyway since shiki is heavy and only needed once a code-block
     * actually renders. Still true on THIS branch — an app that never sets
     * `code.highlighter` is still VitePress's `packages/docs`, and still
     * needs this.
     *
     * @description
     * The `as unknown as TShikiModule` cast on the default branch mirrors
     * the `highlighter as unknown as TShikiHighlighter` cast below: shiki's
     * OWN type narrows `themes` / `langs` to its bundled literal unions
     * (mutable arrays of `BundledTheme` / `BundledLanguage`), stricter than
     * — and not structurally assignable to — the deliberately loose
     * `TShikiModule` this DS exposes to a third-party loader. The runtime
     * shape is identical either way.
     ********************************************************/
    _highlighterPromise = (async () => {
        const shiki: TShikiModule = loader
            ? await loader()
            : await import(/* @vite-ignore */ 'shiki') as unknown as TShikiModule

        const highlighter = await shiki.createHighlighter({
            themes: [LIGHT_THEME, DARK_THEME],
            langs: [...SUPPORTED_LANGS]
        })
        _highlighterReady = true
        return highlighter as unknown as TShikiHighlighter
    })()

    /*********************************************************
     * @description
     * Default shiki not installed (optional peer), or an app-supplied
     * loader rejected / its module lacks `createHighlighter` → degrade to
     * plain. Same fallback on both branches; only the warning differs.
     ********************************************************/
    return _highlighterPromise.catch((err: unknown) => {
        _highlighterUnavailable = true
        _highlighterPromise = null
        if (!_unavailableWarned) {
            _unavailableWarned = true
            console.warn(
                loader
                    ? '[origam] OrigamCode: the `highlighter` supplied to `createOrigam({ code })` ' +
                      'failed to load — rendering plain, unhighlighted code.'
                    : '[origam] OrigamCode: `shiki` is not installed — rendering plain, ' +
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
 *
 * `inject(ORIGAM_CODE_KEY)` below is called synchronously here, which is
 * only valid while THIS function runs during a component's `setup()`
 * (exactly how `OrigamCode.vue` calls it). `undefined` when no
 * `createOrigam({ code })` ancestor provided one (or none was installed at
 * all): `loadHighlighter()` then keeps its original `import('shiki')`
 * behaviour, unchanged.
 */
export function useCode (): IUseCodeReturn {
    const highlighterLoader = inject(ORIGAM_CODE_KEY)?.highlighter

    async function highlight (
        code: string,
        lang: TCodeLang
    ): Promise<string> {
        const resolvedLang = resolveLang(lang)
        const key = makeCacheKey(code, resolvedLang)
        const cached = lruGet(key)
        if (cached !== undefined) return cached

        const highlighter = await loadHighlighter(highlighterLoader)
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
        await loadHighlighter(highlighterLoader)
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
