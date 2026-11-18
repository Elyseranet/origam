import type { IGlobalSearchStaticPage } from '../interfaces/global-search.interface'
import type { TReferenceKind } from '../types/api-reference.type'
import type { TGlobalSearchFamily } from '../types/global-search.type'

/**
 * Static command-palette entries — pages with no backing API catalogue.
 * Labels reuse the `nav.*` keys of the app bar; descriptions live under
 * `chrome.search_page_*`. `keywords` are search tokens, never displayed.
 */
export const GLOBAL_SEARCH_STATIC_PAGES: IGlobalSearchStaticPage[] = [
    {
        id: 'page-installation',
        labelKey: 'nav.installation',
        labelFallback: 'Installation',
        descriptionKey: 'chrome.search_page_installation',
        descriptionFallback: 'Getting started — install origam in your project',
        icon: 'mdi-download-outline',
        keywords: ['install', 'setup', 'npm', 'pnpm', 'yarn', 'getting-started']
    },
    {
        id: 'page-changelog',
        labelKey: 'nav.changelog',
        labelFallback: 'Changelog',
        descriptionKey: 'chrome.search_page_changelog',
        descriptionFallback: 'Release history and migration notes',
        icon: 'mdi-history',
        keywords: ['release', 'version', 'update', 'migration', 'changes']
    },
    {
        id: 'page-roadmap',
        labelKey: 'nav.roadmap',
        labelFallback: 'Roadmap',
        descriptionKey: 'chrome.search_page_roadmap',
        descriptionFallback: 'Upcoming features and milestones',
        icon: 'mdi-map-marker-path',
        keywords: ['future', 'plan', 'upcoming', 'milestone', 'feature']
    },
    {
        id: 'page-stability',
        labelKey: 'nav.stability',
        labelFallback: 'Stability',
        descriptionKey: 'chrome.search_page_stability',
        descriptionFallback: 'Version numbers, release cadence and deprecation policy',
        icon: 'mdi-shield-check-outline',
        keywords: ['stability', 'versioning', 'semver', 'breaking', 'deprecation', 'release']
    },
    {
        id: 'page-wireframe',
        labelKey: 'nav.wireframe',
        labelFallback: 'Wireframe',
        descriptionKey: 'chrome.search_page_wireframe',
        descriptionFallback: 'Design wireframe & component previews',
        icon: 'mdi-vector-square',
        keywords: ['design', 'preview', 'mockup', 'layout']
    },
    {
        id: 'page-theming',
        labelKey: 'nav.theming',
        labelFallback: 'Theming',
        descriptionKey: 'chrome.search_page_theming',
        descriptionFallback: 'Visual theme builder — customise design tokens',
        icon: 'mdi-palette-outline',
        keywords: ['theme', 'token', 'color', 'brand', 'customize']
    },
    {
        id: 'page-why-origam',
        labelKey: 'nav.why_origam',
        labelFallback: 'Why origam?',
        descriptionKey: 'chrome.search_page_why_origam',
        descriptionFallback: 'Design decisions and philosophy',
        icon: 'mdi-help-circle-outline',
        keywords: ['why', 'philosophy', 'decision', 'compare']
    }
]

/** URL each `GLOBAL_SEARCH_STATIC_PAGES` entry navigates to when selected. */
export const GLOBAL_SEARCH_STATIC_PAGE_HREFS: Record<string, string> = {
    'page-installation': '/installation',
    'page-changelog': '/changelog',
    'page-roadmap': '/roadmap',
    'page-stability': '/stability',
    'page-wireframe': '/wireframe',
    'page-theming': '/theming',
    'page-why-origam': '/why-origam'
}

/** Valeur du filtre « toutes les familles ». */
export const GLOBAL_SEARCH_ALL_FAMILY: TGlobalSearchFamily = 'all'

/**
 * Plafond de lignes transmises à la palette. Sans lui, `OrigamCommandPalette`
 * rend un `<button>` par commande retenue : ~2 800 nœuds à l'ouverture.
 */
export const GLOBAL_SEARCH_RESULT_CAP = 50

/**
 * Icône MDI par défaut de chaque famille quand l'entrée n'en porte pas. Les
 * familles elles-mêmes (kind, route, libellé `nav.*`) viennent de
 * `CATALOG_FAMILIES` : une seule liste pour tout le site.
 */
export const GLOBAL_SEARCH_FAMILY_ICONS: Record<TReferenceKind, string> = {
    component: 'mdi-puzzle-outline',
    composable: 'mdi-function-variant',
    directive: 'mdi-code-tags',
    type: 'mdi-alpha-t-box-outline',
    enum: 'mdi-format-list-numbered',
    interface: 'mdi-alpha-i-box-outline',
    util: 'mdi-wrench-outline',
    const: 'mdi-alpha-c-box-outline'
}

/** Lignes par famille quand la requête est vide et que toutes les familles sont visibles. */
export const TEASER_PER_FAMILY = 5
