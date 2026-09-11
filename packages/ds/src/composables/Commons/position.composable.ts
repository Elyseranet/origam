import type { IPositionProps } from '../../interfaces'

import { getCurrentInstanceName } from '../../utils'
import { computed } from 'vue'

/*********************************************************
 * usePosition
 ********************************************************/
export function usePosition (props: IPositionProps, name = getCurrentInstanceName()) {
    const positionClasses = computed(() => {
        return props.position ? `${name}--${props.position}` : undefined
    })

    const positionStyles = computed(() => {
        const styles: Array<string> = []
        const layers = ['top', 'bottom', 'left', 'right']

        layers.forEach((layer) => {
            if (props[layer as keyof IPositionProps]) {
                styles.push(`${layer}: ${props[layer as keyof IPositionProps]}`)
            }
        })

        return styles
    })

    return {positionClasses, positionStyles}
}
