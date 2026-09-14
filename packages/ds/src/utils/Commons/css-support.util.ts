/*********************************************************
 * css-support.util
 *
 * @description
 * Low-level, cached `CSS.supports()` wrapper shared by `useCssSupport`
 * and `useCssSupportClient` (packages/ds/src/composables/Commons/).
 * @description
 * Extracted here rather than duplicated in each composable file: both
 * hooks need the exact same SSR-safe, cached "does the browser support
 * this query" primitive, and the module-level cache must stay a single
 * instance so every component (and both hooks) sees the same answers.
 ********************************************************/

// Module-level cache so every component sees the same answers.
const _cache = new Map<string, boolean>()

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
export function rawSupports (query: string): boolean {
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

/**
 * Test-only helper — clear the shared `CSS.supports` cache.
 * Not part of the public API; consumers must not depend on it.
 *
 * @internal
 */
export function resetSupportsCache () {
    _cache.clear()
}
