// Unit tests for <OrigamForm>'s `actions` slot scope.
//
// The slot advertises `{ submit, reset }` and both the doc and the story
// wire them as `<origam-btn @click="submit"/>`. Until the fix the template
// bound `{ submit: () => handleSubmit, reset: () => handleReset }` — arrow
// functions RETURNING the handler rather than being it. Vue called the
// arrow, got a function reference back, and discarded it: no validation ran,
// no `submit` / `reset` event fired, nothing at all happened.
//
// Everything asserted here is observable in jsdom (emitted events, call
// counts) — no CSS is involved, so the `getComputedStyle` / `var()` trap
// documented in CLAUDE.md does not apply.
//
// Mutation check performed while writing this file: restoring
// `v-bind="{submit: () => handleSubmit, reset: () => handleReset}"` in
// OrigamForm.vue turns the four assertions below red
// (`emitted('submit')` undefined); restoring the fix turns them green.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

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

// Captures the scope object the `actions` slot receives, and renders two
// buttons wired exactly the way OrigamForm.md documents them.
function mountFormWithActions () {
    const scope: { submit?: (e: Event) => void, reset?: (e: Event) => void } = {}

    const wrapper = mount(OrigamForm, {
        global: { plugins: [createOrigam()] },
        slots: {
            actions: (props: { submit: (e: Event) => void, reset: (e: Event) => void }) => {
                scope.submit = props.submit
                scope.reset = props.reset

                return [
                    h('button', { type: 'button', class: 'act-submit', onClick: props.submit }, 'Submit'),
                    h('button', { type: 'button', class: 'act-reset', onClick: props.reset }, 'Reset')
                ]
            }
        }
    })

    return { wrapper, scope }
}

describe('OrigamForm — actions slot scope', () => {
    it('exposes callable helpers, not functions that merely return them', () => {
        const { scope } = mountFormWithActions()

        expect(typeof scope.submit).toBe('function')
        expect(typeof scope.reset).toBe('function')

        // The defect signature: calling the helper returned ANOTHER function
        // instead of doing the work. A correct helper returns undefined.
        const submitResult = scope.submit!(new Event('click'))
        expect(typeof submitResult).not.toBe('function')
    })

    it('fires `submit` when the slot helper is clicked', async () => {
        const { wrapper } = mountFormWithActions()

        await wrapper.find('.act-submit').trigger('click')

        expect(wrapper.emitted('submit')).toBeTruthy()
        expect(wrapper.emitted('submit')!.length).toBe(1)
    })

    it('fires `reset` when the slot helper is clicked', async () => {
        const { wrapper } = mountFormWithActions()

        await wrapper.find('.act-reset').trigger('click')

        expect(wrapper.emitted('reset')).toBeTruthy()
        expect(wrapper.emitted('reset')!.length).toBe(1)
    })

    it('hands the submit helper an awaitable event, like the native path', async () => {
        const { wrapper } = mountFormWithActions()

        await wrapper.find('.act-submit').trigger('click')

        const payload = wrapper.emitted('submit')![0][0] as Event & Promise<{ valid: boolean }>

        // handleSubmit grafts then/catch/finally onto the originating event so
        // `@submit="e => e.then(...)"` works — the contract OrigamForm.md
        // documents as `SubmitEvent & Promise<{ valid, errors }>`.
        expect(typeof payload.then).toBe('function')
        await expect(payload).resolves.toHaveProperty('valid')
    })
})
