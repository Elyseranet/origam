export interface INavLink {
    i18nKey: string
    i18nFallback: string
    href: string
    external?: boolean
}

export interface INavSection {
    titleKey: string
    titleFallback: string
    items: INavLink[]
}

/** Réseau du pied de page : `icon` est un nom MDI ou un chemin SVG 24 × 24 ; sans `showLabel`, le libellé n'est que l'aria-label. */
export interface IFooterSocial {
    key: string
    labelKey: string
    labelFallback: string
    href: string
    icon: string
    showLabel?: boolean
}
