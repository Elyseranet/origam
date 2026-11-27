import type { IEnsoArt, IEnsoSharedArt } from '~/interfaces/enso.interface'
import type { TEnsoArtVars } from '~/types/enso.type'

export interface IHeroVisual {
    src: string
    srcset: string
}

export interface IHeroPlane {
    key: string
    art: IEnsoArt | IEnsoSharedArt
    /** Largeur d'affichage approximative (px CSS), qui choisit le fichier 1x / 2x. */
    displayWidth: number
    /** Défilement : `speed` du plan OrigamParallaxLayer (ratio de la hauteur du hero). */
    speed: number
    /** Amplitude du pointeur (px au bord du hero), axe x. */
    mouseX: number
    /** Amplitude du pointeur (px au bord du hero), axe y. */
    mouseY: number
    /** Retiré sous 860 px : sinon le plan passe sous le titre. */
    wideOnly?: boolean
}

export interface IHeroPlaneView {
    key: string
    cy: string
    classes: string[]
    style: TEnsoArtVars
    speed: number
    mouseX: number
    mouseY: number
}
