import { computed, readonly, ref, type ComputedRef, type Ref } from 'vue'

import { FEATURE_QUERIES } from '../../consts/Commons/css-support.const'

import type { IUseCssSupport } from '../../interfaces/Commons/css-support.interface'
import type { TCssFeatureName, TCssSupportMap } from '../../types/Commons/css-support.type'
import { rawSupports, resetSupportsCache } from '../../utils/Commons/css-support.util'

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
//
// The `rawSupports` cached primitive is shared with `useCssSupportClient`
// (its hydration-safe sibling, in its own file) — it lives in
// `utils/Commons/css-support.util.ts` so neither hook duplicates it.

let _initialized = false

/*********************************************************
 * FEATURE_QUERIES
 *
 * @description
 * La matrice vit dans `src/consts/Commons/css-support.const.ts`, aux côtés
 * du type et de l'interface du même sous-système — tous dans `Commons/`,
 * puisqu'aucun composant ne s'appelle `OrigamCssSupport`.
 * @description
 * C'est délibérément un littéral `as const satisfies` : c'est ce qui garde
 * la dérivation de `TCssFeatureName` étroite plutôt que `string`.
 ********************************************************/

export type { TCssFeatureName, TCssSupportMap } from '../../types/Commons/css-support.type'
export type { IUseCssSupport, IUseCssSupportClientOptions } from '../../interfaces/Commons/css-support.interface'

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

/*********************************************************
 * useCssSupport
 *
 * @description
 * Single feature-detection layer for the whole CSS-first / JS-fallback
 * matrix (see `FEATURE_QUERIES`). Returns a reactive frozen flag map
 * plus free-form `supports` / `supportsAny` / `supportsAll` helpers.
 * `useCssSupportClient` (own file) is the hydration-safe sibling for
 * markup-driving flags — both share the cached `rawSupports` primitive.
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
    resetSupportsCache()
    _initialized = false
    _flags.value = emptyMap()
}
