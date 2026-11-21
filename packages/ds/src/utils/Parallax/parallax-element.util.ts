import { PARALLAX_EVENT } from '../../enums/Parallax/parallax.enum'

import type { IParallaxElementCicle, IParallaxElementMovement } from '../../interfaces/Parallax/parallax-element.interface'

import type { TPoint } from '../../types/Commons/point.type'

function clampMovement (movement: number, min?: number, max?: number): number {
    if (max && movement > max) return max
    if (min && movement < min) return min
    return movement
}

/**
 * Element movement.
 *
 * @param action …
 */
export function elementMovement (action: IParallaxElementMovement) {
    const {y, x, target, strength = 10, event = null, minX, minY, maxX, maxY} = action

    const {originX = 50} = action
    let {originY = 50} = action

    if (event === PARALLAX_EVENT.SCROLL) {
        originY = -originY / 2
    }

    const movementX = (x - originX / 50) * strength
    const movementY = (y - originY / 50) * strength

    return {
        x: clampMovement(movementX, minX, maxX),
        y: clampMovement(movementY, minY, maxY),
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

    const spanningRangeX = event === PARALLAX_EVENT.SCROLL ? window.innerWidth : shape?.width
    const spanningRangeY = event === PARALLAX_EVENT.SCROLL ? window.innerHeight : shape?.height

    const radialPositionX = ((referencePosition.x - shape?.left) * (Math.PI * 2)) / spanningRangeX
    const radialPositionY = ((referencePosition.y - shape?.top) * (Math.PI * 2)) / spanningRangeY

    const cycleX = spanningRangeX * Math.sin(radialPositionX * cycles)
    const cycleY = spanningRangeY * Math.sin(radialPositionY * cycles)

    return {
        x: (cycleX * strength) / (spanningRangeX / 2),
        y: (cycleY * strength) / (spanningRangeY / 2)
    }
}
