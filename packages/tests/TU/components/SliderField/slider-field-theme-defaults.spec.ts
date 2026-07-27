// Regression coverage for #279 — `<OrigamSliderField>` never called
// `useDefaults()`, so `theme.components['origam-slider-field']` (e.g.
// `color`) was completely inert: the resolved `props.color` always fell
// straight through to `withDefaults()` (`undefined`), never picking up a
// theme-level default.
//
// NOTE on `rounded`: the issue text also named `rounded` as inert. That was
// root-caused as a distinct, deeper gap — the prop was never CONSUMED at
// all (no `useRounded()` call anywhere in `OrigamSliderField.vue`), so
// `useDefaults()` alone couldn't have fixed it. Tracked and fixed
// separately in #283 — see `slider-field-rounded.spec.ts`.

import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

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
    setup (_props, { expose, attrs }) {
        expose({ filterProps: (_p: any, _e?: string[]) => ({}) })
        return { vAttrs: attrs }
    },
    template: `
        <div v-bind="vAttrs" class="origam-input">
            <slot :id="'sf-id'" :messagesId="'sf-msg'" :isDisabled="false" :isReadonly="false" :isValid="true"/>
        </div>
    `
})

const OrigamSliderFieldTrackStub = defineComponent({
    name: 'OrigamSliderFieldTrack',
    props: { color: String, bgColor: String },
    template: `<div class="origam-slider-field-track"/>`
})

const THEME: IOrigamTheme = {
    name: 'slider-defaults-theme',
    mode: 'light',
    components: {
        'origam-slider-field': { color: 'rgb(255, 0, 128)' }
    },
    vars: {}
}

const mountThemedSlider = (props: Record<string, unknown> = {}) => {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('slider-defaults-theme', 'light')

    return mount(OrigamSliderField, {
        attachTo: document.body,
        global: {
            plugins: [origam],
            stubs: {
                OrigamInput: OrigamInputStub,
                OrigamSliderFieldTrack: OrigamSliderFieldTrackStub,
                OrigamLabel: { template: '<label/>' },
                OrigamIcon: { template: '<i/>' }
            }
        },
        props: { modelValue: 40, ...props }
    })
}

describe('OrigamSliderField — theme.components["origam-slider-field"] resolution (#279)', () => {
    it('applies the theme color to the thumb surface', () => {
        const wrapper = mountThemedSlider()
        const thumb = wrapper.find('.origam-slider-field-thumb__surface')
        expect(thumb.exists()).toBe(true)
        expect(thumb.attributes('style') ?? '').toContain('rgb(255, 0, 128)')
        wrapper.unmount()
    })

    it('applies the theme color to the forwarded track props', () => {
        const wrapper = mountThemedSlider()
        const track = wrapper.findComponent(OrigamSliderFieldTrackStub)
        expect(track.props('color')).toBe('rgb(255, 0, 128)')
        wrapper.unmount()
    })

    it('an explicit color prop on the consumer still wins over the theme default', () => {
        const wrapper = mountThemedSlider({ color: 'rgb(10, 20, 30)' })
        const thumb = wrapper.find('.origam-slider-field-thumb__surface')
        expect(thumb.attributes('style') ?? '').toContain('rgb(10, 20, 30)')
        expect(thumb.attributes('style') ?? '').not.toContain('rgb(255, 0, 128)')
        wrapper.unmount()
    })
})
