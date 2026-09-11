import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

import type { TMasonryAlign } from '../../types'
import type { TMasonryColumnBreakpoints } from '../../interfaces'

/**
 * Internal layout descriptor produced by the bucket-fill algorithm.
 * One entry per measured item. Coordinates are expressed in CSS px,
 * relative to the masonry container's content box.
 */
export interface IMasonryItemRect {
    /** Index of the item in the original DOM order. */
    index: number
    /** `left` (px) of the item inside the container's content box. */
    left: number
    /** `top` (px) of the item inside the container's content box. */
    top: number
    /** Computed width (px) — same for every item in a given pass. */
    width: number
    /** Measured height (px) — preserved from the natural item flow. */
    height: number
    /** Zero-based column index the item was placed into. */
    column: number
}

/**
 * Public layout result. The caller uses `containerHeight` to size the
 * container (absolute-positioned children would otherwise collapse it),
 * and `items` to read per-item coordinates for inline-style assignment.
 */
export interface IMasonryLayoutResult {
    /** Final container height (px) — `max(column heights)`. */
    containerHeight: number
    /** Per-item position record. Index matches the original DOM order. */
    items: IMasonryItemRect[]
    /** Effective column count used for this layout (post-breakpoint). */
    columns: number
}

/**
 * Options consumed by `useMasonry`. All inputs are refs so the
 * composable can react to prop changes from its consumer.
 */
export interface IUseMasonryOptions {
    /** Default column count. Used when no breakpoint matches. */
    columnsRef: Ref<number>
    /**
     * Gap in **px** between items, both axes. The composable expects an
     * already-resolved pixel value — string-token resolution happens in
     * the component wrapper.
     */
    gapRef: Ref<number>
    /** Optional container-query breakpoints. */
    breakpointsRef?: Ref<TMasonryColumnBreakpoints | undefined>
    /**
     * Vertical alignment of items inside a column. `'top'` packs to the
     * top; `'center'` shifts each column's content down by half the
     * unused space.
     */
    alignRef?: Ref<TMasonryAlign>
}

/**
 * Decide how many columns to use given a container width and a
 * breakpoint map. Picks the LARGEST key ≤ width. Falls back to
 * `defaultColumns` when no key matches (i.e. the container is narrower
 * than every declared breakpoint).
 *
 * Exposed for unit testing — the bucket-fill itself is pure.
 *
 * @example
 *   pickColumnsForWidth(750, { 600: 2, 900: 3, 1200: 4 }, 1) → 2
 *   pickColumnsForWidth(1500, { 600: 2, 900: 3, 1200: 4 }, 1) → 4
 *   pickColumnsForWidth(400, { 600: 2, 900: 3, 1200: 4 }, 1) → 1
 */
export function pickColumnsForWidth (
    width: number,
    breakpoints: TMasonryColumnBreakpoints | undefined,
    defaultColumns: number
): number {
    if (!breakpoints) return Math.max(1, Math.floor(defaultColumns))
    const entries = Object.entries(breakpoints)
        .map(([k, v]) => [Number(k), Number(v)] as [number, number])
        .filter(([k, v]) => Number.isFinite(k) && Number.isFinite(v) && k > 0 && v >= 1)
        .sort((a, b) => a[0] - b[0])
    let resolved = Math.max(1, Math.floor(defaultColumns))
    for (const [bp, cols] of entries) {
        if (width >= bp) resolved = Math.max(1, Math.floor(cols))
    }
    return resolved
}

/**
 * Pure bucket-fill algorithm. Given an ordered list of item heights, a
 * container width, a gap in px, and a column count, returns the layout
 * coordinates of every item and the final container height.
 *
 * Algorithm:
 *   1. Compute item width  = (containerWidth - (cols - 1) * gap) / cols.
 *   2. Track `columnHeights[i]` — running sum of item heights + gaps.
 *   3. For each item, place it in the column with the SMALLEST current
 *      height (ties → leftmost column). Update that column's height.
 *   4. `containerHeight` = max(columnHeights).
 *
 * No DOM access. Fully deterministic. Easy to unit-test.
 */
export function bucketFill (
    heights: ReadonlyArray<number>,
    containerWidth: number,
    gap: number,
    columns: number,
    align: TMasonryAlign = 'top'
): IMasonryLayoutResult {
    const cols = Math.max(1, Math.floor(columns))
    const totalGap = (cols - 1) * gap
    const itemWidth = Math.max(0, (containerWidth - totalGap) / cols)
    const columnHeights = new Array<number>(cols).fill(0)
    const items: IMasonryItemRect[] = []

    for (let i = 0; i < heights.length; i++) {
        // Find shortest column (ties → leftmost — `>` not `>=`).
        let col = 0
        let min = columnHeights[0]
        for (let c = 1; c < cols; c++) {
            if (columnHeights[c] < min) {
                min = columnHeights[c]
                col = c
            }
        }
        const left = col * (itemWidth + gap)
        const top = columnHeights[col]
        const height = Math.max(0, heights[i])
        items.push({
            index: i,
            left,
            top,
            width: itemWidth,
            height,
            column: col
        })
        // Stack the item + a gap, but only if there was a previous item
        // in this column (avoid trailing gap on empty column).
        columnHeights[col] = top + height + gap
    }

    // Subtract the trailing gap (one per non-empty column) so the
    // container hugs the last item.
    let maxHeight = 0
    for (let c = 0; c < cols; c++) {
        const h = columnHeights[c] > 0 ? columnHeights[c] - gap : 0
        if (h > maxHeight) maxHeight = h
    }

    // Centre alignment: shift each column's items by half the unused
    // height. Computed per-column because columns rarely have the same
    // accumulated height.
    if (align === 'center' && maxHeight > 0) {
        const columnUsed = new Array<number>(cols).fill(0)
        for (const item of items) {
            const colHeight = (columnHeights[item.column] > 0)
                ? columnHeights[item.column] - gap
                : 0
            const shift = Math.max(0, (maxHeight - colHeight) / 2)
            if (columnUsed[item.column] === 0) columnUsed[item.column] = shift
            item.top += columnUsed[item.column]
        }
    }

    return {
        containerHeight: maxHeight,
        items,
        columns: cols
    }
}

/**
 * SSR-safe `ResizeObserver` factory. Returns `null` on the server side
 * — the composable falls back to a one-shot measurement on `onMounted`.
 */
function createResizeObserver (callback: () => void): ResizeObserver | null {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
        return null
    }
    return new ResizeObserver(() => {
        // Throttle through rAF so we coalesce multiple synchronous
        // resize events (browser fires one per affected element).
        if (typeof window !== 'undefined') {
            window.requestAnimationFrame(callback)
        } else {
            callback()
        }
    })
}

/**
 * Public composable used by `<OrigamMasonry>` when the CSS-native
 * `grid-template-rows: masonry` is unavailable. Maintains:
 *
 *   - `containerRef` — bind to the container element.
 *   - `itemRefs`     — bind via `:ref="(el) => setItem(idx, el)"` on
 *                      each masonry child.
 *   - `layout`       — reactive layout result (heights, item rects).
 *   - `setItem`      — register a child element. Idempotent.
 *   - `relayout()`   — manual re-measure; useful after async content
 *                      load (images, fonts) that doesn't trigger
 *                      `ResizeObserver`.
 *
 * Lifecycle:
 *   - On mount: install a `ResizeObserver` on the container AND on
 *     every registered item. Run the first layout.
 *   - On every observed mutation: re-measure heights, re-run bucket-fill.
 *   - On unmount: disconnect observers.
 */
export function useMasonry (options: IUseMasonryOptions) {
    const containerRef = ref<HTMLElement | null>(null)
    const items = new Map<number, HTMLElement>()
    const layout = ref<IMasonryLayoutResult>({
        containerHeight: 0,
        items: [],
        columns: Math.max(1, options.columnsRef.value || 1)
    })

    let containerObserver: ResizeObserver | null = null
    let itemObserver: ResizeObserver | null = null

    const setItem = (index: number, el: HTMLElement | null) => {
        const previous = items.get(index)
        if (previous && previous !== el && itemObserver) {
            itemObserver.unobserve(previous)
        }
        if (!el) {
            items.delete(index)
            return
        }
        items.set(index, el)
        if (itemObserver) itemObserver.observe(el)
    }

    const measureHeights = (): number[] => {
        const heights: number[] = []
        // Items are keyed by render index — collect them in ascending
        // order so the algorithm sees the original DOM order.
        const sorted = Array.from(items.entries()).sort((a, b) => a[0] - b[0])
        for (const [, el] of sorted) {
            // `offsetHeight` includes border + padding, matches the
            // child's painted height. Read once per pass.
            heights.push(el.offsetHeight)
        }
        return heights
    }

    const relayout = () => {
        const container = containerRef.value
        if (!container) return
        const width = container.clientWidth
        if (width <= 0) {
            // Container not yet laid out (display: none, detached, …).
            // Bail out — next ResizeObserver tick will retry.
            return
        }
        const cols = pickColumnsForWidth(
            width,
            options.breakpointsRef?.value,
            options.columnsRef.value
        )
        const heights = measureHeights()
        const align = options.alignRef?.value ?? 'top'
        layout.value = bucketFill(heights, width, options.gapRef.value, cols, align)
    }

    // Watch containerRef instead of relying on onMounted: the composable's
    // onMounted fires BEFORE the component's own onMounted, so containerRef
    // is still null at that point (the component assigns it in its own
    // onMounted). By watching the ref we install the observers as soon as
    // the component sets containerRef.value = rootEl, regardless of the
    // hook execution order.
    watch(
        containerRef,
        (container, previous) => {
            // Tear down observers for the previous element (if any).
            if (previous) {
                containerObserver?.unobserve(previous)
            }

            if (!container) return

            // Lazily create observers on first non-null container.
            if (!containerObserver) {
                containerObserver = createResizeObserver(relayout)
            }
            if (!itemObserver) {
                itemObserver = createResizeObserver(relayout)
            }

            if (containerObserver) containerObserver.observe(container)
            if (itemObserver) {
                for (const el of items.values()) itemObserver.observe(el)
            }

            // First-paint measurement. Wait one frame so the children have
            // had time to lay out (especially images / web fonts).
            if (typeof window !== 'undefined') {
                window.requestAnimationFrame(relayout)
            } else {
                relayout()
            }
        },
        { immediate: false }
    )

    onBeforeUnmount(() => {
        containerObserver?.disconnect()
        itemObserver?.disconnect()
        containerObserver = null
        itemObserver = null
        items.clear()
    })

    // React to prop changes without waiting for a resize event.
    watch(
        () => [options.columnsRef.value, options.gapRef.value, options.alignRef?.value, options.breakpointsRef?.value],
        () => relayout(),
        { deep: true }
    )

    return {
        containerRef,
        setItem,
        layout,
        relayout
    }
}
