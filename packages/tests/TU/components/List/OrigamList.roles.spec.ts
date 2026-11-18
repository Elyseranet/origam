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
import axe from 'axe-core'

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

describe('OrigamList — une ligne lien porte le rôle listitem sur un conteneur, pas sur le <a> (#1249)', () => {
    const LINKS = [
        { title: 'Participants', href: '/admin/participants' },
        { title: 'Events', href: '/admin/events' }
    ]
    const mountLinks = (props: Record<string, unknown> = {}) =>
        mount(OrigamList, {
            props: { items: LINKS, itemProps: true, ...props } as never,
            attachTo: document.body,
            global: { plugins: [ createOrigam() ] }
        })

    it('the <a> keeps its implicit link role (no explicit role attribute)', () => {
        const anchors = mountLinks().findAll('a')
        expect(anchors).toHaveLength(2)
        for (const a of anchors) expect(a.attributes('role')).toBeUndefined()
    })

    it('each <a> sits directly inside a role="listitem" container, and the list counts N listitems', () => {
        const wrapper = mountLinks()
        const items = wrapper.findAll('[role="listitem"]')
        expect(items).toHaveLength(2)
        for (const item of items) {
            expect(item.element.tagName).toBe('DIV')
            expect(item.element.firstElementChild?.tagName).toBe('A')
        }
        expect(wrapper.attributes('role')).toBe('list')
    })

    it('the <a> keeps the row classes and its href', () => {
        const a = mountLinks().find('a')
        expect(a.classes()).toContain('origam-list-item')
        expect(a.attributes('href')).toBe('/admin/participants')
    })

    it('axe reports no violation on a nav list of links', async () => {
        const wrapper = mountLinks({ nav: true })
        const { violations } = await axe.run(wrapper.element as Element, { rules: { 'color-contrast': { enabled: false } } })
        expect(violations.map((v) => v.id)).toEqual([])
        wrapper.unmount()
    })

    it('modes without a link keep the flat structure: no wrapper, role on the row itself', () => {
        const wrapper = mountList()
        expect(wrapper.findAll('.origam-list-item-wrapper')).toHaveLength(0)
        expect(rowRoles(wrapper)).toEqual([ 'listitem', 'listitem' ])
        const click = mount(OrigamList, {
            props: { items: [ { title: 'A', onClick: () => {} } ], itemProps: true } as never,
            global: { plugins: [ createOrigam() ] }
        })
        expect(click.find('.origam-list-item').attributes('role')).toBe('listitem')
        expect(click.find('.origam-list-item-wrapper').exists()).toBe(false)
    })

    it('selection mode: a link row stays a flat role="option" (unchanged)', () => {
        const wrapper = mountLinks({ selectStrategy: 'single-leaf' })
        expect(wrapper.findAll('.origam-list-item-wrapper')).toHaveLength(0)
        expect(wrapper.findAll('a').map((a) => a.attributes('role'))).toEqual([ 'option', 'option' ])
    })
})
