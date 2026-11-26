import type { IHeroVisual } from '~/interfaces/hero.interface'

/** Paysage aquarelle du kit A1 (clair uniquement), servi en trois largeurs AVIF. */
export const HERO_WATERCOLOR: IHeroVisual = {
    src: '/brand/hero-watercolor-1672.avif',
    srcset: '/brand/hero-watercolor-836.avif 836w, /brand/hero-watercolor-1254.avif 1254w, /brand/hero-watercolor-1672.avif 1672w'
}

export const HERO_WATERCOLOR_SIZES = '100vw'

/**
 * Point d'insertion de la version nuit de l'aquarelle (fournie plus tard par
 * le propriétaire) : remplacer cette entrée par un `src` + `srcset` du même
 * format que HERO_WATERCOLOR. En attendant, le symbole A1 seul sur fond encre.
 */
export const HERO_NIGHT: IHeroVisual = {
    src: '/brand/hero-symbol-dark.avif',
    srcset: '/brand/hero-symbol-dark.avif 403w'
}

export const HERO_SYMBOL_SIZES = '403px'

/** Symbole A1 en clair, posé au-dessus du paysage comme dans la maquette. */
export const HERO_SYMBOL_DAY: IHeroVisual = {
    src: '/brand/hero-symbol-light.avif',
    srcset: '/brand/hero-symbol-light.avif 403w'
}

/**
 * CTA « soleil » : la rampe `--origam-color__sun---*` arrive avec #1514 et
 * n'a pas encore de repli. Le texte reste encre dans les deux modes (le soleil
 * est clair partout), d'où une primitive qui ne s'inverse pas.
 */
export const HERO_CTA_BG = 'var(--origam-color__sun---500)'
export const HERO_CTA_FG = 'var(--origam-color__neutral---950)'

/** Invite de shell décorative devant `npm i origam` : jamais copiée (prop `prompt` d'OrigamCode). */
export const HERO_INSTALL_PROMPT = '$'
