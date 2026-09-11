/**
 * Stacking strategy for bar / column / area charts.
 *
 * - `NORMAL`  — series are stacked using their raw absolute values.
 *               The Y-axis spans `0 → max(stack total)`.
 * - `PERCENT` — each stack is normalised to 100 %. The Y-axis is
 *               fixed at `0 → 100` and tick labels default to the
 *               `${v}%` format. The tooltip shows both the raw value
 *               and its share of the stack.
 */
export enum CHART_STACKING {
    NORMAL = 'normal',
    PERCENT = 'percent'
}
