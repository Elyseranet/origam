import type { IBox } from '../../interfaces/Commons/box.interface'

import type { TParsedAnchor } from '../../types/Commons/anchor.type'
import type { TElementPoint, TOffset, TPoint, TViewportPoint } from '../../types/Commons/point.type'

/**
 * Element to viewport.
 *
 * @param point  …
 * @param offset …
 */
export function elementToViewport (point: TElementPoint, offset: TOffset | IBox) {
    return {
        x: point.x + offset.x,
        y: point.y + offset.y
    } as TViewportPoint
}

/** Convert a point in viewport space to local space */
export function viewportToElement (point: TViewportPoint, offset: TOffset | IBox) {
    return {
        x: point.x - offset.x,
        y: point.y - offset.y
    } as TElementPoint
}

/** Get the difference between two points */
export function getOffset<T extends TPoint> (a: T, b: T) {
    return {
        x: a.x - b.x,
        y: a.y - b.y
    } as TOffset
}

/*********************************************************
 * resolveAnchorCoord
 *
 * @description
 * Resolve one anchor coordinate: `start` -> 0, `center` -> size / 2, `end` -> size, anything else is returned as is.
 ********************************************************/
function resolveAnchorCoord (value: unknown, start: string, end: string, size: number): number {
    if (value === start) return 0
    if (value === 'center') return size / 2
    if (value === end) return size

    return value as number
}

/** Convert an anchor object to a point in local space */
export function anchorToPoint (anchor: TParsedAnchor, box: IBox): TViewportPoint {
    const {side, align} = anchor

    if (side === 'top' || side === 'bottom') {
        const x = resolveAnchorCoord(align, 'left', 'right', box.width)
        const y = side === 'top' ? 0 : box.height

        return elementToViewport({x, y} as TElementPoint, box)
    } else if (side === 'left' || side === 'right') {
        const x = side === 'left' ? 0 : box.width
        const y = resolveAnchorCoord(align, 'top', 'bottom', box.height)

        return elementToViewport({x, y} as TElementPoint, box)
    }

    return elementToViewport({
        x: box.width / 2,
        y: box.height / 2
    } as TElementPoint, box)
}

/**
 * In viewport.
 *
 * @param element …
 */
export function inViewport (element: IBox | DOMRect) {
    const isInViewport = element.bottom >= 0
        && element.right >= 0
        && element.top
        <= (window.innerHeight || document.documentElement.clientHeight)
        && element.left <= (window.innerWidth || document.documentElement.clientWidth)

    return isInViewport
}

/**
 * Get center.
 *
 * @param element …
 * @returns …
 */
export function getCenter (element: IBox | DOMRect): TPoint {
    return {
        x: element ? element.width / 2 : 0,
        y: element ? element.height / 2 : 0
    }
}
