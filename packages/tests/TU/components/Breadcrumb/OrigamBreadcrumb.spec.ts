// Unit tests for <OrigamBreadcrumb>
//
// Strategy: mount with createOrigam() plugin. Tests assert:
// - items normalisation (string vs. object)
// - last item disabled + aria-current marking
// - divider rendering (default "/" + custom)
// - density classes
// - rounded, border, elevation classes
// - default slot override

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamBreadcrumb from '@origam/components/Breadcrumb/OrigamBreadcrumb.vue'
import OrigamBreadcrumbItem from '@origam/components/Breadcrumb/OrigamBreadcrumbItem.vue'
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

const ITEMS_STRINGS = ['Home', 'Products', 'Detail']
const ITEMS_OBJECTS = [
    { title: 'Home', href: '/' },
    { title: 'Products', href: '/products' },
    { title: 'Detail' }
]

function mountBreadcrumb(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    return mount(OrigamBreadcrumb, {
        props: props as never,
        slots,
        global: { plugins: [createOrigam()] },
        attachTo: document.body
    })
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('OrigamBreadcrumb — rendering', () => {
    it('renders with class origam-breadcrumb', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        expect(wrapper.find('.origam-breadcrumb').exists()).toBe(true)
    })

    it('uses <nav> as default root tag', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        expect(wrapper.element.tagName).toBe('NAV')
    })

    it('has aria-label set on the nav element', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        const nav = wrapper.find('.origam-breadcrumb')
        // useLocale returns the key as a fallback in test env; existence is enough.
        expect(nav.attributes('aria-label')).toBeTruthy()
    })

    it('uses a custom root tag when tag prop is set', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS, tag: 'ol' })
        expect(wrapper.element.tagName).toBe('OL')
    })
})

// ---------------------------------------------------------------------------
// Items list
// ---------------------------------------------------------------------------

describe('OrigamBreadcrumb — items list', () => {
    it('renders one .origam-breadcrumb__item per item (string array)', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        // Each item renders inside an <li class="origam-breadcrumb__item">
        expect(wrapper.findAll('.origam-breadcrumb__item').length).toBe(ITEMS_STRINGS.length)
    })

    it('renders one .origam-breadcrumb__item per item (object array)', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_OBJECTS })
        expect(wrapper.findAll('.origam-breadcrumb__item').length).toBe(ITEMS_OBJECTS.length)
    })

    it('renders items text content from string array', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        const text = wrapper.text()
        expect(text).toContain('Home')
        expect(text).toContain('Products')
        expect(text).toContain('Detail')
    })

    it('renders items text content from object array', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_OBJECTS })
        const text = wrapper.text()
        expect(text).toContain('Home')
        expect(text).toContain('Products')
        expect(text).toContain('Detail')
    })

    it('renders nothing when items is empty', () => {
        const wrapper = mountBreadcrumb({ items: [] })
        expect(wrapper.findAll('.origam-breadcrumb__item').length).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// Last item — disabled + aria-current
// ---------------------------------------------------------------------------

describe('OrigamBreadcrumb — last item semantics', () => {
    it('last item has aria-current="page" via items normalisation (active prop)', () => {
        // FIX: OrigamBreadcrumb.vue normalises items with `active: isLastItem(index)`
        // (was `isActive:` — wrong key, silently ignored by IBreadcrumbItemProps/IActiveProps).
        // After fix, the last item receives active=true, useActive sets isActive=true,
        // and aria-current="page" is rendered correctly on the last breadcrumb item.
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        const items = wrapper.findAll('.origam-breadcrumb-item')
        const lastItem = items[items.length - 1]
        expect(lastItem.attributes('aria-current')).toBe('page')
    })

    it('last item has origam-breadcrumb-item--disabled class', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        const items = wrapper.findAll('.origam-breadcrumb-item')
        const lastItem = items[items.length - 1]
        expect(lastItem.classes()).toContain('origam-breadcrumb-item--disabled')
    })

    it('non-last items do not have aria-current', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        const items = wrapper.findAll('.origam-breadcrumb-item')
        // Check first item (index 0)
        expect(items[0].attributes('aria-current')).toBeUndefined()
    })

    it('aria-current="page" IS rendered when item receives active=true directly', () => {
        // Direct mount of BreadcrumbItem with active=true bypasses the
        // OrigamBreadcrumb normalisation bug and verifies the component itself
        // is correct: given `active: true`, aria-current="page" is emitted.
        const w = mount(OrigamBreadcrumbItem, {
            props: { title: 'Detail', active: true } as never,
            global: { plugins: [createOrigam()] }
        })
        expect(w.find('.origam-breadcrumb-item').attributes('aria-current')).toBe('page')
    })
})

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------

describe('OrigamBreadcrumb — divider', () => {
    it('renders N-1 dividers for N items (default "/")', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        // OrigamBreadcrumbDivider rendered between items
        const dividers = wrapper.findAll('.origam-breadcrumb-divider')
        expect(dividers.length).toBe(ITEMS_STRINGS.length - 1)
    })

    it('uses default "/" divider text', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS })
        const firstDivider = wrapper.find('.origam-breadcrumb-divider')
        expect(firstDivider.text()).toBe('/')
    })

    it('uses custom divider text when divider prop is set', () => {
        const wrapper = mountBreadcrumb({ items: ITEMS_STRINGS, divider: '>' })
        const firstDivider = wrapper.find('.origam-breadcrumb-divider')
        expect(firstDivider.text()).toBe('>')
    })

    it('renders no dividers when there is only one item', () => {
        const wrapper = mountBreadcrumb({ items: ['Home'] })
        expect(wrapper.findAll('.origam-breadcrumb-divider').length).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// Density
// ---------------------------------------------------------------------------

describe('OrigamBreadcrumb — density', () => {
    it('applies density-default class by default', () => {
        const wrapper = mountBreadcrumb({ items: [] })
        expect(wrapper.find('.origam-breadcrumb').classes().some(c => c.includes('density-default'))).toBe(true)
    })

    it('applies density-compact class when density="compact"', () => {
        const wrapper = mountBreadcrumb({ items: [], density: 'compact' })
        expect(wrapper.find('.origam-breadcrumb').classes().some(c => c.includes('density-compact'))).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Rounded / Border / Elevation
// ---------------------------------------------------------------------------

describe('OrigamBreadcrumb — rounded, border, elevation', () => {
    it('applies a rounded modifier class when rounded="lg"', () => {
        const wrapper = mountBreadcrumb({ items: [], rounded: 'lg' })
        expect(wrapper.find('.origam-breadcrumb').classes().join(' ')).toMatch(/rounded/)
    })

    it('applies an elevation modifier class when elevation is set', () => {
        const wrapper = mountBreadcrumb({ items: [], elevation: 'md' })
        expect(wrapper.find('.origam-breadcrumb').classes().join(' ')).toMatch(/elevated|elevation/)
    })
})

// ---------------------------------------------------------------------------
// Default slot override
// ---------------------------------------------------------------------------

describe('OrigamBreadcrumb — default slot', () => {
    it('renders custom slot content instead of generated items', () => {
        const wrapper = mountBreadcrumb(
            {},
            { default: '<li class="custom-item">Custom</li>' }
        )
        expect(wrapper.find('.custom-item').exists()).toBe(true)
        // Generated items should NOT be present
        expect(wrapper.findAll('.origam-breadcrumb__item').length).toBe(0)
    })
})
