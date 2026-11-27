import { ENSO_DEMO_MODES, ENSO_GALLERY, ENSO_PAPER_TILE_WIDTH, ENSO_PAPER_WASHI, ENSO_PETAL_FLIGHTS, ENSO_PETAL_WIDTH } from '~/consts/enso.const'
import type { IEnsoArt, IEnsoDemoColumn, IEnsoPetalView, IEnsoSharedArt, IEnsoSrcsetCandidate } from '~/interfaces/enso.interface'
import { CTA_PLANES } from '~/consts/cta.const'
import { HERO_PLANES } from '~/consts/hero.const'
import type { ICtaPlaneView } from '~/interfaces/cta.interface'
import type { IHeroPlaneView, IHeroVisual } from '~/interfaces/hero.interface'
import type { TEnsoArtVars } from '~/types/enso.type'
import { ENSO_PAGE_HEADER_PLANES } from '~/consts/enso-page-header.const'
import type { ENSO_PAGE_HEADER_FAMILY } from '~/enums/enso-page-header.enum'
import type { IEnsoPageHeaderPlaneView } from '~/interfaces/enso.interface'

/** Le plus petit fichier qui couvre `target`, sinon le plus grand, sinon `src` (srcset vide). */
function pickCandidate (candidates: IEnsoSrcsetCandidate[], target: number, fallback: string): string {
    return (candidates.find(c => c.width >= target) ?? candidates.at(-1))?.url ?? fallback
}

/** Entrées `url Nw` d'un `srcset`, triées par largeur croissante ; une entrée mal formée est ignorée. */
function parseSrcset (srcset: string): IEnsoSrcsetCandidate[] {
    return srcset
        .split(',')
        .flatMap((entry) => {
            const [url, descriptor] = entry.trim().split(/\s+/)
            const width = Number.parseInt(descriptor ?? '', 10)

            return url && Number.isFinite(width) ? [{ url, width }] : []
        })
        .sort((a, b) => a.width - b.width)
}

/**
 * `image-set()` d'un fond CSS à partir d'un `srcset` en largeurs : le plus petit
 * fichier qui couvre `displayWidth` en 1x, puis `2 × displayWidth` en 2x.
 */
export function ensoImageSet (source: IHeroVisual, displayWidth: number): string {
    const candidates = parseSrcset(source.srcset)

    return `image-set(url("${pickCandidate(candidates, displayWidth, source.src)}") 1x, url("${pickCandidate(candidates, displayWidth * 2, source.src)}") 2x)`
}

/** Les deux variantes d'une illustration en variables CSS ; la classe globale `.enso-art` choisit selon `data-mode`. */
export function ensoArtVars (art: IEnsoArt | IEnsoSharedArt, displayWidth: number): TEnsoArtVars {
    const { light, dark } = 'light' in art ? art : { light: art, dark: art }

    return {
        '--enso-art-light': ensoImageSet(light, displayWidth),
        '--enso-art-dark': ensoImageSet(dark, displayWidth),
        '--enso-art-ratio': `${art.width} / ${art.height}`
    }
}

/** `url()` d'un masque (même origine, `src` et jamais `srcset` : `image-set()` n'est pas fiable dans `mask-image`). */
export function ensoMaskUrl (mask: IEnsoSharedArt): string {
    return `url("${mask.src}")`
}

/** Texture papier washi : variables d'`ensoArtVars` + taille de la tuile (`--enso-paper---tile`). */
export function ensoPaperVars (): TEnsoArtVars {
    return {
        ...ensoArtVars(ENSO_PAPER_WASHI, ENSO_PAPER_TILE_WIDTH),
        '--enso-paper---tile': `${ENSO_PAPER_TILE_WIDTH}px`
    }
}

/** Colonnes de la page de contrôle : chaque illustration de `ENSO_GALLERY` dans la variante du mode. */
export function ensoDemoColumns (): IEnsoDemoColumn[] {
    return ENSO_DEMO_MODES.map(demo => ({
        ...demo,
        items: ENSO_GALLERY.map(({ name, art }) => {
            const { src, srcset } = 'light' in art ? art[demo.mode] : art

            return { name, ratio: art.width / art.height, src, srcset }
        })
    }))
}

/** Les `count` premières trajectoires (bornées au nombre défini), prêtes à poser en `style`. */
export function ensoPetalViews (count: number): IEnsoPetalView[] {
    const total = Math.min(Math.max(Math.trunc(count), 0), ENSO_PETAL_FLIGHTS.length)

    return ENSO_PETAL_FLIGHTS.slice(0, total).map((flight, index) => ({
        key: index,
        style: {
            ...ensoArtVars(flight.art, ENSO_PETAL_WIDTH),
            '--petal-start': flight.start,
            '--petal-drift': flight.drift,
            '--petal-duration': flight.duration,
            '--petal-delay': flight.delay,
            '--petal-scale': flight.scale,
            '--petal-spin': flight.spin
        }
    }))
}

/** Plans du paysage du CTA, prêts à poser sur une `OrigamParallaxLayer` (`speed`) et son décor (`classes`, `style`). */
export function ctaPlaneViews (): ICtaPlaneView[] {
    return CTA_PLANES.map(plane => ({
        key: plane.key,
        speed: plane.speed,
        classes: ['enso-art', `home-cta__plane--${plane.key}`],
        style: ensoArtVars(plane.art, plane.displayWidth)
    }))
}

/** Plans du décor de l'en-tête de page d'une famille, prêts à poser sur une `OrigamParallaxLayer`. */
export function ensoPageHeaderPlaneViews (family: `${ENSO_PAGE_HEADER_FAMILY}`): IEnsoPageHeaderPlaneView[] {
    return ENSO_PAGE_HEADER_PLANES[family as ENSO_PAGE_HEADER_FAMILY].map(plane => ({
        key: plane.key,
        speed: plane.speed,
        classes: ['enso-art', `enso-page-header__plane--${plane.key}`],
        style: ensoArtVars(plane.art, plane.displayWidth)
    }))
}

/** Plans du hero (#1593) : variables d'art, puis `speed` / `mouseX` / `mouseY` pour OrigamParallaxLayer. */
export function heroPlaneViews (): IHeroPlaneView[] {
    return HERO_PLANES.map(plane => ({
        key: plane.key,
        cy: `hero-plane-${plane.key}`,
        classes: ['enso-art', `home-hero__plane--${plane.key}`, ...(plane.wideOnly ? ['home-hero__plane--wide-only'] : [])],
        style: ensoArtVars(plane.art, plane.displayWidth),
        speed: plane.speed,
        mouseX: plane.mouseX,
        mouseY: plane.mouseY
    }))
}
