import { OrigamBracketRound } from '../../components'
import { BRACKET_ROUND_SIDE } from '../../enums'

/**
 * Optional side marker for double-elimination tournaments.
 *
 * - `'winner'`       — round belongs to the winner bracket.
 * - `'loser'`        — round belongs to the loser bracket.
 * - `'grand-final'`  — single round that pits the winner of WB against
 *                     the winner of LB.
 *
 * Single-elimination tournaments do not need to set this — leave it
 * `undefined`.
 */
export type TBracketRoundSide = `${BRACKET_ROUND_SIDE}`

export type TOrigamBracketRound = InstanceType<typeof OrigamBracketRound>
