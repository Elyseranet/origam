import type { TSheetSnapPoint } from '../../types'

/**
 * Default snap-point set used by `<OrigamSheet>` when the consumer
 * doesn't pass their own.
 *
 * Heights are intentionally a mix of px and viewport units to match
 * the PDF reference:
 * - `peek` shows ~120 px of content (the drag handle plus a teaser
 *   line),
 * - `half` is roughly 50% of the viewport,
 * - `full` leaves a 10vh strip at the top so the underlying scrim is
 *   still visible / dismissable,
 * - `closed` collapses the sheet height to zero — the parent component
 *   is responsible for unmounting / hiding the host after the snap
 *   settles.
 *
 * Co-located with the rest of the project's constants per the global
 * CLAUDE.md "Constants ONLY in `src/consts/`" rule.
 */
export const DEFAULT_SHEET_SNAP_POINTS: ReadonlyArray<TSheetSnapPoint> = [
    { id: 'closed', height: 0 },
    { id: 'peek',   height: '120px' },
    { id: 'half',   height: '50vh' },
    { id: 'full',   height: '90vh' }
] as const
