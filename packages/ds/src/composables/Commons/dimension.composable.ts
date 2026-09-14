import { computed } from 'vue'
import { DIMENSIONS_ARRAY } from '../../consts/Commons/dimension.const'

import type { IDimensionProps } from '../../interfaces/Commons/dimension.interface'

import { convertToUnit, toKebabCase } from '../../utils/Commons/commons.util'

/*********************************************************
 * useDimension
 *
 * @description
 * Traduit les six props de `IDimensionProps` (`height`, `maxHeight`,
 * `maxWidth`, `minHeight`, `minWidth`, `width`) en declarations CSS inline
 * (`dimensionStyles`, un tableau de chaines `"propriete: valeur"`) via
 * `convertToUnit` — qui accepte un nombre (`→ "Npx"`), une longueur CSS
 * deja unite, une reference a une custom property, ou un raccourci
 * `aspect-ratio`.
 *
 * @description
 * Contrairement aux composables de couleur/rounded/elevation, il n'y a pas
 * de canal "tokenise → classe" ici : toute dimension produit du style
 * inline, jamais de classe utilitaire — c'est le composable de reference a
 * `extends`-er (cf. CLAUDE.md racine) plutot que de parser `height`/`width`
 * a la main dans un nouveau composant.
 ********************************************************/
export function useDimension (props: IDimensionProps) {
    const dimensionStyles = computed(() => {
        const dimensions: Array<string> = []

        DIMENSIONS_ARRAY.forEach((dimension) => {
            if (props[dimension]) {
                dimensions.push(`${toKebabCase(dimension)}: ${convertToUnit(props[dimension])}`)
            }
        })

        return dimensions
    })

    return {dimensionStyles}
}
