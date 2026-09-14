// #550 (critere C1) — les quatre props mortes d'`<OrigamDataTableRows>`.
//
// `IDataTableRowsProps extends ILoaderProps`, qui etend lui-meme
// `ICommonsComponentProps` (`id`, `class`, `style`), `ITagProps` (`tag`) et
// `IColorProps` (`color`). Quatre de ces cinq props n'etaient lues nulle
// part dans le composant.
//
// MESURE AVANT CORRECTIF (meme montage que ci-dessous) :
//
//   attrs { class:'sonde-x', style:'outline: 2px solid red' }
//     → <tr class="origam-data-table-rows origam-data-table-rows--no-data">
//       aucune trace de la classe ni du style, ET AUCUN AVERTISSEMENT Vue.
//   props { tag:'section', color:'primary' }
//     → <tr class="origam-data-table-rows origam-data-table-rows--no-data">
//       toujours un `<tr>`, aucune classe ni style de couleur.
//
// C'est le pire des cas : declarer `class`/`style` les SORT de `$attrs`,
// donc Vue ne peut plus ni les appliquer ni avertir. Le consommateur perd
// sa classe en silence — strictement pire que si la prop n'existait pas.
//
// CORRECTIF : `class`, `style` et `tag` sont retirees de la surface
// (`Omit<ILoaderProps, 'class' | 'style' | 'tag'>`) ; `color` est cablee
// via `useTextColor` sur les deux lignes que le composant rend lui-meme.
// `id` reste : il sert de racine aux identifiants de ligne generes.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'

import OrigamDataTable from '@origam/components/DataTable/OrigamDataTable.vue'
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

// `<OrigamDataTableRows>` lit ses collaborateurs par `inject()` — normalement
// fournis par `<OrigamDataTable>`. Des doublures minimales suffisent a le
// monter isolement (meme approche que `OrigamDataTableRow.spec.ts`).
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

function mountRows (props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
    return mount(OrigamDataTableRows as never, {
        props: {items: [], ...props} as never,
        attrs,
        global: {plugins: [createOrigam()], provide: PROVIDE}
    })
}

describe('OrigamDataTableRows — `class` / `style` ne sont plus captees puis jetees (#550)', () => {
    it('la classe du consommateur atteint la ligne rendue', () => {
        const wrapper = mountRows({}, {class: 'sonde-consommateur'})

        // Test de mutation : tant que `class` etait DECLAREE comme prop,
        // Vue la retirait de `$attrs` et le template ne la bindait nulle
        // part — cette assertion tombait.
        expect(wrapper.classes()).toContain('sonde-consommateur')
    })

    it('le style du consommateur atteint la ligne rendue', () => {
        const wrapper = mountRows({}, {style: 'outline: 2px solid red'})

        // ⛔ On assert sur l'attribut brut : sous jsdom `getComputedStyle`
        // ne resout jamais un `var()` (cf. CLAUDE.md #398).
        expect(wrapper.attributes('style') ?? '').toContain('outline')
    })

    it('sur une branche a plusieurs lignes, Vue AVERTIT au lieu d\'avaler', () => {
        // Nuance mesuree, pas supposee : le fallthrough n'atterrit que sur
        // les branches a racine unique (« loading » / « no-data »). La
        // branche squelette rend cinq `<tr>` — Vue ne peut rien appliquer,
        // mais il le DIT. C'est tout le gain par rapport a l'etat d'avant :
        // la prop declaree, elle, sortait `class` de `$attrs` et personne
        // n'etait prevenu de rien.
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

        mountRows({loading: {type: 'skeleton'}}, {class: 'sonde-fragment'})

        const messages = warn.mock.calls.map((c) => String(c[0])).join(' ')
        warn.mockRestore()

        expect(messages).toContain('Extraneous non-props attributes')
        expect(messages).toContain('class')
    })
})

describe('OrigamDataTableRows — `color` peint les lignes que le composant rend (#550)', () => {
    it('la ligne « aucune donnee » porte la classe utilitaire de l\'intent', () => {
        const wrapper = mountRows({color: 'primary'})

        expect(wrapper.classes()).toContain('origam--color-primary')
    })

    it('la ligne « aucune donnee » porte la declaration inline de premier plan', () => {
        const wrapper = mountRows({color: 'primary'})

        // La declaration inline est le seul canal qui gagne contre la regle
        // scopee `.origam-data-table-rows--no-data { color: … }` (0,2,0)
        // — cf. CLAUDE.md, « Strategy A », canal de premier plan.
        expect(wrapper.attributes('style') ?? '').toContain('color:')
    })

    it('la ligne de chargement porte la meme couleur', () => {
        // ⛔ `wrapper.classes()` ne vaut RIEN ici : la branche « loading »
        // passe par deux `<template>` conditionnels imbriques, donc la
        // racine compilee est un fragment et `wrapper.element` designe son
        // ancre, pas le `<tr>`. On vise l'element reel.
        const row = mountRows({color: 'primary', loading: true}).find('tr')

        expect(row.classes()).toContain('origam-data-table-rows--loading')
        expect(row.classes()).toContain('origam--color-primary')
        expect(row.attributes('style') ?? '').toContain('color:')
    })

    it('deux intents distincts produisent deux rendus distincts', () => {
        // Test de mutation : avant le cablage, les deux cotes rendaient
        // exactement la meme chose et l'assertion tombait.
        const primary = mountRows({color: 'primary'})
        const success = mountRows({color: 'success'})

        expect(primary.classes()).not.toEqual(success.classes())
        expect(primary.attributes('style')).not.toBe(success.attributes('style'))
    })

    it('sans `color`, aucune classe utilitaire ni style de couleur', () => {
        const wrapper = mountRows()

        expect(wrapper.classes().some((c) => c.startsWith('origam--color-'))).toBe(false)
        expect(wrapper.attributes('style') ?? '').not.toContain('color:')
    })
})

describe('OrigamDataTableRows — `tag` a disparu de la surface (#550)', () => {
    it('`tag` n\'est plus une prop declaree', () => {
        // Un `<tbody>` ne peut contenir que des `<tr>` : la prop n'avait
        // aucun objet. Retiree, elle retombe dans `$attrs`, ou Vue la
        // signale au lieu de l'avaler.
        const declared = Object.keys(
            (OrigamDataTableRows as unknown as { props: Record<string, unknown> }).props ?? {}
        )

        expect(declared).not.toContain('tag')
        expect(declared).not.toContain('class')
        expect(declared).not.toContain('style')
        // `id` reste : il prefixe les identifiants de ligne generes.
        expect(declared).toContain('id')
        expect(declared).toContain('color')
    })

    it('les lignes rendues restent des `<tr>` quoi qu\'on passe', () => {
        const wrapper = mountRows({}, {tag: 'section'})

        expect((wrapper.element as HTMLElement).tagName).toBe('TR')
    })
})

describe('OrigamDataTableRows — le scenario EXACT de la story (#550)', () => {
    // La story « Design » ne monte pas `<origam-data-table-rows>` : elle rend
    // `<origam-data-table :loading="true" :color="state.color">` avec un
    // controle intitule « Loader Color ». La couleur descend par
    // `filterProps`, qui passe au fils toute prop que les deux declarent.
    // C'est ce chemin-la qu'il faut prouver, pas le montage isole.
    it('`<origam-data-table :color>` peint bien la ligne de chargement', async () => {
        const wrapper = mount(OrigamDataTable as never, {
            props: {
                headers: [{key: 'name', title: 'Name'}],
                items: [],
                loading: true,
                color: 'primary'
            } as never,
            global: {plugins: [createOrigam()]}
        })

        // `filterProps` passe par une ref de template : `undefined` au
        // premier rendu, resolue au suivant (cf. `useProps`, « one-tick
        // delta »). Sans ce tick on mesurerait le rendu 1.
        await nextTick()

        const row = wrapper.find('.origam-data-table-rows--loading')

        expect(row.exists()).toBe(true)
        expect(row.classes()).toContain('origam--color-primary')
    })
})

describe('OrigamDataTableRows — `id` reste consommee', () => {
    it('prefixe l\'identifiant des lignes squelettes', () => {
        const wrapper = mountRows({id: 'tbl', loading: {type: 'skeleton'}})

        expect(wrapper.html()).toContain('tbl-skeleton-row-1')
    })
})
