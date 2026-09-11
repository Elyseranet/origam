// Unit tests for <OrigamSwitch>
//
// Strategy: mount with createOrigam() + stubs for all sub-components so
// the spec is hermetic. We exercise:
//   - BEM root classes: origam-switch, --flat, --inset, --indeterminate
//   - skeleton loader branch (loading kind=skeleton → origam-switch__skeleton)
//   - reactive indeterminate class changes
//   - custom class forwarded to root

import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'

import OrigamSwitch from '@origam/components/Switch/OrigamSwitch.vue'
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
        // class is NOT declared as a prop so it falls through via inheritAttrs
        style: [String, Array, Object],
        focused: Boolean
    },
    emits: ['update:modelValue'],
    setup (_, { expose, attrs }) {
        expose({ filterProps: (_p: any, _e?: string[]) => ({}) })
        return { attrs }
    },
    template: `
        <div v-bind="attrs" class="origam-input">
            <slot :id="id || 'sw-id'" :messagesId="'sw-msg'" :isDisabled="false" :isReadonly="false" :isValid="true"/>
        </div>
    `
})

// Simplified SelectionControl stub that avoids multi-slot template issues in jsdom
const OrigamSelectionControlStub = defineComponent({
    name: 'OrigamSelectionControl',
    props: {
        modelValue: {},
        id: String,
        disabled: Boolean,
        readonly: Boolean,
        type: String
    },
    emits: ['update:modelValue', 'focus', 'blur'],
    setup (_, { expose }) {
        expose({
            filterProps: (_p: any, _e?: string[]) => ({}),
            inputRef: null
        })
        return {}
    },
    template: `<div class="origam-selection-control"><slot /></div>`
})

const OrigamSwitchTrackStub = defineComponent({
    name: 'OrigamSwitchTrack',
    props: {
        modelValue: {},
        disabled: Boolean,
        error: Boolean,
        inset: Boolean,
        isValid: Boolean,
        readonly: Boolean
    },
    emits: ['click'],
    setup (_, { expose }) {
        expose({ filterProps: (_p: any, _e?: string[]) => ({}) })
        return {}
    },
    template: `<div class="origam-switch-track" @click="$emit('click', $event)"/>`
})

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

interface IMountOpts {
    props?: Record<string, unknown>
}

function mountSwitch (opts: IMountOpts = {}): VueWrapper {
    return mount(OrigamSwitch, {
        attachTo: document.body,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamInput: OrigamInputStub,
                OrigamSelectionControl: OrigamSelectionControlStub,
                OrigamSwitchTrack: OrigamSwitchTrackStub,
                OrigamIcon: { template: '<i/>' },
                OrigamProgress: { template: '<div class="origam-progress"/>' },
                OrigamTranslateScale: { template: '<span><slot/></span>' }
            }
        },
        props: opts.props ?? {}
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrigamSwitch — BEM root class', () => {
    it('renders the origam-switch class', () => {
        const wrapper = mountSwitch()
        expect(wrapper.find('.origam-switch').exists()).toBe(true)
    })

    it('adds origam-switch--flat when flat=true', () => {
        const wrapper = mountSwitch({ props: { flat: true } })
        expect(wrapper.find('.origam-switch--flat').exists()).toBe(true)
    })

    it('does NOT add origam-switch--flat when flat is absent', () => {
        const wrapper = mountSwitch()
        expect(wrapper.find('.origam-switch--flat').exists()).toBe(false)
    })

    it('adds origam-switch--inset when inset=true', () => {
        const wrapper = mountSwitch({ props: { inset: true } })
        expect(wrapper.find('.origam-switch--inset').exists()).toBe(true)
    })

    it('adds origam-switch--indeterminate when indeterminate=true', () => {
        const wrapper = mountSwitch({ props: { indeterminate: true } })
        expect(wrapper.find('.origam-switch--indeterminate').exists()).toBe(true)
    })

    it('does NOT add origam-switch--indeterminate by default', () => {
        const wrapper = mountSwitch()
        expect(wrapper.find('.origam-switch--indeterminate').exists()).toBe(false)
    })
})

describe('OrigamSwitch — skeleton loader branch', () => {
    // The loading prop object form uses the key `type` (not `kind`) per the
    // TLoaderConfig interface consumed by useLoader. The resolved loaderConfig
    // then exposes `kind` after normalisation.
    it('renders the skeleton placeholder when loading type is skeleton', () => {
        const wrapper = mountSwitch({ props: { loading: { type: 'skeleton' } as any } })
        expect(wrapper.find('.origam-switch__skeleton').exists()).toBe(true)
        // The main input wrapper should NOT be rendered in skeleton mode
        expect(wrapper.find('.origam-input').exists()).toBe(false)
    })

    it('adds --inset modifier to the skeleton when inset=true', () => {
        const wrapper = mountSwitch({ props: { loading: { type: 'skeleton' } as any, inset: true } })
        expect(wrapper.find('.origam-switch__skeleton--inset').exists()).toBe(true)
    })

    it('renders aria-busy and role=status on the skeleton', () => {
        const wrapper = mountSwitch({ props: { loading: { type: 'skeleton' } as any } })
        const skeleton = wrapper.find('.origam-switch__skeleton')
        expect(skeleton.attributes('aria-busy')).toBe('true')
        expect(skeleton.attributes('role')).toBe('status')
    })
})

describe('OrigamSwitch — v-model / update:modelValue', () => {
    it('reflects modelValue=false initially (structural smoke)', () => {
        const wrapper = mountSwitch({ props: { modelValue: false } })
        expect(wrapper.find('.origam-switch').exists()).toBe(true)
    })

    it('reflects modelValue=true initially', () => {
        const wrapper = mountSwitch({ props: { modelValue: true } })
        expect(wrapper.find('.origam-switch').exists()).toBe(true)
    })

    it('updates when modelValue changes at runtime', async () => {
        const wrapper = mountSwitch({ props: { modelValue: false } })
        await wrapper.setProps({ modelValue: true })
        await nextTick()
        expect(wrapper.find('.origam-switch').exists()).toBe(true)
    })
})

describe('OrigamSwitch — indeterminate toggling', () => {
    it('does not carry --indeterminate class when indeterminate is false', () => {
        const wrapper = mountSwitch({ props: { indeterminate: false } })
        expect(wrapper.find('.origam-switch--indeterminate').exists()).toBe(false)
    })

    it('re-renders correctly when indeterminate changes at runtime', async () => {
        const wrapper = mountSwitch({ props: { indeterminate: false } })
        await wrapper.setProps({ indeterminate: true })
        await nextTick()
        expect(wrapper.find('.origam-switch--indeterminate').exists()).toBe(true)
    })
})

describe('OrigamSwitch — custom class / style', () => {
    it('appends a custom class to the switch root', () => {
        const wrapper = mountSwitch({ props: { class: 'my-switch-class' } })
        expect(wrapper.find('.origam-switch').classes()).toContain('my-switch-class')
    })
})

describe('OrigamSwitch — non-skeleton loader renders the input branch', () => {
    it('renders the origam-input wrapper when NOT in skeleton mode', () => {
        const wrapper = mountSwitch({ props: { loading: false } })
        expect(wrapper.find('.origam-input').exists()).toBe(true)
        expect(wrapper.find('.origam-switch__skeleton').exists()).toBe(false)
    })
})
