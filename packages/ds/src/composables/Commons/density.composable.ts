import { computed, isRef, Ref } from 'vue'
import { PREDEFINED_DENSITY } from '../../consts/Commons/density.const'

import type { IDensityProps } from '../../interfaces/Commons/density.interface'

import type { TDensity } from '../../types/Commons/density.type'

import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

/*********************************************************
 * useDensity
 *
 * @description
 * Traduit `props.density` (ou un `Ref` de densite passe directement) en une
 * classe utilitaire `{name}--density-{valeur}` — `name` par defaut le nom
 * kebab-case du composant courant, surchargeable pour un enfant qui
 * emprunte le canal densite d'un parent.
 *
 * @description
 * N'emet une classe QUE si la valeur figure dans `PREDEFINED_DENSITY`. Une
 * valeur `null`/`undefined` ne produit aucune classe (densite par defaut du
 * composant), et une valeur hors catalogue est silencieusement ignoree —
 * ce composable ne genere pas de style custom, contrairement a
 * `useDimension` ou `useMargin` qui basculent en style inline pour une
 * valeur non tokenisee.
 ********************************************************/
export function useDensity (props: IDensityProps | Ref<number | string | undefined>, name = getCurrentInstanceName()) {
    const densityClasses = computed(() => {
        const density = isRef(props) ? props.value : props.density
        const classes: Array<string> = []

        if (density == null) return classes

        if (density && PREDEFINED_DENSITY.includes(density as TDensity)) {
            classes.push(`${name}--density-${density}`)
        }

        return classes
    })

    return {densityClasses}
}
