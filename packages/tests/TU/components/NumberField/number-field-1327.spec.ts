// #1327 — hideControls must not pass an (empty) prependInner slot; no model write at mount; `clamp` opt-out.
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'

import OrigamNumberField from '@origam/components/NumberField/OrigamNumberField.vue'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
    global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
})

let seenPrependInner: boolean | null = null
const TextFieldStub = {
    name: 'OrigamTextField',
    inheritAttrs: false,
    props: ['modelValue'],
    emits: ['update:modelValue', 'blur'],
    setup (_p: unknown, { slots }: { slots: Record<string, unknown> }) {
        seenPrependInner = !!slots.prependInner
        return () => h('div', { 'data-cy': 'tf' })
    }
}

const mountNf = (props: Record<string, unknown>, slots: Record<string, () => unknown> = {}) =>
    mount(OrigamNumberField, {
        props,
        slots: slots as never,
        global: { plugins: [createOrigam()], stubs: { OrigamTextField: TextFieldStub, OrigamBtn: true, OrigamDivider: true, OrigamIcon: true } }
    })

describe('OrigamNumberField #1327', () => {
    it('hideControls: no prependInner slot is passed down', () => {
        mountNf({ hideControls: true })
        expect(seenPrependInner).toBe(false)
    })
    it('hideControls + caller prependInner slot: slot still passed', () => {
        mountNf({ hideControls: true }, { prependInner: () => 'x' })
        expect(seenPrependInner).toBe(true)
    })
    it('split + controls shown: prependInner slot passed', () => {
        mountNf({ split: true })
        expect(seenPrependInner).toBe(true)
    })
    it('#1449 no split: controls live in appendInner, no (empty) prependInner slot', () => {
        mountNf({})
        expect(seenPrependInner).toBe(false)
    })
    it('mount never writes the model, even out of bounds', () => {
        const w = mountNf({ modelValue: 27, min: 2000, max: 2100 })
        expect(w.emitted('update:modelValue')).toBeUndefined()
    })
})
