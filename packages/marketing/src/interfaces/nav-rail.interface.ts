/**
 * Interfaces du rail de navigation du catalogue (#1032).
 *
 * ⛔ `INavLink` / `INavSection` (nav.interface.ts) sont RÉUTILISÉS tels quels
 * pour le volet « Pages » : le rail ne redéclare pas un format de lien, il
 * consomme `NAV_SECTIONS` — y compris son drapeau `external`, qui garde
 * Stories et Docs hors de `localePath()` (#760).
 */

import type { INavLink } from './nav.interface'

export type { ICatalogFamily as INavRailFamily } from './catalog-family.interface'

/**
 * Une entrée du catalogue telle que le rail en a besoin.
 *
 * Projection volontairement réduite de ce que rend `/api/reference/:kind` —
 * le rail n'affiche ni description ni icône, donc il ne les garde pas en
 * mémoire. Les champs portent les mêmes noms que la réponse de l'API.
 */
export interface INavRailEntry {
    slug: string
    name: string
    category: string
    /** Renseigné sur les composants membres d'une famille ; absent sinon. */
    parentSlug?: string
}

/** Un groupe de catégorie dans un panneau groupé. */
export interface INavRailGroup {
    /** Valeur brute de `category` — jamais traduite (cf. l'API des catégories). */
    category: string
    entries: INavRailEntry[]
}

/** Un groupe du volet « Pages », titré par une clé i18n. */
export interface INavRailPageGroup {
    titleKey: string
    titleFallback: string
    links: INavLink[]
}
