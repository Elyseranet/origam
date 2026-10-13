import type { TReferenceKind } from '../types/api-reference.type'

/**
 * Une cible de famille du rail.
 *
 * `shortLabel*` est le libellé tenant dans 56 px (« Comp », « use », « I »…) ;
 * le nom complet et le dénombrement partent dans l'`aria-label`, parce qu'un
 * lecteur d'écran n'a aucune raison d'entendre « I » pour « Interfaces ».
 */
export interface ICatalogFamily {
    /** Famille du catalogue, telle que l'API la nomme. */
    kind: TReferenceKind
    /** Route de l'index de la famille, sans préfixe de locale. */
    route: string
    /** Libellé compact affiché dans le rail. */
    shortLabelKey: string
    shortLabelFallback: string
    /** Nom complet de la famille, pour l'`aria-label` et l'entête du panneau. */
    labelKey: string
    labelFallback: string
}
