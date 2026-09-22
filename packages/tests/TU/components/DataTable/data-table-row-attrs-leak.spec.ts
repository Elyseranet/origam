// #371 (point 4) — `<OrigamDataTableRow>` laissait fuir des attributs DOM
// non standard sur chaque ligne d'item : `index="0" mobile="false"`.
//
// Meme mecanisme qu'au point 1 (deja corrige, `08c30693a`), une famille
// plus loin : `<OrigamDataTableRows>` construit l'objet `props` de
// `itemSlotProps()` avec des cles que `IDataTableRowProps` (`item`,
// `cellProps`, et `id`/`class`/`style`/`mobileBreakpoint` heritees) ne
// declare pas — `index` et `mobile`. Une cle non declaree ne disparait pas :
// elle tombe dans `$attrs`, et le `v-bind="$attrs"` du `<tr>` racine
// d'`<OrigamDataTableRow>` la pose en ATTRIBUT DOM sur CHAQUE ligne rendue.
//
// `index` n'etait lu nulle part dans `OrigamDataTableRow.vue`. `mobile`
// etait un residu : la ligne calcule deja son propre `mobile` via
// `useDisplay(props)` a partir de `mobileBreakpoint` (forwarde separement,
// cf. commentaire adjacent dans `itemSlotProps()`) — un fix anterieur a
// ajoute `mobileBreakpoint` sans retirer l'ancienne cle `mobile` qu'il
// remplacait.
//
// MESURE AVANT CORRECTIF (meme montage que ci-dessous, sur le composant tel
// qu'il etait avant ce commit) :
//
//   <tr class="origam-data-table-row …" index="0" mobile="false" aria-rowindex="2">
//
// ⛔ A/B REEL exige par le brief : rejoue contre le commit parent, ce test
// echoue en reproduisant EXACTEMENT ces deux attributs (voir le commit de
// ce fichier pour la preuve `git stash`-free — `git show <sha>^:… `).
//
// ⚠️ Choix d'outil assume : c'est une mesure d'ATTRIBUT DOM (chaine
// litterale posee par le fallthrough), pas une resolution `var()` en CSS —
// jsdom est fiable ici (cf. CLAUDE.md #398), un navigateur reel n'aurait
// rien apporte de plus.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import OrigamDataTableRows from '@origam/components/DataTable/OrigamDataTableRows.vue'
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

// Meme doublure minimale que les autres specs `OrigamDataTableRows` —
// le composant lit ses collaborateurs par `inject()`.
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
        isGroupOpen: () => true,
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

const ITEM = {
    type: 'item',
    key: 'row-1',
    index: 0,
    value: 'row-1',
    selectable: true,
    raw: {name: 'Item 1'},
    columns: {name: 'Item 1'}
}

function mountRowsWithItem () {
    return mount(OrigamDataTableRows as never, {
        props: {items: [ITEM]} as never,
        global: {plugins: [createOrigam()], provide: PROVIDE}
    })
}

describe('OrigamDataTableRows — la ligne d\'item ne laisse plus fuir `index` / `mobile` en attributs DOM (#371)', () => {
    it('la ligne rendue ne porte pas d\'attribut `index`', () => {
        const wrapper = mountRowsWithItem()

        const row = wrapper.find('tr.origam-data-table-row')

        expect(row.exists()).toBe(true)
        expect(row.attributes('index')).toBeUndefined()
    })

    it('la ligne rendue ne porte pas d\'attribut `mobile`', () => {
        const wrapper = mountRowsWithItem()

        const row = wrapper.find('tr.origam-data-table-row')

        expect(row.attributes('mobile')).toBeUndefined()
    })

    it('`aria-rowindex`, un attribut ARIA valide et voulu, continue de passer', () => {
        // Non-regression : le correctif retire des cles mortes, pas le
        // canal de fallthrough lui-meme — `aria-rowindex` doit toujours
        // atteindre le DOM.
        const wrapper = mountRowsWithItem()

        const row = wrapper.find('tr.origam-data-table-row')

        expect(row.attributes('aria-rowindex')).toBe('2')
    })
})
