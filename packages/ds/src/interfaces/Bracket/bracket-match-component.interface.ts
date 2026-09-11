import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IDimensionProps,
    IElevationProps,
    IHoverProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

import type { TBracketMatchStatus } from '../../types'

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
