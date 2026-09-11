// Unit tests for <OrigamNumberField>
//
// Strategy: mount with createOrigam(). OrigamTextField (standard mode) and
// OrigamInput (compact mode) are stubbed with v-bind="$attrs" + filterProps.
// We drive the compact mode tests through the native <input> and buttons the
// component renders directly; standard-mode class assertions go through the stub.

import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import OrigamNumberField from '@origam/components/NumberField/OrigamNumberField.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Re-mock jsdom observers (wiped by vi.clearAllMocks in vitest.setup.ts)
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

const OrigamTextFieldStub = {
    name: 'OrigamTextField',
    inheritAttrs: false,
    // 'class'/'style' NOT in props — they flow via $attrs so classes are propagated.
    props: ['modelValue', 'validationValue', 'inputmode',
        'disabled', 'readonly', 'type', 'label', 'placeholder',
        'name', 'id', 'rules', 'error', 'errorMessages', 'hideDetails',
        'variant', 'rounded', 'border', 'centerAffix', 'split'],
    emits: ['update:modelValue', 'beforeinput', 'blur', 'click', 'focus', 'keydown', 'mousedown',
        'click:clear', 'click:prepend-inner', 'click:append-inner'],
    setup () {
        return { filterProps: (_props: any, _exclude?: string[]) => ({}) }
    },
    template: `
        <div data-cy="origam-text-field" v-bind="$attrs">
            <input
                :value="modelValue"
                type="text"
                data-cy="origam-text-field-input"
                @input="$emit('update:modelValue', $event.target.value)"
            />
            <slot name="prependInner"/>
            <slot name="appendInner"/>
        </div>
    `
}

const OrigamInputStub = {
    name: 'OrigamInput',
    inheritAttrs: false,
    props: ['modelValue', 'class', 'style', 'disabled', 'readonly',
        'rules', 'error', 'errorMessages', 'hideDetails', 'validateOn',
        'maxErrors', 'name', 'validationValue'],
    emits: ['update:modelValue'],
    setup () {
        return { filterProps: (_props: any, _exclude?: string[]) => ({}) }
    },
    template: `<div data-cy="origam-compact-input" v-bind="$attrs"><slot /></div>`
}

const OrigamBtnStub = {
    name: 'OrigamBtn',
    inheritAttrs: false,
    props: ['icon', 'disabled', 'size', 'height', 'tabindex', 'flat',
        'ariaHidden', 'ariaLabel'],
    emits: ['click', 'pointerdown', 'pointerup'],
    template: `<button :disabled="disabled" v-bind="$attrs" @click="$emit('click', $event)" data-stub="btn" />`
}

const OrigamDividerStub = {
    name: 'OrigamDivider',
    props: ['direction'],
    template: `<div class="origam-divider" />`
}

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

const mountNumberField = (props: Record<string, unknown> = {}): VueWrapper => {
    return mount(OrigamNumberField, {
        attachTo: document.body,
        props,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamTextField: OrigamTextFieldStub,
                OrigamInput: OrigamInputStub,
                OrigamBtn: OrigamBtnStub,
                OrigamDivider: OrigamDividerStub,
                OrigamIcon: { template: '<i />' }
            }
        }
    })
}

// ---------------------------------------------------------------------------
// Tests — standard mode class composition
// ---------------------------------------------------------------------------

describe('OrigamNumberField — root class (standard mode)', () => {
    it('carries origam-number-field on the wrapper', () => {
        const wrapper = mountNumberField()
        expect(wrapper.find('[data-cy="origam-text-field"]').classes()).toContain('origam-number-field')
    })

    it('adds origam-number-field--hide-input when hideInput=true', () => {
        const wrapper = mountNumberField({ hideInput: true })
        expect(wrapper.find('[data-cy="origam-text-field"]').classes()).toContain('origam-number-field--hide-input')
    })

    it('adds origam-number-field--split when split=true', () => {
        const wrapper = mountNumberField({ split: true })
        expect(wrapper.find('[data-cy="origam-text-field"]').classes()).toContain('origam-number-field--split')
    })

    it('adds origam-number-field--hide-controls when hideControls=true', () => {
        const wrapper = mountNumberField({ hideControls: true })
        expect(wrapper.find('[data-cy="origam-text-field"]').classes()).toContain('origam-number-field--hide-controls')
    })

    it('adds origam-number-field--reverse when reverse=true', () => {
        const wrapper = mountNumberField({ reverse: true })
        expect(wrapper.find('[data-cy="origam-text-field"]').classes()).toContain('origam-number-field--reverse')
    })
})

describe('OrigamNumberField — value initialisation', () => {
    it('displays the initial modelValue in the text field input', async () => {
        const wrapper = mountNumberField({ modelValue: 42 })
        await nextTick()
        const input = wrapper.find('[data-cy="origam-text-field-input"]')
        expect(Number(input.element.value)).toBe(42)
    })

    it('displays empty when modelValue is null', async () => {
        const wrapper = mountNumberField({ modelValue: null })
        await nextTick()
        const input = wrapper.find('[data-cy="origam-text-field-input"]')
        expect(input.element.value).toBe('')
    })
})

// ---------------------------------------------------------------------------
// Tests — canIncrease / canDecrease (verifiable via button disabled state)
// Standard mode renders buttons inside the appendInner/prependInner slots.
// ---------------------------------------------------------------------------

describe('OrigamNumberField — canIncrease / canDecrease guards (standard mode)', () => {
    it('at least one button is disabled when value equals min', () => {
        const wrapper = mountNumberField({ modelValue: 0, min: 0, max: 10 })
        const disabledBtns = wrapper.findAll('button[data-stub="btn"][disabled]')
        expect(disabledBtns.length).toBeGreaterThan(0)
    })

    it('at least one button is disabled when value equals max', () => {
        const wrapper = mountNumberField({ modelValue: 10, min: 0, max: 10 })
        const disabledBtns = wrapper.findAll('button[data-stub="btn"][disabled]')
        expect(disabledBtns.length).toBeGreaterThan(0)
    })
})

// ---------------------------------------------------------------------------
// Tests — compact mode (rich standalone DOM rendered directly by the component)
// ---------------------------------------------------------------------------

describe('OrigamNumberField — compact mode', () => {
    it('renders the compact mode structure when compact=true', () => {
        const wrapper = mountNumberField({ compact: true })
        expect(wrapper.find('[data-cy="origam-compact-input"]').exists()).toBe(true)
        expect(wrapper.find('[data-cy="origam-text-field"]').exists()).toBe(false)
    })

    it('renders the compact decrement and increment buttons', () => {
        const wrapper = mountNumberField({ compact: true })
        expect(wrapper.find('[data-cy="numberfield-compact-decrement"]').exists()).toBe(true)
        expect(wrapper.find('[data-cy="numberfield-compact-increment"]').exists()).toBe(true)
    })

    it('renders the compact native input with the model value', () => {
        const wrapper = mountNumberField({ compact: true, modelValue: 5 })
        const input = wrapper.find('[data-cy="numberfield-compact-input"]')
        expect(input.exists()).toBe(true)
        expect(input.element.value).toBe('5')
    })

    it('compact increment button is disabled at max', () => {
        const wrapper = mountNumberField({ compact: true, modelValue: 10, max: 10 })
        expect(wrapper.find('[data-cy="numberfield-compact-increment"]').element.disabled).toBe(true)
    })

    it('compact decrement button is disabled at min', () => {
        const wrapper = mountNumberField({ compact: true, modelValue: 0, min: 0 })
        expect(wrapper.find('[data-cy="numberfield-compact-decrement"]').element.disabled).toBe(true)
    })

    it('compact increment button is enabled when below max', () => {
        const wrapper = mountNumberField({ compact: true, modelValue: 5, min: 0, max: 10 })
        expect(wrapper.find('[data-cy="numberfield-compact-increment"]').element.disabled).toBe(false)
    })

    it('emits update:modelValue on compact increment click', async () => {
        const wrapper = mountNumberField({ compact: true, modelValue: 5, step: 1, max: 10 })
        await wrapper.find('[data-cy="numberfield-compact-increment"]').trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(6)
    })

    it('emits update:modelValue on compact decrement click', async () => {
        const wrapper = mountNumberField({ compact: true, modelValue: 5, step: 1, min: 0 })
        await wrapper.find('[data-cy="numberfield-compact-decrement"]').trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(4)
    })
})

// ---------------------------------------------------------------------------
// Tests — disabled guard (compact)
// ---------------------------------------------------------------------------

describe('OrigamNumberField — disabled guard', () => {
    it('all compact buttons disabled when disabled=true', () => {
        const wrapper = mountNumberField({ compact: true, disabled: true, modelValue: 5 })
        expect(wrapper.find('[data-cy="numberfield-compact-increment"]').element.disabled).toBe(true)
        expect(wrapper.find('[data-cy="numberfield-compact-decrement"]').element.disabled).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Tests — precision display
// ---------------------------------------------------------------------------

describe('OrigamNumberField — precision display', () => {
    it('applies precision=2 formatting to the displayed value', async () => {
        const wrapper = mountNumberField({ modelValue: 3.14159, precision: 2 })
        await nextTick()
        const input = wrapper.find('[data-cy="origam-text-field-input"]')
        // precision=2 → "3.14"
        expect(input.element.value).toBe('3.14')
    })
})

// ---------------------------------------------------------------------------
// useDefaults wiring (issue #242) — a theme's `components['origam-number-field']`
// config must resolve on an un-passed prop and be forwarded to the internal
// text-field, mirroring OrigamBtn/OrigamSelect.
//
// The stubs above mock `filterProps` as an unconditional `() => ({})` (they
// only need `textFieldProps` to not crash for the class-composition/compact-
// mode tests above) — that stub can't verify forwarding. Mount the REAL
// component tree instead (same approach as OrigamSelect.spec.ts) so the
// real `filterProps` -> Field chain runs, and read the rendered
// `.origam-field` class. `textFieldProps` is gated by the
// `origamTextFieldRef` template ref, populated one tick after first mount.
// ---------------------------------------------------------------------------

async function mountNumberFieldThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-number-field': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    const wrapper = mount(OrigamNumberField, {
        attachTo: document.body,
        props,
        global: { plugins: [origam] }
    })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamNumberField — useDefaults (theme components wiring)', () => {
    it('resolves rounded="lg" from theme.components[\'origam-number-field\'] on the forwarded field surface', async () => {
        const wrapper = await mountNumberFieldThemed({ rounded: 'lg' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-lg')
    })

    it('without a theme override, the field falls back to the component\'s own legacy rounded=true (rounded-md chrome)', async () => {
        const wrapper = await mountNumberFieldThemed({})
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-md')
    })

    it('an explicitly passed rounded prop overrides the theme default', async () => {
        const wrapper = await mountNumberFieldThemed({ rounded: 'lg' }, { rounded: 'sm' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-sm')
        expect(field.classes()).not.toContain('origam--rounded-lg')
    })
})
