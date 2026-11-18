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
 * `aspectRatio` (#1324, hauteur / largeur) est le mode des charts a
 * geometrie non deformable (radiaux : `1`, jauge, carte) : la surface a
 * ce rapport exact, sa largeur suit le conteneur et une hauteur imposee
 * (prop `height`) la plafonne — le cercle ou la carte n'est jamais
 * ecrase.
 ********************************************************/
export function useChartSize (fallback: { width: number, height: number }, options: { aspectRatio?: number } = {}) {
    const { resizeRef, contentRect } = useResizeObserver<SVGSVGElement>()

    const measuredWidth = computed(() => contentRect.value?.width || fallback.width)
    const measuredHeight = computed(() => contentRect.value?.height || fallback.height)

    const width = computed(() => {
        const ratio = options.aspectRatio
        return ratio ? Math.min(measuredWidth.value, measuredHeight.value / ratio) : measuredWidth.value
    })
    const height = computed(() => options.aspectRatio ? width.value * options.aspectRatio : measuredHeight.value)

    return { resizeRef, width, height }
}
