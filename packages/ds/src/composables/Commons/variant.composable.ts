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
 *
 * Le parametre props n'est plus type via l'ancien `IVariantProps` (mixin
 * unique acceptant a tort `TVariant | TVariantInput` partout — scinde en
 * `IActionVariantProps` / `IInputVariantProps`, cf. #1050). Un type
 * structurel `{ variant?: string }` suffit ici : la fonction ne fait que
 * lire `props.variant` et le stringifier, elle n'a jamais eu besoin de
 * connaitre la liste de valeurs d'une famille precise — et les deux
 * interfaces scindees (comme toute autre) lui restent assignables.
 ********************************************************/
export function useVariant (props: { variant?: string } | Ref<string | undefined>, name = getCurrentInstanceName()) {
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
