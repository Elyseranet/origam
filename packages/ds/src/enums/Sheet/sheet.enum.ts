/**
 * Well-known bottom-sheet snap-point ids understood by `<OrigamSheet>`
 * (`swipeable + side="bottom"`) out of the box.
 *
 * `TSheetSnapId` widens this set with `(string & {})` so brand
 * integrations can add their own rungs without forking — the enum only
 * names the ones the component ships defaults for.
 */
export enum SHEET_SNAP_ID {
    CLOSED = 'closed',
    PEEK = 'peek',
    HALF = 'half',
    FULL = 'full'
}
