// Unit tests for <OrigamPasswordField>
//
// Stubs: OrigamInput/OrigamField use v-bind="$attrs" + filterProps so class
// bindings propagate and the component's ref calls don't throw.

import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import OrigamPasswordField from '@origam/components/PasswordField/OrigamPasswordField.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Re-mock jsdom observers
// ---------------------------------------------------------------------------

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
    global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
})

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const OrigamInputStub = {
    name: 'OrigamInput',
    inheritAttrs: false,
    // 'class' and 'style' NOT in props so they flow through $attrs
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
    // appendInner is rendered directly in the template when !minimal
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

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

interface IMountOpts {
    props?: Record<string, unknown>
    slots?: Record<string, unknown>
}

const mountPasswordField = (opts: IMountOpts & { locale?: string } = {}): VueWrapper => {
    return mount(OrigamPasswordField, {
        attachTo: document.body,
        props: opts.props,
        slots: opts.slots,
        global: {
            plugins: [createOrigam(opts.locale ? { locale: { locale: opts.locale } } as never : undefined)],
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

// ---------------------------------------------------------------------------
// Tests — #1110 (reactive input attrs) / #1334 (length rule opt-in)
// ---------------------------------------------------------------------------

const runRules = (wrapper: VueWrapper, value: string): unknown[] => {
    const rules = wrapper.findComponent({ name: 'OrigamInput' }).props('rules') as Array<(v: unknown) => unknown>
    return rules.map(rule => rule(value)).filter(result => result !== true)
}

describe('OrigamPasswordField — input attrs follow the consumer (#1110)', () => {
    it('forwards aria-invalid / aria-describedby set AFTER mount to the <input>', async () => {
        const wrapper = mount({
            components: { OrigamPasswordField },
            props: ['invalid'],
            template: `<origam-password-field :aria-invalid="invalid ? 'true' : undefined" :aria-describedby="invalid ? 'err-id' : undefined" />`
        }, {
            attachTo: document.body,
            props: { invalid: false },
            global: {
                plugins: [createOrigam()],
                stubs: { OrigamInput: OrigamInputStub, OrigamField: OrigamFieldStub, OrigamCounter: OrigamCounterStub, OrigamMenu: OrigamMenuStub, OrigamIcon: OrigamIconStub }
            }
        })
        expect(wrapper.find('input').attributes('aria-invalid')).toBeUndefined()
        await wrapper.setProps({ invalid: true })
        expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
        expect(wrapper.find('input').attributes('aria-describedby')).toBe('err-id')
    })
})

describe('OrigamPasswordField — length rule is opt-in (#1334)', () => {
    it('adds no rule by default: empty and short values stay valid', () => {
        const wrapper = mountPasswordField()
        expect(runRules(wrapper, '')).toEqual([])
        expect(runRules(wrapper, 'abc')).toEqual([])
    })

    it('with min-length=15, refuses 14 chars and accepts 15', () => {
        const wrapper = mountPasswordField({ props: { minLength: 15 } })
        expect(runRules(wrapper, 'a'.repeat(14))).toHaveLength(1)
        expect(runRules(wrapper, 'a'.repeat(15))).toEqual([])
    })

    it('leaves an empty value to the caller even when min-length is set', () => {
        const wrapper = mountPasswordField({ props: { minLength: 15 } })
        expect(runRules(wrapper, '')).toEqual([])
    })

    it('requirements=true still enforces the default 8 characters', () => {
        const wrapper = mountPasswordField({ props: { requirements: true } })
        expect(runRules(wrapper, 'abc')).toHaveLength(1)
        expect(runRules(wrapper, 'abcdefgh')).toEqual([])
    })
})

describe('OrigamPasswordField — length message (#1334 / #1434)', () => {
    it('translates the default message (fr): no hardcoded "characters"', () => {
        const wrapper = mountPasswordField({ props: { minLength: 15 }, locale: 'fr' })
        const [message] = runRules(wrapper, 'abc') as string[]
        expect(message).toBe('Ce champ doit contenir : 15 caractères')
    })

    it('minLengthMessage replaces the message for this field', () => {
        const wrapper = mountPasswordField({ props: { minLength: 15, minLengthMessage: 'Trop court' } })
        expect(runRules(wrapper, 'abc')).toEqual(['Trop court'])
    })

    it('translates the default checklist labels (fr)', () => {
        const wrapper = mountPasswordField({ props: { requirements: true, requirementsLayout: 'list' }, locale: 'fr' })
        const labels = wrapper.findAll('.origam-password-field__requirement-label').map(l => l.text())
        expect(labels).toContain('Au moins 8 caractères')
        expect(labels.join(' ')).not.toMatch(/characters|At least/)
    })
})
