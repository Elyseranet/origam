import type { ICommand } from 'origam/interfaces'

/**
 * Static command-palette entries — pages with no backing API catalogue
 * (installation, changelog, roadmap, wireframe, theming, why-origam).
 * Moved here from useGlobalSearch.ts — a business const declared inline in
 * a composable belongs in src/consts/ (CLAUDE.md).
 */
export const GLOBAL_SEARCH_STATIC_PAGES: ICommand[] = [
    {
        id: 'page-installation',
        label: 'Installation',
        description: 'Getting started — install origam in your project',
        icon: 'mdi-download-outline',
        group: 'Pages',
        keywords: ['install', 'setup', 'npm', 'pnpm', 'yarn', 'getting-started'],
        perform: () => undefined
    },
    {
        id: 'page-changelog',
        label: 'Changelog',
        description: 'Release history and migration notes',
        icon: 'mdi-history',
        group: 'Pages',
        keywords: ['release', 'version', 'update', 'migration', 'changes'],
        perform: () => undefined
    },
    {
        id: 'page-roadmap',
        label: 'Roadmap',
        description: 'Upcoming features and milestones',
        icon: 'mdi-map-marker-path',
        group: 'Pages',
        keywords: ['future', 'plan', 'upcoming', 'milestone', 'feature'],
        perform: () => undefined
    },
    {
        id: 'page-wireframe',
        label: 'Wireframe',
        description: 'Design wireframe & component previews',
        icon: 'mdi-vector-square',
        group: 'Pages',
        keywords: ['design', 'preview', 'mockup', 'layout'],
        perform: () => undefined
    },
    {
        id: 'page-theming',
        label: 'Theming',
        description: 'Visual theme builder — customise design tokens',
        icon: 'mdi-palette-outline',
        group: 'Pages',
        keywords: ['theme', 'token', 'color', 'brand', 'customize'],
        perform: () => undefined
    },
    {
        id: 'page-why-origam',
        label: 'Why origam?',
        description: 'Design decisions and philosophy',
        icon: 'mdi-help-circle-outline',
        group: 'Pages',
        keywords: ['why', 'philosophy', 'decision', 'compare'],
        perform: () => undefined
    }
]

/** URL each `GLOBAL_SEARCH_STATIC_PAGES` entry navigates to when selected. */
export const GLOBAL_SEARCH_STATIC_PAGE_HREFS: Record<string, string> = {
    'page-installation': '/installation',
    'page-changelog': '/changelog',
    'page-roadmap': '/roadmap',
    'page-wireframe': '/wireframe',
    'page-theming': '/theming',
    'page-why-origam': '/why-origam'
}
