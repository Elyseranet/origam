// TEMP — mutation-testing probe for LOT 1/4 (Field family unemitted-declarations fix).
// Asserts the COMPILED runtime `emits` option (derived by the Vue SFC
// compiler from `defineEmits<IXxxEmits>()`'s resolved TS interface) no
// longer contains the dead names, and still contains the live ones.

import { describe, expect, it } from 'vitest'

import OrigamField from '@origam/components/Field/OrigamField.vue'
import OrigamInput from '@origam/components/Input/OrigamInput.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'
import OrigamNumberField from '@origam/components/NumberField/OrigamNumberField.vue'
import OrigamPasswordField from '@origam/components/PasswordField/OrigamPasswordField.vue'
import OrigamTextareaField from '@origam/components/TextareaField/OrigamTextareaField.vue'
import OrigamFileField from '@origam/components/FileField/OrigamFileField.vue'
import OrigamOtpInputField from '@origam/components/OtpInputField/OrigamOtpInputField.vue'
import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'

function declaredEmits (component: any): string[] {
    const raw = component.emits
    return Array.isArray(raw) ? raw : Object.keys(raw ?? {})
}

describe('LOT1 — compiled emits option no longer declares dead events', () => {
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
