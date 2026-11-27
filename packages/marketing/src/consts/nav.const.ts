import type { INavLink, INavSection } from '../interfaces/nav.interface'

export const NAV_SECTIONS: INavSection[] = [
    {
        titleKey: 'nav.sections.introduction',
        titleFallback: 'Introduction',
        items: [
            { i18nKey: 'nav.why_origam', i18nFallback: 'Why origam?', href: '/why-origam' },
            { i18nKey: 'nav.stability', i18nFallback: 'Stability', href: '/stability' },
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
            // ⛔ `external` — Stories (Histoire) and Docs (VitePress) are SEPARATE
            // static sites served alongside the app, not routes of it. They must
            // NOT go through localePath(): `/fr/stories/` is not a page and 404s
            // (measured). The flag keeps them on a plain <a>. See #760.
            { i18nKey: 'nav.stories', i18nFallback: 'Stories', href: '/stories/', external: true },
            { i18nKey: 'nav.docs', i18nFallback: 'Docs', href: '/docs/', external: true }
        ]
    }
]

export const NAV_THEMING_LINK: INavLink = {
    i18nKey: 'nav.theming',
    i18nFallback: 'Theming',
    href: '/theming'
}

export const TWITTER_LINK = 'https://twitter.com/origam'
