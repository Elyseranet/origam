import { ENSO_DEMO_MODES, ENSO_GALLERY, ENSO_PETAL_FLIGHTS, ENSO_PETAL_WIDTH } from '~/consts/enso.const'
import type { IEnsoArt, IEnsoDemoColumn, IEnsoPetalView, IEnsoSrcsetCandidate } from '~/interfaces/enso.interface'
import { HERO_PLANES } from '~/consts/hero.const'
import type { IHeroPlaneView, IHeroVisual } from '~/interfaces/hero.interface'
import type { TEnsoArtVars } from '~/types/enso.type'

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

/** Plans du hero prêts à poser en `style` ; sans variante sombre, `--enso-art-dark: none` laisse le fond encre nu. */
export function heroPlaneViews (): IHeroPlaneView[] {
    return HERO_PLANES.map(plane => ({
        key: plane.key,
        cy: `hero-plane-${plane.key}`,
        classes: ['enso-art', `home-hero__plane--${plane.key}`, ...(plane.desktopOnly ? ['home-hero__plane--desktop-only'] : [])],
        style: {
            ...ensoArtVars(plane.art, plane.displayWidth),
            ...(plane.lightOnly ? { '--enso-art-dark': 'none' } : {}),
            ...(plane.darkOnly ? { '--enso-art-light': 'none' } : {}),
            '--plane-shift': `${plane.shift}px`
        }
    }))
}
