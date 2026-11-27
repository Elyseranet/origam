import { ENSO_DEMO_MODES, ENSO_GALLERY, ENSO_PETAL_ARTS, ENSO_PETAL_FLIGHTS, ENSO_PETAL_WIDTH } from '~/consts/enso.const'
import type { IEnsoArt, IEnsoDemoColumn, IEnsoPetalView } from '~/interfaces/enso.interface'
import type { IHeroVisual } from '~/interfaces/hero.interface'
import type { TEnsoArtVars } from '~/types/enso.type'

function pickCandidate (candidates: { url: string, width: number }[], target: number): string {
    return (candidates.find(c => c.width >= target) ?? candidates[candidates.length - 1]).url
}

/**
 * `image-set()` d'un fond CSS à partir d'un `srcset` en largeurs : le plus petit
 * fichier qui couvre `displayWidth` en 1x, puis `2 × displayWidth` en 2x.
 */
export function ensoImageSet (source: IHeroVisual, displayWidth: number): string {
    const candidates = source.srcset
        .split(',')
        .map((entry) => {
            const [url, descriptor] = entry.trim().split(/\s+/)

            return { url, width: Number.parseInt(descriptor, 10) }
        })
        .sort((a, b) => a.width - b.width)

    return `image-set(url("${pickCandidate(candidates, displayWidth)}") 1x, url("${pickCandidate(candidates, displayWidth * 2)}") 2x)`
}

/** Les deux variantes d'une illustration en variables CSS ; la classe globale `.enso-art` choisit selon `data-mode`. */
export function ensoArtVars (art: IEnsoArt, displayWidth: number): TEnsoArtVars {
    return {
        '--enso-art-light': ensoImageSet(art.light, displayWidth),
        '--enso-art-dark': ensoImageSet(art.dark, displayWidth),
        '--enso-art-ratio': `${art.width} / ${art.height}`
    }
}

/** Colonnes de la page de contrôle : chaque illustration de `ENSO_GALLERY` dans la variante du mode. */
export function ensoDemoColumns (): IEnsoDemoColumn[] {
    return ENSO_DEMO_MODES.map(demo => ({
        ...demo,
        items: ENSO_GALLERY.map(({ name, art }) => ({
            name,
            ratio: art.width / art.height,
            src: art[demo.mode].src,
            srcset: art[demo.mode].srcset
        }))
    }))
}

/** Les `count` premières trajectoires (bornées au nombre défini), prêtes à poser en `style`. */
export function ensoPetalViews (count: number): IEnsoPetalView[] {
    const total = Math.min(Math.max(Math.trunc(count), 0), ENSO_PETAL_FLIGHTS.length)

    return ENSO_PETAL_FLIGHTS.slice(0, total).map((flight, index) => ({
        key: index,
        style: {
            ...ensoArtVars(ENSO_PETAL_ARTS[flight.art], ENSO_PETAL_WIDTH),
            '--petal-start': flight.start,
            '--petal-drift': flight.drift,
            '--petal-duration': flight.duration,
            '--petal-delay': flight.delay,
            '--petal-scale': flight.scale,
            '--petal-spin': flight.spin
        }
    }))
}
