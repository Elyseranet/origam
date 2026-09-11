import { AXIS, PARALLAX_ELEMENT_TYPE } from '../../enums'

import type { IParallaxElementProps } from '../../interfaces'

import { computed } from 'vue'

/*********************************************************
 * useParallaxTransform
 ********************************************************/
export function useParallaxTransform (props: IParallaxElementProps) {
    const strength = computed(() => {
        const str = props.strength ?? 10

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

    const translateMovement = (x: number, y: number) => {
        const movementX = (strength.value * x) / 10 + 1
        const movementY = (strength.value * y) / 10 + 1

        return `translate3d(${-movementX}px, ${-movementY}px, 0)`
    }
    const rotateMovement = (x: number, y: number) => {
        let movement = 0

        if (!props.axis) {
            movement = (strength.value * (x + y)) / 10 + 1
        } else if (props.axis === AXIS.X) {
            movement = (strength.value * x) / 10 + 1
        } else if (props.axis === AXIS.Y) {
            movement = (strength.value * y) / 10 + 1
        }

        return `rotate3d(0,0,1,${movement}deg)`
    }
    const depthMovement = (x: number, y: number) => {
        return `rotateX(${-y}deg) rotateY(${x}deg) translate3d(0,0,${strength.value * 2}px)`
    }
    const scaleMovement = (x: number, y: number) => {
        const movement = (strength.value * (Math.abs(x) + Math.abs(y))) / 10 + 1

        return `scale3d(${props.type === PARALLAX_ELEMENT_TYPE.SCALE_X || props.type === PARALLAX_ELEMENT_TYPE.SCALE ? movement : 1},
            ${props.type === PARALLAX_ELEMENT_TYPE.SCALE_Y || props.type === PARALLAX_ELEMENT_TYPE.SCALE ? movement : 1},
            1)`
    }

    return {transformStyles, strength}
}
