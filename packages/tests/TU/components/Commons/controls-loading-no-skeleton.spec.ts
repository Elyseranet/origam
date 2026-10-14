// Lot 2a (#1080) - a CONTROL mid-action never turns into a placeholder.
//
// `OrigamBtn`, `OrigamSwitch` and `OrigamField` (and the Select / TextField /
// TextareaField that inherit it) used to REPLACE their content with a
// skeleton when given `loading: { type: 'skeleton' }`: the button lost its
// accessible name (`button "Loading..."`) and nested a <div> inside a
// <span>/<button>, the switch dropped its checkbox, the field unmounted its
// <input> and its label.
//
// These specs run against the parent commit as the A/B control: they fail
// there, they pass here. Structure only - no getComputedStyle (jsdom never
// resolves var(), see CLAUDE.md).

import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
import OrigamSwitch from '@origam/components/Switch/OrigamSwitch.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'
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

const LOADINGS: Array<[string, unknown]> = [
    ['true', true],
    ['42', 42],
    ['{ type: line }', { type: 'line' }],
    ['{ type: circular }', { type: 'circular' }],
    // Refused by the types; an untyped caller must still get a control, not a placeholder.
    ['{ type: skeleton } (untyped caller)', { type: 'skeleton' }]
]

function mountBtn (props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
    return mount(OrigamBtn, {
        props: { text: 'Save', ...props } as never,
        attrs,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamBtn - an action in flight keeps the button', () => {
    it.each(LOADINGS)('loading=%s: label kept, no skeleton, no nested <div>', async (_l, loading) => {
        const wrapper = mountBtn({ loading })
        await flushPromises()
        const el = wrapper.element as HTMLElement

        expect(el.textContent?.trim()).toContain('Save')
        // The spinner is decorative inside the button (which carries aria-busy):
        // it must not feed its own "Loading..." label into the button's name.
        expect(el.textContent).not.toContain('Loading')
        el.querySelectorAll('[role="progressbar"]').forEach((p) => expect(p.getAttribute('aria-hidden')).toBe('true'))
        expect(wrapper.find('.origam-skeleton').exists()).toBe(false)
        // <div> is not allowed inside <button> (phrasing content only). The
        // `line` strip is the one exception: OrigamProgressLinear renders its
        // bars as <div>s (a shared component, out of this lot's scope).
        if ((loading as { type?: string } | undefined)?.type !== 'line') {
            expect(el.querySelector('div')).toBeNull()
        }
    })

    it.each(LOADINGS)('loading=%s: aria-busy + aria-disabled, never the native disabled', (_l, loading) => {
        const el = mountBtn({ loading }).element as HTMLElement

        expect(el.getAttribute('aria-busy')).toBe('true')
        expect(el.getAttribute('aria-disabled')).toBe('true')
        expect(el.hasAttribute('disabled')).toBe(false)
    })

    it('idle: none of the three attributes', () => {
        const el = mountBtn({}).element as HTMLElement

        expect(el.hasAttribute('aria-busy')).toBe(false)
        expect(el.hasAttribute('aria-disabled')).toBe(false)
        expect(el.hasAttribute('disabled')).toBe(false)
    })

    it('emits origam-btn--loading exactly once (#1076 point 1)', () => {
        const el = mountBtn({ loading: true }).element as HTMLElement
        const occurrences = (el.getAttribute('class') ?? '').split(/\s+/).filter((c) => c === 'origam-btn--loading')

        expect(occurrences).toHaveLength(1)
    })

    it('swallows a click (consumer @click included) while loading, lets it through when idle', async () => {
        const onClick = vi.fn()
        const busy = mountBtn({ loading: true }, { onClick })
        await busy.trigger('click')
        expect(onClick).not.toHaveBeenCalled()

        const idle = mountBtn({}, { onClick })
        await idle.trigger('click')
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})

describe('OrigamTextField (OrigamField) - a field mid-save keeps its input and label', () => {
    it.each(LOADINGS)('loading=%s: <input>, label and value stay mounted', async (_l, loading) => {
        const wrapper = mount(OrigamTextField, {
            props: { label: 'Email', modelValue: 'a@b.c', loading } as never,
            global: { plugins: [createOrigam()] }
        })
        await flushPromises()

        const input = wrapper.find('input')
        expect(input.exists()).toBe(true)
        expect((input.element as HTMLInputElement).value).toBe('a@b.c')
        expect(wrapper.text()).toContain('Email')
        expect(wrapper.find('.origam-field__skeleton').exists()).toBe(false)
        expect(wrapper.find('.origam-skeleton').exists()).toBe(false)
    })
})

describe('OrigamSwitch - a save in flight keeps the checkbox and the label', () => {
    it.each(LOADINGS)('loading=%s: checkbox, label and checked state stay mounted', async (_l, loading) => {
        const wrapper = mount(OrigamSwitch, {
            props: { label: 'Notifications', modelValue: true, loading } as never,
            global: { plugins: [createOrigam()] }
        })
        await flushPromises()

        const checkbox = wrapper.find('input[type="checkbox"]')
        expect(checkbox.exists()).toBe(true)
        expect((checkbox.element as HTMLInputElement).checked).toBe(true)
        expect(wrapper.text()).toContain('Notifications')
        expect(wrapper.find('.origam-switch__skeleton').exists()).toBe(false)
    })
})
