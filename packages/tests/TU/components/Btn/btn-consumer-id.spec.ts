// REGRESSION — <OrigamBtn> and the consumer-supplied `id`.
//
// Btn routes its computed styles through `useStyle(btnStyles, …)`, which
// injects a `#<id> { … }` rule rather than an inline `style=""`. The id that
// rule targets and the id the root element carries are THE SAME VALUE, and
// they have to stay that way:
//
//   - Btn has no inline `:style` fallback, so if the rule stops matching the
//     element, the button loses its computed styles outright.
//   - Before `useStyle` accepted a caller id, the generated id overwrote a
//     consumer-supplied `id`, which silently broke every `<label for>`,
//     `aria-labelledby`, `aria-controls` and `aria-describedby` association
//     pointing at a button.
//
// The pair is what matters, so every assertion below checks BOTH ends.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

import OrigamBtn from '@origam/components/Btn/OrigamBtn.vue'
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

function mountBtn (props: Record<string, unknown> = {}) {
    return mount(OrigamBtn, {
        props: { text: 'Button', ...props } as never,
        global: { plugins: [createOrigam()] }
    })
}

function cssOf (wrapper: ReturnType<typeof mountBtn>): string {
    return (wrapper.vm as unknown as { css: string }).css || ''
}

describe('OrigamBtn — consumer `id` wins', () => {
    it('renders the consumer id on the root element', () => {
        const wrapper = mountBtn({ id: 'save-btn' })

        expect(wrapper.element.getAttribute('id')).toBe('save-btn')
    })

    it('points the generated CSS rule at that same id', () => {
        const wrapper = mountBtn({ id: 'save-btn' })

        expect(cssOf(wrapper)).toMatch(/^#save-btn \{/)
    })

    it('keeps the root id and the rule selector in agreement', () => {
        const wrapper = mountBtn({ id: 'save-btn', color: 'primary' })
        const domId = wrapper.element.getAttribute('id')

        expect(cssOf(wrapper).startsWith(`#${domId} {`)).toBe(true)
    })

    it('an id that is not a valid CSS ident is escaped in the rule, not dropped', () => {
        const wrapper = mountBtn({ id: '1st-btn', color: 'primary' })

        expect(wrapper.element.getAttribute('id')).toBe('1st-btn')
        expect(cssOf(wrapper)).toMatch(/^#\\31 st-btn \{/)
    })

    it('exposes the same id on the public instance API', () => {
        const wrapper = mountBtn({ id: 'save-btn' })
        const exposed = (wrapper.vm as unknown as { id: string }).id

        expect(exposed).toBe('save-btn')
    })
})

describe('OrigamBtn — no consumer `id`', () => {
    it('falls back to a generated id rather than rendering none', () => {
        const wrapper = mountBtn()
        const domId = wrapper.element.getAttribute('id')

        // The suffix is `getUid()`'s value, opaque since it became Vue's
        // `useId()` (`v-0`, `v-2-0` past an async boundary) — pinning `\d+`
        // here pinned the SSR-unsafe counter, not the behaviour under test,
        // which is "a generated id exists at all".
        expect(domId).toMatch(/^origam-btn-.+$/)
    })

    it('the generated rule still targets the element that carries it', () => {
        const wrapper = mountBtn({ color: 'primary' })
        const domId = wrapper.element.getAttribute('id')

        expect(cssOf(wrapper).startsWith(`#${domId} {`)).toBe(true)
    })

    it('gives two buttons on the same page distinct ids', () => {
        // Uniqueness is scoped to ONE app install, not to the process:
        // `createOrigam()`'s install calls `getUid.reset()` so the counter is
        // deterministic per app — that is what keeps generated ids stable
        // between an SSR render and its hydration. Two buttons therefore have
        // to be mounted inside the same app for the guarantee to be the real
        // one; two separate `mount()` calls both restart at 0 by design.
        const Host = defineComponent({
            name: 'OrigamBtnUidHost',
            setup: () => () => h('div', [h(OrigamBtn, { text: 'a' }), h(OrigamBtn, { text: 'b' })])
        })

        const wrapper = mount(Host, { global: { plugins: [createOrigam()] } })
        const ids = wrapper.findAll('.origam-btn').map((el) => el.element.getAttribute('id'))

        expect(ids).toHaveLength(2)
        expect(ids[0]).not.toBe(ids[1])
        expect(new Set(ids).size).toBe(ids.length)
    })
})

describe('OrigamBtn — generated rule is valid CSS', () => {
    it('emits no bare `false` from the unpassed `style` prop', () => {
        // Vue's `StyleValue` includes `false`, so an unpassed `style` resolves
        // to the concrete value `false`. It used to be serialised verbatim
        // into the rule body, which made the whole sheet unparseable.
        expect(cssOf(mountBtn({ color: 'primary' }))).not.toContain('false')
    })

    it('emits only `prop: value` declarations in the rule body', () => {
        const body = cssOf(mountBtn({ color: 'primary' })).replace(/^#[^{]*\{/, '').replace(/\}$/, '')

        for (const declaration of body.split(';').filter(Boolean)) {
            expect(declaration).toContain(':')
        }
    })
})
