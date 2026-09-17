import type { IPositionProps } from '../../interfaces/Commons/position.interface'

import { convertToUnit } from '../../utils/Commons/commons.util'
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
 * `top`/`bottom`/`left`/`right` passent par `convertToUnit`, comme les six
 * props de `useDimension` : `top={8}` emet `top: 8px`, `top="8px"` reste
 * verbatim. ⚠️ Cette banniere a longtemps annonce l'INVERSE (« AUCUNE
 * conversion n'est appliquee ») — c'etait vrai jusqu'au correctif #557
 * (`b357f7eba`), qui a change le code sans la mettre a jour.
 *
 * @description
 * ⛔ La garde d'emission est une garde de VERACITE (`if (props[layer])`),
 * pas un test de presence : un cote a `0` est donc silencieusement omis.
 * `top={0}` n'emet rien — mesure. Ecrire `top="0px"` pour un cote colle au
 * bord. Meme forme que `useDimension`, meme consequence.
 *
 * @description
 * `positionClasses` renvoie une CHAINE (ou `undefined`), pas un tableau —
 * seul composable de l'axe dimension/espacement/forme dans ce cas ; tous
 * ses voisins (`densityClasses`, `roundedClasses`, …) renvoient un
 * `Array<string>`.
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
                styles.push(`${layer}: ${convertToUnit(props[layer as keyof IPositionProps] as string | number)}`)
            }
        })

        return styles
    })

    return {positionClasses, positionStyles}
}
