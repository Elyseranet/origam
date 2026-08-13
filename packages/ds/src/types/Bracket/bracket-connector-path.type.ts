import type { IBracketMatch } from '../../interfaces'

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
