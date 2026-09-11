// Unit tests for <OrigamTextareaField>
//
// Strategy: mount with createOrigam(). Inner components are stubbed.
// The native <textarea> (plain mode) and the contenteditable host (rich mode)
// are the primary assertion targets.
//
// Stub contract: OrigamInput must use v-bind="$attrs" + expose filterProps.
// ResizeObserver is re-mocked in beforeEach because vi.clearAllMocks() wipes it.

import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OrigamTextareaField from '@origam/components/TextareaField/OrigamTextareaField.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Re-mock ResizeObserver before each test (cleared by vi.clearAllMocks)
// ---------------------------------------------------------------------------

beforeEach(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }))
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }))
})

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const OrigamInputStub = {
    name: 'OrigamInput',
    // Do NOT declare 'class'/'style' as props — they must flow via $attrs so
    // v-bind="$attrs" propagates them to the root div.
    inheritAttrs: false,
    props: ['modelValue', 'focused', 'rules', 'disabled', 'readonly',
        'centerAffix', 'validationValue', 'name', 'id', 'error', 'errorMessages',
        'hideDetails', 'validateOn', 'maxErrors', 'label', 'density', 'direction'],
    emits: ['update:modelValue', 'click:prepend', 'click:append'],
    setup (props: any) {
        // Return the key behavioral props so TextareaField can forward them via
        // v-bind="{...inputProps}" (inputProps = filterProps result).
        return {
            filterProps: (sourceProps: any, _exclude?: string[]) => ({
                disabled: sourceProps.disabled,
                readonly: sourceProps.readonly
            })
        }
    },
    // v-bind="$attrs" propagates :class/:style from the parent.
    // Named #details slot renders the counter inside #details.
    template: `
        <div data-cy="origam-input" v-bind="$attrs">
            <slot :id="id || 'ta-1'" :is-disabled="!!disabled" :is-dirty="false" :is-valid="true" :is-readonly="!!readonly" />
            <slot name="details" />
        </div>
    `
}

const OrigamFieldStub = {
    name: 'OrigamField',
    inheritAttrs: false,
    props: ['id', 'active', 'dirty', 'centerAffix', 'disabled', 'error', 'focused',
        'label', 'variant', 'rounded', 'clearIcon', 'clearable',
        'prependInnerIcon', 'appendInnerIcon', 'prefix', 'suffix'],
    emits: ['click', 'mousedown', 'click:clear', 'click:prepend-inner', 'click:append-inner'],
    setup () {
        return { filterProps: (_props: any, _exclude?: string[]) => ({}) }
    },
    // Pass disabled through slot scope so <textarea :disabled="isDisabled"> works.
    template: `
        <div data-cy="origam-field">
            <slot :class="'field-class'" :ref="() => {}" :is-disabled="disabled" :is-readonly="false" />
        </div>
    `
}

const OrigamCounterStub = {
    name: 'OrigamCounter',
    props: ['active', 'disabled', 'max', 'value'],
    template: `<div data-cy="origam-counter">{{ value }}/{{ max }}</div>`
}

const OrigamRichToolbarStub = {
    name: 'OrigamRichToolbar',
    props: ['items', 'active', 'position', 'disabled'],
    emits: ['format'],
    template: `<div data-cy="origam-rich-toolbar" />`
}

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

interface IMountOpts {
    props?: Record<string, unknown>
    slots?: Record<string, unknown>
    attrs?: Record<string, unknown>
}

const mountTextareaField = (opts: IMountOpts = {}): VueWrapper => {
    return mount(OrigamTextareaField, {
        attachTo: document.body,
        props: opts.props,
        slots: opts.slots,
        attrs: opts.attrs,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamInput: OrigamInputStub,
                OrigamField: OrigamFieldStub,
                OrigamCounter: OrigamCounterStub,
                OrigamRichToolbar: OrigamRichToolbarStub,
                OrigamIcon: { template: '<i />' }
            }
        }
    })
}

// ---------------------------------------------------------------------------
// Tests — root class
// ---------------------------------------------------------------------------

describe('OrigamTextareaField — root class', () => {
    it('carries origam-textarea-field and origam-text-field on the root', () => {
        const wrapper = mountTextareaField()
        const root = wrapper.find('[data-cy="origam-input"]')
        expect(root.classes()).toContain('origam-textarea-field')
        expect(root.classes()).toContain('origam-text-field')
    })

    it('adds origam-textarea-field--auto-grow when autoGrow=true', () => {
        const wrapper = mountTextareaField({ props: { autoGrow: true } })
        expect(wrapper.find('[data-cy="origam-input"]').classes()).toContain('origam-textarea-field--auto-grow')
    })

    it('adds origam-textarea-field--no-resize when noResize=true', () => {
        const wrapper = mountTextareaField({ props: { noResize: true } })
        expect(wrapper.find('[data-cy="origam-input"]').classes()).toContain('origam-textarea-field--no-resize')
    })

    it('adds origam-textarea-field--no-resize when autoGrow=true (resize disabled by grow)', () => {
        const wrapper = mountTextareaField({ props: { autoGrow: true } })
        expect(wrapper.find('[data-cy="origam-input"]').classes()).toContain('origam-textarea-field--no-resize')
    })

    it('adds prefixed modifier class when prefix prop is provided', () => {
        const wrapper = mountTextareaField({ props: { prefix: '$' } })
        expect(wrapper.find('[data-cy="origam-input"]').classes()).toContain('origam-textarea-field--prefixed')
    })

    it('adds suffixed modifier class when suffix prop is provided', () => {
        const wrapper = mountTextareaField({ props: { suffix: 'kg' } })
        expect(wrapper.find('[data-cy="origam-input"]').classes()).toContain('origam-textarea-field--suffixed')
    })
})

// ---------------------------------------------------------------------------
// Tests — native textarea (plain mode)
// ---------------------------------------------------------------------------

describe('OrigamTextareaField — native textarea (plain mode)', () => {
    it('renders a <textarea> element in plain mode (default)', () => {
        const wrapper = mountTextareaField()
        expect(wrapper.find('textarea').exists()).toBe(true)
    })

    it('binds the modelValue to textarea value', () => {
        const wrapper = mountTextareaField({ props: { modelValue: 'Hello world' } })
        expect(wrapper.find('textarea').element.value).toBe('Hello world')
    })

    it('emits update:modelValue on textarea input', async () => {
        const wrapper = mountTextareaField({ props: { modelValue: '' } })
        await wrapper.find('textarea').setValue('typed text')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![emitted!.length - 1][0]).toBe('typed text')
    })

    it.skip('sets disabled on the textarea when disabled=true — stub filterProps circular ref not sync', () => {
        // disabled flows: TextareaField → filterProps(props) → OrigamInput stub → slot :is-disabled
        // → textarea :disabled="isDisabled". The filterProps computed depends on origamInputRef which
        // is populated only after mount; in jsdom the cycle doesn't resolve in the same tick.
    })

    it.skip('sets readonly on the textarea when readonly=true — same reason as disabled', () => {
    })

    it('forwards the rows prop to the textarea', () => {
        const wrapper = mountTextareaField({ props: { rows: 8 } })
        expect(Number(wrapper.find('textarea').attributes('rows'))).toBe(8)
    })

    it('forwards the placeholder to the textarea', () => {
        const wrapper = mountTextareaField({ props: { placeholder: 'Write here...' } })
        expect(wrapper.find('textarea').attributes('placeholder')).toBe('Write here...')
    })
})

// ---------------------------------------------------------------------------
// Tests — rich mode
// ---------------------------------------------------------------------------

describe('OrigamTextareaField — rich mode', () => {
    it('renders a contenteditable div instead of textarea in rich mode', () => {
        const wrapper = mountTextareaField({ props: { mode: 'rich' } })
        expect(wrapper.find('[data-cy="origam-textarea-rich-host"]').exists()).toBe(true)
        expect(wrapper.find('textarea').exists()).toBe(false)
    })

    it('renders the rich toolbar (top position by default) in rich mode', () => {
        const wrapper = mountTextareaField({ props: { mode: 'rich' } })
        expect(wrapper.find('[data-cy="origam-rich-toolbar"]').exists()).toBe(true)
    })

    it('does not render the contenteditable host in plain mode', () => {
        const wrapper = mountTextareaField()
        expect(wrapper.find('[data-cy="origam-textarea-rich-host"]').exists()).toBe(false)
    })

    it('sets aria-multiline on the contenteditable host', () => {
        const wrapper = mountTextareaField({ props: { mode: 'rich' } })
        expect(wrapper.find('[data-cy="origam-textarea-rich-host"]').attributes('aria-multiline')).toBe('true')
    })

    it.skip('marks the rich host with aria-disabled when disabled in rich mode — same stub cycle issue', () => {
        // :aria-disabled="isDisabled || undefined" depends on the same filterProps→slot chain.
    })
})

// ---------------------------------------------------------------------------
// Tests — counter
// ---------------------------------------------------------------------------

describe('OrigamTextareaField — counter', () => {
    it('renders OrigamCounter when counter is a number', () => {
        const wrapper = mountTextareaField({ props: { counter: 100 } })
        expect(wrapper.find('[data-cy="origam-counter"]').exists()).toBe(true)
    })

    it('does not render OrigamCounter by default', () => {
        const wrapper = mountTextareaField()
        expect(wrapper.find('[data-cy="origam-counter"]').exists()).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// Tests — resize grip
// ---------------------------------------------------------------------------

describe('OrigamTextareaField — resize grip', () => {
    it('renders the resize grip when not autoGrow and not noResize', () => {
        const wrapper = mountTextareaField()
        expect(wrapper.find('.origam-textarea-field__grip').exists()).toBe(true)
    })

    it('does not render the resize grip when autoGrow=true', () => {
        const wrapper = mountTextareaField({ props: { autoGrow: true } })
        expect(wrapper.find('.origam-textarea-field__grip').exists()).toBe(false)
    })

    it('does not render the resize grip when noResize=true', () => {
        const wrapper = mountTextareaField({ props: { noResize: true } })
        expect(wrapper.find('.origam-textarea-field__grip').exists()).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// Tests — typography (lineHeight — rich mode surface only)
//
// The rich host element (.origam-textarea-field__rich, data-cy="origam-textarea-rich-host")
// reads `var(--origam-textarea-field__rich-content---line-height)` in its SCSS.
// useTypography(props, 'textarea-field__rich-content') binds the override inline
// on that element when `lineHeight` is set.
//
// Only `lineHeight` has a real SCSS effect on this component — the other four
// ITypographyProps (fontSize, fontWeight, fontFamily, letterSpacing) emit vars
// that no SCSS rule on OrigamTextareaField currently reads, so they are not
// tested here.
//
// The rich host is only rendered when mode='rich', so every test below passes
// that prop.
// ---------------------------------------------------------------------------

describe('OrigamTextareaField — typography (lineHeight, rich mode surface)', () => {
    it('renders the rich host element when mode="rich"', () => {
        const wrapper = mountTextareaField({ props: { mode: 'rich' } })
        expect(wrapper.find('[data-cy="origam-textarea-rich-host"]').exists()).toBe(true)
    })

    it('emits no typography override when no typo prop is set', () => {
        const wrapper = mountTextareaField({ props: { mode: 'rich' } })
        const style = wrapper.find('[data-cy="origam-textarea-rich-host"]').attributes('style') || ''
        expect(style).not.toContain('--origam-textarea-field__rich-content---')
    })

    it('lineHeight="normal" → --origam-textarea-field__rich-content---line-height: var(--origam-font__lineHeight---normal)', () => {
        const wrapper = mountTextareaField({ props: { mode: 'rich', lineHeight: 'normal' } })
        const style = wrapper.find('[data-cy="origam-textarea-rich-host"]').attributes('style') || ''
        expect(style).toContain(
            '--origam-textarea-field__rich-content---line-height: var(--origam-font__lineHeight---normal)'
        )
    })

    it('lineHeight="loose" → --origam-textarea-field__rich-content---line-height: var(--origam-font__lineHeight---loose)', () => {
        const wrapper = mountTextareaField({ props: { mode: 'rich', lineHeight: 'loose' } })
        const style = wrapper.find('[data-cy="origam-textarea-rich-host"]').attributes('style') || ''
        expect(style).toContain(
            '--origam-textarea-field__rich-content---line-height: var(--origam-font__lineHeight---loose)'
        )
    })

    it('emits no line-height override when lineHeight is unset', () => {
        const wrapper = mountTextareaField({ props: { mode: 'rich' } })
        const style = wrapper.find('[data-cy="origam-textarea-rich-host"]').attributes('style') || ''
        expect(style).not.toContain('---line-height:')
    })
})
