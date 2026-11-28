import { MDI_ICONS } from 'origam/enums'
import type { IFooterSocial, INavLink } from '~/interfaces/nav.interface'
import { MARKETING_DEFAULTS } from '~/consts/marketing.const'
import { TWITTER_LINK } from '~/consts/nav.const'

/** Niveau 2 : les pages légales et le soutien (/support, qui n'a plus d'autre lien). Les valeurs de l'éditeur vivent dans ces pages (variables `LEGAL_*`), jamais ici. */
export const FOOTER_LEGAL: readonly INavLink[] = [
    { i18nKey: 'footer.legal.legal_notice', i18nFallback: 'Legal notice', href: '/legal' },
    { i18nKey: 'footer.legal.privacy', i18nFallback: 'Privacy', href: '/privacy' },
    { i18nKey: 'footer.legal.contact', i18nFallback: 'Contact', href: '/contact' },
    { i18nKey: 'footer.legal.support', i18nFallback: 'Support origam', href: '/support' }
]

/** Glyphes 24 × 24 de la maquette v12 (X, YouTube) ; GitHub vient du jeu MDI du site. */
export const FOOTER_ICON_X = 'M18.2 2h3.3l-7.2 8.3L22.8 22h-6.6l-5.2-6.8L5 22H1.7l7.7-8.8L1.2 2H8l4.7 6.2L18.2 2zm-1.2 18h1.8L7.1 3.9H5.1L17 20z'
export const FOOTER_ICON_YOUTUBE = 'M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z'

export const FOOTER_SOCIAL_GITHUB: IFooterSocial = {
    key: 'github',
    labelKey: 'footer.social.github',
    labelFallback: 'GitHub',
    href: MARKETING_DEFAULTS.githubRepo,
    icon: MDI_ICONS.GITHUB,
    showLabel: true
}

export const FOOTER_SOCIAL_X: IFooterSocial = {
    key: 'x',
    labelKey: 'footer.social.x',
    labelFallback: 'X',
    href: TWITTER_LINK,
    icon: FOOTER_ICON_X
}

/** Pas de lien YouTube dans le dépôt : l'entrée n'existe que si `NUXT_PUBLIC_YOUTUBE_URL` est posée. */
export const FOOTER_SOCIAL_YOUTUBE: Omit<IFooterSocial, 'href'> = {
    key: 'youtube',
    labelKey: 'footer.social.youtube',
    labelFallback: 'YouTube',
    icon: FOOTER_ICON_YOUTUBE
}

/** Largeur d'affichage (px) de la marque enso, qui choisit le fichier 1x / 2x. */
export const FOOTER_MARK_WIDTH = 34
