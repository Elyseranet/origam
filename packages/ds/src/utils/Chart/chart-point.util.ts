/*********************************************************
 * chartPointValue / chartSafeValue (#1398)
 *
 * @description
 * Numeric value of a series entry that is either a bare number or an
 * `{ y }` point. `chartPointValue` keeps the raw number (`null` / `undefined`
 * → 0); `chartSafeValue` additionally clamps non-finite / negative values
 * to 0 (the shape the pictorial chart sizes its icons from).
 ********************************************************/
export function chartPointValue (raw: unknown): number {
    if (raw == null) return 0

    return typeof raw === 'number' ? raw : (raw as { y: number }).y
}

export function chartSafeValue (raw: unknown): number {
    const value = chartPointValue(raw)

    return Number.isFinite(value) && value >= 0 ? value : 0
}
