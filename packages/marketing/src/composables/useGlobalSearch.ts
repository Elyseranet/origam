/**
 * useGlobalSearch — index global pour la command palette du header.
 *
 * Construit un tableau ICommand depuis les catalogues référentiels via l'API Nitro :
 *   - composants     → /api/reference/component  → /components/{slug}
 *   - composables    → /api/reference/composable  → /composables/{slug}
 *   - directives     → /api/reference/directive   → /directives/{slug}
 *   - types/enums    → /api/reference/type        → /types/{slug}
 *   - pages statiques (installation, changelog, roadmap, wireframe, theming)
 *
 * Le tableau est réactif : réinitialisation automatique quand les données API changent.
 *
 * Locale (ADR #325, task 3) : chaque `entry.descriptionFallback` affiché ici vient
 * du serveur en texte localisé — `?locale=` est donc transmis (+ inclus dans la
 * clé de cache) sur les 4 appels ci-dessous, sinon la palette resterait figée
 * sur la première langue chargée après un changement de locale.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ICommand } from 'origam/interfaces'

const STATIC_PAGES: ICommand[] = [
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

const STATIC_PAGE_HREFS: Record<string, string> = {
    'page-installation': '/installation',
    'page-changelog': '/changelog',
    'page-roadmap': '/roadmap',
    'page-wireframe': '/wireframe',
    'page-theming': '/theming',
    'page-why-origam': '/why-origam'
}

export function useGlobalSearch () {
    const { locale } = useI18n()

    const { data: components } = useFetch<Array<{
        slug: string
        name: string
        icon: string
        category: string
        parentSlug?: string
        descriptionFallback: string
    }>>('/api/reference/component', {
        key: () => `global-search:component:${locale.value}`,
        query: { locale },
        default: () => [],
    })

    const { data: composables } = useFetch<Array<{
        slug: string
        name: string
        icon: string
        domain: string
        descriptionFallback: string
    }>>('/api/reference/composable', {
        key: () => `global-search:composable:${locale.value}`,
        query: { locale },
        default: () => [],
    })

    const { data: directives } = useFetch<Array<{
        slug: string
        name: string
        icon: string
        descriptionFallback: string
    }>>('/api/reference/directive', {
        key: () => `global-search:directive:${locale.value}`,
        query: { locale },
        default: () => [],
    })

    const { data: types } = useFetch<Array<{
        slug: string
        name: string
        icon: string
        category: string
        kind: 'type' | 'enum'
        descriptionFallback: string
    }>>('/api/reference/type', {
        key: () => `global-search:type:${locale.value}`,
        query: { locale },
        default: () => [],
    })

    const commands = computed<ICommand[]>(() => {
        const list: ICommand[] = []

        for (const entry of components.value ?? []) {
            if (entry.parentSlug) continue

            list.push({
                id: `component-${entry.slug}`,
                label: entry.name,
                description: entry.descriptionFallback,
                icon: entry.icon ?? 'mdi-puzzle-outline',
                group: 'Components',
                keywords: [entry.slug, entry.category?.toLowerCase() ?? '', 'component', 'origam'],
                perform: () => undefined
            })
        }

        for (const entry of composables.value ?? []) {
            list.push({
                id: `composable-${entry.slug}`,
                label: entry.name,
                description: entry.descriptionFallback,
                icon: entry.icon ?? 'mdi-function-variant',
                group: 'Composables',
                keywords: [entry.slug, entry.domain?.toLowerCase() ?? '', 'composable', 'hook'],
                perform: () => undefined
            })
        }

        for (const entry of directives.value ?? []) {
            list.push({
                id: `directive-${entry.slug}`,
                label: entry.name,
                description: entry.descriptionFallback,
                icon: entry.icon ?? 'mdi-code-tags',
                group: 'Directives',
                keywords: [entry.slug, 'directive', 'v-'],
                perform: () => undefined
            })
        }

        for (const entry of types.value ?? []) {
            list.push({
                id: `type-${entry.slug}`,
                label: entry.name,
                description: entry.descriptionFallback,
                icon: entry.icon ?? 'mdi-alpha-t-box-outline',
                group: entry.kind === 'enum' ? 'Enums' : 'Types',
                keywords: [entry.slug, entry.category?.toLowerCase() ?? '', 'type', 'typescript'],
                perform: () => undefined
            })
        }

        for (const page of STATIC_PAGES) {
            list.push(page)
        }

        return list
    })

    function getHref (commandId: string): string {
        if (commandId.startsWith('component-')) {
            return `/components/${commandId.replace('component-', '')}`
        }

        if (commandId.startsWith('composable-')) {
            return `/composables/${commandId.replace('composable-', '')}`
        }

        if (commandId.startsWith('directive-')) {
            return `/directives/${commandId.replace('directive-', '')}`
        }

        if (commandId.startsWith('type-')) {
            return `/types/${commandId.replace('type-', '')}`
        }

        return STATIC_PAGE_HREFS[commandId] ?? '/'
    }

    return {
        commands,
        getHref
    }
}
