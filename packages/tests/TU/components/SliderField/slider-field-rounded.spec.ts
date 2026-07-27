// Regression coverage for #283 — `<OrigamSliderField>` declared `rounded`
// on `ISliderFieldProps` (via `IRoundedProps`) but never consumed it: no
// `useRounded()` call, no forwarding to the track sub-component, no
// `var(--origam-slider-field---border-radius)` in the SCSS — every radius
// in the component was a hardcoded `999px` / `9999px` / `50%`. Configuring
// `rounded` (via prop OR theme `components['origam-slider-field'].rounded`)
// was a complete no-op.
//
// The fix wires `useRounded(resolvedRounded)` in `OrigamSliderField.vue`,
// where `resolvedRounded = trackProps?.rounded ?? rounded` — this reuses
// `OrigamSliderFieldTrack`'s ALREADY-correct `useRounded()` wiring (no
// duplicated logic) by forwarding the resolved value as an explicit
// `:rounded` binding, and drives the `__buffered` fill's inline style so it
// always matches the rail's shape. A new `--origam-slider-field---border-
// radius` token (see `tokens/component/slider-field.json`) backs every
// previously-hardcoded radius owned directly by `OrigamSliderField.vue`
// (buffered fill + the inset/bare `:deep()` track overrides) as the
// themeable default, independent of the `rounded` prop.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamSliderField from '@origam/components/SliderField/OrigamSliderField.vue'

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
    props: { color: String, bgColor: String, rounded: [Boolean, Number, String] },
    template: `<div class="origam-slider-field-track"/>`
})

const mountSlider = (props: Record<string, unknown> = {}, themes: Array<IOrigamTheme> = []) => {
    const origam = createOrigam({ themes })
    if (themes.length) {
        const theme = themes[0]
        origam._defaultsRef.value = origam._activeDefaultsFor(theme.name, theme.mode ?? 'light')
    }

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

describe('OrigamSliderField — `rounded` prop consumption (#283)', () => {
    it('forwards the top-level `rounded` prop to the track sub-component', () => {
        const wrapper = mountSlider({ rounded: 'lg' })
        const track = wrapper.findComponent(OrigamSliderFieldTrackStub)
        expect(track.props('rounded')).toBe('lg')
        wrapper.unmount()
    })

    it('an explicit `trackProps.rounded` wins over the top-level `rounded`', () => {
        const wrapper = mountSlider({ rounded: 'lg', trackProps: { rounded: 'sm' } })
        const track = wrapper.findComponent(OrigamSliderFieldTrackStub)
        expect(track.props('rounded')).toBe('sm')
        wrapper.unmount()
    })

    it('leaves the track `rounded` unset when the prop is not configured', () => {
        const wrapper = mountSlider()
        const track = wrapper.findComponent(OrigamSliderFieldTrackStub)
        expect(track.props('rounded')).toBeFalsy()
        wrapper.unmount()
    })

    it('applies an inline border-radius to the `__buffered` fill matching the resolved rounded value', () => {
        const wrapper = mountSlider({ rounded: 'sm', buffered: 50 })
        const buffered = wrapper.find('.origam-slider-field__buffered')
        expect(buffered.exists()).toBe(true)
        expect(buffered.attributes('style') ?? '').toContain('border-radius')
        wrapper.unmount()
    })

    it('does NOT set an inline border-radius on `__buffered` when rounded is unset (CSS token fallback owns it)', () => {
        const wrapper = mountSlider({ buffered: 50 })
        const buffered = wrapper.find('.origam-slider-field__buffered')
        expect(buffered.exists()).toBe(true)
        expect(buffered.attributes('style') ?? '').not.toContain('border-radius')
        wrapper.unmount()
    })

    it('resolves a theme `components["origam-slider-field"].rounded` default onto the track', () => {
        const THEME: IOrigamTheme = {
            name: 'slider-rounded-theme',
            mode: 'light',
            components: {
                'origam-slider-field': { rounded: 'md' }
            },
            vars: {}
        }
        const wrapper = mountSlider({}, [THEME])
        const track = wrapper.findComponent(OrigamSliderFieldTrackStub)
        expect(track.props('rounded')).toBe('md')
        wrapper.unmount()
    })

    it('an explicit consumer `rounded` prop still wins over the theme default', () => {
        const THEME: IOrigamTheme = {
            name: 'slider-rounded-theme-2',
            mode: 'light',
            components: {
                'origam-slider-field': { rounded: 'md' }
            },
            vars: {}
        }
        const wrapper = mountSlider({ rounded: 'xl' }, [THEME])
        const track = wrapper.findComponent(OrigamSliderFieldTrackStub)
        expect(track.props('rounded')).toBe('xl')
        wrapper.unmount()
    })
})
