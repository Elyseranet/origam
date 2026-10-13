/**
 * Les 8 familles du catalogue — source unique, partagée par le rail de
 * navigation et par la navigation des fiches de détail (#1032).
 */

import type { ICatalogFamily } from '../interfaces/catalog-family.interface'

/**
 * Les 8 familles du catalogue, dans l'ordre du catalogue (rail, fil d'Ariane, navigation de fiche).
 *
 * Les libellés compacts sont ceux de la convention du DS, pas des abréviations
 * arbitraires : `use` est le préfixe obligatoire d'un composable, `v-` celui
 * d'une directive, `I` / `T` / `E` / `C` les préfixes d'interface, type, enum
 * et constante. Un lecteur du DS les reconnaît ; un lecteur d'écran, lui,
 * reçoit le nom complet et le dénombrement via l'`aria-label`.
 */
export const CATALOG_FAMILIES: ICatalogFamily[] = [
    {
        kind: 'component',
        route: '/components',
        shortLabelKey: 'rail.families.component.short',
        shortLabelFallback: 'Comp',
        labelKey: 'nav.components',
        labelFallback: 'Components'
    },
    {
        kind: 'composable',
        route: '/composables',
        shortLabelKey: 'rail.families.composable.short',
        shortLabelFallback: 'use',
        labelKey: 'nav.composables',
        labelFallback: 'Composables'
    },
    {
        kind: 'directive',
        route: '/directives',
        shortLabelKey: 'rail.families.directive.short',
        shortLabelFallback: 'v-',
        labelKey: 'nav.directives',
        labelFallback: 'Directives'
    },
    {
        kind: 'interface',
        route: '/interfaces',
        shortLabelKey: 'rail.families.interface.short',
        shortLabelFallback: 'I',
        labelKey: 'nav.interfaces',
        labelFallback: 'Interfaces'
    },
    {
        kind: 'type',
        route: '/types',
        shortLabelKey: 'rail.families.type.short',
        shortLabelFallback: 'T',
        labelKey: 'nav.types',
        labelFallback: 'Types'
    },
    {
        kind: 'enum',
        route: '/enums',
        shortLabelKey: 'rail.families.enum.short',
        shortLabelFallback: 'E',
        labelKey: 'nav.enums',
        labelFallback: 'Enums'
    },
    {
        kind: 'const',
        route: '/consts',
        shortLabelKey: 'rail.families.const.short',
        shortLabelFallback: 'C',
        labelKey: 'nav.consts',
        labelFallback: 'Constants'
    },
    {
        kind: 'util',
        route: '/utils',
        shortLabelKey: 'rail.families.util.short',
        shortLabelFallback: 'fn',
        labelKey: 'nav.utils',
        labelFallback: 'Utils'
    }
]
