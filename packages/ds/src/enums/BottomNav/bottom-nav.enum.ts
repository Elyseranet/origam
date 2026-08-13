import { ALIGN } from '../Commons/align.enum'

/**
 * Horizontal placement of the bottom navigation bar when it does not span
 * the full width (e.g. a custom `width`). Maps to inline-start / centred /
 * inline-end alignment within the layout region.
 *
 * Strict subset of `ALIGN` (Commons) — `baseline` / `stretch` have no
 * meaning for a bar placement, so this stays its own enum rather than
 * a re-export, but its members derive from `ALIGN`'s values instead of
 * redeclaring the strings.
 */
export enum BOTTOM_NAV_POSITION {
    START = ALIGN.START,
    CENTER = ALIGN.CENTER,
    END = ALIGN.END
}
