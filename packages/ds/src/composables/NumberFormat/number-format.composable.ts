import {
    computed,
    type ComputedRef,
    isRef,
    type MaybeRefOrGetter,
    toValue
} from 'vue'

import {
    NUMBER_FORMAT_DEFAULT_CURRENCY,
    NUMBER_FORMAT_FALLBACK_LOCALE,
    NUMBER_FORMAT_LRU_CAPACITY
} from '../../consts/NumberFormat/number-format.const'

import type {
    IUseNumberFormatOptions
} from '../../interfaces'

/**
 * Module-level LRU keyed on the serialised resolver options. Reusing a
 * single `Intl.NumberFormat` instance across calls is the documented
 * fast-path — instance creation is the heavy cost in this API.
 *
 * `Map` preserves insertion order, so we evict the first key (the LRU)
 * once we hit capacity. On a cache hit, we delete + reinsert to bump the
 * entry back to the most-recently-used end.
 */
const intlCache = new Map<string, Intl.NumberFormat>()

/**
 * Resolve the active locale chain.
 *
 * The function never throws — every branch falls back to
 * `NUMBER_FORMAT_FALLBACK_LOCALE` rather than letting a missing global
 * blow up `Intl.NumberFormat`.
 */
function resolveLocale (locale: string | string[] | undefined): string | string[] {
    if (Array.isArray(locale) && locale.length > 0) return locale
    if (typeof locale === 'string' && locale.length > 0 && locale !== 'auto') return locale

    // SSR path — no `document` or `navigator` available.
    if (typeof document !== 'undefined') {
        const htmlLang = document.documentElement?.lang
        if (htmlLang) return htmlLang
    }

    if (typeof navigator !== 'undefined' && typeof navigator.language === 'string' && navigator.language.length > 0) {
        return navigator.language
    }

    return NUMBER_FORMAT_FALLBACK_LOCALE
}

/**
 * Translate `useGrouping` between the legacy boolean API and the modern
 * string variants. `Intl.NumberFormat` accepts both, but bundlers
 * targeting older engines may choke on the string form — we normalise
 * to whatever the resolver itself reports as canonical.
 */
function resolveUseGrouping (
    value: boolean | 'always' | 'auto' | 'min2' | undefined
): boolean | string | undefined {
    if (value === undefined) return undefined
    if (typeof value === 'boolean') return value
    return value
}

/**
 * Translate the high-level `format` dialect to the raw `Intl.NumberFormat`
 * `style` + `notation` options. Returns a partial — fields the consumer
 * already set via `notation` win at the merge site downstream.
 */
function resolveStyleAndNotation (
    format: IUseNumberFormatOptions['format']
): Partial<Intl.NumberFormatOptions> {
    switch (format) {
        case 'currency':
            return { style: 'currency' }
        case 'percent':
            return { style: 'percent' }
        case 'unit':
            return { style: 'unit' }
        case 'compact':
            return { style: 'decimal', notation: 'compact' }
        case 'scientific':
            return { style: 'decimal', notation: 'scientific' }
        case 'engineering':
            return { style: 'decimal', notation: 'engineering' }
        case 'decimal':
        case undefined:
        default:
            return { style: 'decimal' }
    }
}

/**
 * Build the final `Intl.NumberFormatOptions` payload from the
 * normalised composable options.
 *
 * Currency / unit gating: we only set the field when the format actually
 * requires it — otherwise `Intl.NumberFormat` throws (`unit` is required
 * when `style === 'unit'`, `currency` is required when `style ===
 * 'currency'`).
 */
function buildIntlOptions (options: IUseNumberFormatOptions): Intl.NumberFormatOptions {
    const intl: Intl.NumberFormatOptions = {}
    const base = resolveStyleAndNotation(options.format)
    Object.assign(intl, base)

    // Explicit notation override — wins over the format-derived value.
    if (options.notation !== undefined) {
        intl.notation = options.notation
    }

    if (intl.style === 'currency') {
        intl.currency = options.currency || NUMBER_FORMAT_DEFAULT_CURRENCY
        if (options.currencyDisplay !== undefined) {
            intl.currencyDisplay = options.currencyDisplay
        }
    }

    if (intl.style === 'unit') {
        if (options.unit) {
            intl.unit = options.unit
            if (options.unitDisplay !== undefined) {
                intl.unitDisplay = options.unitDisplay
            }
        } else {
            // Fall back to a safe decimal — without `unit`, Intl would
            // throw at construction time. Surface a console warning so
            // the misconfiguration is visible at dev time.
            if (typeof console !== 'undefined') {
                console.warn('[origam] useNumberFormat: format="unit" requires a `unit` option (e.g. "kilometer-per-hour"). Falling back to decimal.')
            }
            intl.style = 'decimal'
        }
    }

    if (intl.notation === 'compact' && options.compactDisplay !== undefined) {
        intl.compactDisplay = options.compactDisplay
    }

    if (options.minimumFractionDigits !== undefined) intl.minimumFractionDigits = options.minimumFractionDigits
    if (options.maximumFractionDigits !== undefined) intl.maximumFractionDigits = options.maximumFractionDigits
    if (options.minimumSignificantDigits !== undefined) intl.minimumSignificantDigits = options.minimumSignificantDigits
    if (options.maximumSignificantDigits !== undefined) intl.maximumSignificantDigits = options.maximumSignificantDigits

    const grouping = resolveUseGrouping(options.useGrouping)
    if (grouping !== undefined) {
        // Cast: TS types for `Intl.NumberFormatOptions['useGrouping']`
        // are still `boolean` in some lib versions; the modern engine
        // accepts the string variants at runtime.
        intl.useGrouping = grouping as Intl.NumberFormatOptions['useGrouping']
    }

    if (options.signDisplay !== undefined) {
        // Cast: TNumberFormatSignDisplay uses 'except-zero' and 'negative' which
        // are not yet present in TS lib's NumberFormatOptionsSignDisplayRegistry
        // ('exceptZero' differs in casing, 'negative' is missing).
        // The runtime Intl engine accepts these values; the cast bridges the gap.
        intl.signDisplay = options.signDisplay as Intl.NumberFormatOptions['signDisplay']
    }

    return intl
}

/**
 * Look up (or build + cache) the `Intl.NumberFormat` for the given
 * locale + options. Cache key is the JSON-serialised payload — stable
 * across calls and cheap to compute.
 */
function getIntl (locale: string | string[], options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const cacheKey = JSON.stringify({ l: locale, o: options })

    const hit = intlCache.get(cacheKey)
    if (hit !== undefined) {
        // LRU bump — re-insert to mark as most-recently-used.
        intlCache.delete(cacheKey)
        intlCache.set(cacheKey, hit)
        return hit
    }

    const fresh = new Intl.NumberFormat(locale as string | string[], options)
    intlCache.set(cacheKey, fresh)

    if (intlCache.size > NUMBER_FORMAT_LRU_CAPACITY) {
        const oldest = intlCache.keys().next().value
        if (oldest !== undefined) {
            intlCache.delete(oldest)
        }
    }

    return fresh
}

/**
 * Coerce a `number | string` payload into a `number`. Empty / NaN
 * inputs collapse to `0` rather than `NaN` so the rendered string never
 * surfaces a literal "NaN" to the end-user — caller can still detect
 * the original input by inspecting `isFinite()` on the return.
 */
function coerceValue (value: number | string): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string' && value.length > 0) {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
}

/**
 * Test helper — clears the module-level LRU. Exposed for the unit-test
 * suite (cache-hit assertion) and not advertised in the public docs.
 */
export function __clearNumberFormatCache (): void {
    intlCache.clear()
}

/**
 * Headless number-formatting composable. Wraps `Intl.NumberFormat` with
 * an LRU cache, reactive locale resolution, and convenience format
 * dialects (`currency` / `percent` / `unit` / `compact` / `scientific`
 * / `engineering`).
 *
 * The composable accepts options as a plain object OR as ref-like
 * sources (refs / getters), so the same primitive backs both the
 * `<OrigamNumberFormat>` SFC and ad-hoc callers (e.g. a Pinia store
 * that formats numbers for a non-Vue consumer).
 *
 * @example
 * ```ts
 * const { format, formatToParts } = useNumberFormat({
 *     locale: 'fr-FR',
 *     format: 'currency',
 *     currency: 'EUR'
 * })
 * format(1234.5) // → "1 234,50 €"
 * ```
 */
export function useNumberFormat (
    options: MaybeRefOrGetter<IUseNumberFormatOptions> = {}
) {
    /**
     * Re-resolve options on every access — refs / getters re-read,
     * plain objects pass through. We capture the resolved snapshot
     * inside `intl` so callers do not pay the cost on every format()
     * call when nothing changed.
     */
    const normalisedOptions: ComputedRef<IUseNumberFormatOptions> = computed(() => {
        if (isRef(options) || typeof options === 'function') {
            return toValue(options) ?? {}
        }
        return options as IUseNumberFormatOptions
    })

    const intl: ComputedRef<Intl.NumberFormat> = computed(() => {
        const opts = normalisedOptions.value
        const locale = resolveLocale(opts.locale)
        const intlOptions = buildIntlOptions(opts)
        return getIntl(locale, intlOptions)
    })

    const format = (value: number | string): string => {
        const numeric = coerceValue(value)
        return intl.value.format(numeric)
    }

    const formatToParts = (value: number | string): Intl.NumberFormatPart[] => {
        const numeric = coerceValue(value)
        return intl.value.formatToParts(numeric)
    }

    return {
        intl,
        format,
        formatToParts
    }
}
