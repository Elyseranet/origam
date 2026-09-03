import {
    PARALLAX_ELEMENT_DEFAULT_STRENGTH,
    PARALLAX_ELEMENT_DEPTH_TRANSLATE_FACTOR,
    PARALLAX_ELEMENT_MOVEMENT_BASE,
    PARALLAX_ELEMENT_MOVEMENT_DIVISOR
} from '../../consts/Parallax/parallax-element.const'

import { AXIS, PARALLAX_ELEMENT_TYPE } from '../../enums'

import type { IParallaxElementProps } from '../../interfaces/Parallax/parallax-element.interface'

import { computed } from 'vue'

/*********************************************************
 * useParallaxTransform
 ********************************************************/
export function useParallaxTransform (props: IParallaxElementProps) {
    const strength = computed(() => {
        const str = props.strength ?? PARALLAX_ELEMENT_DEFAULT_STRENGTH

        return props.type === PARALLAX_ELEMENT_TYPE.DEPTH || props.type === PARALLAX_ELEMENT_TYPE.DEPTH_INV
            ? Math.abs(str)
            : str
    })

    const transformStyles = (x: number, y: number) => {
        let transform

        switch (props.type) {
            case PARALLAX_ELEMENT_TYPE.TRANSLATE:
                transform = translateMovement(x, y)
                break
            case PARALLAX_ELEMENT_TYPE.ROTATE:
                transform = rotateMovement(x, y)
                break
            case PARALLAX_ELEMENT_TYPE.DEPTH:
                transform = depthMovement(x, y)
                break
            case PARALLAX_ELEMENT_TYPE.DEPTH_INV:
                transform = depthMovement(-x, -y)
                break
            case PARALLAX_ELEMENT_TYPE.SCALE:
            case PARALLAX_ELEMENT_TYPE.SCALE_X:
            case PARALLAX_ELEMENT_TYPE.SCALE_Y:
                transform = scaleMovement(x, y)
                break
        }

        return transform
    }

    /**
     * Convert a raw pointer offset into a movement amount (px, deg, or a
     * scale ratio depending on the caller) — the single formula every
     * movement helper below shares.
     */
    const toMovement = (offset: number) => {
        return (strength.value * offset) / PARALLAX_ELEMENT_MOVEMENT_DIVISOR + PARALLAX_ELEMENT_MOVEMENT_BASE
    }

    const translateMovement = (x: number, y: number) => {
        const movementX = toMovement(x)
        const movementY = toMovement(y)

        return `translate3d(${-movementX}px, ${-movementY}px, 0)`
    }
    const rotateMovement = (x: number, y: number) => {
        let movement = 0

        if (!props.axis) {
            movement = toMovement(x + y)
        } else if (props.axis === AXIS.X) {
            movement = toMovement(x)
        } else if (props.axis === AXIS.Y) {
            movement = toMovement(y)
        }

        return `rotate3d(0,0,1,${movement}deg)`
    }
    const depthMovement = (x: number, y: number) => {
        const depth = strength.value * PARALLAX_ELEMENT_DEPTH_TRANSLATE_FACTOR

        return `rotateX(${-y}deg) rotateY(${x}deg) translate3d(0,0,${depth}px)`
    }
    const scaleMovement = (x: number, y: number) => {
        const movement = toMovement(Math.abs(x) + Math.abs(y))

        return `scale3d(${props.type === PARALLAX_ELEMENT_TYPE.SCALE_X || props.type === PARALLAX_ELEMENT_TYPE.SCALE ? movement : 1},
            ${props.type === PARALLAX_ELEMENT_TYPE.SCALE_Y || props.type === PARALLAX_ELEMENT_TYPE.SCALE ? movement : 1},
            1)`
    }

    return {transformStyles, strength}
}
