/*
 * id-forwarding-fixtures.ts — harnais de montage pour les composants
 * QUE le sweep runtime ne pouvait pas monter en isolement.
 *
 * CONTEXTE
 * --------
 * `id-forwarding-sweep.spec.ts` monte chaque composant qui déclare une prop
 * `id` avec UNIQUEMENT `{ id: SENTINEL }`. Ça suffit pour ~150 composants.
 * 42 ne se montent pas comme ça (`unmountable`) ou rendent une coquille vide
 * (`not-rendered`) : ils exigent soit des props supplémentaires REQUISES
 * (ex. `rounds` sur `<OrigamBracket>`), soit un contexte injecté par un
 * ancêtre réel (ex. `useGroupItem` pour `<OrigamTab>`), soit `modelValue`
 * ouvert pour rendre leur contenu (ex. `<OrigamDialog>`).
 *
 * Ce fichier fournit, PAR NOM DE COMPOSANT, les props et/ou injections
 * minimales qui lèvent le blocage — sans jamais construire le VRAI parent
 * (`<OrigamExpansionPanels>`, `<OrigamTreeview>`, …). Les injections sont
 * des STUBS qui respectent la FORME (shape) exacte que le composant lit
 * (mêmes noms de champs, mêmes types Ref/computed/fonction) mais dont le
 * comportement est un no-op — l'audit vérifie que `id` atteint le DOM, pas
 * que la sélection de groupe / le tri / la pagination fonctionnent
 * réellement.
 *
 * ⛔ RÈGLE DE NON-CONTAMINATION
 * -----------------------------
 * Chaque `provide` est une FACTORY (fonction), jamais un objet partagé —
 * un `ref()` réutilisé entre deux montages ferait fuiter l'état de l'un
 * vers l'autre (faux "isolement").
 *
 * ⛔ CE FICHIER NE CORRIGE RIEN
 * ------------------------------
 * Si un composant reste `lost` UNE FOIS MONTABLE via ce harnais, c'est un
 * vrai défaut produit (prop `id` acceptée puis jetée) — pas un problème de
 * harnais. Voir le rapport de mission pour la liste des `lost` réels
 * trouvés par ce chemin (ExpansionPanelHeader/Content, Tab, TabPanel,
 * DataTableRows, DefaultsProvider) : ils ne sont PAS corrigés ici.
 */

import { computed, ref } from 'vue'

import { ORIGAM_EXPANSION_PANEL_KEY } from '@origam/consts/ExpansionPanel/expansion-panel.const'
import { ORIGAM_ITEM_GROUP_KEY } from '@origam/consts/ItemGroup/item-group.const'
import { ORIGAM_TABS_KEY, ORIGAM_TAB_PANELS_KEY } from '@origam/consts/Tabs/tabs.const'
import { ORIGAM_WINDOW_GROUP_KEY, ORIGAM_WINDOW_KEY } from '@origam/consts/Window/window.const'
import { ORIGAM_PARALLAX_KEY } from '@origam/consts/Parallax/parallax.const'
import { ORIGAM_PARALLAX_LAYER_KEY } from '@origam/consts/Parallax/parallax-layer.const'
import { ORIGAM_TREEVIEW_KEY } from '@origam/consts/Treeview/treeview.const'
import { ORIGAM_LAYOUT_KEY } from '@origam/consts/Commons/layout.const'
import {
    ORIGAM_DATA_TABLE_EXPAND_KEY,
    ORIGAM_DATA_TABLE_GROUP_KEY,
    ORIGAM_DATA_TABLE_HEADERS_KEY,
    ORIGAM_DATA_TABLE_PAGINATION_KEY,
    ORIGAM_DATA_TABLE_SELECT_KEY,
    ORIGAM_DATA_TABLE_SORT_KEY
} from '@origam/consts/DataTable/data-table.const'

import type { IGroupItemProvide, IGroupProvide } from '@origam/interfaces/Commons/group.interface'
import type { IInternalDataTableHeader } from '@origam/interfaces/DataTable/data-table-header.interface'

/*********************************************************
 * Stubs partagés — group / group-item
 *
 * @description
 * `useGroupItem` (côté enfant) appelle `group.register(...)`,
 * `group.disabled.value`, et lit `group.isSelected(id)` / `.selectedClass`
 * via des computed — tout no-op est acceptable, RIEN de ceci ne doit
 * lancer. `useGroupItem` lui-même LANCE si l'injection est absente : c'est
 * exactement l'erreur `unmountable` mesurée, donc une valeur non-null
 * suffit à la lever.
 ********************************************************/
function stubGroupProvide (): IGroupProvide {
    return {
        register: () => {},
        unregister: () => {},
        select: () => {},
        selected: ref([]),
        isSelected: () => false,
        prev: () => {},
        next: () => {},
        selectedClass: ref(undefined),
        items: computed(() => []),
        disabled: ref(false),
        getItemIndex: () => -1
    }
}

/*
 * Forme consommée directement par `<OrigamExpansionPanelHeader>` /
 * `<OrigamExpansionPanelContent>` (`inject(ORIGAM_EXPANSION_PANEL_KEY)`
 * SANS passer par `useGroupItem`) — c'est la valeur qu'un VRAI
 * `<OrigamExpansionPanel>` re-fournit à ses enfants sous la MÊME clé.
 */
function stubGroupItemProvide (): IGroupItemProvide {
    return {
        id: 1,
        isSelected: ref(false),
        toggle: () => {},
        select: () => {},
        selectedClass: ref([]),
        value: ref(undefined),
        disabled: ref(false),
        group: stubGroupProvide()
    }
}

/*********************************************************
 * Stub — IWindowProvide (`<OrigamWindowItem>` / `<OrigamCarouselItem>`)
 ********************************************************/
function stubWindowProvide () {
    return {
        transition: computed(() => undefined),
        transitionCount: ref(0),
        transitionHeight: ref(undefined),
        isReversed: ref(false),
        rootRef: ref(undefined)
    }
}

/*********************************************************
 * Stub — IParallaxProvide (`<OrigamParallaxElement>`)
 ********************************************************/
function stubParallaxProvide () {
    return {
        audioData: ref(null),
        eventData: ref({x: 0, y: 0}),
        movement: ref({x: 0, y: 0}),
        isMoving: ref(false),
        event: ref('move'),
        duration: ref(300),
        easing: ref('ease-out'),
        shape: ref(null)
    }
}

/*********************************************************
 * Stub — registre de couche (`<OrigamParallaxLayer>`)
 *
 * @description
 * Pas d'interface `IParallaxLayerProvide` exportée — la forme vient de la
 * lecture directe de `OrigamParallaxLayer.vue` : `register`, `unregister`,
 * `update`, `cssScrollDriven`, `reducedMotion`.
 ********************************************************/
function stubParallaxLayerProvide () {
    return {
        register: () => {},
        unregister: () => {},
        update: () => {},
        cssScrollDriven: ref(false),
        reducedMotion: ref(false)
    }
}

/*********************************************************
 * Stub — ITreeviewProvide (`<OrigamTreeviewNode>`)
 ********************************************************/
function stubTreeviewProvide () {
    return {
        toggleExpanded: () => {},
        toggleSelected: () => {},
        isExpanded: () => false,
        isSelected: () => false,
        selectMode: computed(() => 'leaf'),
        selectableNodes: computed(() => 'all'),
        showLines: computed(() => false),
        expandOnClick: computed(() => true),
        color: computed(() => undefined)
    }
}

/*********************************************************
 * Stub — ILayoutProvide (`<OrigamMain>`)
 ********************************************************/
function stubLayoutProvide () {
    return {
        register: () => ({
            layoutItemStyles: ref({}),
            layoutItemScrimStyles: ref({}),
            zIndex: ref(0)
        }),
        unregister: () => {},
        mainRect: ref({top: 0, bottom: 0, left: 0, right: 0}),
        mainStyles: ref({}),
        getLayoutItem: () => undefined,
        items: ref([]),
        layoutRect: ref(undefined),
        rootZIndex: ref(2000),
        layoutId: computed(() => 'origam-layout-stub')
    }
}

/*********************************************************
 * Stub — les cinq contextes `<OrigamDataTable>`
 *
 * @description
 * Un seul objet couvrant pagination / tri / groupement / sélection /
 * headers — appliqué tel quel à CHAQUE sous-composant DataTable de la
 * liste des 42, qu'il en consomme un seul ou plusieurs. Fournir une clé
 * dont le composant ciblé n'a pas besoin est inoffensif (elle reste
 * simplement inutilisée).
 ********************************************************/
const DATA_TABLE_COLUMN: IInternalDataTableHeader = {
    key: 'name',
    value: 'name',
    title: 'Name',
    sortable: true
}

function stubDataTableProvide () {
    return {
        [ORIGAM_DATA_TABLE_PAGINATION_KEY]: {
            page: ref(1),
            itemsPerPage: ref(10),
            startIndex: computed(() => 0),
            stopIndex: computed(() => 0),
            pageCount: computed(() => 1),
            itemsLength: ref(0),
            prevPage: () => {},
            nextPage: () => {},
            setPage: () => {},
            setItemsPerPage: () => {}
        },
        [ORIGAM_DATA_TABLE_SORT_KEY]: {
            sortBy: ref([]),
            toggleSort: () => {},
            isSorted: () => false
        },
        [ORIGAM_DATA_TABLE_GROUP_KEY]: {
            opened: ref(new Set<string>()),
            toggleGroup: () => {},
            isGroupOpen: () => false,
            sortByWithGroups: ref([]),
            groupBy: ref([]),
            extractRows: (items: unknown[]) => items
        },
        [ORIGAM_DATA_TABLE_HEADERS_KEY]: {
            headers: ref([[DATA_TABLE_COLUMN]]),
            columns: ref([DATA_TABLE_COLUMN]),
            sortFunctions: ref({}),
            sortRawFunctions: ref({}),
            filterFunctions: ref({})
        },
        [ORIGAM_DATA_TABLE_SELECT_KEY]: {
            toggleSelect: () => {},
            select: () => {},
            selectAll: () => {},
            isSelected: () => false,
            isSomeSelected: () => false,
            someSelected: computed(() => false),
            allSelected: computed(() => false),
            showSelectAll: computed(() => false)
        },
        [ORIGAM_DATA_TABLE_EXPAND_KEY]: {
            expand: () => {},
            expanded: ref(new Set<string>()),
            expandOnClick: ref(false),
            isExpanded: () => false,
            toggleExpand: () => {}
        }
    }
}

const DATA_TABLE_GROUP_ITEM = {
    type: 'group' as const,
    depth: 0,
    id: 'group-1',
    key: 'group-1',
    value: 'Group 1',
    items: []
}

const DATA_TABLE_ROW_ITEM = {
    type: 'item' as const,
    key: 1,
    index: 0,
    value: 1,
    raw: {name: 'Alice'},
    columns: {name: 'Alice'},
    selectable: true
}

/*********************************************************
 * Media — state/methods stub (`<OrigamMediaController>`)
 *
 * @description
 * Forme de `useMediaPlayer()` (IMediaPlayerState + IMediaPlayerMethods) —
 * refs neutres + méthodes no-op, aucun élément `<video>`/`<audio>` réel
 * n'est attaché.
 ********************************************************/
function stubMediaState () {
    return {
        playing: ref(false),
        paused: ref(true),
        currentTime: ref(0),
        duration: ref(120),
        buffered: ref(0),
        volume: ref(1),
        muted: ref(false),
        ready: ref(true),
        loading: ref(false),
        error: ref(null),
        playbackRate: ref(1),
        remoteAvailable: ref(false),
        remoteState: ref('disconnected')
    }
}

function stubMediaMethods () {
    return {
        play: async () => {},
        pause: () => {},
        toggle: async () => {},
        seek: () => {},
        setVolume: () => {},
        toggleMute: () => {},
        load: () => {},
        skipBackward: () => {},
        skipForward: () => {},
        setPlaybackRate: () => {},
        requestRemotePlayback: async () => {},
        stopRemotePlayback: async () => {}
    }
}

/*********************************************************
 * Bracket — données minimales valides
 ********************************************************/
const BRACKET_COMPETITOR_A = {id: 'c1', name: 'Team A'}
const BRACKET_COMPETITOR_B = {id: 'c2', name: 'Team B'}
const BRACKET_MATCH = {
    id: 'm1',
    competitorA: BRACKET_COMPETITOR_A,
    competitorB: BRACKET_COMPETITOR_B,
    scoreA: 2,
    scoreB: 1,
    winnerId: 'c1'
}
const BRACKET_ROUND = {
    id: 'r1',
    title: 'Final',
    matches: [BRACKET_MATCH]
}

/*********************************************************
 * Chart — série minimale valide
 ********************************************************/
const CHART_SERIES = [{name: 'Series A', data: [1, 2, 3]}]
const CHART_CATEGORIES = ['A', 'B', 'C']

export type TIdForwardingFixture = {
    /** Props additionnelles fusionnées APRÈS `{ id: SENTINEL }`. */
    props?: Record<string, unknown>
    /** Factory — jamais un objet partagé entre montages. */
    provide?: () => Record<symbol, unknown>
}

export const ID_FORWARDING_FIXTURES: Record<string, TIdForwardingFixture> = {
    /* ---------- Bracket — required data props ---------- */
    OrigamBracket: {props: {rounds: [BRACKET_ROUND]}},
    OrigamBracketRound: {props: {round: BRACKET_ROUND, index: 0, totalRounds: 1}},
    OrigamBracketMatch: {props: {match: BRACKET_MATCH}},
    OrigamBracketCompetitor: {props: {competitor: BRACKET_COMPETITOR_A}},

    /* ---------- Chart — required `series` ---------- */
    OrigamChart: {props: {series: CHART_SERIES, categories: CHART_CATEGORIES}},
    OrigamChartCartesian: {props: {series: CHART_SERIES, categories: CHART_CATEGORIES}},
    OrigamChartPolar: {props: {series: CHART_SERIES, categories: CHART_CATEGORIES}},
    OrigamChartRadar: {props: {series: CHART_SERIES, categories: CHART_CATEGORIES}},

    /* ---------- useGroup injection (IGroupProvide) ---------- */
    OrigamExpansionPanel: {provide: () => ({[ORIGAM_EXPANSION_PANEL_KEY]: stubGroupProvide()})},
    OrigamItemGroupItem: {provide: () => ({[ORIGAM_ITEM_GROUP_KEY]: stubGroupProvide()})},
    OrigamTab: {provide: () => ({[ORIGAM_TABS_KEY]: stubGroupProvide()})},
    OrigamTabPanel: {provide: () => ({[ORIGAM_TAB_PANELS_KEY]: stubGroupProvide()})},
    OrigamWindowItem: {
        provide: () => ({
            [ORIGAM_WINDOW_KEY]: stubWindowProvide(),
            [ORIGAM_WINDOW_GROUP_KEY]: stubGroupProvide()
        })
    },
    OrigamCarouselItem: {
        provide: () => ({
            [ORIGAM_WINDOW_KEY]: stubWindowProvide(),
            [ORIGAM_WINDOW_GROUP_KEY]: stubGroupProvide()
        })
    },

    /* ---------- Injection directe (IGroupItemProvide / contextes dédiés) ---------- */
    OrigamExpansionPanelHeader: {provide: () => ({[ORIGAM_EXPANSION_PANEL_KEY]: stubGroupItemProvide()})},
    OrigamExpansionPanelContent: {provide: () => ({[ORIGAM_EXPANSION_PANEL_KEY]: stubGroupItemProvide()})},
    OrigamParallaxElement: {provide: () => ({[ORIGAM_PARALLAX_KEY]: stubParallaxProvide()})},
    OrigamParallaxLayer: {provide: () => ({[ORIGAM_PARALLAX_LAYER_KEY]: stubParallaxLayerProvide()})},
    OrigamTreeviewNode: {
        props: {node: {id: 'n1', label: 'Node 1'}},
        provide: () => ({[ORIGAM_TREEVIEW_KEY]: stubTreeviewProvide()})
    },
    OrigamMain: {provide: () => ({[ORIGAM_LAYOUT_KEY]: stubLayoutProvide()})},

    /* ---------- DataTable — cinq contextes injectés + props requises ---------- */
    OrigamDataTable: {props: {items: []}},
    OrigamDataTableFooter: {provide: stubDataTableProvide},
    OrigamDataTableGroupHeaderRow: {
        props: {item: DATA_TABLE_GROUP_ITEM},
        provide: stubDataTableProvide
    },
    OrigamDataTableHeaderCell: {
        props: {column: DATA_TABLE_COLUMN, x: 0, y: 0},
        provide: stubDataTableProvide
    },
    OrigamDataTableHeaders: {provide: stubDataTableProvide},
    OrigamDataTableHeadersCellMobile: {
        props: {columns: [DATA_TABLE_COLUMN]},
        provide: stubDataTableProvide
    },
    OrigamDataTableHeadersCell: {
        props: {headers: [[DATA_TABLE_COLUMN]]},
        provide: stubDataTableProvide
    },
    OrigamDataTableRow: {
        props: {item: DATA_TABLE_ROW_ITEM},
        provide: stubDataTableProvide
    },
    OrigamDataTableRows: {provide: stubDataTableProvide},

    /* ---------- Media / Video / VirtualScroll / FileField — required data props ---------- */
    OrigamMediaController: {props: {state: stubMediaState(), methods: stubMediaMethods()}},
    OrigamVideo: {props: {src: 'video.mp4'}},
    OrigamVirtualScroll: {props: {items: [1, 2, 3]}},
    OrigamFileFieldDragNDropItem: {props: {file: new File(['x'], 'a.txt'), index: 0}},
    OrigamFileFieldListItem: {props: {file: new File(['x'], 'a.txt'), index: 0}},

    /* ---------- not-rendered — modelValue fermé par défaut ---------- */
    OrigamDialog: {props: {modelValue: true}},
    OrigamDialogConfirmation: {props: {modelValue: true}},
    OrigamMenu: {props: {modelValue: true}},
    OrigamContextualMenu: {props: {modelValue: true}},
    OrigamSnackbar: {props: {modelValue: true}},
    OrigamOverlay: {props: {modelValue: true}},
    OrigamOverlayScrim: {props: {active: true}},

    /* ---------- not-rendered — renderless structural component ---------- */
    OrigamDefaultsProvider: {}
}
