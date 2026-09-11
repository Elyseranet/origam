/**
 * How many Y-axis ticks `<OrigamChart>` draws by default. The
 * composable snaps the data range to a "nice" multiple of this —
 * five rows fits most narrow chart heights without crowding.
 */
export const CHART_Y_TICK_COUNT = 5

/**
 * Default buttons shown in the range-selector toolbar when the consumer
 * enables `rangeSelector.enabled` without providing a custom `buttons`
 * array. Labels match common time-series conventions; counts are supplied
 * as documentation — the component resolves the actual window size at
 * runtime from `dataLength`.
 */
export const CHART_RANGE_SELECTOR_DEFAULT_BUTTONS = [
    { label: '1w', count: 7 },
    { label: '1m', count: 30 },
    { label: '3m', count: 90 },
    { label: '6m', count: 180 },
    { label: '1y', count: 365 },
    { label: 'all', fraction: 1 }
] as const
