// Regression for #402 — OrigamColorPickerEdit's mode-cycle button was
// icon-only with no accessible name (`aria-label` → undefined, `text()` →
// ''). A screen reader announced "button", nothing else.
//
// A second-locale check is mandatory here (cf. CLAUDE.md): under 'en', a
// hardcoded English string is indistinguishable from its own translation —
// an en-only test still passes WITH the bug.
// `origam.color_picker.edit.cycle_mode_aria_label` renders different EN/FR
// wording, so switching the active locale to 'fr' and asserting the FR
// string proves the name genuinely flows through `t()` / the injected
// locale instance, rather than a literal baked into the template.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamColorPickerEdit from '@origam/components/ColorPicker/OrigamColorPickerEdit.vue'
import { createOrigam } from '@origam/origam'

function mountEdit (props: Record<string, unknown> = {}, locale = 'en') {
    return mount(OrigamColorPickerEdit, {
        props: { modes: ['rgb', 'hex'], ...props } as never,
        global: {
            plugins: [createOrigam({ locale: { locale } } as never)]
        }
    })
}

describe('OrigamColorPickerEdit — mode-cycle button has an accessible name (#402)', () => {
    it('carries an aria-label in English', () => {
        const wrapper = mountEdit()

        expect(wrapper.find('.origam-btn').attributes('aria-label')).toBe('Switch color format')
    })

    it('carries the FR-translated aria-label, proving it flows through the real i18n system', () => {
        const wrapper = mountEdit({}, 'fr')

        expect(wrapper.find('.origam-btn').attributes('aria-label')).toBe('Changer le format de couleur')
    })

    it('a consumer-supplied ariaLabel wins over the translated default', () => {
        const wrapper = mountEdit({ ariaLabel: 'Custom label' })

        expect(wrapper.find('.origam-btn').attributes('aria-label')).toBe('Custom label')
    })

    it('propagates disabled to the mode-cycle button (it did not before #402)', () => {
        const wrapper = mountEdit({ disabled: true })

        expect(wrapper.find('.origam-btn').attributes('disabled')).toBeDefined()
    })
})
