/**
 * How many Y-axis ticks `<OrigamChart>` draws by default. The
 * composable snaps the data range to a "nice" multiple of this —
 * five rows fits most narrow chart heights without crowding.
 */
export const CHART_Y_TICK_COUNT = 5

/**
 * Static default of the `animationDuration` prop, mirrored verbatim in
 * every `OrigamChart*.vue`'s `withDefaults()` call (which MUST inline the
 * literal — see the repo's `withDefaults()` rule, imported consts are not
 * statically resolvable there). Kept here as the single comparison point
 * `useChartAnimationStyle` uses to tell "resolves to the untouched default"
 * apart from "a theme or the consumer changed it" — see that composable's
 * doc for why the distinction matters (#505).
 */
export const CHART_ANIMATION_DURATION_DEFAULT = 600

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
