/**
 * Constantes du rail de navigation du catalogue (#1032).
 *
 * ⛔ RÉUTILISATION — rien n'est redéclaré ici de ce qui existe ailleurs :
 *  • les NOMS COMPLETS des 8 familles réutilisent les clés `nav.*` déjà
 *    présentes dans `en.json` et consommées par l'app bar et le pied de page ;
 *    seuls les libellés COMPACTS (56 px de large) sont de nouvelles clés.
 *  • le volet « Pages » est construit par SPREAD de `NAV_SECTIONS`
 *    (`nav.const.ts`) — y compris son drapeau `external`, qui garde Stories et
 *    Docs hors de `localePath()` (#760). Le rail ne réinvente pas la carte du
 *    site, il l'affiche.
 */

import type { INavRailFamily, INavRailPageGroup } from '../interfaces/nav-rail.interface'

import { NAV_SECTIONS, NAV_THEMING_LINK } from './nav.const'

/** Largeur du rail, en px. 56 = une cible de 44 px plus son padding. */
export const NAV_RAIL_WIDTH = 56

/** Gouttière entre le rail et le bord / le contenu, en px. */
export const NAV_RAIL_GUTTER = 16

/** Largeur du panneau ancré, en px. */
export const NAV_RAIL_PANEL_WIDTH = 320

/**
 * Épaisseur de la feuille basse du mobile, en FRACTION de la hauteur de la
 * fenêtre.
 *
 * ⛔ Elle passe par la prop `width` d'`OrigamDrawer`, et ce n'est pas une
 * erreur de nom : pour un tiroir `location="bottom"`, `width` est l'ÉPAISSEUR
 * du tiroir le long de son axe, donc sa hauteur à l'écran.
 *
 * Mesuré le 2026-10-02 : `OrigamDrawer` écrit sa géométrie en style INLINE
 * (`bottom / z-index / transform / position / height / left / width`), donc
 * aucune règle de feuille ne peut la surcharger sans `!important`. Trois
 * tentatives successives — le token `--origam-drawer---height`, un
 * `block-size` sur ma propre classe, puis un `block-size: 100%` sur le
 * contenu — sont toutes restées sans effet, le tiroir gardant 256 px. La
 * géométrie appartient au composant : on la pilote par sa prop, pas contre
 * elle.
 *
 * ⚠️ Et la prop veut un NOMBRE : `width="85vh"` a été rendu `height: 85px`,
 * l'unité silencieusement perdue (mesuré). On calcule donc la valeur en
 * pixels depuis `useDisplay().height`, qui est réactive au redimensionnement.
 */
export const NAV_RAIL_SHEET_HEIGHT_RATIO = 0.85

/**
 * Décalage du panneau par rapport au bord droit, en px.
 * = largeur du rail + deux gouttières, pour que le panneau se pose À GAUCHE
 * du rail sans le recouvrir.
 */
export const NAV_RAIL_PANEL_OFFSET = NAV_RAIL_WIDTH + NAV_RAIL_GUTTER * 2

/**
 * Seuils de la forme du panneau, mesurés le 2026-10-02 sur la base de
 * référence (`doc_entry`, entrées non orphelines) :
 *
 * | famille    | entrées | catégories | forme retenue |
 * |------------|---------|------------|---------------|
 * | component  |  94 (*) |         11 | groupée       |
 * | directive  |       6 |          1 | liste plate   |
 * | composable |     145 |         11 | recherche     |
 * | enum       |     137 |         42 | recherche     |
 * | util       |     375 |         22 | recherche     |
 * | const      |     429 |         62 | recherche     |
 * | type       |     497 |        110 | recherche     |
 * | interface  |     972 |        154 | recherche     |
 *
 * (*) 94 de premier niveau ; les 124 autres composants sont des membres de
 * famille (`parentSlug` renseigné) et ne sont pas des cibles de navigation.
 *
 * La forme est DÉRIVÉE de ces deux seuils à l'exécution, jamais écrite famille
 * par famille : le catalogue bouge à chaque composant ajouté — const est déjà
 * passé de 428 à 429 entre deux synchronisations le jour de la mesure.
 */
export const NAV_RAIL_GROUP_MAX_CATEGORIES = 12
export const NAV_RAIL_GROUP_MAX_ENTRIES = 120

/**
 * Plafond de résultats affichés, et il est ANNONCÉ à l'écran (« 50 sur 318 »).
 * Un plafond silencieux est pire que pas de plafond : l'utilisateur croit
 * avoir vu la liste entière.
 */
export const NAV_RAIL_RESULT_CAP = 50

/** Nombre d'entrées en dessous duquel une liste plate s'affiche sans filtre. */
export const NAV_RAIL_FILTER_MIN_ENTRIES = 12

/**
 * Les 8 familles du catalogue, dans l'ordre du rail.
 *
 * Les libellés compacts sont ceux de la convention du DS, pas des abréviations
 * arbitraires : `use` est le préfixe obligatoire d'un composable, `v-` celui
 * d'une directive, `I` / `T` / `E` / `C` les préfixes d'interface, type, enum
 * et constante. Un lecteur du DS les reconnaît ; un lecteur d'écran, lui,
 * reçoit le nom complet et le dénombrement via l'`aria-label`.
 */
export const NAV_RAIL_FAMILIES: INavRailFamily[] = [
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

/**
 * Le volet « Pages ».
 *
 * Les trois premiers groupes SONT `NAV_SECTIONS` — même objets, mêmes clés,
 * même drapeau `external`. Le dernier groupe rassemble les pages qui n'ont
 * jamais eu d'entrée dans l'app bar (Theming est un lien de premier niveau,
 * Support / Contact / Privacy ne vivaient que dans le pied de page) et
 * réutilise leurs clés i18n existantes — aucune clé nouvelle pour une page
 * qui existait déjà.
 */
export const NAV_RAIL_PAGE_GROUPS: INavRailPageGroup[] = [
    ...NAV_SECTIONS.map(section => ({
        titleKey: section.titleKey,
        titleFallback: section.titleFallback,
        links: section.items
    })),
    {
        titleKey: 'rail.pages.more',
        titleFallback: 'More',
        links: [
            NAV_THEMING_LINK,
            { i18nKey: 'footer.resources.support', i18nFallback: 'Support origam', href: '/support' },
            { i18nKey: 'footer.legal.contact', i18nFallback: 'Contact', href: '/contact' },
            { i18nKey: 'footer.legal.privacy', i18nFallback: 'Privacy', href: '/privacy' }
        ]
    }
]
