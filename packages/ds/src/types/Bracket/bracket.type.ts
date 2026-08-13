import type { IBracketMatch, IBracketRound } from '../../interfaces'
import type { TDirection } from '../Commons/direction.type'
import { BRACKET_VARIANT } from '../../enums'
import { OrigamBracket } from '../../components'

/**
 * One measured SVG connector link between two match cards
 * (`<OrigamBracket>`'s `connectorPaths`). Computed from the LIVE DOM rects
 * of the match cards (not a formula) so the link always lands on the
 * exact centre of the card it leaves / enters — see the "Connector
 * measurement" block in `OrigamBracket.vue` for why a formula was not
 * reliable across density / title / score variations.
 */
export type TBracketConnectorPath = {
    key: string
    d: string
    from: { matchId: IBracketMatch['id']; x: number; y: number }
    to: { matchId: IBracketMatch['id']; x: number; y: number }
    winner: boolean
}

/**
 * Layout axis of the bracket tree.
 *
 * - `'horizontal'` — each round is a column, matches stack vertically
 *   within the column, connectors flow left-to-right.
 * - `'vertical'`   — each round is a row, matches lay out horizontally,
 *   connectors flow top-to-bottom.
 *
 * Mirrors the global `TDirection` so the bracket plays nicely with the
 * rest of the design system's direction props.
 */
export type TBracketDirection = TDirection

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

export type TBracketVariant = `${BRACKET_VARIANT}`

export type TOrigamBracket = InstanceType<typeof OrigamBracket>
