import type { ENSO_PAGE_HEADER_FAMILY, ENSO_PAGE_HEADER_PLANE } from '~/enums/enso-page-header.enum'
import type { IHeroVisual } from '~/interfaces/hero.interface'
import type { TEnsoArtVars, TEnsoMode } from '~/types/enso.type'

/** Illustration du kit enso livrée en deux variantes, choisies par le mode de la page. */
export interface IEnsoArt {
    width: number
    height: number
    light: IHeroVisual
    dark: IHeroVisual
}

/** Illustration identique dans les deux modes (pinceaux violet, doré, ivoire). */
export interface IEnsoSharedArt extends IHeroVisual {
    width: number
    height: number
}

/** Trajectoire d'un pétale : `art` est la variante peinte, le reste alimente les variables CSS du `@keyframes`. */
export interface IEnsoPetalFlight {
    art: IEnsoArt
    start: string
    drift: string
    duration: string
    delay: string
    scale: number
    spin: string
}

/** Une entrée `url Nw` d'un `srcset`. */
export interface IEnsoSrcsetCandidate {
    url: string
    width: number
}

export interface IEnsoPetalView {
    key: number
    style: TEnsoArtVars
}

export interface IEnsoPaperProps {
    tag?: string
}

export interface IEnsoPaperSlots {
    default?: () => unknown
}

export interface IEnsoSectionTitleProps {
    tag?: string
    id?: string
}

export interface IEnsoSectionTitleSlots {
    default?: () => unknown
}

export interface IEnsoPetalsProps {
    count?: number
}

/** Page de contrôle `/enso` : une illustration du catalogue et le nom de sa constante. */
export interface IEnsoGalleryItem {
    name: string
    art: IEnsoArt | IEnsoSharedArt
}

export interface IEnsoDemoMode {
    mode: TEnsoMode
    headingId: string
    labelKey: string
    labelFallback: string
}

export interface IEnsoGalleryView extends IHeroVisual {
    name: string
    ratio: number
}

export interface IEnsoDemoColumn extends IEnsoDemoMode {
    items: IEnsoGalleryView[]
}

/** Un plan du décor de l'en-tête de page : l'illustration, sa largeur d'affichage et sa vitesse de parallaxe. */
export interface IEnsoPageHeaderPlane {
    key: `${ENSO_PAGE_HEADER_PLANE}`
    art: IEnsoArt
    /** Largeur d'affichage approximative (px CSS), qui choisit le fichier 1x / 2x. */
    displayWidth: number
    /** Vitesse de la couche `OrigamParallaxLayer` (positive : le plan retarde sur le défilement). */
    speed: number
}

export interface IEnsoPageHeaderPlaneView {
    key: string
    speed: number
    classes: string[]
    style: TEnsoArtVars
}

export interface IEnsoPageHeaderProps {
    /** Famille de pages : choisit le décor dans un jeu fermé. */
    family: `${ENSO_PAGE_HEADER_FAMILY}`
    /** `id` du `h1` ; par défaut un identifiant généré (SSR-safe). */
    titleId?: string
}

/** `breadcrumb` : fil d'Ariane ; `eyebrow`, `title`, `intro` : le texte ; `default` : actions sous l'intro. */
export interface IEnsoPageHeaderSlots {
    breadcrumb?: () => unknown
    eyebrow?: () => unknown
    title?: () => unknown
    intro?: () => unknown
    default?: () => unknown
}
