import type { IBracketRound } from '../../interfaces'

/**
 * One rendered tree of a double-elimination bracket (`<OrigamBracket>`'s
 * `doubleSections` computed). A double-elimination tournament is really
 * two independent trees — Winner Bracket and Loser Bracket — converging on
 * a single Grand Final, so each section carries its own pre-translated
 * label and the subset of `IBracketRound[]` that belongs to it. Empty
 * sections are filtered out before render.
 */
export type TBracketDoubleSection = {
    key: 'winners' | 'losers' | 'grand-final'
    label: string
    rounds: IBracketRound[]
}
