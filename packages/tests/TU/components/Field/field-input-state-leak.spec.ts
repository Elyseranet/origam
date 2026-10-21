import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamFileField, OrigamPasswordField, OrigamSelect, OrigamTextareaField, OrigamTextField } from '@origam/components'
import { createOrigam } from '@origam/origam'

/*********************************************************
 * #1224 — `isActive` / `isFocused` (slot props d'OrigamField) ne doivent
 * pas fuir en attributs HTML (`isactive`, `isfocused`) sur le controle natif.
 ********************************************************/

const FIELDS = {
    TextField: OrigamTextField,
    Select: OrigamSelect,
    TextareaField: OrigamTextareaField,
    PasswordField: OrigamPasswordField,
    FileField: OrigamFileField
}

describe('#1224 — field state does not leak onto the native control', () => {
    for (const [name, comp] of Object.entries(FIELDS)) {
        it(`${name}: control carries no isactive / isfocused attribute`, () => {
            const wrapper = mount(comp as never, {
                props: { label: 'L' } as never,
                global: { plugins: [createOrigam()] }
            })
            const el = wrapper.find('input, textarea')
            expect(el.exists()).toBe(true)
            const keys = Object.keys(el.attributes())
            expect(keys).not.toContain('isactive')
            expect(keys).not.toContain('isfocused')
        })
    }
})
