import { computed } from 'vue'

import { useResizeObserver } from '../Commons/resizeObserver.composable'

/*********************************************************
 * useChartSize
 *
 * @description
 * Dimensions de la surface de dessin d'un chart (#1317) : la boite
 * rendue de l'element portant `resizeRef`, afin que `viewBox` suive le
 * conteneur au lieu d'une constante. Tant que rien n'est mesure (SSR,
 * avant montage, boite nulle) on rend `fallback`, identique entre
 * serveur et premier rendu client — pas de mismatch d'hydratation.
 ********************************************************/
export function useChartSize (fallback: { width: number, height: number }) {
    const { resizeRef, contentRect } = useResizeObserver()

    const width = computed(() => contentRect.value?.width || fallback.width)
    const height = computed(() => contentRect.value?.height || fallback.height)

    return { resizeRef, width, height }
}
