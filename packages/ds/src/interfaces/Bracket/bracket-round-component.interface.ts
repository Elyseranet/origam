import type { ICommonsComponentProps, IDirectionProps, ITagProps, ITypographyProps } from '../../interfaces'

import type { TIntent } from '../../types'

import type { IBracketRound } from './bracket-round.interface'

/**
 * Props for `<OrigamBracketRound>` — a single round (column in
 * horizontal mode, row in vertical mode). Exported so consumers can
 * render a round standalone (e.g. inside a custom layout).
 */
export interface IBracketRoundProps extends ICommonsComponentProps, ITagProps, IDirectionProps, ITypographyProps {
    /** The round payload to render. */
    round: IBracketRound
    /** Index of the round inside its bracket — drives the vertical offset. */
    index: number
    /** Total number of rounds — used to flag the last round as final. */
    totalRounds: number
    /** Toggle the round title heading. */
    showRoundTitle?: boolean
    /** Forward to children — toggles score column. */
    showScores?: boolean
    /** Forward to children — toggles seed prefix. */
    showSeed?: boolean
    /** Forward to children — toggles match-card interactivity. */
    interactive?: boolean
    /** Forward intent color. */
    color?: TIntent
}
