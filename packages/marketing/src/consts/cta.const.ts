import { ENSO_CTA_FOREGROUND, ENSO_CTA_MOUNTAINS, ENSO_CTA_RIDGE } from '~/consts/enso.const'
import type { ICtaAction, ICtaPlane, TCtaSurface } from '~/interfaces/cta.interface'

/**
 * Constants for the HomeCta section.
 * CTA_START_HREF is also used by why-origam.vue (installation entry point).
 */
export const CTA_START_HREF = '/installation'

/** Primary CTA of the closing band: the component catalogue. */
export const CTA_COMPONENTS_HREF = '/components'

/** Secondary CTA of the closing band: the documentation (VitePress, a static site served under `/docs/`). */
export const CTA_DOCS_HREF = '/docs/'

/** Sun accent (kit A1) has no DS intent: primitive ramp from #1514. */
export const CTA_SUN_COLOR = 'var(--origam-color__sun---500)'

/** Ink text on the sun button: `--home-cta-ink` (HomeCta) is #1b1127 in both modes, as in the mockup. */
export const CTA_INK_COLOR = 'var(--home-cta-ink)'

/** Text of the outlined button: the page text colour, so it follows the mode. */
export const CTA_LINE_COLOR = 'var(--origam-color__text---primary)'

/**
 * Boutons du CTA (maquette v12) : 22 px de padding horizontal, texte 600. La hauteur (48 px),
 * le texte (15 px, entre les crans `md` 14 et `lg` 16) et le rayon (10 px) sont posés en CSS
 * dans HomeCta : aucun cran de l'échelle ne les porte.
 */
export const CTA_BTN = {
    size: 'large',
    fontWeight: 'semibold',
    letterSpacing: 'normal',
    paddingInline: '22px'
} as const

/**
 * Plans du paysage du CTA « Crépuscule » (#1596), du plus lointain au plus proche.
 * Course du défilement (chemin JS de l'hôte) : de −vitesse × H à +vitesse × H (H = hauteur de la
 * section, 800 px), soit ±13 / ±8 / ±4 px, les valeurs de la maquette
 * (`--cy × k` avec k = 0,22 / 0,14 / 0,06 et `--cy` de −60 à 60).
 */
export const CTA_PLANES: readonly ICtaPlane[] = [
    { key: 'mountains', art: ENSO_CTA_MOUNTAINS, displayWidth: 1600, speed: -0.0165 },
    { key: 'ridge', art: ENSO_CTA_RIDGE, displayWidth: 1600, speed: -0.0105 },
    { key: 'foreground', art: ENSO_CTA_FOREGROUND, displayWidth: 1600, speed: -0.0045 }
]

/** Boutons de la bande de la home : composants (soleil), puis documentation (contour). */
export const CTA_HOME_ACTIONS: readonly ICtaAction[] = [
    { key: 'components', labelKey: 'home.cta.cta_docs', labelFallback: 'Explore the components', href: CTA_COMPONENTS_HREF, localized: true, dataCy: 'cta-btn-components' },
    { key: 'docs', labelKey: 'home.cta.cta_read_docs', labelFallback: 'Read the documentation', href: CTA_DOCS_HREF, localized: false, dataCy: 'cta-btn-docs' }
]

/** Fond de départ du ciel, par surface de la section précédente (`var()` littéraux : gardés par `token-var-channels`). */
export const CTA_SURFACE_BG: Record<TCtaSurface, string> = {
    sunken: 'var(--origam-color__surface---sunken)',
    overlay: 'var(--origam-color__surface---overlay)'
}
