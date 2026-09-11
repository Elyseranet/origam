import type { Ref } from 'vue'

import type { TSheetSnapId } from '../../types'

/**
 * Public surface returned by `useSheetSwipe()`. Components consuming
 * the composable should bind `currentSnap` to a CSS height variable,
 * read `dragOffset` for the live transform during a gesture, and use
 * `isDragging` to disable/enable transitions accordingly.
 *
 * `snapTo()` is exposed so the parent can drive the sheet
 * programmatically (e.g. open via a button), and `dismiss()` is the
 * convenience alias for `snapTo('closed')`. `currentSnapHeight` is the
 * resolved px height of the active snap — useful for assertions in
 * tests and for any layout maths the consumer wants to do without
 * re-resolving the snap-point preset themselves.
 */
export interface ISheetSwipeReturn {
    /** The currently-active snap id. */
    currentSnap: Ref<TSheetSnapId>
    /** Live drag delta during a gesture (px from snap baseline). */
    dragOffset: Ref<number>
    /** True while a pointer is held on the handle. */
    isDragging: Ref<boolean>
    /** Imperative snap (programmatic). */
    snapTo: (id: TSheetSnapId) => void
    /** Convenience — alias for `snapTo('closed')`. */
    dismiss: () => void
    /** Resolved height (in px) of the active snap point. */
    currentSnapHeight: Ref<number>
}
