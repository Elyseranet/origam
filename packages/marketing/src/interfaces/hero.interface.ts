import type { IEnsoArt } from '~/interfaces/enso.interface'
import type { TEnsoArtVars } from '~/types/enso.type'

export interface IHeroVisual {
    src: string
    srcset: string
}

export interface IHeroPlane {
    key: string
    art: IEnsoArt
    /** Largeur d'affichage approximative (px CSS), qui choisit le fichier 1x / 2x. */
    displayWidth: number
    shift: number
    desktopOnly?: boolean
    darkOnly?: boolean
    lightOnly?: boolean
}

export interface IHeroPlaneView {
    key: string
    cy: string
    classes: string[]
    style: TEnsoArtVars
}
