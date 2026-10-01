import { BORDER_LOGICAL_AXIS } from '../../enums/Commons/border.enum'
import { BLOCK, INLINE, START_END } from '../../enums/Commons/anchor.enum'

export type TStartEnd = `${START_END}`

export type TBlock = `${BLOCK}`
export type TBlockStartEnd = TBlock | TStartEnd

export type TInline = `${INLINE}`
export type TInlineStartEnd = TInline | TStartEnd

export type TDirectionBoth = TBlock | TInline

/*********************************************************
 * TLogicalSide
 *
 * @description
 * One LOGICAL box edge — `block-start` | `block-end` | `inline-start` |
 * `inline-end`. The writing-mode-relative twin of {@link TDirectionBoth},
 * which names the four PHYSICAL edges.
 *
 * @description
 * Composed from the two enums that already carry this vocabulary rather
 * than spelling a fifth literal union : `BORDER_LOGICAL_AXIS` fournit
 * l'axe, `START_END` son extremite. Rien de neuf n'est declare, donc les
 * cotes logiques ne peuvent pas deriver des props d'axe (`paddingInline`,
 * `borderBlock`, …) qui lisent les memes membres.
 *
 * @description
 * ⚠️ `BORDER_LOGICAL_AXIS` est border-NOMME mais pas border-PORTE — c'est
 * deja le vocabulaire d'axe de padding et margin
 * (`consts/Commons/spacing.const.ts` l'importe pour
 * `PADDING_LOGICAL_AXIS_MAP` / `MARGIN_LOGICAL_AXIS_MAP`). Le reutiliser
 * ici suit ce precedent au lieu d'ajouter un enum quasi identique.
 *
 * @description
 * Consomme par les familles `*InlineStart` / `*InlineEnd` / `*BlockStart`
 * / `*BlockEnd` de `IPaddingProps`, `IMarginProps` et `IBorderProps`
 * (#1013), et par les tables qui les cablent.
 ********************************************************/
export type TLogicalSide = `${BORDER_LOGICAL_AXIS}-${START_END}`

/*********************************************************
 * TLogicalCorner
 *
 * @description
 * One LOGICAL box CORNER — `start-start` | `start-end` | `end-start` |
 * `end-end`, dans l'ordre natif `border-{block}-{inline}-radius` (fin de
 * bloc d'abord, fin d'inline ensuite). Le jumeau relatif au mode
 * d'ecriture des noms physiques `top-left` / ….
 *
 * @description
 * Compose depuis `START_END` seul, pour la meme raison anti-duplication
 * que {@link TLogicalSide} : un coin est l'intersection d'une fin de bloc
 * et d'une fin d'inline, donc le vocabulaire est `START_END` au carre.
 *
 * @description
 * Consomme par les props `roundedStartStart` / `roundedStartEnd` /
 * `roundedEndStart` / `roundedEndEnd` de `IRoundedProps` (#1013).
 ********************************************************/
export type TLogicalCorner = `${START_END}-${START_END}`

export type TAnchor =
    | TBlock
    | TInline
    | 'center'
    | 'center center'
    | `${TBlock} ${TInline | 'center'}`
    | `${TInline} ${TBlock | 'center'}`

export type TParsedAnchor =
    | { side: 'center', align: 'center' }
    | { side: TBlock, align: TInline | 'center' }
    | { side: TInline, align: TBlock | 'center' }


