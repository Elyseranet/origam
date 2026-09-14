import { useIntersectionObserver } from '../Commons/intersectionObserver.composable'
import { useMargin } from '../Commons/margin.composable'
import { usePadding } from '../Commons/padding.composable'
import { useVModel } from '../Commons/vModel.composable'

import type { IProgressTypeProps } from '../../interfaces/Progress/progress.interface'

import { int } from '../../utils/Commons/commons.util'

import { computed, useSlots } from 'vue'

/*********************************************************
 * useProgress
 ********************************************************/
/*********************************************************
 * useProgress
 *
 * @description
 * Socle partage par `<origam-progress-linear>` et
 * `<origam-progress-circular>` : normalise la valeur, resout l'epaisseur et
 * le maximum, et compose les classes et styles de la racine. Retourne
 * `{ progressClasses, progressStyles, normalizedValue, thickness, max,
 * progress, hasContent }`.
 *
 * @description
 * `normalizedValue` ramene toujours a un POURCENTAGE (`value / max * 100`),
 * quel que soit le `max` du consommateur — les deux implementations
 * raisonnent ensuite sur la meme echelle, l'une en largeur, l'autre en arc.
 *
 * @description
 * ⛔ La classe `--visible` est pilotee par un `IntersectionObserver`, pas par
 * une prop : une barre hors de l'ecran n'anime pas. Consequence a connaitre
 * en test — hors d'un vrai navigateur l'observateur ne se declenche pas, donc
 * la classe reste absente et ce n'est pas un defaut du composant.
 ********************************************************/
export function useProgress (props: IProgressTypeProps) {
    const progress = useVModel(props, 'modelValue')
    const slots = useSlots()
    const {isIntersecting} = useIntersectionObserver()
    const {paddingClasses, paddingStyles} = usePadding(props)
    const {marginClasses, marginStyles} = useMargin(props)

    const thickness = computed(() => {
        return Number(props.thickness)
    })
    const max = computed(() => int(props.max as string))
    const normalizedValue = computed(() => {
        return parseFloat(progress.value as string) / max.value * 100
    })
    const hasContent = computed(() => {
        return slots.default
    })

    const progressClasses = computed(() => {
        return [
            'origam-progress',
            {
                'origam-progress--indeterminate': props.indeterminate,
                'origam-progress--visible': isIntersecting.value,
                'origam-progress--active': props.active,
                'origam-progress--striped': props.striped,
                'origam-progress--absolute': props.absolute
            },
            paddingClasses.value,
            marginClasses.value
        ]
    })

    const progressStyles = computed(() => {
        return [
            paddingStyles.value,
            marginStyles.value
        ]
    })

    return {progressClasses, progressStyles, normalizedValue, thickness, max, progress, hasContent}
}
