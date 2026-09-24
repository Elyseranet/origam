/*
 * #790 — l'`id` du consommateur atteint-il le DOM ?
 *
 * ⛔ COMPARAISON EXACTE D'ATTRIBUT. Le lot corrige ici est reste invisible des
 * mois parce que l'instrument testait une SOUS-CHAINE (`html.includes(id)`),
 * que toute derivation satisfait : `mon-champ` est contenu dans
 * `mon-champ-messages`. Toute assertion de ce fichier passe donc par
 * `getAttribute('id') === ID`, jamais par le HTML serialise.
 *
 * ⛔ CONTROLE POSITIF. Les deux derniers `describe` montent des composants qui
 * transmettaient DEJA correctement leur id et doivent continuer. Sans eux, un
 * rouge ne distingue pas « le composant perd l'id » de « la sonde regarde le
 * mauvais noeud ».
 *
 * A/B contre le commit parent : ces assertions rougissent AVANT le correctif
 * (mesure reportee dans la PR), vertes apres.
 */

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { computed, nextTick, ref } from 'vue'
import { createOrigam } from '@origam/origam'

import OrigamOtpInputField from '@origam/components/OtpInputField/OrigamOtpInputField.vue'
import OrigamDataTableHeadersCell from '@origam/components/DataTable/OrigamDataTableHeadersCell.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'
import OrigamCheckbox from '@origam/components/Checkbox/OrigamCheckbox.vue'

import {
    ORIGAM_DATA_TABLE_EXPAND_KEY,
    ORIGAM_DATA_TABLE_GROUP_KEY,
    ORIGAM_DATA_TABLE_HEADERS_KEY,
    ORIGAM_DATA_TABLE_PAGINATION_KEY,
    ORIGAM_DATA_TABLE_SELECT_KEY,
    ORIGAM_DATA_TABLE_SORT_KEY
} from '@origam/consts/DataTable/data-table.const'
import type { IInternalDataTableHeader } from '@origam/interfaces/DataTable/data-table-header.interface'

/*
 * Harnais minimal pour `OrigamDataTableHeadersCell`, qui exige le contexte
 * injecte par un vrai `<OrigamDataTable>`. Duplique volontairement la forme
 * de `audit/id-forwarding-fixtures.ts` plutot que de l'importer : ce fichier
 * d'audit tire `@origam/consts/**` via des chemins que la config vitest de
 * TU ne resout pas. Les stubs respectent la FORME lue par le composant ; leur
 * comportement est un no-op, on mesure l'`id`, pas le tri ni la pagination.
 */
const DATA_TABLE_COLUMN: IInternalDataTableHeader = {
    key: 'name',
    value: 'name',
    title: 'Name',
    sortable: true
}

const stubDataTableProvide = () => ({
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
})

const FIXTURES: Record<string, { props?: Record<string, unknown>, provide?: () => object }> = {
    OrigamDataTableHeadersCell: {
        props: { headers: [[DATA_TABLE_COLUMN]] },
        provide: stubDataTableProvide
    }
}

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
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = vi.fn()
global.ResizeObserver = vi.fn(class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}) as any
global.IntersectionObserver = vi.fn(class {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
}) as any

const ID = 'mon-champ'
const origam = createOrigam()

const mountWith = (Cmp: any, name: string) => {
    const fixture = FIXTURES[name]

    return mount(Cmp, {
        props: { id: ID, ...fixture?.props },
        global: {
            plugins: [origam],
            stubs: { teleport: true, transition: false },
            provide: fixture?.provide?.()
        }
    })
}

/** Tous les noeuds portant un id, racine comprise. */
const idNodes = (wrapper: any): HTMLElement[] => {
    const root = wrapper.element as HTMLElement
    const scope: HTMLElement = root?.nodeType === 1 ? root : (root.parentElement as HTMLElement)

    return [
        ...(scope?.hasAttribute?.('id') ? [scope] : []),
        ...Array.from(scope?.querySelectorAll<HTMLElement>('[id]') ?? [])
    ]
}

/** ⛔ EXACT — jamais `includes`. */
const carriesExactly = (wrapper: any, id: string) =>
    idNodes(wrapper).some((e) => e.getAttribute('id') === id)

const renderedIds = (wrapper: any) => idNodes(wrapper).map((e) => e.getAttribute('id'))

describe('#790 — OrigamOtpInputField', () => {
    it('pose l id du consommateur sur sa racine, en valeur EXACTE', async () => {
        const wrapper = mountWith(OrigamOtpInputField, 'OrigamOtpInputField')

        await nextTick()
        await nextTick()

        expect((wrapper.element as HTMLElement).getAttribute('id')).toBe(ID)
        wrapper.unmount()
    })

    it('n emet pas d id en double', async () => {
        const wrapper = mountWith(OrigamOtpInputField, 'OrigamOtpInputField')

        await nextTick()
        await nextTick()

        const ids = renderedIds(wrapper)

        expect(ids.filter((v) => v === ID)).toHaveLength(1)
        wrapper.unmount()
    })
})

describe('#790 — OrigamDataTableHeadersCell', () => {
    it('pose l id du consommateur sur sa premiere ligne d en-tetes, en valeur EXACTE', async () => {
        const wrapper = mountWith(OrigamDataTableHeadersCell, 'OrigamDataTableHeadersCell')

        await nextTick()
        await nextTick()

        expect(carriesExactly(wrapper, ID)).toBe(true)
        wrapper.unmount()
    })

    it('n emet pas d id en double', async () => {
        const wrapper = mountWith(OrigamDataTableHeadersCell, 'OrigamDataTableHeadersCell')

        await nextTick()
        await nextTick()

        const ids = renderedIds(wrapper)

        expect(ids.filter((v) => v === ID)).toHaveLength(1)
        wrapper.unmount()
    })
})

/*
 * ⛔ CONTROLES POSITIFS — ces deux-la transmettaient deja correctement. Ils
 * montent le MEME OrigamInput que les cas ci-dessus et doivent rester verts
 * AVANT comme APRES : c'est ce qui distingue un vrai defaut d'une sonde qui
 * regarde le mauvais noeud.
 */
describe('#790 — controle positif : OrigamTextField', () => {
    it('pose l id du consommateur sur un element LABELABLE (cible valide d un <label for>)', async () => {
        const wrapper = mountWith(OrigamTextField, 'OrigamTextField')

        await nextTick()
        await nextTick()

        const carrier = idNodes(wrapper).find((e) => e.getAttribute('id') === ID)

        expect(carrier).toBeTruthy()
        expect(carrier!.tagName).toBe('INPUT')
        wrapper.unmount()
    })
})

describe('#790 — controle positif : OrigamCheckbox', () => {
    it('pose l id du consommateur sur un element LABELABLE', async () => {
        const wrapper = mountWith(OrigamCheckbox, 'OrigamCheckbox')

        await nextTick()
        await nextTick()

        const carrier = idNodes(wrapper).find((e) => e.getAttribute('id') === ID)

        expect(carrier).toBeTruthy()
        expect(carrier!.tagName).toBe('INPUT')
        wrapper.unmount()
    })
})
