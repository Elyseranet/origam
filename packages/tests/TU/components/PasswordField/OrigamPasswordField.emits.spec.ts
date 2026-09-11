// Unit tests for <OrigamPasswordField> — C5 audit (does a declared emit
// really fire, and does a test prove it?).
//
// `click:control` / `mousedown:control` (relayed from the internal
// `<origam-field>`'s own `click` / `mousedown` emits) and `update:strength`
// (fired from a `watch` on the computed password strength level) are all
// correctly wired in the component script — nothing in the existing spec
// file asserted any of the three.

import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import OrigamPasswordField from '@origam/components/PasswordField/OrigamPasswordField.vue'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
    global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
})

const OrigamInputStub = {
    name: 'OrigamInput',
    inheritAttrs: false,
    props: ['modelValue', 'focused', 'rules', 'disabled', 'readonly',
        'validationValue', 'name', 'id', 'error', 'errorMessages', 'hideDetails',
        'centerAffix', 'direction', 'density'],
    emits: ['update:modelValue', 'click:prepend', 'click:append'],
    setup () {
        return {
            filterProps: (sourceProps: any, _exclude?: string[]) => ({
                disabled: sourceProps.disabled,
                readonly: sourceProps.readonly
            })
        }
    },
    template: `
        <div data-cy="origam-input" v-bind="$attrs">
            <slot :id="id || 'pf-1'" :is-disabled="!!disabled" :is-dirty="false" :is-valid="true" :is-readonly="!!readonly" />
            <slot name="details" />
        </div>
    `
}

const OrigamFieldStub = {
    name: 'OrigamField',
    inheritAttrs: false,
    props: ['id', 'active', 'dirty', 'disabled', 'error', 'focused', 'role',
        'class', 'style', 'rounded', 'label', 'variant', 'clearIcon', 'clearable'],
    emits: ['click', 'mousedown', 'click:clear', 'click:prepend-inner', 'click:append-inner'],
    setup () {
        return { filterProps: (_props: any, _exclude?: string[]) => ({}) }
    },
    template: `
        <div data-cy="origam-field">
            <slot :class="'field-class'" :ref="() => {}" />
            <slot name="appendInner"/>
        </div>
    `
}

const OrigamCounterStub = {
    name: 'OrigamCounter',
    props: ['active', 'disabled', 'max', 'value'],
    template: `<div data-cy="origam-counter" />`
}

const OrigamMenuStub = {
    name: 'OrigamMenu',
    props: ['modelValue', 'persistent', 'target', 'contentClass', 'closeDelay',
        'closeOnContentClick', 'locationStrategy', 'location', 'openDelay',
        'scrim', 'scrollStrategy', 'activatorProps'],
    template: `<div data-cy="origam-menu"><slot /></div>`
}

const OrigamIconStub = {
    name: 'OrigamIcon',
    props: ['icon', 'color'],
    template: `<i :data-icon="icon" />`
}

const OrigamChipStub = {
    name: 'OrigamChip',
    props: ['bgColor', 'prependIcon', 'text', 'class'],
    template: `<div class="origam-password-field__requirement-chip" v-bind="$attrs"><slot>{{ text }}</slot></div>`
}

const mountPasswordField = (props: Record<string, unknown> = {}): VueWrapper => {
    return mount(OrigamPasswordField, {
        attachTo: document.body,
        props,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamInput: OrigamInputStub,
                OrigamField: OrigamFieldStub,
                OrigamCounter: OrigamCounterStub,
                OrigamMenu: OrigamMenuStub,
                OrigamIcon: OrigamIconStub,
                OrigamChip: OrigamChipStub,
                OrigamRow: { template: '<div><slot /></div>' },
                OrigamCol: { template: '<div><slot /></div>' },
                OrigamSheet: { props: ['class', 'color', 'rounded'], template: '<div><slot /></div>' }
            }
        }
    })
}

describe('OrigamPasswordField — click:control / mousedown:control (C5)', () => {
    it('relays the internal field click as click:control', async () => {
        const wrapper = mountPasswordField()
        const field = wrapper.findComponent(OrigamFieldStub as never)

        field.vm.$emit('click', new MouseEvent('click'))
        await nextTick()

        expect(wrapper.emitted('click:control')).toBeTruthy()
    })

    it('relays the internal field mousedown as mousedown:control', async () => {
        const wrapper = mountPasswordField()
        const field = wrapper.findComponent(OrigamFieldStub as never)

        field.vm.$emit('mousedown', new MouseEvent('mousedown'))
        await nextTick()

        expect(wrapper.emitted('mousedown:control')).toBeTruthy()
    })
})

describe('OrigamPasswordField — update:strength (C5)', () => {
    it('emits update:strength when typing changes the computed level', async () => {
        const wrapper = mountPasswordField({ modelValue: '' })

        await wrapper.find('input').setValue('MyStr0ng!Pass')

        const emitted = wrapper.emitted('update:strength')
        expect(emitted).toBeTruthy()
        expect(emitted![emitted!.length - 1][0]).toBe('strong')
    })

    it('does not emit update:strength again when the level is unchanged', async () => {
        const wrapper = mountPasswordField({ modelValue: '' })

        await wrapper.find('input').setValue('MyStr0ng!Pass')
        const countAfterFirstChange = wrapper.emitted('update:strength')!.length

        await wrapper.find('input').setValue('MyStr0ng!Pass2')
        expect(wrapper.emitted('update:strength')!.length).toBe(countAfterFirstChange)
    })
})
