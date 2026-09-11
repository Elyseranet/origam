import { computed, ref } from 'vue'

/**
 * Minimum number of categories that must remain visible after a zoom
 * operation. Prevents the viewport from collapsing to zero width.
 */
const MIN_VISIBLE_CATEGORIES = 2

/**
 * Scroll-wheel zoom speed. Each wheel tick moves the window by this
 * fraction of the current visible range. `0.15` is ~15 % per notch
 * which matches Highcharts' feel without being jerky.
 */
const WHEEL_ZOOM_STEP = 0.15

/**
 * Manages interactive zoom / pan state for `<OrigamChartCartesian>`.
 *
 * The zoom window is expressed as a closed `[zoomStart, zoomEnd]`
 * range of **category indices** (integers). The engine clips the
 * category array and re-computes the X scale against the visible
 * subset before handing off to the path generator.
 *
 * Invariants maintained by every mutating method:
 *   - `0 ≤ zoomStart < zoomEnd ≤ dataLength - 1`
 *   - `zoomEnd - zoomStart ≥ MIN_VISIBLE_CATEGORIES - 1`
 *
 * @param options.dataLength  Reactive getter returning the total
 *   number of categories (or data points when no categories array
 *   is provided). Must always be ≥ 1.
 */
export function useChartZoom(options: { dataLength: () => number }) {
    const zoomStart = ref<number>(0)
    const zoomEnd = ref<number>(Infinity)

    const isDragging = ref(false)
    const dragStartPx = ref<number | null>(null)
    const dragEndPx = ref<number | null>(null)

    const isZoomed = computed<boolean>(() => {
        const len = options.dataLength()
        return zoomStart.value > 0 || (zoomEnd.value < len - 1 && Number.isFinite(zoomEnd.value))
    })

    const effectiveEnd = computed<number>(() => {
        const len = options.dataLength()
        return Number.isFinite(zoomEnd.value)
            ? Math.min(zoomEnd.value, len - 1)
            : Math.max(0, len - 1)
    })

    /**
     * Clamp a proposed `[start, end]` pair so it satisfies all
     * invariants, then apply it to the reactive refs.
     */
    const applyZoom = (start: number, end: number): void => {
        const len = options.dataLength()
        if (len <= 0) return
        const maxIdx = len - 1
        let s = Math.max(0, Math.min(start, maxIdx))
        let e = Math.max(0, Math.min(end, maxIdx))
        if (s > e) [s, e] = [e, s]
        if (e - s < MIN_VISIBLE_CATEGORIES - 1) {
            e = Math.min(maxIdx, s + MIN_VISIBLE_CATEGORIES - 1)
        }
        zoomStart.value = Math.round(s)
        zoomEnd.value = Math.round(e)
    }

    /**
     * Zoom to an explicit `[start, end]` category-index range.
     */
    const zoomTo = (start: number, end: number): void => {
        applyZoom(start, end)
    }

    /**
     * Restore the full data range.
     */
    const zoomReset = (): void => {
        zoomStart.value = 0
        zoomEnd.value = Infinity
    }

    /**
     * Zoom in / out by `deltaFraction` of the current visible window,
     * anchored at `anchorFraction` (0 = left edge, 1 = right edge,
     * 0.5 = centre). Positive delta → zoom IN (narrower window).
     *
     * Guards against:
     *  - Infinite loops when the window is already at MIN width.
     *  - `NaN` / out-of-range values from floating-point arithmetic.
     */
    const zoomBy = (deltaFraction: number, anchorFraction: number): void => {
        const len = options.dataLength()
        if (len <= 0) return
        const cur = effectiveEnd.value
        const visibleRange = cur - zoomStart.value
        if (visibleRange < MIN_VISIBLE_CATEGORIES - 1 && deltaFraction > 0) return

        const anchor = zoomStart.value + visibleRange * Math.max(0, Math.min(1, anchorFraction))
        const newStart = anchor - (anchor - zoomStart.value) * (1 - deltaFraction)
        const newEnd = anchor + (cur - anchor) * (1 - deltaFraction)
        applyZoom(newStart, newEnd)
    }

    /**
     * Shift the visible window by `deltaCategories` (positive = right).
     * The window size is preserved; the call is a no-op when it would
     * push the window out of bounds.
     */
    const panBy = (deltaCategories: number): void => {
        const len = options.dataLength()
        if (len <= 0) return
        const cur = effectiveEnd.value
        const windowSize = cur - zoomStart.value
        const newStart = Math.max(0, Math.min(len - 1 - windowSize, zoomStart.value + deltaCategories))
        applyZoom(newStart, newStart + windowSize)
    }

    /**
     * Convert a pixel X offset within the SVG plot area to a
     * fractional category index. `plotX0` and `plotX1` are the
     * left / right pixel edges of the plot (in SVG coordinate space).
     *
     * The result is a float in `[0, dataLength - 1]`.
     */
    const pxToCategoryIndex = (
        svgX: number,
        plotX0: number,
        plotX1: number
    ): number => {
        const len = options.dataLength()
        if (len <= 1) return 0
        const ratio = Math.max(0, Math.min(1, (svgX - plotX0) / Math.max(1, plotX1 - plotX0)))
        const cur = effectiveEnd.value
        return zoomStart.value + ratio * (cur - zoomStart.value)
    }

    /**
     * Convert a pixel X offset to an SVG-space X coordinate relative
     * to the plot area. Used to position the drag-selection overlay.
     *
     * Returns the SVG X pixel that corresponds to `categoryIndex`.
     */
    const categoryIndexToPx = (
        categoryIndex: number,
        plotX0: number,
        plotX1: number
    ): number => {
        const cur = effectiveEnd.value
        const windowSize = Math.max(1, cur - zoomStart.value)
        const ratio = (categoryIndex - zoomStart.value) / windowSize
        return plotX0 + ratio * (plotX1 - plotX0)
    }

    return {
        zoomStart,
        zoomEnd: effectiveEnd,
        zoomEndRaw: zoomEnd,
        isDragging,
        dragStartPx,
        dragEndPx,
        isZoomed,
        zoomTo,
        zoomReset,
        zoomBy,
        panBy,
        pxToCategoryIndex,
        categoryIndexToPx,
        WHEEL_ZOOM_STEP
    }
}
