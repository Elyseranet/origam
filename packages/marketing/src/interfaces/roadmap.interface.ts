export interface IRoadmapStatusItem {
    labelKey: string
    done: boolean
}

export interface IRoadmapWaveItem {
    nameKey: string
    noteKey?: string
    done: boolean
}

export interface IRoadmapWave {
    titleKey: string
    items: IRoadmapWaveItem[]
}

export interface IRoadmapPhaseItem {
    titleKey: string
    descriptionKey: string
    icon: string
    effortKey?: string
}

export interface IRoadmapPhase {
    id: string
    eyebrowKey: string
    titleKey: string
    intent: 'primary' | 'secondary' | 'warning' | 'info' | 'success'
    icon: string
    defaultOpen?: boolean
    items: IRoadmapPhaseItem[]
}

/**
 * One clickable component of the shipped-catalogue section.
 *
 * The route is resolved ONCE here, in the page's `computed`, rather than in
 * the template: `localePath()` is what keeps `/fr/roadmap` → `/fr/components/…`
 * instead of dropping the visitor on the English page (the i18n strategy is
 * `prefix_except_default`, so a bare `/components/btn` resolves to EN).
 */
export interface IRoadmapCatalogueLink {
    slug: string
    name: string
    to: string
}

/**
 * One category block of the shipped-catalogue section.
 *
 * `count` and `dataCy` are resolved in the page's `computed` for the same
 * reason the route is: the template must stay free of expressions.
 */
export interface IRoadmapCatalogueGroup {
    key: string
    label: string
    count: number
    dataCy: string
    links: IRoadmapCatalogueLink[]
}

export interface IRoadmapStat {
    value: string
    labelKey: string
    icon: string
}
