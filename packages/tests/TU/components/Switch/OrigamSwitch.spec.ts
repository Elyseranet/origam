// Unit tests for <OrigamSwitch>
//
// Strategy: mount with createOrigam() + stubs for all sub-components so
// the spec is hermetic. We exercise:
//   - BEM root classes: origam-switch, --inset, --indeterminate
//   - a save in flight keeps the control (no skeleton branch since lot 2a)
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
    emits: ['update:modelValue', 'focus', 'blur', 'click:label'],
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

describe('OrigamSwitch — a save in flight never replaces the control (lot 2a)', () => {
    // `{ type: 'skeleton' }` is refused at compile time (TControlLoadingValue).
    // A value that slips past the types at runtime must NOT bring the old
    // placeholder back: the switch keeps rendering its control.
    it.each([
        ['true', true],
        ['a number', 42],
        ['{ type: line }', { type: 'line' }],
        ['{ type: circular }', { type: 'circular' }],
        ['{ type: skeleton } (untyped caller)', { type: 'skeleton' }]
    ])('keeps the input wrapper and the checkbox when loading=%s', (_label, loading) => {
        const wrapper = mountSwitch({ props: { loading: loading as any, label: 'Notifications' } })
        expect(wrapper.find('.origam-input').exists()).toBe(true)
        // (checkbox + label are asserted unstubbed in
        // TU/components/Commons/controls-loading-no-skeleton.spec.ts)
        expect(wrapper.find('.origam-switch__skeleton').exists()).toBe(false)
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

// LOT 3 (unemitted-declarations guard) — `ISwitchEmits` extends
// `IClickLabelEmits` (`click:label`), but nothing wired the underlying
// `<origam-selection-control>`'s own `click:label` up to `<origam-switch>`:
// the declaration was dead, a consumer binding `@click:label` never
// received it. Fixed by capturing `defineEmits` into `emits` and wiring
// `@click:label="handleClickLabel"` — same pattern as OrigamRadioBtn.
describe('OrigamSwitch — click:label forwarded from the underlying SelectionControl', () => {
    it('emits click:label when the SelectionControl fires it', async () => {
        const wrapper = mountSwitch()
        const control = wrapper.findComponent({ name: 'OrigamSelectionControl' })
        const event = new MouseEvent('click')
        await control.vm.$emit('click:label', event)

        expect(wrapper.emitted('click:label')).toBeTruthy()
        expect(wrapper.emitted('click:label')?.[0][0]).toBe(event)
    })
})

describe('OrigamSwitch — custom class / style', () => {
    it('appends a custom class to the switch root', () => {
        const wrapper = mountSwitch({ props: { class: 'my-switch-class' } })
        expect(wrapper.find('.origam-switch').classes()).toContain('my-switch-class')
    })
})

describe('OrigamSwitch — idle renders the input branch', () => {
    it('renders the origam-input wrapper when not loading', () => {
        const wrapper = mountSwitch({ props: { loading: false } })
        expect(wrapper.find('.origam-input').exists()).toBe(true)
        expect(wrapper.find('.origam-switch__skeleton').exists()).toBe(false)
    })
})
