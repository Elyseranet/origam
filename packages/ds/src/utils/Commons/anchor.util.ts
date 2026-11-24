import { BLOCK_ARRAY, INLINE_ARRAY } from '../../consts/Commons/anchor.const'

import { AXIS } from '../../enums/Commons/drag.enum'

import type { TAnchor, TBlock, TInline, TParsedAnchor } from '../../types/Commons/anchor.type'

/*********************************************************
 * defaultAlign
 *
 * @description
 * Default alignment of a side when the anchor carries none.
 ********************************************************/
function defaultAlign (side: TBlock | TInline | 'center') {
    if (BLOCK_ARRAY.includes(side as TBlock)) return 'left'
    if (INLINE_ARRAY.includes(side as TInline)) return 'top'

    return 'center'
}

/**
 * Parse anchor.
 *
 * @param anchor …
 */
export function parseAnchor (anchor: TAnchor) {
    const [side, initialAlign] = anchor.split(' ') as [TBlock | TInline | 'center', TBlock | TInline | 'center' | undefined]

    const align = initialAlign || defaultAlign(side)

    return {side, align} as TParsedAnchor
}

/**
 * Flip side.
 *
 * @param anchor …
 */
export function flipSide (anchor: TParsedAnchor) {
    return {
        side: {
            center: 'center',
            top: 'bottom',
            bottom: 'top',
            left: 'right',
            right: 'left'
        }[anchor.side],
        align: anchor.align
    } as TParsedAnchor
}

/**
 * Flip align.
 *
 * @param anchor …
 */
export function flipAlign (anchor: TParsedAnchor) {
    return {
        side: anchor.side,
        align: {
            center: 'center',
            top: 'bottom',
            bottom: 'top',
            left: 'right',
            right: 'left'
        }[anchor.align]
    } as TParsedAnchor
}

/**
 * Flip corner.
 *
 * @param anchor …
 */
export function flipCorner (anchor: TParsedAnchor) {
    return {
        side: anchor.align,
        align: anchor.side
    } as TParsedAnchor
}

/**
 * Get axis.
 *
 * @param anchor …
 */
export function getAxis (anchor: TParsedAnchor) {
    return BLOCK_ARRAY.includes(anchor.side as TBlock) ? AXIS.Y : AXIS.X
}
