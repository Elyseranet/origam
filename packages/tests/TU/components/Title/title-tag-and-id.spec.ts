// REGRESSION — <OrigamTitle> default heading level, theme override, and the
// consumer-supplied `id`.
//
// Default tag: a document may carry exactly ONE `h1`, so `h1` is the one level
// a shared component must never emit by default — two untagged titles on a
// page produced two `h1`s and broke both the heading order and the automated
// a11y audit. `h2` is the deepest level that is always valid under a
// page-owned `h1`, and repeating it is legal. The correct level still depends
// on document position, which the component cannot know, so `tag` stays
// explicit whenever it matters.
//
// `id`: unlike Btn, Title also applies its style bag inline via `:style`, so a
// rule whose selector has drifted away from the element costs no visible
// style — an inline style outranks an id rule anyway. It is still a defect
// worth pinning: the rule is injected into `<head>` for every instance, and a
// consumer reading `id` off the exposed API has to get the id that is really
// on the element.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamTitle from '@origam/components/Title/OrigamTitle.vue'
import OrigamDefaultsProvider from '@origam/components/DefaultsProvider/OrigamDefaultsProvider.vue'
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

function mountTitle (props: Record<string, unknown> = {}) {
    return mount(OrigamTitle, {
        props: { text: 'Title', ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

function cssOf (wrapper: ReturnType<typeof mountTitle>): string {
    return (wrapper.vm as unknown as { css: string }).css || ''
}

describe('OrigamTitle — default heading level', () => {
    it('renders an h2 when no tag is passed', () => {
        expect(mountTitle().element.tagName).toBe('H2')
    })

    it('never renders an h1 by default — a page owns its single h1', () => {
        expect(mountTitle().element.tagName).not.toBe('H1')
    })

    it('two untagged titles produce no duplicate h1', () => {
        const tags = [mountTitle().element.tagName, mountTitle().element.tagName]

        expect(tags.filter((tag) => tag === 'H1')).toHaveLength(0)
    })

    it('an explicit tag still wins over the default', () => {
        expect(mountTitle({ tag: 'h1' }).element.tagName).toBe('H1')
        expect(mountTitle({ tag: 'h4' }).element.tagName).toBe('H4')
    })
})

describe('OrigamTitle — tag overridable through the defaults layer', () => {
    it('a theme default restores h1 app-wide (the one-line migration path)', () => {
        const wrapper = mount(OrigamTitle, {
            props: { text: 'Title' } as never,
            global: {
                plugins: [createOrigam({ theme: { components: { 'origam-title': { tag: 'h1' } } } } as never)]
            }
        })

        expect(wrapper.element.tagName).toBe('H1')
    })

    it('a <origam-defaults-provider> ancestor sets the tag for its sub-tree', () => {
        const wrapper = mount(OrigamDefaultsProvider, {
            props: { defaults: { 'origam-title': { tag: 'h3' } } } as never,
            slots: { default: '<origam-title text="Title" />' },
            global: {
                plugins: [createOrigam()],
                components: { 'origam-title': OrigamTitle }
            }
        })

        expect(wrapper.find('.origam-title').element.tagName).toBe('H3')
    })

    it('an explicit tag still beats the defaults layer', () => {
        const wrapper = mount(OrigamTitle, {
            props: { text: 'Title', tag: 'h5' } as never,
            global: {
                plugins: [createOrigam({ theme: { components: { 'origam-title': { tag: 'h1' } } } } as never)]
            }
        })

        expect(wrapper.element.tagName).toBe('H5')
    })
})

describe('OrigamTitle — consumer `id` and the generated rule', () => {
    it('renders the consumer id on the root element', () => {
        expect(mountTitle({ id: 'hero-title' }).element.getAttribute('id')).toBe('hero-title')
    })

    it('points the generated CSS rule at that same id, not at the generated one', () => {
        const wrapper = mountTitle({ id: 'hero-title', color: 'primary' })

        expect(cssOf(wrapper)).toMatch(/^#hero-title \{/)
        expect(cssOf(wrapper)).not.toMatch(/^#origam-title-\d+ \{/)
    })

    it('keeps the root id and the rule selector in agreement', () => {
        const wrapper = mountTitle({ id: 'hero-title', color: 'primary' })
        const domId = wrapper.element.getAttribute('id')

        expect(cssOf(wrapper).startsWith(`#${domId} {`)).toBe(true)
    })

    it('exposes the resolved id on the public instance API', () => {
        const exposed = (mountTitle({ id: 'hero-title' }).vm as unknown as { id: string }).id

        expect(exposed).toBe('hero-title')
    })
})

describe('OrigamTitle — generated rule is valid CSS', () => {
    it('emits no bare `false` from the unpassed `style` prop', () => {
        expect(cssOf(mountTitle({ color: 'primary' }))).not.toContain('false')
    })

    it('emits an empty body rather than junk when nothing is styled', () => {
        expect(cssOf(mountTitle())).toMatch(/^#[^{]+\{\}$/)
    })
})
