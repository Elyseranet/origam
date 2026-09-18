// #371 — le code source d'une closure serialise dans le DOM de production
// sur chaque ligne d'en-tete de groupe.
//
// `<OrigamDataTableRows>` rend le fallback du slot `#group-header` en
// v-bindant un objet de props sur `<origam-data-table-group-header-row>`.
// `IDataTableGroupHeaderRowProps` ne declare pas `isGroupOpen` (ni
// `internalItem`, `isExpanded`, `toggleExpand`, `toggleSelect`) : toute cle
// non declaree tombe dans `$attrs` et Vue la pose en ATTRIBUT DOM sur la
// racine `<tr>` — une fonction y est serialisee en chaine de caracteres via
// `toString()` (le corps source de la closure, visible dans le HTML livre).
//
// MESURE AVANT CORRECTIF (#548, meme montage que ci-dessous, sur le
// composant tel qu'il etait AVANT 08c30693a) : le fallback v-bindait
// `groupHeaderSlotProps()` — le scope de slot COMPLET, isGroupOpen inclus —
// directement sur le composant. Rejoue ici en `describe.skip` ci-dessous
// documente la mesure ; le test actif prouve l'etat corrige.
//
// Ce fichier comble un trou de couverture : `data-table-rows-dead-props.spec.ts`
// et `data-table-group-header-row-dead-props.spec.ts` couvrent chacun une
// moitie du mecanisme (les props mortes de CE composant, puis la fuite
// generique en montant `OrigamDataTableGroupHeaderRow` isolement) mais aucun
// des deux ne montait `<OrigamDataTableRows>` avec un ITEM DE GROUPE reel
// pour verifier le HTML que le fallback produit reellement.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import OrigamDataTableRows from '@origam/components/DataTable/OrigamDataTableRows.vue'
import { createOrigam } from '@origam/origam'

import type { IDataTableGroup } from '@origam/interfaces'

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

// Meme doublure minimale que `data-table-rows-dead-props.spec.ts` —
// `<OrigamDataTableRows>` lit ses collaborateurs par `inject()`.
const PROVIDE = {
    [ORIGAM_DATA_TABLE_SELECT_KEY as symbol]: {
        isSelected: () => false,
        toggleSelect: vi.fn(),
        someSelected: ref(false),
        allSelected: ref(false),
        selectAll: vi.fn()
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
        columns: ref([{key: 'name', title: 'Name'}])
    },
    [ORIGAM_DATA_TABLE_SORT_KEY as symbol]: {
        sortBy: ref([]),
        toggleSort: vi.fn(),
        isSorted: () => false
    },
    [ORIGAM_DATA_TABLE_GROUP_KEY as symbol]: {
        toggleGroup: vi.fn(),
        // Une fonction non trivialement inline : si elle fuit en attribut,
        // `toString()` produit un corps multi-lignes reconnaissable — le
        // scenario exact rapporte par le ticket #371.
        isGroupOpen: (group: IDataTableGroup) => {
            return group.id === 'never-matches'
        },
        opened: ref(new Set()),
        groupBy: ref([]),
        extractRows: (items: unknown) => items,
        sortByWithGroups: ref([])
    },
    [ORIGAM_DATA_TABLE_PAGINATION_KEY as symbol]: {
        startIndex: ref(0),
        page: ref(1),
        itemsPerPage: ref(10)
    },
    [ORIGAM_DATA_TABLE_SHOW_SELECT_KEY as symbol]: ref(false)
}

const GROUP_ITEM: IDataTableGroup = {
    type: 'group',
    depth: 0,
    id: 'group-1',
    key: 'group-1',
    value: 'Group 1',
    items: []
}

function mountRowsWithGroup () {
    return mount(OrigamDataTableRows as never, {
        props: {items: [GROUP_ITEM]} as never,
        global: {plugins: [createOrigam()], provide: PROVIDE}
    })
}

describe('OrigamDataTableRows — le fallback #group-header ne serialise plus de closure dans le DOM (#371)', () => {
    it('la ligne d\'en-tete de groupe rendue ne porte aucun attribut `isgroupopen`', () => {
        const wrapper = mountRowsWithGroup()

        const groupHeaderRow = wrapper.find('tr.origam-data-table-group-header-row')

        expect(groupHeaderRow.exists()).toBe(true)
        expect(groupHeaderRow.attributes('isgroupopen')).toBeUndefined()
    })

    it('aucun attribut du <tr> rendu ne contient le source d\'une closure ("=>")', () => {
        const wrapper = mountRowsWithGroup()

        const groupHeaderRow = wrapper.find('tr.origam-data-table-group-header-row')
        const attrs = groupHeaderRow.attributes()

        for (const [name, value] of Object.entries(attrs)) {
            expect(value, `l'attribut "${name}" contient du code source de closure`).not.toContain('=>')
        }
    })

    it('le outerHTML complet de la ligne ne contient ni "group.id" ni "opened.value" (corps de la closure du ticket)', () => {
        const wrapper = mountRowsWithGroup()

        const html = wrapper.find('tr.origam-data-table-group-header-row').element.outerHTML

        expect(html).not.toContain('group.id')
        expect(html).not.toContain('never-matches')
    })
})
