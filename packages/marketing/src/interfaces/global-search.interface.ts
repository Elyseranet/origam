/** Forme commune des entrées légères de `/api/reference/:kind` que la palette lit. */
export interface IGlobalSearchEntry {
    slug: string
    name: string
    icon?: string
    category?: string
    domain?: string
    descriptionFallback?: string
    /** Membre de famille de composant : sans page propre, exclu de la palette. */
    parentSlug?: string
}

/** Page statique de la palette : libellé et description sont des clés i18n. */
export interface IGlobalSearchStaticPage {
    id: string
    labelKey: string
    labelFallback: string
    descriptionKey: string
    descriptionFallback: string
    icon: string
    /** Termes de recherche, jamais affichés. */
    keywords: string[]
}
