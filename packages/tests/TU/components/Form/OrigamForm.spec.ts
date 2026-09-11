// Unit tests for <OrigamForm> — typography props surface (ITypographyProps).
//
// Strategy: mount with createOrigam() plugin. Typography is applied to the
// `.origam-form__details` BEM child, which is only rendered when `hasMessages`
// is true. `hasMessages` is derived from `Boolean(props.errorMessages)`, so
// passing `errorMessages: ['Test error']` makes the div appear.
//
// Assertion targets the inline style attribute on .origam-form__details:
//   fontSize       → --origam-form__details---font-size
//   fontWeight     → --origam-form__details---font-weight
//   letterSpacing  → --origam-form__details---letter-spacing
//   lineHeight     → --origam-form__details---line-height
// All four are read by the __details SCSS block, so they have a real visual effect.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamForm from '@origam/components/Form/OrigamForm.vue'
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

// Pass errorMessages so hasMessages=true → __details div is rendered.
function mountForm (props: Record<string, unknown> = {}) {
    return mount(OrigamForm, {
        props: { errorMessages: ['Test error'], ...props } as never,
        global: {
            plugins: [createOrigam()],
            stubs: {
                // Stub OrigamMessages to avoid its own composable machinery
                OrigamMessages: { template: '<div class="origam-messages-stub"/>' }
            }
        }
    })
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('OrigamForm — rendering', () => {
    it('renders a <form> root element', () => {
        const wrapper = mountForm()
        expect(wrapper.element.tagName).toBe('FORM')
    })

    it('has origam-form class on the root', () => {
        const wrapper = mountForm()
        expect(wrapper.find('form').classes()).toContain('origam-form')
    })

    it('renders __details div when errorMessages is set', () => {
        const wrapper = mountForm()
        expect(wrapper.find('.origam-form__details').exists()).toBe(true)
    })

    it('does not render __details when no messages', () => {
        const wrapper = mount(OrigamForm, {
            props: {} as never,
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.find('.origam-form__details').exists()).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// fontSize
// ---------------------------------------------------------------------------

describe('OrigamForm — fontSize prop', () => {
    it('emits no font-size override when fontSize is unset', () => {
        const wrapper = mountForm()
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).not.toContain('--origam-form__details---font-size')
    })

    it('fontSize="xl" sets --origam-form__details---font-size to the xl token', () => {
        const wrapper = mountForm({ fontSize: 'xl' })
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).toContain('--origam-form__details---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="sm" sets --origam-form__details---font-size to the sm token', () => {
        const wrapper = mountForm({ fontSize: 'sm' })
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).toContain('--origam-form__details---font-size: var(--origam-font__size---sm)')
    })
})

// ---------------------------------------------------------------------------
// fontWeight
// ---------------------------------------------------------------------------

describe('OrigamForm — fontWeight prop', () => {
    it('emits no font-weight override when fontWeight is unset', () => {
        const wrapper = mountForm()
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).not.toContain('--origam-form__details---font-weight')
    })

    it('fontWeight="bold" sets --origam-form__details---font-weight to the bold token', () => {
        const wrapper = mountForm({ fontWeight: 'bold' })
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).toContain('--origam-form__details---font-weight: var(--origam-font__weight---bold)')
    })

    it('fontWeight="semibold" sets --origam-form__details---font-weight to the semibold token', () => {
        const wrapper = mountForm({ fontWeight: 'semibold' })
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).toContain('--origam-form__details---font-weight: var(--origam-font__weight---semibold)')
    })
})

// ---------------------------------------------------------------------------
// letterSpacing
// ---------------------------------------------------------------------------

describe('OrigamForm — letterSpacing prop', () => {
    it('emits no letter-spacing override when letterSpacing is unset', () => {
        const wrapper = mountForm()
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).not.toContain('--origam-form__details---letter-spacing')
    })

    it('letterSpacing="wide" sets --origam-form__details---letter-spacing to the wide token', () => {
        const wrapper = mountForm({ letterSpacing: 'wide' })
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).toContain('--origam-form__details---letter-spacing: var(--origam-font__letterSpacing---wide)')
    })

    it('letterSpacing="tight" sets --origam-form__details---letter-spacing to the tight token', () => {
        const wrapper = mountForm({ letterSpacing: 'tight' })
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).toContain('--origam-form__details---letter-spacing: var(--origam-font__letterSpacing---tight)')
    })
})

// ---------------------------------------------------------------------------
// lineHeight
// ---------------------------------------------------------------------------

describe('OrigamForm — lineHeight prop', () => {
    it('emits no line-height override when lineHeight is unset', () => {
        const wrapper = mountForm()
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).not.toContain('--origam-form__details---line-height')
    })

    it('lineHeight="loose" sets --origam-form__details---line-height to the loose token', () => {
        const wrapper = mountForm({ lineHeight: 'loose' })
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).toContain('--origam-form__details---line-height: var(--origam-font__lineHeight---loose)')
    })

    it('lineHeight="tight" sets --origam-form__details---line-height to the tight token', () => {
        const wrapper = mountForm({ lineHeight: 'tight' })
        const style = wrapper.find('.origam-form__details').attributes('style') || ''
        expect(style).toContain('--origam-form__details---line-height: var(--origam-font__lineHeight---tight)')
    })
})

// ---------------------------------------------------------------------------
// reset emit (issue #415)
// ---------------------------------------------------------------------------
//
// `handleReset` called `form.reset()` and `resetFormValidation()` but never
// `emits('reset', …)`, even though `IFormEmits` declares it and the doc's
// Events table documents it ("Form reset"). A native `reset` DOM event on
// the `<form>` element (fired by a `<button type="reset">` or programmatic
// `.reset()`) triggers the template's `@reset="handleReset"` handler — this
// test drives that same native event, exactly like a real reset button click
// would, and asserts the Vue-level `reset` emit actually fires.

describe('OrigamForm — reset emit (issue #415)', () => {
    it('emits "reset" when the native form reset event fires', async () => {
        const wrapper = mountForm()
        await wrapper.find('form').trigger('reset')
        expect(wrapper.emitted('reset')).toBeTruthy()
        expect(wrapper.emitted('reset')).toHaveLength(1)
    })

    it('does NOT emit "submit" when reset fires (no cross-wiring)', async () => {
        const wrapper = mountForm()
        await wrapper.find('form').trigger('reset')
        expect(wrapper.emitted('submit')).toBeFalsy()
    })
})

// ---------------------------------------------------------------------------
// hint prop (issue #415)
// ---------------------------------------------------------------------------
//
// `hint` is declared on `IFormProps` and `useMessage()`'s `messages` computed
// already read it as a fallback (higher priority than `props.messages`,
// lower than `errorMessages`) — but `hasMessages`, which gates the
// `.origam-form__details` `v-if`, never tested `props.hint`. The container
// therefore never rendered for a form passing `hint` alone, so the text was
// physically never on screen.

describe('OrigamForm — hint prop (issue #415)', () => {
    it('renders __details when only hint is set (no errorMessages/messages)', () => {
        const wrapper = mount(OrigamForm, {
            props: { hint: 'Fill every required field' } as never,
            global: {
                plugins: [createOrigam()],
                stubs: { OrigamMessages: { template: '<div class="origam-messages-stub"/>', props: ['messages'] } }
            }
        })
        expect(wrapper.find('.origam-form__details').exists()).toBe(true)
    })

    it('does not render __details when hint is absent and no other message source is set', () => {
        const wrapper = mount(OrigamForm, {
            props: {} as never,
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.find('.origam-form__details').exists()).toBe(false)
    })

    it('passes the hint text down to OrigamMessages when no error is present', () => {
        const wrapper = mount(OrigamForm, {
            props: { hint: 'Fill every required field' } as never,
            global: {
                plugins: [createOrigam()],
                stubs: { OrigamMessages: { template: '<div class="origam-messages-stub">{{ messages }}</div>', props: ['messages'] } }
            }
        })
        expect(wrapper.find('.origam-messages-stub').text()).toContain('Fill every required field')
    })
})
