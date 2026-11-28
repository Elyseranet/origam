import type { IEnsoArt } from '~/interfaces/enso.interface'
import type { TEnsoArtVars } from '~/types/enso.type'

export interface ICtaPlane {
    key: string
    art: IEnsoArt
    /** Largeur d'affichage approximative (px CSS), qui choisit le fichier 1x / 2x. */
    displayWidth: number
    /** Vitesse de la couche `OrigamParallaxLayer` (négative : le plan descend quand la section entre). */
    speed: number
}

export interface ICtaPlaneView {
    key: string
    speed: number
    classes: string[]
    style: TEnsoArtVars
}


/** Bouton de la bande finale : le premier est l'action principale (soleil), les suivants sont au contour. */
export interface ICtaAction {
    key: string
    labelKey: string
    labelFallback: string
    href: string
    /** `true` : route de l'app, préfixée par la locale. `false` : lien brut (site statique, GitHub). */
    localized: boolean
    /** Ouvre un autre site : `target="_blank"` et `rel="noopener noreferrer"`. */
    external?: boolean
    dataCy: string
}

/** Fond de la section qui précède la bande : le ciel en part, sans couture. */
export type TCtaSurface = 'sunken' | 'overlay'

/** Tout est facultatif : sans prop, la bande est celle de la home. */
export interface ICtaProps {
    title?: string
    description?: string
    actionsLabel?: string
    surface?: TCtaSurface
    /** `id` du h2, cible de `aria-labelledby` ; par défaut `cta-title` (home). */
    titleId?: string
    actions?: readonly ICtaAction[]
}
