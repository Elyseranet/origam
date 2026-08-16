/**
 * High-level format dialect understood by `<OrigamNumberFormat>` and
 * `useNumberFormat`. Each value maps to a known `Intl.NumberFormat`
 * configuration (style + notation) so callers do not have to wire the
 * raw `Intl` options themselves for the 95% case.
 */
export enum NUMBER_FORMAT_FORMAT {
    DECIMAL = 'decimal',
    CURRENCY = 'currency',
    PERCENT = 'percent',
    UNIT = 'unit',
    COMPACT = 'compact',
    SCIENTIFIC = 'scientific',
    ENGINEERING = 'engineering'
}

/**
 * Currency-symbol rendering — forwarded to `Intl.NumberFormat`'s
 * `currencyDisplay` option.
 */
export enum NUMBER_FORMAT_CURRENCY_DISPLAY {
    SYMBOL = 'symbol',
    NARROW_SYMBOL = 'narrowSymbol',
    CODE = 'code',
    NAME = 'name'
}

/**
 * Unit-label rendering — forwarded to `Intl.NumberFormat`'s
 * `unitDisplay` option.
 *
 * Kept distinct from {@link NUMBER_FORMAT_COMPACT_DISPLAY} even though
 * the two currently overlap on `short` / `long`: ECMA-402 defines them
 * as separate option domains, and only this one carries `narrow`.
 */
export enum NUMBER_FORMAT_UNIT_DISPLAY {
    SHORT = 'short',
    LONG = 'long',
    NARROW = 'narrow'
}

/**
 * Compact-notation rendering — forwarded to `Intl.NumberFormat`'s
 * `compactDisplay` option. Only applies when `notation === 'compact'`.
 */
export enum NUMBER_FORMAT_COMPACT_DISPLAY {
    SHORT = 'short',
    LONG = 'long'
}

/**
 * Raw `notation` mirror — exposed for advanced callers who set
 * `format: 'decimal'` but still want scientific / engineering output.
 */
export enum NUMBER_FORMAT_NOTATION {
    STANDARD = 'standard',
    COMPACT = 'compact',
    SCIENTIFIC = 'scientific',
    ENGINEERING = 'engineering'
}

/**
 * Sign-display strategy — forwarded to `Intl.NumberFormat`'s
 * `signDisplay` option.
 */
export enum NUMBER_FORMAT_SIGN_DISPLAY {
    AUTO = 'auto',
    ALWAYS = 'always',
    EXCEPT_ZERO = 'except-zero',
    NEGATIVE = 'negative',
    NEVER = 'never'
}

/**
 * Grouping (thousands separator) strategy. `TNumberFormatUseGrouping`
 * widens this with `boolean` for backwards compat with the original
 * `Intl.NumberFormat` API; the string variants match the modern
 * proposal landed in Chrome 106+ / Safari 16.4+.
 */
export enum NUMBER_FORMAT_USE_GROUPING {
    ALWAYS = 'always',
    AUTO = 'auto',
    MIN_2 = 'min2'
}
