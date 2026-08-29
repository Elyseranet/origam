// Regression coverage for #421 — the OrigamInput root wrapper fix, and the
// two duplicate-id traps that fix would otherwise spring.
//
// THREE DISTINCT MECHANISMS BEHIND THE SAME SYMPTOM ("consumer id lost"):
//
//   1. OrigamInput's own root `<div class="origam-input">` never bound
//      `:id` at all, despite computing one (`props.id || 'input-${uid}'`).
//      Purely additive fix (root case below).
//
//   2. OrigamRatingField AND OrigamNumberField (compact branch) each
//      bound the SAME id explicitly on `<origam-input>` in addition to
//      their own real functional control (label's `for` target / native
//      `<input>`). Fixing (1) would have painted that id on the
//      `.origam-input` wrapper too — a SECOND element with the identical
//      id, alongside the real control (duplicate-id cases below).
//
//   3. RatingField's `useStyle(ratingFieldStyles, () => props.id)`
//      generated-vs-consumer-id homonym (#381) — already fixed on
//      develop before this ticket; verified NOT regressed here.
//
// Each is a different code shape; a single test asserting "id reaches the
// DOM somewhere" cannot tell them apart, hence three separate assertions.

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamInput from '@origam/components/Input/OrigamInput.vue'
import OrigamRatingField from '@origam/components/RatingField/OrigamRatingField.vue'
import OrigamNumberField from '@origam/components/NumberField/OrigamNumberField.vue'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false, media: query, onchange: null,
            addListener: vi.fn(), removeListener: vi.fn(),
            addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
        }))
    })
})

const SENTINEL = 'my-custom-id'

describe('#421 mechanism 1 — OrigamInput root wrapper id', () => {
    it('binds the consumer id on the .origam-input root element', () => {
        const wrapper = mount(OrigamInput, {
            props: { id: SENTINEL },
            global: { plugins: [createOrigam()] }
        })
        expect(wrapper.attributes('id')).toBe(SENTINEL)
        wrapper.unmount()
    })
})

describe('#421 mechanism 2 — no duplicate DOM id (RatingField)', () => {
    it('exactly one element in the DOM carries the consumer id', async () => {
        const wrapper = mount(OrigamRatingField, {
            props: { id: SENTINEL },
            global: { plugins: [createOrigam()] },
            attachTo: document.body
        })
        await nextTick()
        await nextTick()

        const matches = document.querySelectorAll(`[id="${SENTINEL}"]`)
        expect(matches.length).toBe(1)
        wrapper.unmount()
    })

    it('the label still targets the real id (#381 non-regression)', async () => {
        const wrapper = mount(OrigamRatingField, {
            props: { id: SENTINEL, label: 'Rate it' },
            global: { plugins: [createOrigam()] },
            attachTo: document.body
        })
        await nextTick()
        await nextTick()

        const label = wrapper.find('label')
        expect(label.attributes('for')).toBe(SENTINEL)
        wrapper.unmount()
    })
})

describe('#421 mechanism 2 — no duplicate DOM id (NumberField compact)', () => {
    it('exactly one element in the DOM carries the consumer id', async () => {
        const wrapper = mount(OrigamNumberField, {
            props: { id: SENTINEL, compact: true },
            global: { plugins: [createOrigam()] },
            attachTo: document.body
        })
        await nextTick()
        await nextTick()

        const matches = document.querySelectorAll(`[id="${SENTINEL}"]`)
        expect(matches.length).toBe(1)
        wrapper.unmount()
    })

    it('the real compact <input> still carries the consumer id', async () => {
        const wrapper = mount(OrigamNumberField, {
            props: { id: SENTINEL, compact: true },
            global: { plugins: [createOrigam()] },
            attachTo: document.body
        })
        await nextTick()
        await nextTick()

        const input = wrapper.find('.origam-number-field__compact-input')
        expect(input.attributes('id')).toBe(SENTINEL)
        wrapper.unmount()
    })
})
