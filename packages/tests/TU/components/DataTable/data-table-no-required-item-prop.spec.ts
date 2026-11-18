/****************************************************************************
 * data-table-no-required-item-prop.spec.ts — #1246 (doublon #1154)
 *
 * `IDataTableProps` heritait de `IDataTableRowProps` et donc de sa prop
 * `item` REQUISE (une LIGNE) : « Missing required prop: "item" » a chaque
 * montage de la table. La ligne, elle, garde `item` requis.
 ***************************************************************************/

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamDataTable from '@origam/components/DataTable/OrigamDataTable.vue'
import OrigamDataTableRow from '@origam/components/DataTable/OrigamDataTableRow.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

afterEach(() => vi.restoreAllMocks())

describe('OrigamDataTable — pas de prop de ligne requise', () => {
    it('monter la table avec headers + items ne warn pas « Missing required prop »', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mount(OrigamDataTable as never, {
            props: {headers: [{title: 'Nom', key: 'name'}], items: [{name: 'A'}]} as never,
            global: {plugins: [createOrigam()]}
        })
        await nextTick()
        const missing = warn.mock.calls.map(c => String(c[0])).filter(m => m.includes('Missing required prop'))
        expect(missing).toEqual([])
    })

    it('la table ne declare pas `item`, la ligne le garde requis', () => {
        const tableProps = (OrigamDataTable as any).props
        const rowProps = (OrigamDataTableRow as any).props
        expect(tableProps.item).toBeUndefined()
        expect(rowProps.item.required).toBe(true)
        expect(tableProps.cellProps).toBeDefined()
    })
})
