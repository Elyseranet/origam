import type { TReferenceKind } from '../types/api-reference.type'

/** Un lien vers une fiche du catalogue. */
export interface ICatalogNeighbourLink {
    slug: string
    name: string
}

/** Les entrées d'UNE autre famille qui touchent la fiche lue. */
export interface ICatalogRelatedGroup {
    kind: TReferenceKind
    entries: ICatalogNeighbourLink[]
}

/**
 * Réponse de `GET /api/reference/neighbours/:kind/:slug`.
 *
 * `prev` / `next` suivent l'ordre de l'INDEX de la famille ; `related` ne
 * contient que des relations STOCKÉES (jamais déduites du nom).
 */
export interface ICatalogNeighbours {
    prev: ICatalogNeighbourLink | null
    next: ICatalogNeighbourLink | null
    related: ICatalogRelatedGroup[]
}

/** Ligne de `doc_entry` telle que l'ordonnancement du catalogue la lit. */
export interface ICatalogSequenceRow {
    slug: string
    name: string
    category: string | null
    domain: string | null
    parent_slug: string | null
}

export interface IResolvedTarget {
    kind: string
    slug: string
    name: string
}
