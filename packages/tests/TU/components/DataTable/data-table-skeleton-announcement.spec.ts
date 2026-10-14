import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import OrigamDataTable from '@origam/components/DataTable/OrigamDataTable.vue'
import { createOrigam } from '@origam/origam'

const headers = [
    { key: 'name', title: 'Name' },
    { key: 'amount', title: 'Amount', align: 'end' }
]

// `<OrigamDataTable>` hands its props to `<OrigamDataTableRows>` through a
// template ref, so the rows only see `loading` on the second render (the
// one-tick delta documented in `props.composable.ts`): every read is awaited.
async function mountTable (props: Record<string, unknown>) {
    const wrapper = mount(OrigamDataTable, {
        props: { headers, items: [], hideDefaultFooter: true, ...props } as never,
        global: { plugins: [createOrigam()] }
    })
    await nextTick()
    await nextTick()

    return wrapper
}

describe('OrigamDataTable — skeleton announcement (#1073 lot 2b)', () => {
    it('makes ONE announcement, outside the <table>, never inside a row', async () => {
        const wrapper = await mountTable({ loading: { type: 'skeleton' } })

        // scoped to the announcement: the header's sort <select> owns its own
        // `role="status"` messages region, which is not the table's announcement
        const statuses = wrapper.findAll('.origam-data-table__announcement[role="status"]')
        expect(statuses).toHaveLength(1)
        expect(statuses[0].element.closest('table')).toBeNull()
        expect(wrapper.find('tbody [role="status"]').exists()).toBe(false)
        expect(statuses[0].text()).toBe('Loading items...')
    })

    it('hides every placeholder row and cell, the first included', async () => {
        const wrapper = await mountTable({ loading: { type: 'skeleton' } })

        const rows = wrapper.findAll('tbody tr')
        const cells = wrapper.findAll('tbody td')
        expect(rows).toHaveLength(5)
        expect(cells).toHaveLength(10)
        expect(rows.every((r) => r.attributes('aria-hidden') === 'true')).toBe(true)
        expect(cells.every((c) => c.attributes('aria-hidden') === 'true')).toBe(true)
    })

    it('flags the table root aria-busy while the skeleton shows', async () => {
        expect((await mountTable({ loading: { type: 'skeleton' } })).attributes('aria-busy')).toBe('true')
    })

    it('uses the label of the config, then loadingText, as the announcement', async () => {
        const withText = await mountTable({ loading: { type: 'skeleton' }, loadingText: 'origam.loading' })
        expect(withText.find('.origam-data-table__announcement').text()).toBe('Loading...')

        const withLabel = await mountTable({ loading: { type: 'skeleton', label: 'Fetching invoices' } })
        expect(withLabel.find('.origam-data-table__announcement').text()).toBe('Fetching invoices')
    })

    it('adds nothing for the other kinds nor when idle', async () => {
        for (const loading of [false, true, { type: 'line' }]) {
            const wrapper = await mountTable({ loading })
            expect(wrapper.find('.origam-data-table__announcement').exists()).toBe(false)
            expect(wrapper.attributes('aria-busy')).toBeUndefined()
        }
    })
})
