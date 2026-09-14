// Unit tests for <OrigamColorPickerSwatches> — selection checkmark + disabled
// state (issue #401).
//
// Bug 1: `deepEqual(colorHsv, hsva)` compared `colorHsv` against the
// FUNCTION `hsva` itself, never `hsva(color)` (its return value). A function
// can never deep-equal a plain HSVA object, so the checkmark icon never
// rendered for any color, in any state.
//
// Bug 2: `disabled` is declared on `IColorPickerSwatchesProps` and forwarded
// by the parent, but was read nowhere in this component — clicking a swatch
// still emitted `update:colorHsv` even when `disabled` was true.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamColorPickerSwatches from '@origam/components/ColorPicker/OrigamColorPickerSwatches.vue'
import { createOrigam } from '@origam/origam'

import type { TRGBA } from '@origam/types'

const RED: TRGBA = {r: 255, g: 0, b: 0, a: 1}
const GREEN: TRGBA = {r: 0, g: 255, b: 0, a: 1}

function mountSwatches (props: Record<string, unknown> = {}) {
    return mount(OrigamColorPickerSwatches, {
        props: {
            swatches: [[RED, GREEN]],
            ...props
        } as never,
        global: {plugins: [createOrigam()]}
    })
}

describe('OrigamColorPickerSwatches — selection checkmark (#401)', () => {
    it('renders no checkmark icon when colorHsv matches nothing', () => {
        const wrapper = mountSwatches()

        expect(wrapper.findComponent({name: 'OrigamIcon'}).exists()).toBe(false)
    })

    it('renders exactly one checkmark icon on the swatch matching colorHsv', async () => {
        const wrapper = mountSwatches()

        await wrapper.findAll('.origam-color-picker-swatches__color')[0].trigger('click')

        const emitted = wrapper.emitted('update:colorHsv')
        expect(emitted).toBeTruthy()
        const emittedHsv = emitted![0][0]

        await wrapper.setProps({colorHsv: emittedHsv} as never)

        const icons = wrapper.findAllComponents({name: 'OrigamIcon'})
        expect(icons).toHaveLength(1)
    })
})

describe('OrigamColorPickerSwatches — disabled (#401)', () => {
    it('does not emit update:colorHsv when disabled and a swatch is clicked', async () => {
        const wrapper = mountSwatches({disabled: true})

        await wrapper.findAll('.origam-color-picker-swatches__color')[0].trigger('click')

        expect(wrapper.emitted('update:colorHsv')).toBeFalsy()
    })

    it('still emits update:colorHsv when NOT disabled', async () => {
        const wrapper = mountSwatches({disabled: false})

        await wrapper.findAll('.origam-color-picker-swatches__color')[0].trigger('click')

        expect(wrapper.emitted('update:colorHsv')).toBeTruthy()
    })
})

// ---------------------------------------------------------------------------
// issue #443 — each swatch was a bare <div @click>: no accessible name, no
// tabindex, no keyboard path at all.
// ---------------------------------------------------------------------------

describe('OrigamColorPickerSwatches — keyboard + accessible name (issue #443)', () => {
    it('renders real <button type="button"> swatches, not <div>', () => {
        const wrapper = mountSwatches()
        const swatch = wrapper.find('.origam-color-picker-swatches__color')
        expect(swatch.element.tagName).toBe('BUTTON')
        expect(swatch.attributes('type')).toBe('button')
    })

    it('carries a non-empty aria-label naming the color', () => {
        const wrapper = mountSwatches()
        const swatches = wrapper.findAll('.origam-color-picker-swatches__color')
        expect(swatches[0].attributes('aria-label')).toBeTruthy()
        expect(swatches[1].attributes('aria-label')).toBeTruthy()
        expect(swatches[0].attributes('aria-label')).not.toBe(swatches[1].attributes('aria-label'))
    })

    it('aria-pressed reflects the current selection (colorHsv prop)', async () => {
        const wrapper = mountSwatches()
        const first = wrapper.findAll('.origam-color-picker-swatches__color')[0]
        expect(first.attributes('aria-pressed')).toBe('false')

        await first.trigger('click')
        const emittedHsv = wrapper.emitted('update:colorHsv')![0][0]
        await wrapper.setProps({ colorHsv: emittedHsv } as never)

        expect(wrapper.findAll('.origam-color-picker-swatches__color')[0].attributes('aria-pressed')).toBe('true')
    })

    it('disabled swatches carry the native disabled attribute — unreachable by Tab, no click', async () => {
        const wrapper = mountSwatches({ disabled: true })
        const swatch = wrapper.find('.origam-color-picker-swatches__color')
        expect(swatch.attributes('disabled')).toBeDefined()
    })
})
