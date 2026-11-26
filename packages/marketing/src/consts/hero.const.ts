import type { IHeroVisual } from '~/interfaces/hero.interface'

/** Paysage aquarelle du kit A1 (la section hero est rendue en clair dans les deux modes), servi en trois largeurs AVIF. */
export const HERO_WATERCOLOR: IHeroVisual = {
    src: '/brand/hero-watercolor-1672.avif',
    srcset: '/brand/hero-watercolor-836.avif 836w, /brand/hero-watercolor-1254.avif 1254w, /brand/hero-watercolor-1672.avif 1672w'
}

export const HERO_WATERCOLOR_SIZES = '100vw'

export const HERO_SYMBOL_SIZES = '34rem'

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

/** Fond sous le bouton GitHub : sans lui, son texte passe sur la montagne sombre en mobile. */
export const HERO_CTA_OUTLINE_BG = 'color-mix(in srgb, var(--origam-color__surface---default) 80%, transparent)'

/**
 * CTA du hero : 52 px (cran `x-large`), texte 16 px / 600 sans interlettrage,
 * 32 px de padding horizontal — cibles de la maquette (#1554, T3), échelle ×1,8.
 */
export const HERO_BTN = {
    size: 'x-large',
    fontSize: 'lg',
    fontWeight: 'semibold',
    letterSpacing: 'normal',
    paddingInline: '32px'
} as const
