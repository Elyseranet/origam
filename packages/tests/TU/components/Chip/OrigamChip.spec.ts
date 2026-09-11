// Unit tests for <OrigamChip>
//
// Strategy: mount with createOrigam() plugin. OrigamChip uses useGroupItem
// which requires an injection key — when no group parent is present, it
// falls back gracefully (group is null). Tests cover the API surface that
// does NOT need a parent group (closable, click emit, disabled, size,
// density, label, pill, rounded) and a few edge cases.
//
// Typography props (ITypographyProps surface, useTypography with 'chip' prefix):
// Chip's SCSS reads `--origam-chip---font-weight` at root level and resolves
// `--origam-chip---font-size` generic-first in each `&--size-*` rule
// (`var(--origam-chip---font-size, var(--origam-chip---font-size-{size}, …))`),
// so `fontSize` overrides the size-variant font-size when set and the per-size
// value stays in control when unset. Runtime px proof lives in the e2e layer;
// these unit tests assert the emitted custom property via `wrapper.vm.css`
// (injected through useStyle, same pattern as OrigamBtn).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamChip from '@origam/components/Chip/OrigamChip.vue'
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

function mountChip(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
    return mount(OrigamChip, {
        props: props as never,
        slots,
        global: { plugins: [createOrigam()] }
    })
}

function cssOf(props: Record<string, unknown> = {}): string {
    return (mountChip(props).vm as unknown as { css: string }).css || ''
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('OrigamChip — rendering', () => {
    it('renders with class origam-chip', () => {
        const wrapper = mountChip()
        expect(wrapper.find('.origam-chip').exists()).toBe(true)
    })

    it('renders text content via the text prop', () => {
        const wrapper = mountChip({ text: 'Vue 3' })
        expect(wrapper.text()).toContain('Vue 3')
    })

    it('renders default slot content (overrides text prop)', () => {
        const wrapper = mountChip({ text: 'prop text' }, { default: 'Slot text' })
        expect(wrapper.text()).toContain('Slot text')
    })
})

// ---------------------------------------------------------------------------
// Closable
// ---------------------------------------------------------------------------

describe('OrigamChip — closable', () => {
    it('does not render the close button by default', () => {
        const wrapper = mountChip()
        expect(wrapper.find('.origam-chip__close').exists()).toBe(false)
    })

    it('renders the close button when closable=true', () => {
        const wrapper = mountChip({ closable: true })
        expect(wrapper.find('.origam-chip__close').exists()).toBe(true)
    })

    it('clicking close emits click:close with a MouseEvent', async () => {
        const wrapper = mountChip({ closable: true })
        await wrapper.find('.origam-chip__close').trigger('click')
        const emitted = wrapper.emitted('click:close') as MouseEvent[][] | undefined
        expect(emitted).toBeTruthy()
        expect(emitted!.length).toBe(1)
    })

    it('clicking close emits update:modelValue=false', async () => {
        const wrapper = mountChip({ closable: true, modelValue: true })
        await wrapper.find('.origam-chip__close').trigger('click')
        const updates = wrapper.emitted('update:modelValue') as boolean[][] | undefined
        expect(updates).toBeTruthy()
        expect(updates![0][0]).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// Click emit
// ---------------------------------------------------------------------------

describe('OrigamChip — click event', () => {
    it('emits "click" when the chip root is clicked', async () => {
        const wrapper = mountChip()
        await wrapper.find('.origam-chip').trigger('click')
        expect(wrapper.emitted('click')).toBeTruthy()
    })
})

// ---------------------------------------------------------------------------
// Disabled
// ---------------------------------------------------------------------------

describe('OrigamChip — disabled', () => {
    it('adds origam-chip--disabled class when disabled=true', () => {
        const wrapper = mountChip({ disabled: true })
        expect(wrapper.find('.origam-chip').classes()).toContain('origam-chip--disabled')
    })

    it('does not add origam-chip--disabled class by default', () => {
        const wrapper = mountChip()
        expect(wrapper.find('.origam-chip').classes()).not.toContain('origam-chip--disabled')
    })
})

// ---------------------------------------------------------------------------
// Label / Pill modifiers
// ---------------------------------------------------------------------------

describe('OrigamChip — visual modifiers', () => {
    it('adds origam-chip--label class when label=true', () => {
        const wrapper = mountChip({ label: true })
        expect(wrapper.find('.origam-chip').classes()).toContain('origam-chip--label')
    })

    it('adds origam-chip--pill class when pill=true', () => {
        const wrapper = mountChip({ pill: true })
        expect(wrapper.find('.origam-chip').classes()).toContain('origam-chip--pill')
    })
})

// ---------------------------------------------------------------------------
// Size
// ---------------------------------------------------------------------------

describe('OrigamChip — size', () => {
    it('defaults to size "small" from the origam theme (components[\'origam-chip\'].size)', () => {
        // The default origam theme sets `'origam-chip': { size: 'small' }` (derived
        // from the marketing's common chip usage), so a chip with no explicit size
        // inherits 'small' via useDefaults — proving the theme's component defaults apply.
        const wrapper = mountChip()
        expect(wrapper.find('.origam-chip').classes().some(c => c.includes('size-small'))).toBe(true)
    })

    it('applies origam-chip--size-small when size="small"', () => {
        const wrapper = mountChip({ size: 'small' })
        expect(wrapper.find('.origam-chip').classes().some(c => c.includes('size-small'))).toBe(true)
    })

    it('applies origam-chip--size-large when size="large"', () => {
        const wrapper = mountChip({ size: 'large' })
        expect(wrapper.find('.origam-chip').classes().some(c => c.includes('size-large'))).toBe(true)
    })

    it('applies origam-chip--size-x-small when size="x-small"', () => {
        const wrapper = mountChip({ size: 'x-small' })
        expect(wrapper.find('.origam-chip').classes().some(c => c.includes('size-x-small'))).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Density
// ---------------------------------------------------------------------------

describe('OrigamChip — density', () => {
    it('applies a density class when density="compact"', () => {
        const wrapper = mountChip({ density: 'compact' })
        expect(wrapper.find('.origam-chip').classes().some(c => c.includes('density-compact'))).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Rounded
// ---------------------------------------------------------------------------

describe('OrigamChip — rounded', () => {
    it('applies a rounded class when rounded="sm"', () => {
        const wrapper = mountChip({ rounded: 'sm' })
        expect(wrapper.find('.origam-chip').classes().join(' ')).toMatch(/rounded/)
    })
})

// ---------------------------------------------------------------------------
// Prepend / Append icons
// ---------------------------------------------------------------------------

describe('OrigamChip — prepend and append', () => {
    it('renders .origam-chip__prepend when prependIcon is set', () => {
        const wrapper = mountChip({ prependIcon: 'mdi-account' })
        expect(wrapper.find('.origam-chip__prepend').exists()).toBe(true)
    })

    it('renders .origam-chip__append when appendIcon is set', () => {
        const wrapper = mountChip({ appendIcon: 'mdi-chevron-down' })
        expect(wrapper.find('.origam-chip__append').exists()).toBe(true)
    })

    it('does not render prepend or append when no icon props are set', () => {
        const wrapper = mountChip()
        expect(wrapper.find('.origam-chip__prepend').exists()).toBe(false)
        expect(wrapper.find('.origam-chip__append').exists()).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// Typography — fontSize
// ---------------------------------------------------------------------------

describe('OrigamChip — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        expect(cssOf()).not.toContain('--origam-chip---font-size:')
    })

    it('fontSize="xl" sets the font-size var to the xl token', () => {
        expect(cssOf({ fontSize: 'xl' })).toContain('--origam-chip---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="xs" sets the font-size var to the xs token', () => {
        expect(cssOf({ fontSize: 'xs' })).toContain('--origam-chip---font-size: var(--origam-font__size---xs)')
    })
})

// ---------------------------------------------------------------------------
// Typography — fontWeight
// ---------------------------------------------------------------------------

describe('OrigamChip — fontWeight prop', () => {
    it('emits no font-weight override when fontWeight is unset', () => {
        expect(cssOf()).not.toContain('--origam-chip---font-weight:')
    })

    it('fontWeight="bold" sets the font-weight var to the bold token (700)', () => {
        expect(cssOf({ fontWeight: 'bold' })).toContain('--origam-chip---font-weight: var(--origam-font__weight---bold)')
    })

    it('fontWeight="black" sets the font-weight var to the black token (900)', () => {
        expect(cssOf({ fontWeight: 'black' })).toContain('--origam-chip---font-weight: var(--origam-font__weight---black)')
    })
})
