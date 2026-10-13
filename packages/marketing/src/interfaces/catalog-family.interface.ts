import type { TReferenceKind } from '../types/api-reference.type'

/** Une famille du catalogue. */
export interface ICatalogFamily {
    /** Famille du catalogue, telle que l'API la nomme. */
    kind: TReferenceKind
    /** Route de l'index de la famille, sans préfixe de locale. */
    route: string
    /** Nom complet de la famille. */
    labelKey: string
    labelFallback: string
}
