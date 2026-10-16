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

/** Une entrée de l'encart « même sujet », prête à rendre (#1172). */
export interface ICatalogRelatedEntryView extends ICatalogNeighbourLink {
    href: string
    /** Faux pour une entrée repliée : elle reste dans le DOM, masquée. */
    isShown: boolean
}

/** Une ligne de l'encart « même sujet » : une famille, ses entrées, son repli (#1172). */
export interface ICatalogRelatedGroupView {
    kind: TReferenceKind
    label: string
    /** Id du titre `h3` de la ligne, qui nomme la liste de ses entrées. */
    labelId: string
    /** Id de la liste des entrées, que le bouton de repli contrôle. */
    listId: string
    count: string
    entries: ICatalogRelatedEntryView[]
    /** Vrai au-delà de `CATALOG_RELATED_LIMIT` entrées : la ligne porte un bouton de repli. */
    isCollapsible: boolean
    isOpen: boolean
    toggleLabel: string
    toggleIcon: string
}
