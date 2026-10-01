import { BORDER_LOGICAL_AXIS } from '../../enums/Commons/border.enum'
import { BLOCK, INLINE, START_END } from '../../enums/Commons/anchor.enum'

export type TStartEnd = `${START_END}`

export type TBlock = `${BLOCK}`
export type TBlockStartEnd = TBlock | TStartEnd

export type TInline = `${INLINE}`
export type TInlineStartEnd = TInline | TStartEnd

export type TDirectionBoth = TBlock | TInline

/*********************************************************
 * One LOGICAL box edge — `block-start` | `block-end` | `inline-start` |
 * `inline-end`. The writing-mode-relative twin of {@link TDirectionBoth},
 * which names the four PHYSICAL edges.
 *
 * Composed from the two enums that already carry this vocabulary rather
 * than spelling a fifth literal union: `BORDER_LOGICAL_AXIS` supplies the
 * axis and `START_END` the end of it. Nothing new is declared, so the
 * logical sides cannot drift from the axis props (`paddingInline`,
 * `borderBlock`, …) that read the same `BORDER_LOGICAL_AXIS` members.
 *
 * ⚠️ `BORDER_LOGICAL_AXIS` is border-NAMED but not border-SCOPED — it is
 * already the axis vocabulary for padding and margin too
 * (`consts/Commons/spacing.const.ts` imports it for
 * `PADDING_LOGICAL_AXIS_MAP` / `MARGIN_LOGICAL_AXIS_MAP`). Reusing it here
 * follows that precedent instead of adding a near-identical enum.
 *
 * Consumed by the `*InlineStart` / `*InlineEnd` / `*BlockStart` /
 * `*BlockEnd` prop families on `IPaddingProps`, `IMarginProps` and
 * `IBorderProps` (issue #1013), and by the maps that wire them.
 ********************************************************/
export type TLogicalSide = `${BORDER_LOGICAL_AXIS}-${START_END}`

/*********************************************************
 * One LOGICAL box CORNER — `start-start` | `start-end` | `end-start` |
 * `end-end`, in the native `border-{block}-{inline}-radius` order (block
 * end first, inline end second). The writing-mode-relative twin of the
 * physical `top-left` / … corner names.
 *
 * Composed from `START_END` alone, for the same anti-duplication reason as
 * {@link TLogicalSide}: a corner is the intersection of a block end and an
 * inline end, so the vocabulary is `START_END` squared.
 *
 * Consumed by `IRoundedProps`' `roundedStartStart` / `roundedStartEnd` /
 * `roundedEndStart` / `roundedEndEnd` props (issue #1013).
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


