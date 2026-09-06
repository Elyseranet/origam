import type { IVariantProps } from '../../interfaces/Commons/variant.interface'
import type { TVariant, TVariantInput } from '../../types/Commons/variant.type'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'

import { computed, isRef, Ref } from 'vue'

/*********************************************************
 * useVariant
 *
 * @description
 * Traduit `props.variant` (ou un `Ref` passe directement) en une seule
 * classe `{name}--variant-{valeur}`. Accepte n'importe quelle chaine —
 * contrairement a `useDensity`/`useSize`, il n'y a pas de liste blanche
 * (`*_ARRAY`) a matcher : toute valeur non-nulle produit une classe, y
 * compris une variante que le composant ne connait pas.
 ********************************************************/
export function useVariant (props: IVariantProps | Ref<TVariant | TVariantInput | string | undefined>, name = getCurrentInstanceName()) {
    const variantClasses = computed(() => {
        const variant = isRef(props) ? props.value : props.variant
        const classes: Array<string> = []

        if (variant == null) return classes

        if (variant) {
            classes.push(`${name}--variant-${variant}`)
        }

        return classes
    })

    return { variantClasses }
}
