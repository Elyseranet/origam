// Regression coverage for #421 — the OrigamInput root wrapper fix, and the
// duplicate-id trap a naive version of that fix springs.
//
// THE MECHANISM
// --------------
// OrigamInput's own root `<div class="origam-input">` never bound `:id` at
// all, despite computing one (`id = props.id || 'input-${uid}'`) and
// correctly feeding it to `messagesId` and to the `#default` slot (the
// value every Input-family consumer binds onto its REAL functional
// control — the actual `<input>`, `<origam-checkbox-btn>`, …).
//
// ⛔ THE TRAP — binding `:id="id"` (the SAME value as the real control)
// -----------------------------------------------------------------------
// A first attempt at this fix bound the root to that same `id`. Measured
// directly: mounting `OrigamCheckbox` with a consumer-supplied `id` then
// produced TWO DOM elements sharing the identical id — the `.origam-input`
// wrapper AND the real `<input type="checkbox">` two levels down. Six of
// the eleven Input-family consumers explicitly bind `:id="id"` straight
// onto `<origam-input>` (Checkbox, Switch, Radio, RadioGroup, RatingField,
// NumberField's compact branch) — every one of them would have grown a
// duplicate id the instant the root started rendering it too.
//
// THE FIX — `styleId`, not `id`
// ------------------------------
// The sibling `OrigamField` component already solves the exact same
// "wrapper needs SOME id, the real control needs the CONSUMER's id"
// problem: its root binds `:id="styleId"` (its own generated scoped-style
// id, from `useStyle()` with no consumer-id override) and reserves `id`
// (the consumer's real id) for the slot content only. Mirroring that
// pattern on OrigamInput gives the wrapper a real, stable id — fixing the
// reported "no id at all" defect — without ever colliding with the real
// control's id.

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamInput from '@origam/components/Input/OrigamInput.vue'
import OrigamCheckbox from '@origam/components/Checkbox/OrigamCheckbox.vue'
import OrigamSwitch from '@origam/components/Switch/OrigamSwitch.vue'
import OrigamRadio from '@origam/components/Radio/OrigamRadio.vue'
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

describe('OrigamInput root wrapper — has a real id, distinct from the control (#421)', () => {
    it('the .origam-input root carries a non-empty, generated id', () => {
        const wrapper = mount(OrigamInput, {
            props: { id: SENTINEL },
            global: { plugins: [createOrigam()] }
        })
        const rootId = wrapper.attributes('id')
        expect(rootId).toBeTruthy()
        // Deliberately NOT the consumer id — see the header comment.
        expect(rootId).not.toBe(SENTINEL)
        wrapper.unmount()
    })
})

describe('#421 — no duplicate DOM id once the root wrapper has one', () => {
    it.each([
        ['Checkbox', OrigamCheckbox, {}],
        ['Switch', OrigamSwitch, {}],
        ['Radio', OrigamRadio, {}],
        ['NumberField (compact)', OrigamNumberField, { compact: true }],
        ['NumberField (default)', OrigamNumberField, {}]
    ])('%s — exactly one element carries the consumer id (the real control, not the wrapper)', async (_name, Component, extraProps) => {
        const wrapper = mount(Component as any, {
            props: { id: SENTINEL, ...extraProps },
            global: { plugins: [createOrigam()] },
            attachTo: document.body
        })
        await nextTick()
        await nextTick()

        const matches = document.querySelectorAll(`[id="${SENTINEL}"]`)
        expect(matches.length).toBe(1)

        // The wrapper itself must NOT be the element carrying it — it has
        // its OWN (different) id.
        expect(wrapper.attributes('id')).not.toBe(SENTINEL)

        wrapper.unmount()
    })
})
