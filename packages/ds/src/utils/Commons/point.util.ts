import type { IBox } from '../../interfaces'

import type { TElementPoint, TOffset, TParsedAnchor, TPoint, TViewportPoint } from '../../types'

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

/** Convert an anchor object to a point in local space */
export function anchorToPoint (anchor: TParsedAnchor, box: IBox): TViewportPoint {
    if (anchor.side === 'top' || anchor.side === 'bottom') {
        const {side, align} = anchor

        const x: number =
            align === 'left' ? 0
                : align === 'center' ? box.width / 2
                    : align === 'right' ? box.width
                        : align
        const y: number =
            side === 'top' ? 0
                : side === 'bottom' ? box.height
                    : side

        return elementToViewport({x, y} as TElementPoint, box)
    } else if (anchor.side === 'left' || anchor.side === 'right') {
        const {side, align} = anchor

        const x: number =
            side === 'left' ? 0
                : side === 'right' ? box.width
                    : side
        const y: number =
            align === 'top' ? 0
                : align === 'center' ? box.height / 2
                    : align === 'bottom' ? box.height
                        : align

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
