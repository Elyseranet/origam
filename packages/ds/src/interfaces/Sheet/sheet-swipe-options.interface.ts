import type { Ref } from 'vue'

import type { TSheetSnapId, TSheetSnapPoint } from '../../types'

/**
 * Options bag passed to `useSheetSwipe()` — the bottom-sheet drag
 * gesture composable.
 *
 * Documented at the interface level so that consumers wire the refs
 * correctly without having to read the composable source. The drag
 * gesture only binds to `handle` (a small pill at the top of the
 * sheet), keeping the rest of the sheet body interactive (lists scroll,
 * buttons click) — Material 3 / iOS bottom-sheet pattern.
 */
export interface ISheetSwipeOptions {
    /** The sheet root element — used to read its current rendered height. */
    el: Ref<HTMLElement | null | undefined>
    /** The drag-handle element — pointer events bind to this only. */
    handle: Ref<HTMLElement | null | undefined>
    /** Ordered list of snap points (any order; the composable sorts). */
    snapPoints?: Ref<ReadonlyArray<TSheetSnapPoint>>
    /** Initial snap id; defaults to `'half'`. */
    defaultSnap?: Ref<TSheetSnapId>
    /** When true, ignore pointer events entirely. */
    disabled?: Ref<boolean | undefined>
    /** When true, dragging past `closed` snaps back instead of dismissing. */
    persistent?: Ref<boolean | undefined>
}
