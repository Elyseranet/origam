// Regression coverage for #424 (second half) — "le rôle doit décrire ce que le
// composant EST".
//
// `<origam-list>` hard-coded `role="listbox"` on its root, unconditionally. A
// listbox is a SELECTION widget: it promises `role="option"` children carrying
// `aria-selected`, and a screen reader announces it as "list box, N items,
// selected …". A navigation list, a list of subheaders and dividers, a menu's
// item list — none of those are selection widgets, and announcing them as one
// is exactly the "bad ARIA" the W3C rule warns about.
//
// The two modes this spec pins, by their EXACT role (a test asserting the role
// merely "changed" would be worthless):
//
//   mode liste      → root `role="list"`,    rows `role="listitem"`
//   mode sélection  → root `role="listbox"`, rows `role="option"` + aria-selected
//
// Selection mode is entered when the CONSUMER opts in, by passing `selected`
// (typically `v-model:selected`) or an explicit `selectStrategy` — the two
// things `<origam-select>` passes, and the two things `<origam-menu>` does not.
// `selectStrategy` has a `withDefaults` value, so "passed" is read off
// `vnode.props` via `usePassedProps`, never off `props.selectStrategy`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamList from '@origam/components/List/OrigamList.vue'
import OrigamListItem from '@origam/components/List/OrigamListItem.vue'
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

const ITEMS = [
    { type: 'subheader', title: 'Section A' },
    { title: 'Item 1', value: 1 },
    { type: 'divider' },
    { title: 'Item 2', value: 2 }
]

function mountList (props: Record<string, unknown> = {}) {
    return mount(OrigamList, {
        props: { items: ITEMS, ...props } as never,
        global: { plugins: [ createOrigam() ] }
    })
}

const rowRoles = (wrapper: ReturnType<typeof mountList>) =>
    wrapper.findAll('.origam-list-item').map((r) => r.attributes('role'))

describe('OrigamList — mode liste (aucune sélection demandée)', () => {
    it('the root announces itself as a plain list, not a selection widget', () => {
        expect(mountList().attributes('role')).toBe('list')
    })

    it('every row announces itself as a list item', () => {
        expect(rowRoles(mountList())).toEqual([ 'listitem', 'listitem' ])
    })

    it('a list row carries no aria-selected — there is nothing to select', () => {
        const rows = mountList().findAll('.origam-list-item')
        for (const row of rows) expect(row.attributes('aria-selected')).toBeUndefined()
    })

    it('the subheader and the divider stay out of the row roles entirely', () => {
        const wrapper = mountList()
        expect(wrapper.find('.origam-list-subheader').attributes('role')).toBeUndefined()
        // `<origam-divider>` owns its own `role="separator"`.
        expect(wrapper.find('hr').attributes('role')).toBe('separator')
    })
})

describe('OrigamList — mode sélection via `selected` (v-model:selected)', () => {
    it('the root announces itself as a listbox', () => {
        expect(mountList({ selected: [ 1 ] }).attributes('role')).toBe('listbox')
    })

    it('every row announces itself as an option', () => {
        expect(rowRoles(mountList({ selected: [ 1 ] }))).toEqual([ 'option', 'option' ])
    })

    it('aria-selected mirrors the selection, option by option', () => {
        const rows = mountList({ selected: [ 1 ] }).findAll('.origam-list-item')
        expect(rows[0].attributes('aria-selected')).toBe('true')
        expect(rows[1].attributes('aria-selected')).toBe('false')
    })
})

describe('OrigamList — mode sélection via un `selectStrategy` explicite', () => {
    it('the root announces itself as a listbox', () => {
        expect(mountList({ selectStrategy: 'independent' }).attributes('role')).toBe('listbox')
    })

    it('every row announces itself as an option', () => {
        expect(rowRoles(mountList({ selectStrategy: 'independent' }))).toEqual([ 'option', 'option' ])
    })

    it('⛔ the withDefaults value alone does NOT enter selection mode', () => {
        // `selectStrategy` defaults to SINGLE_LEAF, so `props.selectStrategy`
        // is ALWAYS truthy. Reading the prop instead of `vnode.props` would put
        // every list on earth into listbox mode — the very defect being fixed.
        expect(mountList().attributes('role')).toBe('list')
    })
})

describe('OrigamList — mode sélection via un écouteur `@update:selected`', () => {
    // Un consommateur qui écoute `update:selected` DEMANDE une sélection —
    // l'emit ne part que quand elle change. C'est la forme qu'emploie la
    // Variant « Events - update:selected » de la story, qui ne lie aucun
    // `selected`.
    //
    // ⛔ Détectable via `vnode.props` (ce que lit `usePassedProps`), PAS via
    // `$attrs` : Vue retire des attrs les écouteurs d'un emit déclaré.
    const withListener = () => mount(OrigamList, {
        props: { items: ITEMS } as never,
        attrs: { 'onUpdate:selected': () => undefined },
        global: { plugins: [ createOrigam() ] }
    })

    it('the root announces itself as a listbox', () => {
        expect(withListener().attributes('role')).toBe('listbox')
    })

    it('every row announces itself as an option', () => {
        expect(rowRoles(withListener())).toEqual([ 'option', 'option' ])
    })
})

describe('OrigamList — un `role` explicite du consommateur fait autorité', () => {
    it('keeps a consumer-supplied role on the root', () => {
        expect(mountList({ role: 'menu' }).attributes('role')).toBe('menu')
    })
})

describe('OrigamListItem — hors de toute liste', () => {
    it('carries no role at all: no ARIA is better than a role whose container does not exist', () => {
        const wrapper = mount(OrigamListItem, {
            props: { title: 'Bare row' } as never,
            global: { plugins: [ createOrigam() ] }
        })
        expect(wrapper.attributes('role')).toBeUndefined()
    })
})
