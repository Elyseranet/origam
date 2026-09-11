// Unit tests for OrigamMediaScrubber — headless scrubber primitive.
//
// What's covered:
//  - `modelValue` change updates `aria-valuenow` AND the thumb's inline
//    `left` (horizontal) / `bottom` (vertical) style channel.
//  - `disabled` drops the slider out of the tab order (`tabindex=-1`)
//    AND removes the `role="slider"` so AT users are not invited to
//    interact. Pointerdown becomes a no-op (no `@update:modelValue`).
//  - Keyboard ArrowRight (horizontal) emits `@update:modelValue` with
//    `value + step` (or +5 % of range when step=0). Mirror check for
//    ArrowUp on vertical.
//  - `buffered` prop renders the `__buffer` bar with the correct
//    width percentage; absent buffer hides the bar entirely.

import { mount, type VueWrapper } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrigamMediaScrubber from '@origam/components/Media/OrigamMediaScrubber.vue'

import type { IMediaScrubberProps } from '@origam/interfaces'

type MountOptions = Partial<IMediaScrubberProps>

const mountScrubber = (opts: MountOptions = {}): VueWrapper => {
    const defaults: IMediaScrubberProps = {
        modelValue: 0,
        max: 100,
        ariaLabel: 'Test scrubber'
    }
    return mount(OrigamMediaScrubber, {
        props: { ...defaults, ...opts } as IMediaScrubberProps
    })
}

describe('OrigamMediaScrubber — modelValue → aria + thumb position', () => {
    it('paints aria-valuenow with the clamped modelValue', () => {
        const wrapper = mountScrubber({ modelValue: 40, max: 100 })
        expect(wrapper.attributes('aria-valuenow')).toBe('40')
    })

    it('paints the horizontal thumb inline `left` from modelValue %', () => {
        const wrapper = mountScrubber({ modelValue: 25, max: 100 })
        const thumb = wrapper.find('.origam-media-scrubber__thumb')
        expect(thumb.attributes('style')).toMatch(/left:\s*25%/)
    })

    it('paints the vertical thumb inline `bottom` from modelValue %', () => {
        const wrapper = mountScrubber({ modelValue: 0.75, max: 1, orientation: 'vertical' })
        const thumb = wrapper.find('.origam-media-scrubber__thumb')
        expect(thumb.attributes('style')).toMatch(/bottom:\s*75%/)
    })

    it('clamps an out-of-range modelValue to [min, max]', () => {
        const wrapper = mountScrubber({ modelValue: 9999, max: 100 })
        expect(wrapper.attributes('aria-valuenow')).toBe('100')
    })

    it('updates aria-valuenow reactively when modelValue changes', async () => {
        const wrapper = mountScrubber({ modelValue: 10, max: 100 })
        expect(wrapper.attributes('aria-valuenow')).toBe('10')
        await wrapper.setProps({ modelValue: 60 })
        expect(wrapper.attributes('aria-valuenow')).toBe('60')
    })
})

describe('OrigamMediaScrubber — disabled', () => {
    it('removes role="slider" and drops tabindex to -1', () => {
        const wrapper = mountScrubber({ disabled: true })
        expect(wrapper.attributes('role')).toBeUndefined()
        expect(wrapper.attributes('tabindex')).toBe('-1')
        expect(wrapper.attributes('aria-disabled')).toBe('true')
    })

    it('keeps role="slider" and tabindex=0 when enabled', () => {
        const wrapper = mountScrubber()
        expect(wrapper.attributes('role')).toBe('slider')
        expect(wrapper.attributes('tabindex')).toBe('0')
    })

    it('ignores keyboard ArrowRight when disabled', async () => {
        const wrapper = mountScrubber({ disabled: true, modelValue: 10, max: 100 })
        await wrapper.trigger('keydown', { key: 'ArrowRight' })
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
})

describe('OrigamMediaScrubber — keyboard', () => {
    it('ArrowRight emits modelValue + step on horizontal', async () => {
        const wrapper = mountScrubber({ modelValue: 10, max: 100, step: 5 })
        await wrapper.trigger('keydown', { key: 'ArrowRight' })
        const events = wrapper.emitted('update:modelValue') as Array<Array<number>>
        expect(events).toBeTruthy()
        expect(events[0][0]).toBe(15)
    })

    it('ArrowRight emits modelValue + 5% of range when step=0', async () => {
        const wrapper = mountScrubber({ modelValue: 0, max: 100, step: 0 })
        await wrapper.trigger('keydown', { key: 'ArrowRight' })
        const events = wrapper.emitted('update:modelValue') as Array<Array<number>>
        expect(events).toBeTruthy()
        expect(events[0][0]).toBeCloseTo(5)
    })

    it('ArrowUp emits modelValue + step on vertical', async () => {
        const wrapper = mountScrubber({ modelValue: 0.5, max: 1, step: 0.1, orientation: 'vertical' })
        await wrapper.trigger('keydown', { key: 'ArrowUp' })
        const events = wrapper.emitted('update:modelValue') as Array<Array<number>>
        expect(events).toBeTruthy()
        expect(events[0][0]).toBeCloseTo(0.6, 5)
    })

    it('ArrowDown decreases on vertical, but ArrowLeft is a no-op on vertical', async () => {
        const wrapper = mountScrubber({ modelValue: 0.5, max: 1, step: 0.1, orientation: 'vertical' })
        await wrapper.trigger('keydown', { key: 'ArrowDown' })
        const downEvents = wrapper.emitted('update:modelValue') as Array<Array<number>>
        expect(downEvents).toBeTruthy()
        expect(downEvents[0][0]).toBeCloseTo(0.4, 5)

        await wrapper.trigger('keydown', { key: 'ArrowLeft' })
        // No additional event for ArrowLeft on vertical orientation.
        expect((wrapper.emitted('update:modelValue') as Array<Array<number>>).length).toBe(1)
    })

    it('Home jumps to min, End jumps to max', async () => {
        const wrapper = mountScrubber({ modelValue: 50, max: 100 })
        await wrapper.trigger('keydown', { key: 'Home' })
        await wrapper.trigger('keydown', { key: 'End' })
        const events = wrapper.emitted('update:modelValue') as Array<Array<number>>
        expect(events[0][0]).toBe(0)
        expect(events[1][0]).toBe(100)
    })

    it('PageUp / PageDown move by 10% of range (read from the current prop)', async () => {
        const wrapper = mountScrubber({ modelValue: 50, max: 100 })
        await wrapper.trigger('keydown', { key: 'PageUp' })
        const up = wrapper.emitted('update:modelValue') as Array<Array<number>>
        expect(up[0][0]).toBe(60)

        // PageDown reads from the PROP (parent hasn't written 60 back yet),
        // so 50 - 10 = 40 is the expected emit payload.
        await wrapper.trigger('keydown', { key: 'PageDown' })
        const down = wrapper.emitted('update:modelValue') as Array<Array<number>>
        expect(down[1][0]).toBe(40)
    })
})

describe('OrigamMediaScrubber — buffered prop', () => {
    it('renders the __buffer bar when `buffered` is set', () => {
        const wrapper = mountScrubber({ modelValue: 30, max: 100, buffered: 70 })
        const buffer = wrapper.find('.origam-media-scrubber__buffer')
        expect(buffer.exists()).toBe(true)
        expect(buffer.attributes('style')).toMatch(/width:\s*70%/)
    })

    it('omits the __buffer bar when `buffered` is undefined', () => {
        const wrapper = mountScrubber({ modelValue: 30, max: 100 })
        const buffer = wrapper.find('.origam-media-scrubber__buffer')
        expect(buffer.exists()).toBe(false)
    })
})

describe('OrigamMediaScrubber — change emit', () => {
    it('Home + End emit `change` (commit) in addition to `update:modelValue`', async () => {
        const wrapper = mountScrubber({ modelValue: 50, max: 100 })
        await wrapper.trigger('keydown', { key: 'Home' })
        const change = wrapper.emitted('change') as Array<Array<number>>
        expect(change).toBeTruthy()
        expect(change[0][0]).toBe(0)
    })
})
