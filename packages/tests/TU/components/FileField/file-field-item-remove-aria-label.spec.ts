// Regression for #418 — the remove button on both OrigamFileFieldListItem
// and OrigamFileFieldDragNDropItem was icon-only with no accessible name.
// A screen reader announced "button" for a DESTRUCTIVE action (removing a
// file), with no indication of what it would remove.
//
// A second-locale check is mandatory here (cf. CLAUDE.md): under 'en', a
// hardcoded English string is indistinguishable from its own translation —
// an en-only test still passes WITH the bug.
// `origam.file_field.remove_aria_label` renders "Remove {0}" in English and
// "Supprimer {0}" in French; asserting the FR string (with the real file
// name interpolated) proves the name flows through `t()` / the injected
// locale instance, not a literal baked into the template.
//
// Also covers the sibling defect found in the same file family: `showSize`
// accepts `boolean | 1000 | 1024`, but nothing gated the size line on it —
// `false` and `true` rendered identical output. The story's own control
// labelled `false` as "(hidden)", which the component never honoured.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamFileFieldListItem from '@origam/components/FileField/OrigamFileFieldListItem.vue'
import OrigamFileFieldDragNDropItem from '@origam/components/FileField/OrigamFileFieldDragNDropItem.vue'
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

const mockFile = (name = 'test.pdf', size = 2000): File => {
    const blob = new Blob([''], { type: 'application/pdf' })
    const file = new File([blob], name, { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: size })
    return file
}

function mountComponent (component: typeof OrigamFileFieldListItem | typeof OrigamFileFieldDragNDropItem, props: Record<string, unknown> = {}, locale = 'en') {
    return mount(component, {
        props: { file: mockFile(), index: 0, ...props } as never,
        global: {
            plugins: [createOrigam({ locale: { locale } } as never)],
            stubs: {
                OrigamIcon: { template: '<i />' },
                OrigamProgress: { template: '<div />' }
            }
        }
    })
}

describe.each([
    ['OrigamFileFieldListItem', OrigamFileFieldListItem, '.origam-file-field-list-item__meta'],
    ['OrigamFileFieldDragNDropItem', OrigamFileFieldDragNDropItem, '.origam-file-field-dragndrop-item__meta']
] as const)('%s — remove button accessible name + showSize gating (#418)', (_name, Component, metaSelector) => {
    it('carries an aria-label naming the file, in English', () => {
        const wrapper = mountComponent(Component, { file: mockFile('report.pdf') })

        expect(wrapper.find('.origam-btn').attributes('aria-label')).toBe('Remove report.pdf')
    })

    it('carries the FR-translated aria-label, proving it flows through the real i18n system', () => {
        const wrapper = mountComponent(Component, { file: mockFile('rapport.pdf') }, 'fr')

        expect(wrapper.find('.origam-btn').attributes('aria-label')).toBe('Supprimer rapport.pdf')
    })

    it('showSize=false hides the size line entirely', () => {
        const wrapper = mountComponent(Component, { showSize: false })

        expect(wrapper.find(metaSelector).exists()).toBe(false)
    })

    it('showSize=true shows the size line', () => {
        const wrapper = mountComponent(Component, { showSize: true })

        expect(wrapper.find(metaSelector).exists()).toBe(true)
    })

    it('showSize unset resolves to hidden — Vue\'s own Boolean-prop coercion turns an unset ' +
        '`boolean | 1000 | 1024` prop into `false` at runtime (no `default` is declared for it), ' +
        'matching OrigamFileField\'s own explicit `showSize: false` default rather than the ' +
        'pre-fix "always shown regardless of value" behaviour', () => {
        const wrapper = mountComponent(Component, {})

        expect(wrapper.find(metaSelector).exists()).toBe(false)
    })

    it('showSize=1000/1024 both show the size line (they only pick the unit system)', () => {
        expect(mountComponent(Component, { showSize: 1000 }).find(metaSelector).exists()).toBe(true)
        expect(mountComponent(Component, { showSize: 1024 }).find(metaSelector).exists()).toBe(true)
    })

    // #418 — "click:remove marche, mais rien ne le prouve": the story has an
    // "Events - click:remove" Variant but no e2e/unit spec ever asserted the
    // emitted payload. Clicking the (now-named) remove button must emit the
    // exact `{ file, index }` shape the parent `OrigamFileField` depends on
    // to splice the right entry out of its model.
    it('clicking the remove button emits click:remove with the exact { file, index } payload', async () => {
        const file = mockFile('to-remove.pdf')
        const wrapper = mountComponent(Component, { file, index: 2 })

        await wrapper.find('.origam-btn').trigger('click')

        expect(wrapper.emitted('click:remove')).toHaveLength(1)
        expect(wrapper.emitted('click:remove')![0]).toEqual([{ file, index: 2 }])
    })
})
