// #550 (critere C7) — le relais de slots de la famille DataTable.
//
// MESURE AVANT CORRECTIF (meme montage que ci-dessous, `develop` @ 925784a5) :
//
//   #loading            → contenu custom rendu : false
//   #no-data            → contenu custom rendu : false
//   #item               → contenu custom rendu : false
//   #group-header       → contenu custom rendu : false
//   #expanded-row       → contenu custom rendu : false
//   #data-table-group   → contenu custom rendu : false
//   #item.commits       → contenu custom rendu : false
//   #header.commits     → contenu custom rendu : false
//   @expand / @select   → 0 appel du handler apres clic
//
// `<OrigamDataTable>` montait `<origam-data-table-rows>` et
// `<origam-data-table-headers>` SANS ENFANT : tout ce que les descendants
// declaraient etait inatteignable depuis la racine, alors que les stories
// de cinq composants de la famille le demontraient.
//
// Ces assertions portent sur du CONTENU RENDU et des HANDLERS APPELES —
// jamais sur `getComputedStyle`, aveugle aux `var()` sous jsdom (#398).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamDataTable from '@origam/components/DataTable/OrigamDataTable.vue'
import { createOrigam } from '@origam/origam'

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

const HEADERS = [
    {title: 'Name', key: 'name'},
    {title: 'Team', key: 'team'},
    {title: 'Commits', key: 'commits'}
]

const ITEMS = [
    {name: 'Alice', team: 'Frontend', commits: 142},
    {name: 'Bob', team: 'Backend', commits: 98}
]

function mountTable (options: Record<string, unknown> = {}) {
    return mount(OrigamDataTable as never, {
        props: {headers: HEADERS, items: ITEMS, ...(options.props as object ?? {})} as never,
        slots: (options.slots ?? {}) as never,
        attrs: (options.attrs ?? {}) as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamDataTable — slots relayes a <OrigamDataTableRows> (#550, C7)', () => {
    // ⛔ `await nextTick()` n'est pas cosmetique : `<OrigamDataTable>` derive
    // les props de ses enfants d'un `filterProps` appele sur un `ref` de
    // composant, vide au PREMIER rendu. Sans le tick, `loading` n'a pas
    // encore atteint `<OrigamDataTableRows>` et la table s'affiche meme en
    // disposition mobile (le `mobileBreakpoint` non plus n'est pas arrive).
    it('#loading remplace la ligne de chargement', async () => {
        const wrapper = mountTable({
            props: {items: [], loading: true},
            slots: {loading: '<tr><td class="sonde-loading">Chargement maison</td></tr>'}
        })

        await nextTick()

        expect(wrapper.find('.sonde-loading').exists()).toBe(true)
        expect(wrapper.text()).toContain('Chargement maison')
    })

    it('#no-data remplace la ligne « aucune donnee »', () => {
        const wrapper = mountTable({
            props: {items: []},
            slots: {'no-data': '<span class="sonde-empty">Rien ici</span>'}
        })

        expect(wrapper.find('.sonde-empty').exists()).toBe(true)
    })

    it('#item remplace la ligne entiere et recoit son scope', async () => {
        const wrapper = mountTable({
            slots: {item: '<tr class="sonde-item"><td>{{ params.item.name }}</td></tr>'}
        })

        await nextTick()

        const rows = wrapper.findAll('.sonde-item')

        expect(rows).toHaveLength(ITEMS.length)
        expect(rows[0].text()).toBe('Alice')
    })

    it('#group-header remplace la ligne de groupe et recoit son scope', () => {
        const wrapper = mountTable({
            props: {groupBy: [{key: 'team', order: 'asc'}]},
            slots: {'group-header': '<tr class="sonde-group"><td>{{ params.item.value }}</td></tr>'}
        })

        const groups = wrapper.findAll('.sonde-group')

        expect(groups.length).toBeGreaterThan(0)
        expect(groups.map((g) => g.text())).toContain('Backend')
    })

    it('#expanded-row est rendu sous une ligne depliee', async () => {
        const wrapper = mountTable({
            props: {showExpand: true},
            slots: {'expanded-row': '<tr class="sonde-expanded"><td>Detail</td></tr>'}
        })

        expect(wrapper.find('.sonde-expanded').exists()).toBe(false)

        await wrapper.findAll('.origam-data-table-row__column--expanded-row button')[0].trigger('click')
        await nextTick()

        expect(wrapper.find('.sonde-expanded').exists()).toBe(true)
    })
})

describe('OrigamDataTable — slots relayes deux crans plus bas (#550, C7)', () => {
    it('#data-table-group atteint <OrigamDataTableGroupHeaderRow>', () => {
        const wrapper = mountTable({
            props: {groupBy: [{key: 'team', order: 'asc'}]},
            slots: {'data-table-group': '<td class="sonde-group-cell">{{ params.count }}</td>'}
        })

        expect(wrapper.find('.sonde-group-cell').exists()).toBe(true)
    })

    it('#item.{cle} atteint la cellule de <OrigamDataTableRow>', () => {
        const wrapper = mountTable({
            slots: {'item.commits': '<b class="sonde-cell">{{ params.value }} commits</b>'}
        })

        const cells = wrapper.findAll('.sonde-cell')

        expect(cells).toHaveLength(ITEMS.length)
        expect(cells[0].text()).toBe('142 commits')
    })

    it('#header.{cle} atteint le <th> de <OrigamDataTableHeaderCell>', async () => {
        const wrapper = mountTable({
            slots: {'header.commits': '<b class="sonde-header">Total</b>'}
        })

        await nextTick()

        const header = wrapper.find('.sonde-header')

        expect(header.exists()).toBe(true)
        expect(header.element.closest('th')).not.toBeNull()
    })

    it('#item.data-table-select remplace la case a cocher de ligne', () => {
        const wrapper = mountTable({
            props: {showSelect: true},
            slots: {'item.data-table-select': '<i class="sonde-select"/>'}
        })

        expect(wrapper.findAll('.sonde-select')).toHaveLength(ITEMS.length)
    })

    it('#item.data-table-expand remplace le bouton de depliage', () => {
        const wrapper = mountTable({
            props: {showExpand: true},
            slots: {'item.data-table-expand': '<i class="sonde-expand"/>'}
        })

        expect(wrapper.findAll('.sonde-expand')).toHaveLength(ITEMS.length)
    })

    it('les noms reserves header.mobile / header.loader ne partent PAS vers une colonne', async () => {
        const wrapper = mountTable({
            props: {loading: true},
            slots: {'header.loader': '<span class="sonde-loader">…</span>'}
        })

        await nextTick()

        // Un seul rendu — celui du slot `loader` d'<OrigamDataTableHeaders>.
        // S'il partait aussi dans la famille colonne, il y en aurait un par
        // colonne d'en-tete.
        expect(wrapper.findAll('.sonde-loader')).toHaveLength(1)
    })
})

describe('OrigamDataTable — emits `expand` / `select` relayes depuis la ligne (#550, C7)', () => {
    it('un clic sur le bouton de depliage remonte `expand` avec sa charge utile', async () => {
        const wrapper = mountTable({props: {showExpand: true}})

        await wrapper.findAll('.origam-data-table-row__column--expanded-row button')[0].trigger('click')

        const events = wrapper.emitted('expand')

        expect(events).toHaveLength(1)
        expect((events?.[0][0] as { value: boolean }).value).toBe(true)
        expect((events?.[0][0] as { item: { raw: unknown } }).item.raw).toEqual(ITEMS[0])
    })

    it('un clic sur la case de selection remonte `select` avec sa charge utile', async () => {
        const wrapper = mountTable({props: {showSelect: true}})

        await wrapper.findAll('.origam-data-table-row__column--select-row input')[0].trigger('click')

        const events = wrapper.emitted('select')

        expect(events).toHaveLength(1)
        expect((events?.[0][0] as { item: { raw: unknown } }).item.raw).toEqual(ITEMS[0])
    })
})
