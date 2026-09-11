/**
 * Sheet bottom-swipe snap-point typings.
 *
 * The bottom-sheet pattern (see `OrigamSheet` with `swipeable + side="bottom"`)
 * relies on a discrete set of "snap" heights the gesture composable will
 * settle on at the end of every drag. These types describe that contract.
 *
 * - `TSheetSnapId` — well-known id strings the component understands by
 *   default (`closed`, `peek`, `half`, `full`). It also accepts arbitrary
 *   strings so brand integrations can extend the set without forking.
 * - `TSheetSnapPoint` — a `{ id, height }` tuple. Heights may be a number
 *   (interpreted as px) or any CSS length (`'120px'`, `'50vh'`, `'90%'`).
 *
 * Use site: `OrigamSheet`, `sheetSwipe.composable.ts`,
 * `sheetSwipe.composable.spec.ts`, the `Bottom — swipeable` story Variant
 * and `tests/e2e/sheet.spec.ts`.
 */

export type TSheetSnapId =
    | 'closed'
    | 'peek'
    | 'half'
    | 'full'
    | (string & {})

export type TSheetSnapPoint = {
    id: TSheetSnapId
    height: number | string
}
