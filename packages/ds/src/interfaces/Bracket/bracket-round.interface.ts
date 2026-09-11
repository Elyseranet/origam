import type { TBracketRoundSide } from '../../types'
import type { IBracketMatch } from './bracket-match.interface'

/**
 * A round (column in horizontal mode, row in vertical mode) of the
 * tournament tree.
 *
 * Title is required — `OrigamBracket` renders it above (or beside) the
 * matches list when `showRoundTitles` is enabled. Consumers should
 * pre-translate the label (the component does not call `useT`).
 *
 * `side` is only meaningful for double-elimination — single-elim
 * tournaments leave it `undefined`.
 */
export interface IBracketRound {
    /** Stable identifier — used as key and in slot scopes. */
    id: string | number
    /** Pre-translated label ("Quarter-finals", "Semi-finals", "Final"). */
    title: string
    /** Ordered list of matches that belong to this round. */
    matches: IBracketMatch[]
    /**
     * Optional bracket-side marker for double-elimination layouts.
     * Drives grouping into Winner Bracket / Loser Bracket / Grand
     * Final sections.
     */
    side?: TBracketRoundSide
}
