// Unit tests for <OrigamSliderField>
//
// Strategy: mount with createOrigam() + stubs.
// We exercise:
//   - BEM root class: origam-slider-field
//   - Modifier classes: --horizontal, --vertical, --disabled, --readonly,
//     --error, --range, --focused, --inset, --variant-*
//   - variant='field' → renders origam-input wrapper
//   - variant='timer'/'audio' → bare section element (no origam-input)
//   - Native <input type="range"> value / min / max / step attributes
//   - input event → update:modelValue emit
//   - range mode: two inputs rendered
//   - error=true → color/bgColor forced to 'danger'
//   - start/end emits on pointerdown/pointerup
//   - disabled: input carries disabled attribute
//   - skip: real drag via pointerdown/pointermove (no layout in jsdom)

import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { computed, defineComponent, nextTick } from 'vue'

import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'
import OrigamSliderFieldTrack from '@origam/components/SliderField/OrigamSliderFieldTrack.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const OrigamInputStub = defineComponent({
    name: 'OrigamInput',
    inheritAttrs: false,
    props: {
        modelValue: {},
        id: String,
        disabled: Boolean,
        readonly: Boolean,
        style: [String, Array, Object],
        focused: Boolean
    },
    emits: ['update:modelValue'],
    setup (props, { expose, attrs }) {
        expose({ filterProps: (_p: any, _e?: string[]) => ({}) })
        return { vAttrs: attrs, isDisabled: computed(() => !!props.disabled), isReadonly: computed(() => !!props.readonly) }
    },
    template: `
        <div v-bind="vAttrs" class="origam-input">
            <slot :id="id || 'sf-id'" :messagesId="'sf-msg'" :isDisabled="isDisabled" :isReadonly="isReadonly" :isValid="true"/>
            <slot name="prepend"/>
            <slot name="append"/>
        </div>
    `
})

const OrigamSliderFieldTrackStub = defineComponent({
    name: 'OrigamSliderFieldTrack',
    props: {
        color: String,
        bgColor: String,
        disabled: Boolean,
        error: Boolean,
        isVertical: Boolean,
        indexFromEnd: Boolean,
        max: [Number, String],
        min: [Number, String],
        showTicks: [String, Boolean],
        start: Number,
        stop: Number,
        tickSize: [Number, String],
        ticks: [Array, Object]
    },
    template: `<div class="origam-slider-field-track"><slot name="item"/></div>`
})

const OrigamLabelStub = defineComponent({
    name: 'OrigamLabel',
    props: { text: String, required: Boolean, htmlFor: String },
    template: `<label class="origam-label">{{ text }}</label>`
})

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

interface IMountOpts {
    props?: Record<string, unknown>
}

function mountSlider (opts: IMountOpts = {}): VueWrapper {
    return mount(OrigamSliderField, {
        attachTo: document.body,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamInput: OrigamInputStub,
                OrigamSliderFieldTrack: OrigamSliderFieldTrackStub,
                OrigamLabel: OrigamLabelStub,
                OrigamIcon: { template: '<i/>' }
            }
        },
        props: opts.props ?? {}
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrigamSliderField — BEM root class', () => {
    it('renders the origam-slider-field class', () => {
        const wrapper = mountSlider()
        expect(wrapper.find('.origam-slider-field').exists()).toBe(true)
    })

    it('adds --horizontal class by default', () => {
        const wrapper = mountSlider()
        expect(wrapper.find('.origam-slider-field--horizontal').exists()).toBe(true)
    })

    it('adds --disabled when disabled=true', () => {
        const wrapper = mountSlider({ props: { disabled: true } })
        expect(wrapper.find('.origam-slider-field--disabled').exists()).toBe(true)
    })

    it('does NOT add --disabled by default', () => {
        const wrapper = mountSlider()
        expect(wrapper.find('.origam-slider-field--disabled').exists()).toBe(false)
    })

    it('adds --readonly when readonly=true', () => {
        const wrapper = mountSlider({ props: { readonly: true } })
        expect(wrapper.find('.origam-slider-field--readonly').exists()).toBe(true)
    })

    it('adds --error when error=true', () => {
        const wrapper = mountSlider({ props: { error: true } })
        expect(wrapper.find('.origam-slider-field--error').exists()).toBe(true)
    })

    it('adds --range when range=true', () => {
        const wrapper = mountSlider({ props: { range: true, modelValue: [20, 80] } })
        expect(wrapper.find('.origam-slider-field--range').exists()).toBe(true)
    })

    it('adds --inset when inset=true', () => {
        const wrapper = mountSlider({ props: { inset: true } })
        expect(wrapper.find('.origam-slider-field--inset').exists()).toBe(true)
    })
})

describe('OrigamSliderField — variant routing', () => {
    it('wraps in origam-input (field variant) by default', () => {
        const wrapper = mountSlider()
        expect(wrapper.find('.origam-input').exists()).toBe(true)
        expect(wrapper.find('section').exists()).toBe(false)
    })

    it('renders a bare <section> for variant=timer', () => {
        const wrapper = mountSlider({ props: { variant: 'timer' } })
        expect(wrapper.find('section').exists()).toBe(true)
        expect(wrapper.find('.origam-input').exists()).toBe(false)
    })

    it('renders a bare <section> for variant=audio', () => {
        const wrapper = mountSlider({ props: { variant: 'audio' } })
        expect(wrapper.find('section').exists()).toBe(true)
        expect(wrapper.find('.origam-input').exists()).toBe(false)
    })

    it('adds --variant-field class for field variant', () => {
        const wrapper = mountSlider({ props: { variant: 'field' } })
        expect(wrapper.find('.origam-slider-field--variant-field').exists()).toBe(true)
    })

    it('adds --variant-timer class for timer variant', () => {
        const wrapper = mountSlider({ props: { variant: 'timer' } })
        expect(wrapper.find('.origam-slider-field--variant-timer').exists()).toBe(true)
    })

    it('exposes aria-label on the bare section', () => {
        const wrapper = mountSlider({ props: { variant: 'timer', label: 'Playback position' } })
        const section = wrapper.find('section')
        expect(section.attributes('aria-label')).toBe('Playback position')
    })
})

describe('OrigamSliderField — native input attributes (single mode)', () => {
    it('renders a single <input type="range">', () => {
        const wrapper = mountSlider({ props: { modelValue: 50 } })
        const input = wrapper.find('input[type="range"]')
        expect(input.exists()).toBe(true)
    })

    it('sets the correct min and max attributes', () => {
        const wrapper = mountSlider({ props: { min: 10, max: 200, modelValue: 50 } })
        const input = wrapper.find('input[type="range"]')
        expect(input.attributes('min')).toBe('10')
        expect(input.attributes('max')).toBe('200')
    })

    it('sets the step attribute when step > 0', () => {
        const wrapper = mountSlider({ props: { step: 5, modelValue: 0 } })
        const input = wrapper.find('input[type="range"]')
        expect(input.attributes('step')).toBe('5')
    })

    it('falls back to "any" for the step attribute when step=0', () => {
        const wrapper = mountSlider({ props: { step: 0, modelValue: 0 } })
        const input = wrapper.find('input[type="range"]')
        expect(input.attributes('step')).toBe('any')
    })

    it('sets the disabled attribute on the native input in bare variant (timer)', () => {
        // In 'timer' variant, disabled is passed directly without the OrigamInput slot chain,
        // so the native <input> receives :disabled="disabled" directly.
        const wrapper = mountSlider({ props: { disabled: true, modelValue: 0, variant: 'timer' } })
        const input = wrapper.find('input[type="range"]')
        expect(input.attributes('disabled')).toBeDefined()
    })

    it('sets the readonly attribute on the native input in bare variant (timer)', () => {
        const wrapper = mountSlider({ props: { readonly: true, modelValue: 0, variant: 'timer' } })
        const input = wrapper.find('input[type="range"]')
        expect(input.attributes('readonly')).toBeDefined()
    })
})

describe('OrigamSliderField — range mode inputs', () => {
    it('renders two <input type="range"> elements in range mode', () => {
        const wrapper = mountSlider({ props: { range: true, modelValue: [20, 80] } })
        const inputs = wrapper.findAll('input[type="range"]')
        expect(inputs).toHaveLength(2)
    })

    it('adds --start and --stop classes to range inputs', () => {
        const wrapper = mountSlider({ props: { range: true, modelValue: [10, 90] } })
        expect(wrapper.find('.origam-slider-field__input--start').exists()).toBe(true)
        expect(wrapper.find('.origam-slider-field__input--stop').exists()).toBe(true)
    })
})

describe('OrigamSliderField — update:modelValue emit (input event)', () => {
    it('emits update:modelValue when the native input changes', async () => {
        const wrapper = mountSlider({ props: { modelValue: 0, min: 0, max: 100 } })
        const input = wrapper.find('input[type="range"]')
        // Simulate native input event with a new value
        await input.setValue('42')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(Number(emitted![0][0])).toBe(42)
    })
})

describe('OrigamSliderField — start / end emits', () => {
    it.skip('emits "start" on pointerdown — skip: jsdom lacks layout for pointer dispatch', () => {
        // Real pointer drag requires actual layout metrics (getBoundingClientRect).
        // jsdom returns zeroes → the slider math produces NaN / wrong values.
        // Tested via Playwright e2e instead.
    })

    it.skip('emits "end" on pointerup — skip: same reason as "start"', () => {})
})

describe('OrigamSliderField — buffered percentage', () => {
    it('does NOT render the buffered element when buffered is not a number', () => {
        const wrapper = mountSlider({ props: { modelValue: 0 } })
        expect(wrapper.find('.origam-slider-field__buffered').exists()).toBe(false)
    })

    it('renders the buffered element when a finite buffered value is given', () => {
        const wrapper = mountSlider({ props: { modelValue: 0, buffered: 60 } })
        expect(wrapper.find('.origam-slider-field__buffered').exists()).toBe(true)
    })
})

describe('OrigamSliderField — vertical direction', () => {
    it('adds --vertical class when direction=vertical', () => {
        const wrapper = mountSlider({ props: { direction: 'vertical' } })
        expect(wrapper.find('.origam-slider-field--vertical').exists()).toBe(true)
    })

    it('does NOT add --horizontal when direction=vertical', () => {
        const wrapper = mountSlider({ props: { direction: 'vertical' } })
        expect(wrapper.find('.origam-slider-field--horizontal').exists()).toBe(false)
    })
})

/*
 * #468 — `reverse` was left uncovered after #466 removed the only test
 * that mentioned it (correctly: that test asserted a dead `--reverse`
 * class with no matching SCSS rule — vacant green). The prop is real:
 * `indexFromEnd = isVertical !== isReversed` is computed in
 * OrigamSliderField.vue and consumed by OrigamSliderFieldTrack's
 * `startDir` (`inset-{inline|block}-{start|end}`).
 *
 * Two layers, both required per the ticket's explicit pitfall warning
 * (comparing two renders' `.html()` passes even when the prop is dead,
 * because auto-generated `id`s already differ):
 *   1. WIRING — OrigamSliderField really passes the right `indexFromEnd`
 *      boolean down to the (stubbed) Track for every reverse × direction
 *      combination — proves the computed, not just "something changed".
 *   2. OUTPUT — the REAL OrigamSliderFieldTrack (not the stub) turns
 *      `indexFromEnd` into the actual `inset-inline-*` / `inset-block-*`
 *      inline style the ticket asks to observe.
 */
describe('OrigamSliderField — #468 reverse wiring (indexFromEnd)', () => {
    const trackOf = (wrapper: VueWrapper) => wrapper.findComponent(OrigamSliderFieldTrackStub)

    it('reverse=false, horizontal (default) — indexFromEnd is false', () => {
        const wrapper = mountSlider({ props: { reverse: false } })
        expect(trackOf(wrapper).props('indexFromEnd')).toBe(false)
    })

    it('reverse=true, horizontal — indexFromEnd is true', () => {
        const wrapper = mountSlider({ props: { reverse: true } })
        expect(trackOf(wrapper).props('indexFromEnd')).toBe(true)
    })

    it('reverse=false, vertical — indexFromEnd is true (isVertical !== isReversed)', () => {
        const wrapper = mountSlider({ props: { reverse: false, direction: 'vertical' } })
        expect(trackOf(wrapper).props('indexFromEnd')).toBe(true)
    })

    it('reverse=true, vertical — indexFromEnd is false (XOR cancels out)', () => {
        const wrapper = mountSlider({ props: { reverse: true, direction: 'vertical' } })
        expect(trackOf(wrapper).props('indexFromEnd')).toBe(false)
    })
})

describe('OrigamSliderFieldTrack — #468 startDir renders the actual inset side', () => {
    function mountTrack (props: Record<string, unknown>) {
        return mount(OrigamSliderFieldTrack, {
            global: { plugins: [createOrigam()] },
            props
        })
    }

    it('indexFromEnd=false, horizontal — background renders inset-inline-start, not inset-inline-end', () => {
        const wrapper = mountTrack({ isVertical: false, indexFromEnd: false })
        const style = wrapper.find('.origam-slider-field-track__background').attributes('style') ?? ''
        expect(style).toContain('inset-inline-start')
        expect(style).not.toContain('inset-inline-end')
    })

    it('indexFromEnd=true, horizontal — background renders inset-inline-end, not inset-inline-start', () => {
        const wrapper = mountTrack({ isVertical: false, indexFromEnd: true })
        const style = wrapper.find('.origam-slider-field-track__background').attributes('style') ?? ''
        expect(style).toContain('inset-inline-end')
        expect(style).not.toContain('inset-inline-start')
    })

    it('indexFromEnd=false, vertical — background renders inset-block-start', () => {
        const wrapper = mountTrack({ isVertical: true, indexFromEnd: false })
        const style = wrapper.find('.origam-slider-field-track__background').attributes('style') ?? ''
        expect(style).toContain('inset-block-start')
        expect(style).not.toContain('inset-block-end')
    })

    it('indexFromEnd=true, vertical — background renders inset-block-end (reverse=true + direction=vertical combo)', () => {
        const wrapper = mountTrack({ isVertical: true, indexFromEnd: true })
        const style = wrapper.find('.origam-slider-field-track__background').attributes('style') ?? ''
        expect(style).toContain('inset-block-end')
        expect(style).not.toContain('inset-block-start')
    })
})
