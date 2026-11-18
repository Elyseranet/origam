import { CHART_AXIS_LABEL_CHAR_WIDTH, CHART_AXIS_LABEL_MIN_GAP } from '../../consts/Chart/chart.const'
import type { IChartAxisLabelSlot } from '../../interfaces/Chart/chart-axis.interface'
import type { IChartTick } from '../../interfaces/Chart/chart.interface'

/*********************************************************
 * measureWidestAxisLabel (#1325)
 *
 * @description
 * Largeur réelle (getComputedTextLength) de la plus longue étiquette X
 * sous `root`, ou `null` quand rien n'est mesurable (SSR, jsdom, aucun
 * label, largeur nulle) : l'appelant retombe alors sur l'estimation.
 * Ces fonctions vivent hors du .vue : le paquet publié expose les
 * .vue sans types, et un `ref<…>` ou un lambda typé y devient erreur
 * pour tout consommateur qui les vérifie.
 ********************************************************/
export function measureWidestAxisLabel (root: ParentNode | null): number | null {
    if (!root) return null
    const nodes = Array.from(root.querySelectorAll<SVGTextContentElement>('.origam-chart__axis-label--x'))
    let widest = 0
    for (const node of nodes) {
        const length = typeof node.getComputedTextLength === 'function' ? node.getComputedTextLength() : 0
        if (length > widest) widest = length
    }
    return widest > 0 ? widest : null
}

/*********************************************************
 * decimateAxisTicks (#1325)
 *
 * @description
 * Une étiquette sur N : N = ceil((largeur + écart minimal) / plus petit
 * écart entre graduations). `measured` (px) l'emporte ; sinon la largeur
 * est estimée (caractères × CHART_AXIS_LABEL_CHAR_WIDTH), identique côté
 * serveur et client.
 ********************************************************/
export function decimateAxisTicks (
    ticks: Array<IChartTick>,
    format: (value: number | string) => string,
    measured: number | null
): Array<IChartAxisLabelSlot> {
    let longest = 0
    for (const tick of ticks) longest = Math.max(longest, format(tick.value).length)
    const widest = measured ?? longest * CHART_AXIS_LABEL_CHAR_WIDTH

    let pitch = Infinity
    let previous: number | undefined
    for (const tick of ticks) {
        if (previous !== undefined) pitch = Math.min(pitch, Math.abs(tick.position - previous))
        previous = tick.position
    }
    const step = Number.isFinite(pitch) && pitch > 0 ? Math.max(1, Math.ceil((widest + CHART_AXIS_LABEL_MIN_GAP) / pitch)) : 1

    return ticks.map((tick, i) => ({ tick, i, shown: i % step === 0 }))
}
