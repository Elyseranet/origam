import type { TBracketMatchStatus } from '../../types'
import type { IBracketCompetitor } from './bracket-competitor.interface'

/**
 * Head-start carried into a match by one competitor — the classic
 * double-elimination Grand Final advantage, where the Winner Bracket
 * champion starts the (single) Grand Final already up by one round /
 * set.
 */
export interface IBracketMatchAdvantage {
    /** Id of the competitor that starts ahead. */
    competitorId: string | number
    /**
     * Size of the head start, in rounds / sets.
     *
     * @default 1
     */
    rounds?: number
}

/**
 * A single match between two competitors.
 *
 * `competitorA` / `competitorB` are nullable so the bracket can render
 * "TBD" placeholders for matches whose participants are not yet
 * determined (e.g. winner of an earlier round).
 *
 * `scoreA` / `scoreB` accept `string` to allow non-numeric markers
 * (`'—'`, `'DSQ'`, `'W/O'`, …) without forcing the consumer to coerce.
 *
 * `nextMatchId` lets `OrigamBracket` draw a connector from this match
 * to the next round automatically. If `undefined`, the layout falls
 * back to positional mapping (match `i` of round `n` connects to match
 * `floor(i / 2)` of round `n + 1`).
 */
export interface IBracketMatch {
    /** Stable identifier — required for connector linking. */
    id: string | number
    /** Left-side / top-side competitor. `null` = TBD or bye. */
    competitorA: IBracketCompetitor | null
    /** Right-side / bottom-side competitor. `null` = TBD or bye. */
    competitorB: IBracketCompetitor | null
    /** Score of `competitorA`. Accepts `string` for non-numeric markers. */
    scoreA?: number | string
    /** Score of `competitorB`. Accepts `string` for non-numeric markers. */
    scoreB?: number | string
    /**
     * Identifier of the declared winner. Falls back to `null` /
     * `undefined` when the match is not yet completed. Used by the
     * component to apply the `--winner` modifier class on the
     * relevant competitor row.
     */
    winnerId?: string | number | null
    /**
     * Optional lifecycle marker. Drives the visual `--status-{value}`
     * modifier on the match card (e.g. live pulse, completed grey out).
     */
    status?: TBracketMatchStatus
    /**
     * Optional id of the downstream match this one feeds into. Used
     * by the connector layout to draw a path. If omitted, positional
     * mapping is used.
     */
    nextMatchId?: string | number
    /**
     * Optional head-start for one competitor — the Winner Bracket
     * champion's one-round advantage in a double-elimination Grand
     * Final. Rendered as a `+N` badge on the favoured competitor row.
     */
    advantage?: IBracketMatchAdvantage
    /** ISO date string — informative only, displayed when present. */
    scheduledAt?: string
    /** Free-form payload — never read by the component. */
    metadata?: Record<string, unknown>
}
