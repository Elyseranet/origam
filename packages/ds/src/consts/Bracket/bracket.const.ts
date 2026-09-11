import type { TBracketMatchStatus, TBracketVariant } from '../../types'

/**
 * Closed list of valid `variant` values for `OrigamBracket`. Exposed so
 * stories / consumers can iterate the matrix (e.g. for a `HstSelect`)
 * without duplicating string literals.
 */
export const BRACKET_VARIANTS: ReadonlyArray<TBracketVariant> = [
    'single-elimination',
    'double-elimination',
    'round-robin'
]

/**
 * Closed list of valid `status` values for `IBracketMatch.status`.
 */
export const BRACKET_MATCH_STATUSES: ReadonlyArray<TBracketMatchStatus> = [
    'pending',
    'live',
    'completed',
    'forfeited'
]

/**
 * Default match card width (in px) used by the layout algorithm when
 * computing connector paths in horizontal mode. Mirrors the token
 * `bracket.match.width` — duplicated in code so the connector pure
 * function stays free of DOM measurement.
 */
export const BRACKET_DEFAULT_MATCH_WIDTH = 240

/**
 * Default match card height (in px) used by the layout algorithm.
 * Mirrors the token `bracket.match.height`.
 */
export const BRACKET_DEFAULT_MATCH_HEIGHT = 72

/**
 * Default vertical gap (in px) between sibling matches in the first
 * round. Subsequent rounds double the gap to produce the classic
 * branching pattern.
 */
export const BRACKET_DEFAULT_MATCH_GAP = 24

/**
 * Default horizontal gap (in px) between rounds. Mirrors the token
 * `bracket.gap-round`.
 */
export const BRACKET_DEFAULT_ROUND_GAP = 48

/**
 * Default heading rendered above the winner-bracket tree in a
 * double-elimination layout. Override via the `winnersLabel` prop
 * (e.g. to localise). Kept as a literal in `withDefaults`, mirrored
 * here for consumer reference.
 */
export const BRACKET_DEFAULT_WINNERS_LABEL = 'Winners bracket'

/**
 * Default heading rendered above the loser-bracket tree in a
 * double-elimination layout. Override via the `losersLabel` prop.
 */
export const BRACKET_DEFAULT_LOSERS_LABEL = 'Losers bracket'
