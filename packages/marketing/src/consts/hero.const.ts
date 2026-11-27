import { ENSO_CIRCLE_WIDE, ENSO_HERO_ARCHITECTURE, ENSO_HERO_LANDSCAPE, ENSO_HERO_MOUNTAINS, ENSO_HERO_SAKURA, ENSO_HERO_SKY, ENSO_HERO_SUN } from '~/consts/enso.const'
import type { IHeroPlane } from '~/interfaces/hero.interface'

/**
 * Plans de la parallaxe du hero (#1572), du plus lointain au plus proche.
 * `shift` = déplacement vertical (px) atteint après `HERO_PARALLAX_RANGE` de
 * défilement : positif = le plan descend (il paraît défiler plus lentement que
 * la page), négatif = il monte (il paraît plus rapide). `desktopOnly` = masqué
 * sous 48rem (moins de plans en mobile). `darkOnly` = pas de variante claire : le ciel clair porte déjà son soleil, un second le doublerait. `lightOnly` = pas de variante sombre :
 * `hero/dark/01-sky` est un ciel CLAIR dans le kit, le soleil seul tient le fond encre.
 */
export const HERO_PLANES: readonly IHeroPlane[] = [
    { key: 'sky', art: ENSO_HERO_SKY, displayWidth: 1440, shift: 80, lightOnly: true },
    { key: 'enso', art: ENSO_CIRCLE_WIDE, displayWidth: 480, shift: 76, desktopOnly: true },
    { key: 'sun', art: ENSO_HERO_SUN, displayWidth: 240, shift: 64, darkOnly: true },
    { key: 'mountains', art: ENSO_HERO_MOUNTAINS, displayWidth: 900, shift: 40 },
    { key: 'landscape', art: ENSO_HERO_LANDSCAPE, displayWidth: 1440, shift: 20 },
    { key: 'pagoda', art: ENSO_HERO_ARCHITECTURE, displayWidth: 260, shift: 0, desktopOnly: true },
    { key: 'sakura', art: ENSO_HERO_SAKURA, displayWidth: 480, shift: -48 }
]

/** Défilement (px) sur lequel les plans atteignent leur `shift` ; égal à `animation-range` dans HomeHero. */
export const HERO_PARALLAX_RANGE = 480

/** Pétales du hero (8 à 12 voulus ; EnsoPetals n'en garde que 6 sous 40rem). */
export const HERO_PETAL_COUNT = 10

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
