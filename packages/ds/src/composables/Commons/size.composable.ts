import { SIZES_ARRAY } from '../../consts/Commons/size.const'
import type { ISizeProps } from '../../interfaces/Commons/size.interface'

import type { TSize } from '../../types/Commons/size.type'

import { convertToUnit } from '../../utils/Commons/commons.util'
import { getCurrentInstanceName } from '../../utils/Commons/getCurrentInstance.util'
import { computed, isRef } from 'vue'

/**
 * Mapping from the legacy `SIZES` enum (`x-small | small | default |
 * large | x-large`) onto the modern utility taxonomy
 * (`xs | sm | md | lg | xl`) emitted by the Phase 1 manifest.
 *
 * NOTE — `useSize` historically drives `width` / `height`, NOT
 * `font-size`. The Phase 1 utility classes drive `font-size`. The
 * companion class is therefore **only useful for components whose
 * `size` prop also implies a typographic scale** (e.g. Btn, Chip).
 * Components that interpret `size` purely as a box dimension should
 * NOT consume `sizeClasses` from this composable in their
 * `:class` binding — the inline `width`/`height` styles from
 * `sizeStyles` remain authoritative.
 */
const LEGACY_SIZE_TO_UTILITY: Readonly<Record<string, string>> = {
    'x-small': 'xs',
    'small': 'sm',
    'default': 'md',
    'large': 'lg',
    'x-large': 'xl'
}

/*********************************************************
 * useSize
 *
 * @description
 * Pour une valeur d'enum connue (`SIZES_ARRAY`), emet une classe
 * `{name}--size-{valeur}` PLUS, via `LEGACY_SIZE_TO_UTILITY`, la classe
 * utilitaire typographique `origam--text-{xs|sm|md|lg|xl}` correspondante.
 * Pour une valeur custom (nombre ou longueur CSS non reconnue de l'enum),
 * `sizeStyles` emet `width`/`height` inline via `convertToUnit` — jamais
 * les deux canaux a la fois pour une meme valeur.
 *
 * @description
 * ⛔ `useSize` pilote historiquement `width`/`height`, PAS `font-size` —
 * la classe `origam--text-*` n'est donc pertinente QUE pour un composant
 * dont `size` implique aussi une echelle typographique (Btn, Chip). Un
 * composant qui traite `size` comme une pure dimension de boite ne doit
 * pas consommer `sizeClasses` dans son `:class` : `sizeStyles` reste seul
 * autoritaire pour la geometrie.
 *
 * @description
 * ⛔ SURFACE ASYMETRIQUE — `sizeClasses` deballe un `Ref` (`isRef(props)
 * ? props.value : props.size`), `sizeStyles` lit `props.size` directement.
 * La signature ne type que `ISizeProps`, donc passer un `Ref` est
 * hors-contrat ; mais le premier canal l'accepte a moitie et le second
 * l'ignore. Mesure : `useSize(ref(24))` rend `{classes: [], styles: []}`
 * — inerte des deux cotes — quand `useSize({size: 24})` rend bien
 * `["width: 24px", "height: 24px"]`. Passer l'objet de props.
 *
 * @description
 * ⚠️ Aucune validation de la valeur custom : `size="zzz"` ne figure pas
 * dans `SIZES_ARRAY`, prend donc la branche inline et emet
 * `width: zzz` / `height: zzz` — deux declarations invalides, sans
 * avertissement. Meme absence de liste blanche que `useVariant`.
 ********************************************************/
export function useSize (props: ISizeProps, name = getCurrentInstanceName()) {
    const sizeClasses = computed(() => {
        const size = isRef(props) ? props.value : props.size
        const classes: string[] = []

        if (size && SIZES_ARRAY.includes(size as TSize)) {
            classes.push(`${name}--size-${size}`)

            // Classes-first companion: bridge the legacy enum onto the
            // typographic utility for components that opt in.
            const utilityRung = LEGACY_SIZE_TO_UTILITY[size as string]
            if (utilityRung) {
                classes.push(`origam--text-${utilityRung}`)
            }
        }

        return classes
    })

    const sizeStyles = computed(() => {
        const styles = []

        if (props.size && !SIZES_ARRAY.includes(props.size as TSize)) {
            // Note: previous version emitted `width': …` (stray apostrophe)
            // which Vue silently dropped — leading to 0×0 components when a
            // numeric/custom size was passed.
            styles.push(`width: ${convertToUnit(props.size)}`)
            styles.push(`height: ${convertToUnit(props.size)}`)
        }

        return styles
    })

    return {sizeStyles, sizeClasses}
}
