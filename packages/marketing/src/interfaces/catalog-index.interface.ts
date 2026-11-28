/** Une puce d'ancrage vers un groupe du catalogue. */
export interface ICatalogIndexAnchor {
    id: string
    label: string
}

export interface ICatalogIndexLayoutProps {
    /** Titre du `h1` (déjà traduit). */
    title: string
    /** Introduction sous le titre (déjà traduite). */
    intro: string
    /** Libellé de la page courante dans le fil d'Ariane. */
    current: string
    /** `id` du `h1`. */
    titleId: string
    /** Préfixe des `data-cy` de la page (`components`, `consts`…). */
    dataCy: string
}

export interface ICatalogIndexLayoutSlots {
    /** Outils (recherche, ancres) et état vide. */
    default?: () => unknown
    /** Les groupes de cartes. */
    groups?: () => unknown
}

export interface ICatalogIndexToolsProps {
    modelValue: string
    placeholder: string
    label: string
    /** Ligne de compte, déjà composée par la page. */
    count: string
    /** Libellé de la navigation par ancres. */
    jumpLabel: string
    anchors: ICatalogIndexAnchor[]
    dataCy: string
}

export interface ICatalogIndexToolsEmits {
    (e: 'update:modelValue', value: string): void
}

export interface ICatalogIndexToolsSlots {}

export interface ICatalogGroupProps {
    /** Sans titre, le groupe ne rend que sa grille (page sans catégories). */
    title?: string
    id?: string
    count?: number
}

export interface ICatalogGroupSlots {
    default?: () => unknown
}

export interface ICatalogCardProps {
    to: string
    name: string
    description: string
    dataCy: string
}

export interface ICatalogCardSlots {
    meta?: () => unknown
}

export interface ICatalogIndexEmptyProps {
    title: string
    description: string
    dataCy: string
}
