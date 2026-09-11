/**
 * High-level format dialect understood by `<OrigamNumberFormat>` and
 * `useNumberFormat`. Each value maps to a known `Intl.NumberFormat`
 * configuration (style + notation) so callers do not have to wire the
 * raw `Intl` options themselves for the 95% case.
 *
 * - `decimal` — plain number, locale-aware grouping (default).
 * - `currency` — uses `currency` + `currencyDisplay` (style: 'currency').
 * - `percent` — multiplies by 100 and appends the locale percent glyph
 *   (style: 'percent').
 * - `unit` — pairs with `unit` + `unitDisplay` (style: 'unit').
 * - `compact` — short / long compact notation (1.2K / 1.2 million),
 *   internally sets `notation: 'compact'`.
 * - `scientific` — exponent notation (1.234E5).
 * - `engineering` — engineering-style exponent (multiples of 3).
 */
export type TNumberFormatFormat =
    | 'decimal'
    | 'currency'
    | 'percent'
    | 'unit'
    | 'compact'
    | 'scientific'
    | 'engineering'

/**
 * Currency-symbol rendering — forwarded to `Intl.NumberFormat`'s
 * `currencyDisplay` option.
 */
export type TNumberFormatCurrencyDisplay = 'symbol' | 'narrowSymbol' | 'code' | 'name'

/**
 * Unit-label rendering — forwarded to `Intl.NumberFormat`'s
 * `unitDisplay` option.
 */
export type TNumberFormatUnitDisplay = 'short' | 'long' | 'narrow'

/**
 * Compact-notation rendering — forwarded to `Intl.NumberFormat`'s
 * `compactDisplay` option. Only applies when `notation === 'compact'`.
 */
export type TNumberFormatCompactDisplay = 'short' | 'long'

/**
 * Raw `notation` mirror — exposed for advanced callers who set
 * `format: 'decimal'` but still want scientific / engineering output.
 */
export type TNumberFormatNotation = 'standard' | 'compact' | 'scientific' | 'engineering'

/**
 * Sign-display strategy — forwarded to `Intl.NumberFormat`'s
 * `signDisplay` option.
 */
export type TNumberFormatSignDisplay = 'auto' | 'always' | 'except-zero' | 'negative' | 'never'

/**
 * Grouping (thousands separator) strategy — boolean kept for backwards
 * compat with the original `Intl.NumberFormat` API; the string variants
 * (`'always' | 'auto' | 'min2'`) match the modern proposal landed in
 * Chrome 106+ / Safari 16.4+.
 */
export type TNumberFormatUseGrouping = boolean | 'always' | 'auto' | 'min2'

/**
 * Sentinel for the locale prop — `'auto'` triggers the runtime
 * resolution chain (`<html lang>` → `navigator.language` → `'en-US'`).
 * Any other value (a BCP-47 tag or array of tags) is passed through to
 * `Intl.NumberFormat` verbatim.
 */
export type TNumberFormatLocale = string | string[]
