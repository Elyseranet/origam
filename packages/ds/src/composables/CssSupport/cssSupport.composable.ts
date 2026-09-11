import { computed, onMounted, readonly, ref, type ComputedRef, type Ref } from 'vue'

import { FEATURE_QUERIES } from '../../consts/CssSupport/css-support.const'

// ────────────────────────────────────────────────────────────────────────────
// CSS feature detection — `useCssSupport`
// ────────────────────────────────────────────────────────────────────────────
//
// PRINCIPLE — CSS-first, JS-only-when-needed
//
// Modern CSS is powerful: `grid-template-areas`, `min()/max()/clamp()`,
// container queries, `:has()`, `aspect-ratio`, `color-mix()`, `subgrid`,
// flex `gap`, anchor positioning, etc. Origam systematically prefers a
// pure CSS solution and only falls back to a JS implementation when the
// browser cannot honour the modern feature.
//
// `useCssSupport()` is the single feature-detection layer. Every component
// that needs a fallback should consult it at the boundary, never use
// `CSS.supports()` directly. Centralising the calls:
//   - keeps the matrix of supported features in one auditable place,
//   - lets us cache the answers (browser support doesn't change at runtime),
//   - keeps SSR safe by deferring DOM access until the first browser tick.
//
// Usage
// ─────
//   const { css, supports, supportsAny } = useCssSupport()
//
//   // Reactive flags — re-evaluated once on hydration, then frozen.
//   if (css.value.containerQueries) { /* CSS-only path */ }
//   else { /* JS resize-observer path */ }
//
//   // Free-form query (cached after first call).
//   if (supports('display: subgrid')) { … }
//
//   // Logical combinators.
//   if (supportsAny('display: grid', 'display: -ms-grid')) { … }
//
// SSR safety
// ──────────
// During SSR (no `window`/`CSS`), every flag returns `false` — the JS
// fallback is taken. On client hydration we run the detection once and
// flip the flags. Components that gate behaviour on these flags should
// therefore NOT prerender hydration-sensitive markup; use `<ClientOnly>`
// or guard with `onMounted`.

// Module-level cache so every component sees the same answers.
const _cache = new Map<string, boolean>()
let _initialized = false

// `FEATURE_QUERIES` lives in `src/consts/CssSupport/css-support.const.ts`.
// The matrix is intentionally an `as const satisfies` literal so the
// `TCssFeatureName` derivation below stays narrow.

export type TCssFeatureName = keyof typeof FEATURE_QUERIES
export type TCssSupportMap = Readonly<Record<TCssFeatureName, boolean>>

/**
 * Run `CSS.supports(query)` with safe handling of:
 *   - SSR / non-browser environments (returns false)
 *   - older browsers without CSS.supports (returns false)
 *   - parens-vs-paren-less queries (Selector queries need `selector(...)`,
 *     not all engines accept `display: grid` without parens — we let the
 *     caller phrase the query)
 *   - `@supports`-style boolean expressions (we DO NOT split — the caller
 *     is responsible for using a query CSS.supports accepts)
 *
 * Results are cached.
 */
function rawSupports (query: string): boolean {
    if (typeof window === 'undefined' || typeof CSS === 'undefined' || !CSS.supports) {
        return false
    }
    if (_cache.has(query)) return _cache.get(query)!
    let result = false
    try {
        // CSS.supports accepts two signatures: (property, value) or (query).
        // We always use the single-string form for consistency.
        result = CSS.supports(query)
    } catch {
        result = false
    }
    _cache.set(query, result)
    return result
}

// Reactive flag map — stays at all-false during SSR, hydrates at first
// browser-side `useCssSupport()` call.
const _flags = ref<TCssSupportMap>(emptyMap())

function emptyMap (): TCssSupportMap {
    const out = {} as Record<TCssFeatureName, boolean>
    for (const k of Object.keys(FEATURE_QUERIES) as TCssFeatureName[]) {
        out[k] = false
    }
    return Object.freeze(out)
}

function detectAll (): TCssSupportMap {
    const out = {} as Record<TCssFeatureName, boolean>
    for (const k of Object.keys(FEATURE_QUERIES) as TCssFeatureName[]) {
        out[k] = rawSupports(FEATURE_QUERIES[k])
    }
    return Object.freeze(out)
}

function ensureInitialized () {
    if (_initialized) return
    if (typeof window === 'undefined') return  // SSR — keep all-false
    _flags.value = detectAll()
    _initialized = true
}

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

export interface IUseCssSupport {
    /**
     * Reactive map of feature → `boolean`. Computed once on first browser-
     * side call; subsequent calls share the same frozen snapshot.
     */
    css: Readonly<Ref<TCssSupportMap>>

    /**
     * Free-form query support. Pass any string accepted by `CSS.supports()`.
     * Result is cached per-query.
     *
     * @example
     *   supports('display: grid')                  // true on modern browsers
     *   supports('selector(:has(*))')              // selector query
     *   supports('width: clamp(1px, 50%, 100px)')  // math function
     */
    supports: (query: string) => boolean

    /**
     * `true` if at least ONE of the queries is supported.
     */
    supportsAny: (...queries: string[]) => boolean

    /**
     * `true` if EVERY query is supported.
     */
    supportsAll: (...queries: string[]) => boolean

    /**
     * Reactive `ComputedRef<boolean>` for a single named feature. Useful in
     * templates: `<div v-if="hasGrid">…`.
     */
    has: (feature: TCssFeatureName) => ComputedRef<boolean>
}

/*********************************************************
 * useCssSupport
 ********************************************************/
export function useCssSupport (): IUseCssSupport {
    ensureInitialized()

    function supports (query: string): boolean {
        return rawSupports(query)
    }

    function supportsAny (...queries: string[]): boolean {
        for (const q of queries) {
            if (rawSupports(q)) return true
        }
        return false
    }

    function supportsAll (...queries: string[]): boolean {
        for (const q of queries) {
            if (!rawSupports(q)) return false
        }
        return true
    }

    function has (feature: TCssFeatureName): ComputedRef<boolean> {
        return computed(() => _flags.value[feature])
    }

    return {
        css: readonly(_flags) as Readonly<Ref<TCssSupportMap>>,
        supports,
        supportsAny,
        supportsAll,
        has
    }
}

/**
 * Test-only helper — clear the internal cache + re-detect on next call.
 * Not part of the public API; consumers must not depend on it.
 *
 * @internal
 */

/*********************************************************
 * _resetCssSupportCache
 ********************************************************/
export function _resetCssSupportCache () {
    _cache.clear()
    _initialized = false
    _flags.value = emptyMap()
}

// ────────────────────────────────────────────────────────────────────────────
// `useCssSupportClient` — hydration-safe variant
// ────────────────────────────────────────────────────────────────────────────
//
// PROBLEM
// ───────
// `useCssSupport()` returns a flag that stays `false` during SSR and flips
// to the real value after hydration. If a component renders a different
// DOM tree based on that flag (e.g. CSS-vs-JS branch), the SSR markup
// shows the JS fallback, the client hydrates into the CSS branch, and
// Vue logs a hydration mismatch.
//
// SOLUTION
// ────────
// `useCssSupportClient()` returns a `Ref<boolean>` that starts at the
// caller-provided `defaultValue` (defaults to `false`) and only flips to
// the real `CSS.supports()` result inside an `onMounted` callback. Both
// SSR and the first client render therefore see the same `defaultValue`
// — no mismatch — and the runtime branch resolves a tick after mount.
//
// Use when a feature flag drives **markup** (template `v-if` /
// `<component :is>` / different DOM structure). For style-only
// branches (CSS variables, class toggles), the regular
// `useCssSupport()` is fine because the post-hydration class flip is
// invisible to the reconciler.

export interface IUseCssSupportClientOptions {
    /**
     * Value returned during SSR and on the first client render (before
     * `onMounted` fires). Pick the side of the branch that produces the
     * smaller / safer markup — typically `false` (= JS fallback) so the
     * server output stays universally compatible.
     */
    defaultValue?: boolean
}

/*********************************************************
 * useCssSupportClient
 *
 * @description
 * Hydration-safe single-feature gate. Returns a `Ref<boolean>` that
 * starts at `defaultValue` and flips to the real support result on
 * `onMounted`. Use to gate **markup**, not styles — for style-only
 * branches prefer `useCssSupport().css.value.X` directly.
 *
 * @example
 *   const supportsContainer = useCssSupportClient('containerQueries')
 *   // template:
 *   //   <div v-if="supportsContainer">…CSS path…</div>
 *   //   <div v-else>…JS fallback path…</div>
 ********************************************************/
export function useCssSupportClient (
    feature: TCssFeatureName | string,
    options: IUseCssSupportClientOptions = {}
): Ref<boolean> {
    const { defaultValue = false } = options
    const flag = ref(defaultValue)

    onMounted(() => {
        // We don't reuse `_flags` from the singleton because it might
        // not be initialised yet (the caller may be the first consumer).
        // Going through `rawSupports` keeps the cache warm.
        const query = (FEATURE_QUERIES as Record<string, string>)[feature] ?? feature
        flag.value = rawSupports(query)
    })

    return flag
}
