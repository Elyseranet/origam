import type { IFooterColumn, INavLink, INavSection } from '../interfaces/nav.interface'

import { MARKETING_DEFAULTS } from './marketing.const'

export const NAV_SECTIONS: INavSection[] = [
    {
        titleKey: 'nav.sections.introduction',
        titleFallback: 'Introduction',
        items: [
            { i18nKey: 'nav.why_origam', i18nFallback: 'Why origam?', href: '/why-origam' },
            { i18nKey: 'nav.roadmap', i18nFallback: 'Roadmap', href: '/roadmap' },
            { i18nKey: 'nav.changelog', i18nFallback: 'Changelog', href: '/changelog' }
        ]
    },
    {
        titleKey: 'nav.sections.getting_started',
        titleFallback: 'Getting started',
        items: [
            { i18nKey: 'nav.installation', i18nFallback: 'Installation', href: '/installation' },
            { i18nKey: 'nav.wireframe', i18nFallback: 'Wireframe', href: '/wireframe' }
        ]
    },
    {
        titleKey: 'nav.sections.features',
        titleFallback: 'Features',
        items: [
            { i18nKey: 'nav.components', i18nFallback: 'Components', href: '/components' },
            { i18nKey: 'nav.directives', i18nFallback: 'Directives', href: '/directives' },
            { i18nKey: 'nav.composables', i18nFallback: 'Composables', href: '/composables' },
            { i18nKey: 'nav.types', i18nFallback: 'Types', href: '/types' },
            { i18nKey: 'nav.enums', i18nFallback: 'Enums', href: '/enums' },
            { i18nKey: 'nav.interfaces', i18nFallback: 'Interfaces', href: '/interfaces' },
            { i18nKey: 'nav.utils', i18nFallback: 'Utils', href: '/utils' },
            { i18nKey: 'nav.consts', i18nFallback: 'Constants', href: '/consts' },
            { i18nKey: 'nav.stories', i18nFallback: 'Stories', href: '/stories/' },
            { i18nKey: 'nav.docs', i18nFallback: 'Docs', href: '/docs/' }
        ]
    }
]

export const NAV_THEMING_LINK: INavLink = {
    i18nKey: 'nav.theming',
    i18nFallback: 'Theming',
    href: '/theming'
}

export const GITHUB_LINK: INavLink = {
    i18nKey: 'nav.github',
    i18nFallback: 'GitHub',
    href: MARKETING_DEFAULTS.githubRepo,
    external: true
}

export const DISCORD_LINK = 'https://discord.gg/origam'
export const TWITTER_LINK = 'https://twitter.com/origam'

export const FOOTER_GRID_COLUMNS = '2fr 1fr 1fr 1fr'

export const FOOTER_COLUMNS: IFooterColumn[] = [
    {
        titleKey: 'footer.product.title',
        titleFallback: 'Product',
        links: [
            { i18nKey: 'footer.product.charts', i18nFallback: 'Charts', href: '/components#charts' },
            { i18nKey: 'footer.product.themes', i18nFallback: 'Themes', href: '/#themes' }
        ]
    },
    {
        titleKey: 'footer.resources.title',
        titleFallback: 'Resources',
        links: [
            { i18nKey: 'footer.resources.github', i18nFallback: 'GitHub', href: MARKETING_DEFAULTS.githubRepo, external: true },
            { i18nKey: 'footer.resources.community', i18nFallback: 'Community', href: `${MARKETING_DEFAULTS.githubRepo}/discussions`, external: true },
            { i18nKey: 'footer.resources.discord', i18nFallback: 'Discord', href: DISCORD_LINK, external: true },
            { i18nKey: 'footer.resources.discussions', i18nFallback: 'Discussions', href: `${MARKETING_DEFAULTS.githubRepo}/discussions`, external: true },
            { i18nKey: 'footer.resources.twitter', i18nFallback: 'Twitter', href: TWITTER_LINK, external: true },
            { i18nKey: 'footer.resources.support', i18nFallback: 'Support origam', href: '/support' }
        ]
    },
    {
        titleKey: 'footer.legal.title',
        titleFallback: 'Legal',
        links: [
            { i18nKey: 'footer.legal.license', i18nFallback: 'MIT License', href: `${MARKETING_DEFAULTS.githubRepo}/blob/main/LICENSE`, external: true },
            { i18nKey: 'footer.legal.privacy', i18nFallback: 'Privacy', href: '/privacy' },
            { i18nKey: 'footer.legal.contact', i18nFallback: 'Contact', href: '/contact' }
        ]
    }
]
