import type {
    ICommonsComponentProps,
    ITagProps
} from '../../interfaces'

import type {
    TNumberFormatCompactDisplay,
    TNumberFormatCurrencyDisplay,
    TNumberFormatFormat,
    TNumberFormatLocale,
    TNumberFormatNotation,
    TNumberFormatSignDisplay,
    TNumberFormatUnitDisplay,
    TNumberFormatUseGrouping
} from '../../types'

/**
 * Props for `<OrigamNumberFormat>` — pure-display i18n number renderer
 * powered by `Intl.NumberFormat` (zero external dep).
 *
 * The component owns NO state: it transforms `value` through the
 * resolved `Intl` instance and emits the result into a `<tag>` element
 * (default `<span>`). Consumers who want to override the rendering
 * granularly use the scoped `#default` slot which exposes
 * `{ formatted, parts, value }`.
 */
export interface INumberFormatProps extends ICommonsComponentProps, ITagProps {
    /**
     * Number to render. Strings are parsed via `Number()` — callers can
     * pass a stringified BigInt-like to preserve precision before
     * coercion (the actual formatting still goes through `Number`, so
     * values beyond `Number.MAX_SAFE_INTEGER` may lose accuracy).
     */
    value: number | string
    /**
     * High-level format dialect — see `TNumberFormatFormat`.
     *
     * @default 'decimal'
     */
    format?: TNumberFormatFormat
    /**
     * BCP-47 locale tag (or array, for fallback chains). The literal
     * string `'auto'` triggers the runtime resolution chain (`<html
     * lang>` → `navigator.language` → `'en-US'`).
     *
     * @default 'auto'
     */
    locale?: TNumberFormatLocale
    /**
     * ISO 4217 currency code. Required when `format === 'currency'`; we
     * fall back to `'USD'` rather than throwing so storybook controls
     * remain forgiving.
     *
     * @default 'USD' (only when format === 'currency')
     */
    currency?: string
    /**
     * Currency-symbol rendering — `'symbol'` (`$`), `'narrowSymbol'`
     * (`$` instead of `US$`), `'code'` (`USD`) or `'name'`
     * (`US dollar`).
     *
     * @default 'symbol'
     */
    currencyDisplay?: TNumberFormatCurrencyDisplay
    /**
     * Sanctioned unit identifier (e.g. `'kilometer-per-hour'`,
     * `'celsius'`, `'liter'`). Required when `format === 'unit'`. The
     * full ECMAScript-sanctioned list is exposed under
     * `Intl.supportedValuesOf('unit')` at runtime.
     */
    unit?: string
    /**
     * Unit-label rendering — `'short'` (`km/h`), `'long'`
     * (`kilometers per hour`) or `'narrow'` (`kph`).
     *
     * @default 'short'
     */
    unitDisplay?: TNumberFormatUnitDisplay
    /**
     * Raw `notation` override. Auto-set to `'compact'` when `format ===
     * 'compact'`, to `'scientific'` / `'engineering'` for the matching
     * formats. Explicit values still win — useful for `format:
     * 'decimal'` with `notation: 'scientific'`.
     */
    notation?: TNumberFormatNotation
    /**
     * Compact-notation rendering — `'short'` (`1M`) or `'long'`
     * (`1 million`). Only honoured when `notation === 'compact'`.
     *
     * @default 'short'
     */
    compactDisplay?: TNumberFormatCompactDisplay
    /** Minimum digits after the decimal point. */
    minimumFractionDigits?: number
    /** Maximum digits after the decimal point. */
    maximumFractionDigits?: number
    /** Minimum significant digits (mutually exclusive with fraction digits). */
    minimumSignificantDigits?: number
    /** Maximum significant digits (mutually exclusive with fraction digits). */
    maximumSignificantDigits?: number
    /**
     * Thousands-separator behaviour. `true` / `'auto'` keep the locale
     * default, `false` removes them, `'always'` forces them on, `'min2'`
     * only renders them when the integer part has at least 2 groups.
     *
     * @default true
     */
    useGrouping?: TNumberFormatUseGrouping
    /**
     * Sign-display strategy. `'auto'` (default — only negatives),
     * `'always'`, `'except-zero'`, `'negative'`, `'never'`.
     *
     * @default 'auto'
     */
    signDisplay?: TNumberFormatSignDisplay
}

/**
 * Bindings exposed by the scoped `#default` slot. Consumers use these
 * to highlight specific parts of the formatted output (currency symbol,
 * decimal separator, …) without re-running `Intl.NumberFormat`
 * themselves.
 */
export interface INumberFormatScopedSlotBindings {
    /** The locale-formatted string, ready to render. */
    formatted: string
    /** The structured parts (`Intl.NumberFormatPart[]`). */
    parts: Intl.NumberFormatPart[]
    /** The numeric value after string-to-number coercion. */
    value: number
}

/**
 * Slot signatures for `<OrigamNumberFormat>`.
 */
export interface INumberFormatSlots {
    /**
     * Custom render override. Scoped — receives the resolved value plus
     * the structured parts so consumers can paint individual segments.
     */
    default?: (bindings: INumberFormatScopedSlotBindings) => any
}

/**
 * Options accepted by `useNumberFormat`. Mirrors the public props of
 * `<OrigamNumberFormat>` minus the wiring concerns (`tag`, `class`,
 * `style`).
 */
export interface IUseNumberFormatOptions {
    /** Same semantics as `INumberFormatProps.format`. */
    format?: TNumberFormatFormat
    /** Same semantics as `INumberFormatProps.locale`. */
    locale?: TNumberFormatLocale
    /** Same semantics as `INumberFormatProps.currency`. */
    currency?: string
    /** Same semantics as `INumberFormatProps.currencyDisplay`. */
    currencyDisplay?: TNumberFormatCurrencyDisplay
    /** Same semantics as `INumberFormatProps.unit`. */
    unit?: string
    /** Same semantics as `INumberFormatProps.unitDisplay`. */
    unitDisplay?: TNumberFormatUnitDisplay
    /** Same semantics as `INumberFormatProps.notation`. */
    notation?: TNumberFormatNotation
    /** Same semantics as `INumberFormatProps.compactDisplay`. */
    compactDisplay?: TNumberFormatCompactDisplay
    /** Same semantics as `INumberFormatProps.minimumFractionDigits`. */
    minimumFractionDigits?: number
    /** Same semantics as `INumberFormatProps.maximumFractionDigits`. */
    maximumFractionDigits?: number
    /** Same semantics as `INumberFormatProps.minimumSignificantDigits`. */
    minimumSignificantDigits?: number
    /** Same semantics as `INumberFormatProps.maximumSignificantDigits`. */
    maximumSignificantDigits?: number
    /** Same semantics as `INumberFormatProps.useGrouping`. */
    useGrouping?: TNumberFormatUseGrouping
    /** Same semantics as `INumberFormatProps.signDisplay`. */
    signDisplay?: TNumberFormatSignDisplay
}
