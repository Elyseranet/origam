// Regression pin — guard `unemitted-declarations` (LOT 1/4, issue family
// #373/#376/#416/#430/#446 + Field-family follow-up).
//
// Asserts the COMPILED runtime `emits` option (derived by the Vue SFC
// compiler from `defineEmits<IXxxEmits>()`'s resolved TS interface) no
// longer declares an event the component never fires — Vue strips any
// `@event` listener matching a DECLARED emit from `$attrs` unconditionally,
// so a dead declaration silently breaks fallthrough for real consumers.
//
// Each assertion below mirrors one line of the guard's baseline entry that
// this lot resolved:
//   Field:update:active,update:modelValue
//   Input:update:focused
//   TextField / NumberField / PasswordField / TextareaField / FileField:update:active
//   OtpInputField:click:append,click:appendInner,click:prepend,click:prependInner,update:active
//   Select:click:append,click:appendInner,click:clear,click:prepend,click:prependInner,update:focused
//
// `Field:update:active` is intentionally KEPT declared — mutating it away
// was proven wrong by `emits update:active when focus toggles isActive via
// useStateFlag` below: the guard's static relay list (`RELAYS` in
// `guards/lib/emits.mjs`) only recognises a literal `useActive(props)` call,
// not `useStateFlag(props, {state: 'active'})` (the composable `useActive`
// was merged into). `<OrigamField>` genuinely emits it via
// `useStateFlag` -> `useVModel` -> `vm.emit('update:active', …)`.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, nextTick } from 'vue'

import OrigamField from '@origam/components/Field/OrigamField.vue'
import OrigamInput from '@origam/components/Input/OrigamInput.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'
import OrigamNumberField from '@origam/components/NumberField/OrigamNumberField.vue'
import OrigamPasswordField from '@origam/components/PasswordField/OrigamPasswordField.vue'
import OrigamTextareaField from '@origam/components/TextareaField/OrigamTextareaField.vue'
import OrigamFileField from '@origam/components/FileField/OrigamFileField.vue'
import OrigamOtpInputField from '@origam/components/OtpInputField/OrigamOtpInputField.vue'
import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
import { createOrigam } from '@origam/origam'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

function declaredEmits (component: any): string[] {
    const raw = component.emits
    return Array.isArray(raw) ? raw : Object.keys(raw ?? {})
}

describe('Field family — compiled emits option no longer declares dead events', () => {
    it('OrigamField — keeps update:active, drops update:modelValue', () => {
        const emits = declaredEmits(OrigamField)
        expect(emits).toContain('update:active')
        expect(emits).not.toContain('update:modelValue')
    })

    it('OrigamInput — drops update:focused', () => {
        const emits = declaredEmits(OrigamInput)
        expect(emits).not.toContain('update:focused')
        expect(emits).toContain('update:modelValue')
        expect(emits).toContain('click:append')
        expect(emits).toContain('click:prepend')
    })

    it('OrigamTextField — drops update:active, keeps update:focused/click:appendInner/click:prependInner', () => {
        const emits = declaredEmits(OrigamTextField)
        expect(emits).not.toContain('update:active')
        expect(emits).toContain('update:focused')
        expect(emits).toContain('click:appendInner')
        expect(emits).toContain('click:prependInner')
    })

    it('OrigamNumberField — drops update:active, keeps update:focused/click:appendInner/click:prependInner', () => {
        const emits = declaredEmits(OrigamNumberField)
        expect(emits).not.toContain('update:active')
        expect(emits).toContain('update:focused')
        expect(emits).toContain('click:appendInner')
        expect(emits).toContain('click:prependInner')
    })

    it('OrigamPasswordField — drops update:active, keeps update:focused/click:appendInner/click:prependInner', () => {
        const emits = declaredEmits(OrigamPasswordField)
        expect(emits).not.toContain('update:active')
        expect(emits).toContain('update:focused')
        expect(emits).toContain('click:appendInner')
        expect(emits).toContain('click:prependInner')
    })

    it('OrigamTextareaField — drops update:active, keeps update:focused/click:appendInner/click:prependInner', () => {
        const emits = declaredEmits(OrigamTextareaField)
        expect(emits).not.toContain('update:active')
        expect(emits).toContain('update:focused')
        expect(emits).toContain('click:appendInner')
        expect(emits).toContain('click:prependInner')
    })

    it('OrigamFileField — drops update:active, keeps update:focused/click:appendInner/click:prependInner', () => {
        const emits = declaredEmits(OrigamFileField)
        expect(emits).not.toContain('update:active')
        expect(emits).toContain('update:focused')
        expect(emits).toContain('click:appendInner')
        expect(emits).toContain('click:prependInner')
    })

    it('OrigamOtpInputField — drops update:active/click:append/click:prepend, keeps click:appendInner/click:prependInner/update:focused', () => {
        const emits = declaredEmits(OrigamOtpInputField)
        expect(emits).not.toContain('update:active')
        expect(emits).not.toContain('click:append')
        expect(emits).not.toContain('click:prepend')
        expect(emits).toContain('click:appendInner')
        expect(emits).toContain('click:prependInner')
        expect(emits).toContain('update:focused')
        expect(emits).toContain('update:modelValue')
    })

    it('OrigamSelect — still declares the full adjacent + focus surface (component-side relay fix, not interface)', () => {
        const emits = declaredEmits(OrigamSelect)
        expect(emits).toContain('click:append')
        expect(emits).toContain('click:prepend')
        expect(emits).toContain('click:appendInner')
        expect(emits).toContain('click:prependInner')
        expect(emits).toContain('click:clear')
        expect(emits).toContain('update:focused')
    })
})

describe('OrigamField — update:active is genuinely emitted at runtime (guard false-positive, kept intentionally)', () => {
    it('emits update:active when focus toggles isActive via useStateFlag', async () => {
        const wrapper = mount(OrigamField, {
            props: { label: 'Test label' },
            slots: {
                default: (slotProps: any) => h('input', {
                    class: 'origam-field__input',
                    onFocus: slotProps.onFocus,
                    onBlur: slotProps.onBlur
                })
            },
            global: { plugins: [createOrigam()] }
        })

        const input = wrapper.find('input')
        await input.trigger('focus')
        await nextTick()
        await input.trigger('blur')
        await nextTick()

        expect(wrapper.emitted('update:active')).toEqual([[true], [false]])
    })
})
