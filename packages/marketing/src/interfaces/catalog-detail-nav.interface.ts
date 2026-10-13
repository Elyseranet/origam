/**
 * Props des blocs de navigation des fiches de détail du catalogue (#1032).
 */

import type { TReferenceKind } from '../types/api-reference.type'
import type { ICatalogNeighbourLink } from './catalog-neighbours.interface'

/** Fil d'Ariane d'une fiche : famille (menu) › [parent] › entrée courante. */
export interface ICatalogBreadcrumbProps {
    kind: TReferenceKind
    /** Nom de l'entrée lue. */
    name: string
    /** Composant parent, pour un composant membre de famille. */
    parent?: ICatalogNeighbourLink | null
}

/** Blocs qui lisent `useCatalogNeighbours` : la famille et le slug suffisent. */
export interface ICatalogDetailNavProps {
    kind: TReferenceKind
    slug: string
}

/** Les blocs de navigation n'émettent rien et n'exposent aucun slot. */
export interface ICatalogDetailNavEmits {}

export interface ICatalogDetailNavSlots {}
