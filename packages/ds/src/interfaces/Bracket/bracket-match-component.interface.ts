import type {
    IActiveEmits,
    IActiveProps
} from '../Commons/active.interface'
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
import type { IHoverProps } from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TBracketMatchStatus } from '../../types/Bracket/bracket-match.type'

import type { IBracketCompetitor } from './bracket-competitor.interface'
import type { IBracketMatch } from './bracket-match.interface'

/**
 * Props for `<OrigamBracketMatch>` — a single match card rendered
 * inside `<OrigamBracket>`. Exported so consumers can render a match
 * card outside the full bracket (e.g. on a match-details page). Carries
 * the full cross-cutting surface (color, bgColor, rounded, elevation,
 * border, density, dimension, padding, margin) so a standalone card
 * behaves like any other origam component.
 */
export interface IBracketMatchProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IHoverProps, IActiveProps, IRoundedProps, IElevationProps, IBorderProps, IDensityProps, IDimensionProps, IPaddingProps, IMarginProps {
    /** The match payload to render. */
    match: IBracketMatch
    /**
     * Override of the per-match status — useful when the caller wants
     * to force a status (e.g. preview a "live" badge from a story).
     */
    status?: TBracketMatchStatus
    /**
     * Destination of the "Watch live" link, shown in the meta header only
     * when the match is `live`. A URL (rendered as an `<a>` opening in a
     * new tab). Omit to hide the link.
     */
    to?: string
    /**
     * Hoists the match into the "final" visual treatment — bigger
     * card, shadow, and rounded corners.
     *
     * @default false
     */
    isFinal?: boolean
    /**
     * Hides the score column when `false`.
     *
     * @default true
     */
    showScores?: boolean
    /**
     * Shows the seed prefix on competitor names.
     *
     * @default false
     */
    showSeed?: boolean
    /**
     * Whether the card advertises interactivity (hover state, cursor,
     * keyboard focus, `role="button"`).
     *
     * @default true
     */
    interactive?: boolean
}

/** Emits fired by `<OrigamBracketMatch>` — click on the card itself
 *  (outside a competitor row), and the two per-competitor channels the
 *  card re-emits on behalf of its `competitor` slot / default rows. */
/* Même défaut que `IBracketCompetitorEmits` : `useActive(props)` émet
 * `update:active` via `onActive()`, câblé sur le clic. Prouvé au runtime
 * dans `packages/tests/TU/origam/relay-emits-declaration.spec.ts`. */
export interface IBracketMatchEmits extends IActiveEmits {
    (e: 'click', match: IBracketMatch, event: MouseEvent): void
    (e: 'competitor-click', competitor: IBracketCompetitor, match: IBracketMatch, side: 'A' | 'B', event: MouseEvent | KeyboardEvent): void
    (e: 'winner-click', competitor: IBracketCompetitor, match: IBracketMatch, event: MouseEvent | KeyboardEvent): void
}

/** Scope for the `competitor` slot — one side (`A` or `B`) of the match.
 *  `competitor` is `null` for a not-yet-determined participant (renders
 *  "TBD" by default). */
export interface IBracketMatchCompetitorSlot {
    competitor: IBracketCompetitor | null
    match: IBracketMatch
    isWinner: boolean
    side: 'A' | 'B'
}

export interface IBracketMatchSlots {
    competitor?: (props: IBracketMatchCompetitorSlot) => any
}
