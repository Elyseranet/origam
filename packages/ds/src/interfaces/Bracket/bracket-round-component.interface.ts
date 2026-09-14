import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TIntent } from '../../types/Commons/intent.type'

import type { IBracketCompetitor } from './bracket-competitor.interface'
import type { IBracketMatch } from './bracket-match.interface'
import type { IBracketMatchCompetitorSlot } from './bracket-match-component.interface'
import type { IBracketRound } from './bracket-round.interface'

/**
 * Props for `<OrigamBracketRound>` — a single round (column in
 * horizontal mode, row in vertical mode). Exported so consumers can
 * render a round standalone (e.g. inside a custom layout).
 */
export interface IBracketRoundProps extends ICommonsComponentProps, ITagProps, IDirectionProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'letterSpacing'> {
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

/** Emits fired by `<OrigamBracketRound>` — re-emitted from its default
 *  `<OrigamBracketMatch>` renders (or from a custom `match` / `competitor`
 *  slot render that wires the same handlers back up). */
export interface IBracketRoundEmits {
    (e: 'match-click', match: IBracketMatch, event: MouseEvent): void
    (e: 'competitor-click', competitor: IBracketCompetitor, match: IBracketMatch, side: 'A' | 'B', event: MouseEvent | KeyboardEvent): void
    (e: 'winner-click', competitor: IBracketCompetitor, match: IBracketMatch, event: MouseEvent | KeyboardEvent): void
}

/** Scope for the `round-title` slot. */
export interface IBracketRoundTitleSlot {
    round: IBracketRound
    index: number
}

/** Scope for the `match` slot — one match card slot in this round.
 *  `isFinal` is `true` only for the round's single match when it's also
 *  the bracket's last round (the championship match). */
export interface IBracketRoundMatchSlot {
    match: IBracketMatch
    round: IBracketRound
    isFinal: boolean
}

/*********************************************************
 * IBracketRoundSlots
 *
 * @description
 * #388 — `competitor` is relayed straight through to each
 * `<OrigamBracketMatch>` this round renders via its default `match`
 * slot content. Before this fix `OrigamBracketRound` never forwarded
 * it: a consumer providing `#competitor` at `OrigamBracket` level saw
 * the default `OrigamBracketCompetitor` row render anyway.
 ********************************************************/
export interface IBracketRoundSlots {
    'round-title'?: (props: IBracketRoundTitleSlot) => any
    match?: (props: IBracketRoundMatchSlot) => any
    competitor?: (props: IBracketMatchCompetitorSlot) => any
}
