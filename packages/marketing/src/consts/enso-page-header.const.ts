import { ENSO_PAGE_HEADER_FAMILY, ENSO_PAGE_HEADER_PLANE } from '~/enums/enso-page-header.enum'
import { ENSO_CTA_FOREGROUND, ENSO_CTA_RIDGE, ENSO_HERO_LANDSCAPE, ENSO_PAGE_FOREGROUND, ENSO_PAGE_TEMPLE } from '~/consts/enso.const'
import type { IEnsoPageHeaderPlane } from '~/interfaces/enso.interface'

/**
 * Décor de l'en-tête « Vallée » (#1584) : deux plans du kit par famille, le Fuji
 * n'y figure jamais (il reste au hero et au CTA). `forest-hills-wide` est
 * `ENSO_HERO_LANDSCAPE`, `forest-ridge` `ENSO_CTA_RIDGE`, `foreground-1`
 * `ENSO_CTA_FOREGROUND` (mêmes fichiers, vérifiés à l'écart de pixels).
 *
 * Parallaxe au défilement (`OrigamParallax origin="page-top"`, chemin JS) :
 * le plan lointain retarde plus que le proche. Amplitudes faibles, mesurées
 * dans la PR (scrollY 0 -> 300).
 */
export const ENSO_PAGE_HEADER_SPEED_BACK = 0.1
export const ENSO_PAGE_HEADER_SPEED_FRONT = 0.04

const BACK = ENSO_PAGE_HEADER_PLANE.BACK
const FRONT = ENSO_PAGE_HEADER_PLANE.FRONT

export const ENSO_PAGE_HEADER_PLANES: Record<ENSO_PAGE_HEADER_FAMILY, readonly IEnsoPageHeaderPlane[]> = {
    [ENSO_PAGE_HEADER_FAMILY.CATALOG]: [
        { key: BACK, art: ENSO_CTA_RIDGE, displayWidth: 700, speed: ENSO_PAGE_HEADER_SPEED_BACK },
        { key: FRONT, art: ENSO_HERO_LANDSCAPE, displayWidth: 700, speed: ENSO_PAGE_HEADER_SPEED_FRONT }
    ],
    [ENSO_PAGE_HEADER_FAMILY.EDITORIAL]: [
        { key: BACK, art: ENSO_PAGE_FOREGROUND, displayWidth: 700, speed: ENSO_PAGE_HEADER_SPEED_BACK },
        { key: FRONT, art: ENSO_CTA_FOREGROUND, displayWidth: 700, speed: ENSO_PAGE_HEADER_SPEED_FRONT }
    ],
    [ENSO_PAGE_HEADER_FAMILY.LEGAL]: [
        { key: BACK, art: ENSO_HERO_LANDSCAPE, displayWidth: 700, speed: ENSO_PAGE_HEADER_SPEED_BACK }
    ],
    [ENSO_PAGE_HEADER_FAMILY.TOOL]: [
        { key: BACK, art: ENSO_PAGE_TEMPLE, displayWidth: 240, speed: ENSO_PAGE_HEADER_SPEED_BACK },
        { key: FRONT, art: ENSO_HERO_LANDSCAPE, displayWidth: 700, speed: ENSO_PAGE_HEADER_SPEED_FRONT }
    ]
}
