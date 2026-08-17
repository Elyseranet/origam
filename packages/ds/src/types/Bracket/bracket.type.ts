import type { IBracketMatch, IBracketRound } from '../../interfaces'
import type { IBorderProps } from '../../interfaces/Commons/border.interface'
import type { IRoundedProps } from '../../interfaces/Commons/rounded.interface'
import type { TColor } from '../Commons/color.type'
import type { TDirection } from '../Commons/direction.type'
import type { TElevation } from '../Commons/elevation.type'
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

/**
 * Input vocabularies accepted by the `resolveBracket*` helpers in
 * `src/utils/Bracket/bracket-surface.util.ts`.
 *
 * Each one is DERIVED from the matching Commons surface rather than
 * restated as a literal union. The four started life as four hand-typed
 * unions — three of which (`rounded`, `elevation`, `border`) had
 * collapsed to the byte-identical `string | number | boolean | null |
 * undefined`, so nothing in the type system stopped them drifting apart
 * from the props they are fed by, nor from each other. Deriving them
 * means a widening of `IRoundedProps['rounded']` (or of `TElevation`)
 * reaches the resolver's signature on its own.
 *
 * They are LOOSER than the props they mirror on one axis: the resolvers
 * are called with raw prop bags through a cast (see
 * `bracketSurfaceVars(props as IBracketSurfaceInput)` in
 * `OrigamBracket.vue`), so `null` and a bare `true` opt-in both have to
 * be accepted and are handled explicitly at runtime.
 */

/**
 * Colour input — the string half of {@link TColor}. The bracket
 * resolvers deliberately do NOT accept `IGradient`: they emit
 * `--origam-bracket-match---*` custom properties that feed
 * `background-color` / `border-color`, and neither CSS property has a
 * gradient form.
 */
export type TBracketColor = Extract<TColor, string> | null | undefined

/** Corner-radius input — the exact vocabulary of `IRoundedProps['rounded']`. */
export type TBracketRounded = IRoundedProps['rounded']

/**
 * Elevation input — {@link TElevation} plus the boolean opt-in
 * (`true` → the default `md` rung) and the falsy opt-out.
 */
export type TBracketElevation = TElevation | boolean | null | undefined

/**
 * Border-width input — the per-side vocabulary of
 * `IBorderProps['borderTop']`, plus the falsy opt-out.
 *
 * The per-SIDE prop is the right reference here, not the global
 * `IBorderProps['border']`: the latter also accepts a
 * `TDirectionBoth[]` ("border on these edges only"), which is an edge
 * SELECTOR, not a width. `resolveBracketBorderWidth` resolves a width
 * for one already-chosen edge, so the array form has no meaning at this
 * layer.
 */
export type TBracketBorder = IBorderProps['borderTop'] | null | undefined
