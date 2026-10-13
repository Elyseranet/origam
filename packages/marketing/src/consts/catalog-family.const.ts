/**
 * Les 8 familles du catalogue — source unique, partagée par la navigation des
 * fiches de détail et par la palette ⌘K (#1032).
 */

import type { ICatalogFamily } from '../interfaces/catalog-family.interface'

/** Les 8 familles du catalogue, dans l'ordre du catalogue (fil d'Ariane, navigation de fiche, palette ⌘K). */
export const CATALOG_FAMILIES: ICatalogFamily[] = [
    {
        kind: 'component',
        route: '/components',
        labelKey: 'nav.components',
        labelFallback: 'Components'
    },
    {
        kind: 'composable',
        route: '/composables',
        labelKey: 'nav.composables',
        labelFallback: 'Composables'
    },
    {
        kind: 'directive',
        route: '/directives',
        labelKey: 'nav.directives',
        labelFallback: 'Directives'
    },
    {
        kind: 'interface',
        route: '/interfaces',
        labelKey: 'nav.interfaces',
        labelFallback: 'Interfaces'
    },
    {
        kind: 'type',
        route: '/types',
        labelKey: 'nav.types',
        labelFallback: 'Types'
    },
    {
        kind: 'enum',
        route: '/enums',
        labelKey: 'nav.enums',
        labelFallback: 'Enums'
    },
    {
        kind: 'const',
        route: '/consts',
        labelKey: 'nav.consts',
        labelFallback: 'Constants'
    },
    {
        kind: 'util',
        route: '/utils',
        labelKey: 'nav.utils',
        labelFallback: 'Utils'
    }
]
