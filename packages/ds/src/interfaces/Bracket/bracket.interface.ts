import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type {
    TBracketConnectorPath,
    TBracketVariant
} from '../../types/Bracket/bracket.type'

import type { IBracketCompetitor } from './bracket-competitor.interface'
import type { IBracketMatchCompetitorSlot } from './bracket-match-component.interface'
import type { IBracketMatch } from './bracket-match.interface'
import type { IBracketRoundMatchSlot, IBracketRoundTitleSlot } from './bracket-round-component.interface'
import type { IBracketRound } from './bracket-round.interface'

/**
 * Props for `<OrigamBracket>` — a tournament tree renderer supporting
 * single-elimination, double-elimination and round-robin layouts.
 *
 * The component is purely presentational: it accepts an immutable
 * `rounds` payload and emits user-interaction events (`match-click`,
 * `winner-click`, `competitor-click`) so the consumer can update the
 * data and re-render. No internal state is held about scores or
 * winners — the data passed in is the source of truth.
 */
export interface IBracketProps extends ICommonsComponentProps, ITagProps, IDensityProps, IRoundedProps, IColorProps, IBgColorProps, IBorderProps, IDimensionProps, IElevationProps, IMarginProps, IPaddingProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'letterSpacing'> {
    /**
     * Required. Pre-ordered list of rounds. For single-elimination,
     * the rounds are laid out from earliest (e.g. round-of-16) to
     * final. For double-elimination, segregate by `IBracketRound.side`
     * (`'winner'`, `'loser'`, `'grand-final'`).
     */
    rounds: IBracketRound[]
    /**
     * Tournament shape. Single-elimination is the default.
     * Round-robin renders a NxN matrix instead of a tree.
     *
     * @default 'single-elimination'
     */
    variant?: TBracketVariant
    /**
     * Layout axis. Horizontal stacks rounds as columns (the classic
     * tournament tree look). Vertical stacks rounds as rows — useful
     * for narrow viewports. Ignored when `variant === 'round-robin'`
     * (the matrix layout has its own grid axis).
     *
     * @default 'horizontal'
     */
    direction?: 'horizontal' | 'vertical'
    /**
     * Toggle round headers (`<h3>Quarter-finals</h3>`).
     *
     * @default true
     */
    showRoundTitles?: boolean
    /**
     * Toggle the score column on each competitor row.
     *
     * @default true
     */
    showScores?: boolean
    /**
     * Toggle the seed prefix on competitor names (e.g. `1. Team Liquid`).
     *
     * @default false
     */
    showSeed?: boolean
    /**
     * Whether match cards should be interactive (cursor, hover state,
     * keyboard focus). When `false`, click handlers still fire but the
     * cards do not advertise affordance.
     *
     * @default true
     */
    interactive?: boolean
    /**
     * Heading shown above the winner-bracket tree in a
     * double-elimination layout. Pre-translate before passing — the
     * component never calls `useT`.
     *
     * @default 'Winners bracket'
     */
    winnersLabel?: string
    /**
     * Heading shown above the loser-bracket tree in a
     * double-elimination layout.
     *
     * @default 'Losers bracket'
     */
    losersLabel?: string
}

/** Emits fired by `<OrigamBracket>` — bubbled up from every match /
 *  competitor across every round (single-elim tree, both double-elim
 *  trees, or the round-robin matrix). */
export interface IBracketEmits {
    (e: 'match-click', match: IBracketMatch, round: IBracketRound, event: MouseEvent): void
    (e: 'winner-click', competitor: IBracketCompetitor, match: IBracketMatch, event: MouseEvent | KeyboardEvent): void
    (e: 'competitor-click', competitor: IBracketCompetitor, match: IBracketMatch, event: MouseEvent | KeyboardEvent): void
}

/** Scope for the `connector` slot — one measured SVG link between two
 *  match cards (single/double-elimination only; round-robin has no
 *  connectors). Overriding it replaces the default `<path>` render. */
export interface IBracketConnectorSlot {
    from: TBracketConnectorPath['from']
    to: TBracketConnectorPath['to']
}

/** Slot signatures for `<OrigamBracket>`. `round-title` / `match` /
 *  `competitor` are 1:1 forwards of `<OrigamBracketRound>` /
 *  `<OrigamBracketMatch>`'s own slots (same scope, same names) — they
 *  exist here so a consumer can override deeply-nested match/competitor
 *  rendering without dropping down to the round component directly. */
export interface IBracketSlots {
    connector?: (props: IBracketConnectorSlot) => any
    'round-title'?: (props: IBracketRoundTitleSlot) => any
    match?: (props: IBracketRoundMatchSlot) => any
    competitor?: (props: IBracketMatchCompetitorSlot) => any
}
