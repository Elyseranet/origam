import { BLOCK, INLINE, START_END } from '../../enums'

export type TStartEnd = `${START_END}`

export type TBlock = `${BLOCK}`
export type TBlockStartEnd = TBlock | TStartEnd

export type TInline = `${INLINE}`
export type TInlineStartEnd = TInline | TStartEnd

export type TDirectionBoth = TBlock | TInline

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


