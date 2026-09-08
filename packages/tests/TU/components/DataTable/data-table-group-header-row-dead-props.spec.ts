// #548 (garde `unconsumed-props`) — les props inertes d'`<OrigamDataTableGroupHeaderRow>`.
//
// MESURE AVANT CORRECTIF : le garde signalait 14 paires prop/composant sur ce
// seul fichier. Trois familles, trois verdicts distincts :
//
//   1. `color` (heritee d'`IColorProps`) — declaree, lue nulle part, alors que
//      le SCSS scope declare deja `color:` sur le `<tr>`. CABLEE via
//      `useTextColor`, meme forme que `<OrigamDataTableRows>` (#550).
//
//   2. `IPaddingProps` (7 props) — RETIREES. La racine rendue est un `<tr>` :
//      le modele de boite CSS ignore `padding` sur `display: table-row`. Les
//      binder aurait produit un vert de facade.
//
//   3. Six props homonymes-ecrasees : le composant les declarait ET
//      destructurait un retour de composable du meme nom, le binding
//      `<script setup>` l'emportant dans le template compile (famille #372).
//      `toggleGroup` / `isSelected` sont desormais CONSOMMEES prop d'abord ;
//      `internalItem` / `isExpanded` / `toggleExpand` / `toggleSelect` sont
//      RETIREES faute de site de consommation ecrivable.
//
// APRES : garde a 0 violation, `vue-tsc --noEmit` a 0 ligne.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import OrigamDataTableGroupHeaderRow from '@origam/components/DataTable/OrigamDataTableGroupHeaderRow.vue'
import { createOrigam } from '@origam/origam'

import {
    ORIGAM_DATA_TABLE_EXPAND_KEY,
    ORIGAM_DATA_TABLE_GROUP_KEY,
    ORIGAM_DATA_TABLE_HEADERS_KEY,
    ORIGAM_DATA_TABLE_PAGINATION_KEY,
    ORIGAM_DATA_TABLE_SELECT_KEY,
    ORIGAM_DATA_TABLE_SHOW_SELECT_KEY,
    ORIGAM_DATA_TABLE_SORT_KEY
} from '@origam/consts'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

const GROUP = {
    type: 'group' as const,
    depth: 0,
    id: 'team-frontend',
    key: 'team',
    value: 'Frontend',
    items: [
        {type: 'item', raw: {name: 'Alice'}},
        {type: 'item', raw: {name: 'Dan'}}
    ]
}

const COLUMNS = [
    {key: 'data-table-group', title: ''},
    {key: 'data-table-select', title: ''}
]

/** Doublures des collaborateurs normalement fournis par `<OrigamDataTable>`. */
function makeProvide (overrides: Record<string, unknown> = {}) {
    return {
        [ORIGAM_DATA_TABLE_SELECT_KEY as symbol]: {
            isSelected: () => false,
            toggleSelect: vi.fn(),
            select: vi.fn(),
            isSomeSelected: () => false,
            someSelected: ref(false),
            allSelected: ref(false),
            selectAll: vi.fn(),
            ...(overrides.select as object ?? {})
        },
        [ORIGAM_DATA_TABLE_EXPAND_KEY as symbol]: {
            expand: vi.fn(),
            expanded: ref(new Set()),
            expandOnClick: ref(false),
            isExpanded: () => false,
            toggleExpand: vi.fn()
        },
        [ORIGAM_DATA_TABLE_HEADERS_KEY as symbol]: {
            headers: ref([]),
            columns: ref(COLUMNS)
        },
        [ORIGAM_DATA_TABLE_SORT_KEY as symbol]: {
            sortBy: ref([]),
            toggleSort: vi.fn(),
            isSorted: () => false
        },
        [ORIGAM_DATA_TABLE_GROUP_KEY as symbol]: {
            toggleGroup: vi.fn(),
            isGroupOpen: () => true,
            opened: ref(new Set()),
            groupBy: ref([]),
            extractRows: (items: Array<{ items?: unknown[] }>) => items.flatMap((i) => i.items ?? []),
            sortByWithGroups: ref([]),
            ...(overrides.group as object ?? {})
        },
        [ORIGAM_DATA_TABLE_PAGINATION_KEY as symbol]: {
            startIndex: ref(0),
            page: ref(1),
            itemsPerPage: ref(10)
        },
        [ORIGAM_DATA_TABLE_SHOW_SELECT_KEY as symbol]: ref(true)
    }
}

function mountRow (
    props: Record<string, unknown> = {},
    provideOverrides: Record<string, unknown> = {}
) {
    return mount(OrigamDataTableGroupHeaderRow as never, {
        props: {index: 0, item: GROUP, columns: COLUMNS, ...props} as never,
        global: {plugins: [createOrigam()], provide: makeProvide(provideOverrides)}
    })
}

describe('OrigamDataTableGroupHeaderRow — `color` peint la ligne (#548)', () => {
    it('la ligne porte la classe utilitaire de l\'intent', () => {
        const wrapper = mountRow({color: 'primary'})

        expect(wrapper.classes()).toContain('origam--color-primary')
    })

    it('la ligne porte la declaration inline de premier plan', () => {
        const wrapper = mountRow({color: 'primary'})

        // Seul canal qui gagne contre la regle scopee
        // `.origam-data-table-group-header-row { color: … }` (0,2,0)
        // — cf. CLAUDE.md, « Strategy A », canal de premier plan.
        expect(wrapper.attributes('style') ?? '').toContain('color:')
    })

    it('deux intents distincts produisent deux rendus distincts', () => {
        // Test de mutation : avant le cablage les deux cotes rendaient
        // exactement la meme chose et l'assertion tombait.
        const primary = mountRow({color: 'primary'})
        const success = mountRow({color: 'success'})

        expect(primary.classes()).not.toEqual(success.classes())
        expect(primary.attributes('style')).not.toBe(success.attributes('style'))
    })

    it('sans `color`, aucune classe utilitaire ni style de couleur', () => {
        const wrapper = mountRow()

        expect(wrapper.classes().some((c) => c.startsWith('origam--color-'))).toBe(false)
        expect(wrapper.attributes('style') ?? '').not.toContain('color:')
    })
})

describe('OrigamDataTableGroupHeaderRow — prop d\'abord, contexte en repli (#548)', () => {
    it('`toggleGroup` passe par la PROP quand elle est fournie', async () => {
        const fromProp = vi.fn()
        const fromContext = vi.fn()

        const wrapper = mountRow(
            {toggleGroup: fromProp},
            {group: {toggleGroup: fromContext}}
        )

        await wrapper.find('button').trigger('click')

        // Test de mutation : avant le correctif le binding `<script setup>`
        // l'emportait, donc `fromContext` etait appele et `fromProp` jamais.
        expect(fromProp).toHaveBeenCalledTimes(1)
        expect(fromProp).toHaveBeenCalledWith(GROUP)
        expect(fromContext).not.toHaveBeenCalled()
    })

    it('`toggleGroup` retombe sur le contexte quand la prop est absente', async () => {
        const fromContext = vi.fn()

        const wrapper = mountRow({}, {group: {toggleGroup: fromContext}})

        await wrapper.find('button').trigger('click')

        // Le repli est ce qui garde l'usage dans `<OrigamDataTable>` intact.
        expect(fromContext).toHaveBeenCalledTimes(1)
    })

    it('`isSelected` passe par la PROP quand elle est fournie', () => {
        const wrapper = mountRow(
            {isSelected: () => true},
            {select: {isSelected: () => false}}
        )

        // La case du groupe reflete la prop, pas le contexte.
        expect(wrapper.findComponent({name: 'OrigamCheckboxBtn'}).props('modelValue')).toBe(true)
    })

    it('`isSelected` retombe sur le contexte quand la prop est absente', () => {
        const wrapper = mountRow({}, {select: {isSelected: () => true}})

        expect(wrapper.findComponent({name: 'OrigamCheckboxBtn'}).props('modelValue')).toBe(true)
    })
})

describe('OrigamDataTableGroupHeaderRow — la surface retiree (#548, BREAKING)', () => {
    it('les sept props de padding ne sont plus declarees', () => {
        const declared = Object.keys(
            (OrigamDataTableGroupHeaderRow as unknown as { props: Record<string, unknown> }).props ?? {}
        )

        // Le modele de boite CSS ignore `padding` sur `display: table-row` :
        // ces props n'avaient aucun objet sur cette racine.
        for (const name of [
            'padding', 'paddingInline', 'paddingBlock',
            'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'
        ]) {
            expect(declared).not.toContain(name)
        }
    })

    it('les quatre props sans site de consommation ne sont plus declarees', () => {
        const declared = Object.keys(
            (OrigamDataTableGroupHeaderRow as unknown as { props: Record<string, unknown> }).props ?? {}
        )

        expect(declared).not.toContain('internalItem')
        expect(declared).not.toContain('isExpanded')
        expect(declared).not.toContain('toggleExpand')
        expect(declared).not.toContain('toggleSelect')
    })

    it('les cinq props restantes sont bien la', () => {
        const declared = Object.keys(
            (OrigamDataTableGroupHeaderRow as unknown as { props: Record<string, unknown> }).props ?? {}
        )

        for (const name of ['index', 'item', 'columns', 'isSelected', 'toggleGroup', 'color']) {
            expect(declared).toContain(name)
        }
    })

    it('⛔ une cle retiree passee malgre tout ne se serialise PAS en attribut DOM', () => {
        // Aucun composant du DS ne pose `inheritAttrs: false` : une cle non
        // declaree tombe dans `$attrs` et Vue la pose en ATTRIBUT sur la
        // racine — ici un `<tr>`. Une FONCTION y serait serialisee en chaine
        // (`toggleexpand="(item) => {…}"`). D'ou le constructeur borne
        // `groupHeaderRowProps()` cote `<OrigamDataTableRows>`.
        //
        // Ce test documente le mecanisme qu'il fallait contourner : il MONTRE
        // la fuite quand la cle est passee directement.
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        const wrapper = mountRow({toggleExpand: (i: unknown) => i})

        warn.mockRestore()

        expect(wrapper.attributes('toggleexpand')).toBeDefined()
    })
})
