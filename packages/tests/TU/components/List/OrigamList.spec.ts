// Regression coverage for #424 — "OrigamList : divider et subheader passes
// via items rendent un ListItem casse (JSON brut affiche), et le listbox n'a
// aucun role=option".
//
// Reproduces the ticket's exact repro shape (structural `divider` / `subheader`
// entries mixed into a plain `items` array, no slot overrides) and asserts:
//   1. `type: 'divider'` / `type: 'subheader'` entries route to the real
//      `<origam-divider>` / `<origam-list-subheader>` components instead of
//      falling through to a plain `.origam-list-item` with a JSON-dumped title.
//   2. `<origam-list>` (role="listbox") only has `role="option"` on its real,
//      selectable `.origam-list-item` descendants — never on the subheader
//      (a label, not an option) nor the divider (a separator, already
//      `role="separator"` via `<origam-divider>`).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamList from '@origam/components/List/OrigamList.vue'
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

// Exact shape reported in the ticket.
const TICKET_ITEMS = [
    { type: 'subheader', title: 'Section A' },
    { title: 'Item 1', value: 1 },
    { type: 'divider' },
    { title: 'Item 2', value: 2 }
]

function mountList (props: Record<string, unknown> = {}) {
    return mount(OrigamList, {
        props: { items: TICKET_ITEMS, ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamList — structural `items` entries (divider / subheader) (#424)', () => {
    it('routes a `type: "subheader"` entry to a real OrigamListSubheader, not a plain ListItem', () => {
        const wrapper = mountList()
        const subheaders = wrapper.findAll('.origam-list-subheader')
        expect(subheaders).toHaveLength(1)
        expect(subheaders[0].text()).toContain('Section A')
    })

    it('routes a `type: "divider"` entry to a real <hr> divider, not a plain ListItem', () => {
        const wrapper = mountList()
        expect(wrapper.findAll('hr')).toHaveLength(1)
    })

    it('renders exactly the 2 real selectable rows as ListItem — not 4 (structural entries excluded)', () => {
        const wrapper = mountList()
        const items = wrapper.findAll('.origam-list-item')
        expect(items).toHaveLength(2)
        expect(items[0].text()).toContain('Item 1')
        expect(items[1].text()).toContain('Item 2')
    })

    it('never dumps the raw item object as text anywhere in the list (no JSON leak)', () => {
        const wrapper = mountList()
        expect(wrapper.text()).not.toContain('"type"')
        expect(wrapper.text()).not.toContain('[object Object]')
    })

    it('gives role="option" to every real ListItem row, and to nothing else', () => {
        const wrapper = mountList()
        const items = wrapper.findAll('.origam-list-item')
        for (const item of items) {
            expect(item.attributes('role')).toBe('option')
        }

        // The container keeps its (pre-existing) listbox role…
        expect(wrapper.attributes('role')).toBe('listbox')
        // …but the subheader (a label) and the divider (a separator) must NOT
        // also claim to be selectable options.
        const subheader = wrapper.find('.origam-list-subheader')
        expect(subheader.attributes('role')).not.toBe('option')
        const divider = wrapper.find('hr')
        expect(divider.attributes('role')).not.toBe('option')
    })

    it('exposes aria-selected on every option, reflecting the `selected` prop', () => {
        const wrapper = mountList({ selected: [1] })
        const items = wrapper.findAll('.origam-list-item')
        expect(items[0].attributes('aria-selected')).toBe('true')
        expect(items[1].attributes('aria-selected')).toBe('false')
    })

    it('does not give role="option" to a group activator row — it toggles expand/collapse, it is not a selectable option', () => {
        // A group activator's `<origam-list-item>` never calls `select()` on
        // click (see OrigamListItem's `click` handler — it early-returns when
        // `isGroupActivator` is true). Claiming `role="option"` on it would be
        // the exact "half-implemented ARIA" this ticket flags, just moved
        // one level down.
        const wrapper = mount(OrigamList, {
            props: {
                items: [
                    { title: 'Parent', value: 'p', children: [{ title: 'Child A', value: 'a' }] }
                ],
                opened: ['p']
            } as never,
            global: { plugins: [createOrigam()] }
        })

        const activator = wrapper.find('.origam-list-group-activator .origam-list-item')
        expect(activator.exists()).toBe(true)
        expect(activator.attributes('role')).not.toBe('option')

        const group = wrapper.find('.origam-list-group__items')
        const childItem = group.find('.origam-list-item')
        expect(childItem.exists()).toBe(true)
        expect(childItem.attributes('role')).toBe('option')
    })
})
