import type { ILiveKpi, ILiveKpiResolved } from '~/interfaces/kpi.interface'

/**
 * Résout les compteurs d'adoption réels. Un compteur est omis quand sa valeur est
 * indisponible (`null`) ; les stars GitHub le sont aussi à 0 (décision propriétaire,
 * #1210 : un « 0 » affiché nuit à la confiance), les téléchargements npm non.
 */
export function resolveLiveKpis (
    kpis: ILiveKpi[],
    stars: number | null,
    downloads: number | null
): ILiveKpiResolved[] {
    return kpis
        .map(kpi => ({ ...kpi, value: kpi.source === 'stars' ? stars : downloads }))
        .filter((kpi): kpi is ILiveKpiResolved => kpi.value !== null && (kpi.source !== 'stars' || kpi.value > 0))
}
