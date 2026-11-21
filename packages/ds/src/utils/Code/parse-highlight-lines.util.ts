/*********************************************************
 * parseSegment
 *
 * @description
 * Lines of one comma-separated segment: a single number or a `a-b` range (either order); invalid input yields none.
 ********************************************************/
function parseSegment (segment: string): number[] {
    if (!segment) return []

    if (segment.includes('-')) {
        const [rawStart, rawEnd] = segment.split('-').map((s) => s.trim())
        const start = Number.parseInt(rawStart, 10)
        const end = Number.parseInt(rawEnd, 10)
        if (!Number.isFinite(start) || !Number.isFinite(end)) return []
        if (start < 1 || end < 1) return []
        const [lo, hi] = start <= end ? [start, end] : [end, start]
        const range: number[] = []
        for (let i = lo; i <= hi; i++) range.push(i)
        return range
    }

    const single = Number.parseInt(segment, 10)
    return Number.isFinite(single) && single >= 1 ? [single] : []
}

/**
 * Parse the `highlight-lines` prop of `<OrigamCode>` into a Set of 1-based
 * line numbers.
 *
 * Accepts:
 *   - an array of numbers, returned as-is (deduplicated, sorted) so the
 *     consumer can build a Set with a single allocation;
 *   - a comma- and/or range-separated string ("1", "1,3", "1-3",
 *     "1,3-5,7"). Whitespace inside the string is ignored. Negative
 *     values, zeros and NaN are dropped silently — the surface is meant
 *     for prose-style author input, not validated runtime data.
 *
 * Returns `[]` when the input is `null`, `undefined`, an empty string or
 * an empty array. The caller decides whether to skip the highlight pass
 * altogether based on `result.length === 0`.
 *
 * Examples:
 *   parseHighlightLines('1,3-5,7') → [1, 3, 4, 5, 7]
 *   parseHighlightLines([2, 5])    → [2, 5]
 *   parseHighlightLines('  2 , 5 - 7 ') → [2, 5, 6, 7]
 *   parseHighlightLines('foo')     → []
 *   parseHighlightLines(null)      → []
 */
export function parseHighlightLines (input: number[] | string | null | undefined): number[] {
    if (input == null) return []

    if (Array.isArray(input)) {
        const cleaned = input
            .filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && n >= 1)
            .map((n) => Math.floor(n))
        return Array.from(new Set(cleaned)).sort((a, b) => a - b)
    }

    if (typeof input !== 'string') return []
    const trimmed = input.trim()
    if (!trimmed) return []

    const out = new Set<number>()
    for (const rawSegment of trimmed.split(',')) {
        for (const line of parseSegment(rawSegment.trim())) out.add(line)
    }

    return Array.from(out).sort((a, b) => a - b)
}
