import { BLOCK_ARRAY, INLINE_ARRAY } from '../../consts'

import { AXIS } from '../../enums'

import type { TAnchor, TBlock, TInline, TParsedAnchor } from '../../types'

/**
 * Parse anchor.
 *
 * @param anchor …
 */
export function parseAnchor (anchor: TAnchor) {
    const [side, initialAlign] = anchor.split(' ') as [TBlock | TInline | 'center', TBlock | TInline | 'center' | undefined]

    const align = !initialAlign
        ? BLOCK_ARRAY.includes(side as TBlock) ? 'left'
            : INLINE_ARRAY.includes(side as TInline) ? 'top'
                : 'center'
        : initialAlign

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
