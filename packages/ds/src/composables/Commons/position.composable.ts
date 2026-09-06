import type { IPositionProps } from '../../interfaces/Commons/position.interface'

import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'
import { computed } from 'vue'

/*********************************************************
 * usePosition
 *
 * @description
 * `positionClasses` traduit `props.position` (`'absolute'|'fixed'|'relative'|'sticky'|'static'`)
 * en classe `{name}--{position}`. `positionStyles` emet une declaration
 * inline par cote present parmi `top`/`bottom`/`left`/`right`.
 *
 * @description
 * ⛔ Contrairement a `useDimension`, AUCUNE conversion via `convertToUnit`
 * n'est appliquee sur `top`/`bottom`/`left`/`right` : bien que
 * `IPositionProps` les type `number | string`, un nombre est interpole
 * TEL QUEL (`"top: 8"`, pas `"top: 8px"`) — declaration CSS invalide.
 * Passer une chaine unitee (`"8px"`) est le seul usage sur qui marche
 * aujourd'hui.
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
