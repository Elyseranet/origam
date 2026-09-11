import type { IParallaxElementCicle, IParallaxElementMovement } from '../../interfaces'

import type { TPoint } from '../../types'

/**
 * Element movement.
 *
 * @param action …
 */
export function elementMovement (action: IParallaxElementMovement) {
    const {y, x, target, strength = 10, event = null, minX, minY, maxX, maxY} = action

    const {originX = 50} = action
    let {originY = 50} = action

    if (event === 'scroll') {
        originY = -originY / 2
    }

    let movementX = (x - originX / 50) * strength
    let movementY = (y - originY / 50) * strength

    if (minX || maxX) {
        movementX = maxX && movementX > maxX ? maxX : minX && movementX < minX ? minX : movementX
    }

    if (minY || maxY) {
        movementY = maxY && movementY > maxY ? maxY : minY && movementY < minY ? minY : movementY
    }

    return {
        x: movementX,
        y: movementY,
        target
    }
}

/**
 * Cyclic movement.
 *
 * @param cycleData …
 * @returns …
 */
export function cyclicMovement (cycleData: IParallaxElementCicle): TPoint {
    const {referencePosition, shape, event, cycles, strength} = cycleData

    const spanningRangeX = event === 'scroll' ? window.innerWidth : shape?.width
    const spanningRangeY = event === 'scroll' ? window.innerHeight : shape?.height

    const radialPositionX = ((referencePosition.x - shape?.left) * (Math.PI * 2)) / spanningRangeX
    const radialPositionY = ((referencePosition.y - shape?.top) * (Math.PI * 2)) / spanningRangeY

    const cycleX = spanningRangeX * Math.sin(radialPositionX * cycles)
    const cycleY = spanningRangeY * Math.sin(radialPositionY * cycles)

    return {
        x: (cycleX * strength) / (spanningRangeX / 2),
        y: (cycleY * strength) / (spanningRangeY / 2)
    }
}
