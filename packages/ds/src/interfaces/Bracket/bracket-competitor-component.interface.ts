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
import type { ITypographyProps } from '../Commons/typography.interface'

import type { IBracketCompetitor } from './bracket-competitor.interface'

/**
 * Props for `<OrigamBracketCompetitor>` — a single competitor row.
 * Exported so consumers can render a competitor row standalone (e.g.
 * inside a custom match slot). Carries the full cross-cutting prop
 * surface (color, bgColor, rounded, elevation, border, density,
 * dimension, padding, margin) so a standalone row behaves like any
 * other origam component.
 */
export interface IBracketCompetitorProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, IHoverProps, IActiveProps, IRoundedProps, IElevationProps, IBorderProps, IDensityProps, IDimensionProps, IPaddingProps, IMarginProps, ITypographyProps {
    /**
     * The competitor payload. `null` renders a "TBD" placeholder — used
     * when the match's participant is not yet determined (winner of an
     * earlier round, byes, …).
     */
    competitor: IBracketCompetitor | null
    /** Optional score — accepts string for non-numeric markers. */
    score?: number | string
    /**
     * Whether to apply the `--winner` modifier class (bolder text,
     * intent-tinted background).
     *
     * @default false
     */
    isWinner?: boolean
    /**
     * Mirror the player-is-loser state. Used to lighten the row when
     * the match is completed and the consumer wants to de-emphasize
     * the losing side.
     *
     * @default false
     */
    isLoser?: boolean
    /**
     * Toggle the score column.
     *
     * @default true
     */
    showScore?: boolean
    /**
     * Toggle the seed prefix.
     *
     * @default false
     */
    showSeed?: boolean
    /**
     * Whether the row advertises interactivity (hover state, cursor).
     *
     * @default true
     */
    interactive?: boolean
    /**
     * Head-start carried into the match by this competitor, in rounds /
     * sets. When set (`> 0`), a `+N` badge is rendered next to the name
     * — used for the Winner Bracket champion's Grand Final advantage.
     */
    advantageRounds?: number
    /**
     * Marks this competitor as the one that FORFEITED the match — the
     * name is struck through and a "forfeit" tag is shown.
     */
    forfeit?: boolean
}

/** Emits fired by `<OrigamBracketCompetitor>` — click (mouse) / activation
 *  (Enter / Space when `interactive`) on the row. */
/* `useActive(props)` écrit dans le v-model `active` depuis `onActive()`,
 * câblé sur le clic du composant. L'émission `update:active` partait donc
 * sans être déclarée — Vue avertissait à chaque clic et le handler
 * `onUpdate:active` restait dans `$attrs`, posé sur l'élément racine par
 * `inheritAttrs`. Prouvé au runtime dans
 * `packages/tests/TU/origam/relay-emits-declaration.spec.ts`. */
export interface IBracketCompetitorEmits extends IActiveEmits {
    (e: 'click', event: MouseEvent | KeyboardEvent): void
}
