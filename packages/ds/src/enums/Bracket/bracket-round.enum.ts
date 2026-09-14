/**
 * Optional side marker for double-elimination tournaments. See
 * `TBracketRoundSide` for the per-value rationale. Single-elimination
 * tournaments leave `IBracketRound.side` `undefined`.
 */
export enum BRACKET_ROUND_SIDE {
    WINNER = 'winner',
    LOSER = 'loser',
    GRAND_FINAL = 'grand-final'
}
