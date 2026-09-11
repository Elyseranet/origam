/**
 * A single button in the range-selector toolbar.
 *
 * Exactly one of `count` or `fraction` must be provided:
 *  - `count`    — number of categories from the right edge to show
 *                 (e.g. 30 for the last 30 days on a daily series).
 *  - `fraction` — fraction of the full category range to show (0..1).
 *                 1 means "all".
 */
export interface IChartRangeSelectorButton {
    /** Short label rendered on the button. E.g. `"1w"`, `"1m"`, `"all"`. */
    label: string
    /**
     * Number of categories from the trailing edge of the data to
     * include in the visible window. Ignored when `fraction` is set.
     */
    count?: number
    /**
     * Fraction of the total category count to show (0 exclusive, 1 inclusive).
     * `fraction: 1` is equivalent to "all". Ignored when `count` is set.
     */
    fraction?: number
}

/**
 * Configuration for the optional band-style range-selector toolbar
 * rendered above `<OrigamChartCartesian>`.
 */
export interface IChartRangeSelector {
    /** Show the range-selector toolbar. Default `false`. */
    enabled?: boolean
    /**
     * Buttons to display. Defaults to a standard set when omitted:
     * `1w / 1m / 3m / 6m / 1y / all`.
     */
    buttons?: Array<IChartRangeSelectorButton>
    /** Zero-based index of the initially selected button. */
    selected?: number
}
