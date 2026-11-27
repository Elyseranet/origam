import { ENSO_CIRCLE_OPEN, ENSO_HERO_ARCHITECTURE, ENSO_HERO_LANDSCAPE, ENSO_HERO_MOUNTAINS, ENSO_HERO_SAKURA, ENSO_SUN_DISC } from '~/consts/enso.const'
import type { IHeroPlane } from '~/interfaces/hero.interface'

/**
 * Plans de la parallaxe du hero (#1593, spec v12 § 3), du fond vers l'avant :
 * le soleil est SOUS les montagnes (le Fuji en cache le bas). `mouseX` / `mouseY`
 * = amplitude du pointeur en px au bord du hero ; `speed` = défilement
 * (OrigamParallaxLayer), tel que la maquette l'applique en `scrollY × k`.
 * `wideOnly` = retiré sous 860 px.
 */
export const HERO_PLANES: readonly IHeroPlane[] = [
    { key: 'sun', art: ENSO_SUN_DISC, displayWidth: 270, speed: 0.35, mouseX: 10, mouseY: 8, wideOnly: true },
    { key: 'mountains', art: ENSO_HERO_MOUNTAINS, displayWidth: 1872, speed: 0.28, mouseX: 12, mouseY: 6 },
    { key: 'landscape', art: ENSO_HERO_LANDSCAPE, displayWidth: 1440, speed: 0.16, mouseX: 20, mouseY: 8 },
    { key: 'pagoda', art: ENSO_HERO_ARCHITECTURE, displayWidth: 210, speed: 0.12, mouseX: 26, mouseY: 10 },
    { key: 'sakura', art: ENSO_HERO_SAKURA, displayWidth: 430, speed: 0.05, mouseX: 40, mouseY: 14 },
    { key: 'enso', art: ENSO_CIRCLE_OPEN, displayWidth: 400, speed: 0.2, mouseX: 28, mouseY: 18, wideOnly: true }
]

/**
 * CTA « soleil » : la rampe `--origam-color__sun---*` arrive avec #1514 et
 * n'a pas encore de repli. Le texte reste encre dans les deux modes (le soleil
 * est clair partout), d'où une primitive qui ne s'inverse pas.
 */
export const HERO_CTA_BG = 'var(--origam-color__sun---500)'
export const HERO_CTA_FG = 'var(--origam-color__neutral---950)'

/** Fond sous le bouton GitHub : sans lui, son texte passe sur la montagne sombre en mobile. */
export const HERO_CTA_OUTLINE_BG = 'color-mix(in srgb, var(--origam-color__surface---default) 80%, transparent)'

/**
 * CTA du hero : 52 px (cran `x-large`), texte 15 px / 600 sans interlettrage,
 * 32 px de padding horizontal — cibles de la maquette (#1554, T3), échelle ×1,8.
 */
export const HERO_BTN = {
    size: 'x-large',
    fontWeight: 'semibold',
    letterSpacing: 'normal',
    paddingInline: '32px'
} as const

/** Taille du texte des CTA : 15 px (maquette v12), hors de l'échelle `fontSize` du DS (14 / 16 px) : variable du bouton, en `style`. */
export const HERO_BTN_VARS = {
    '--origam-btn---font-size': '15px'
} as const
