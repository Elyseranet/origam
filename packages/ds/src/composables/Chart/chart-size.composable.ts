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
 *
 * @description
 * `square: true` (#1324) est le mode des charts radiaux : la surface
 * est un carre dont le cote est `min(largeur, hauteur)` de la boite
 * mesuree. La largeur suit le conteneur, la hauteur lui est egale, et
 * une hauteur imposee (prop `height`) plafonne le cote — le cercle
 * n'est jamais ecrase.
 ********************************************************/
export function useChartSize (fallback: { width: number, height: number }, options: { square?: boolean } = {}) {
    const { resizeRef, contentRect } = useResizeObserver<SVGSVGElement>()

    const measuredWidth = computed(() => contentRect.value?.width || fallback.width)
    const measuredHeight = computed(() => contentRect.value?.height || fallback.height)
    const side = computed(() => Math.min(measuredWidth.value, measuredHeight.value))

    const width = computed(() => options.square ? side.value : measuredWidth.value)
    const height = computed(() => options.square ? side.value : measuredHeight.value)

    return { resizeRef, width, height }
}
