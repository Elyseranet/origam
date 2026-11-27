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

