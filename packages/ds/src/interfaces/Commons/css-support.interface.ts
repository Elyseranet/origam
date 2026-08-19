import type { ComputedRef, Ref } from 'vue'

import type {
    TCssFeatureName,
    TCssSupportMap
} from '../../types/Commons/css-support.type'

/** Public API returned by `useCssSupport`. */
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

/** Options accepted by `useCssSupportClient`. */
export interface IUseCssSupportClientOptions {
    /**
     * Value returned during SSR and on the first client render (before
     * `onMounted` fires). Pick the side of the branch that produces the
     * smaller / safer markup — typically `false` (= JS fallback) so the
     * server output stays universally compatible.
     */
    defaultValue?: boolean
}
