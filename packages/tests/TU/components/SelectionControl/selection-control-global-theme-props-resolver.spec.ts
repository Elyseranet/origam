// ADR-005 — the exact VERIFIED repro named in the ADR ("Manifestation 2").
//
// `OrigamSelectionControl` templates `:type="type"` — the RAW (unmerged)
// prop, since the SFC compiler always emits `__props.x` for a bare template
// binding, never a value a composable returns. Under a theme setting
// `'origam-selection-control': { type: 'checkbox' }`, the OLD mechanism
// (`useDefaults()` alone) left the rendered `<input>` with NO `type`
// attribute at all — `input.type` fell back to the browser's default
// (`"text"`), so the control had no checkbox semantics and never emitted
// `update:modelValue`.
//
// This spec asserts the FIXED behaviour (`type === 'checkbox'`), the
// opposite of what the pre-fix code produced. Per the mandatory
// "inverted repro" rule: this test MUST fail against the code before
// `installThemePropsResolver()` was wired into `createOrigam()`, and pass
// after. `OrigamSelectionControl` itself is NOT modified by this fix — the
// resolution happens entirely in the global hook.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamSelectionControl from '@origam/components/SelectionControl/OrigamSelectionControl.vue'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

describe('OrigamSelectionControl — themed via the global theme-props-resolver hook (ADR-005, manifestation 2)', () => {
    it('a theme naming `type` resolves it onto the rendered <input>, without the component calling useDefaults() for it', () => {
        const theme: IOrigamTheme = {
            name: 'checkbox-theme',
            components: { 'origam-selection-control': { type: 'checkbox' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('checkbox-theme', undefined)

        const wrapper = mount(OrigamSelectionControl, {
            attachTo: document.body,
            global: { plugins: [origam] },
            props: { value: 'a' } // `type` intentionally NOT passed — must come from the theme
        })

        const input = wrapper.get('input')

        // The pre-fix behaviour was `input.element.type === 'text'` and no
        // `type` attribute rendered at all. Both assertions below are the
        // INVERSE of that bug.
        expect(input.attributes('type')).toBe('checkbox')
        expect(input.element.type).toBe('checkbox')
        expect(input.attributes('aria-checked')).toBeDefined()

        wrapper.unmount()
    })

    it('an explicitly passed `type` still wins over the theme', () => {
        const theme: IOrigamTheme = {
            name: 'checkbox-theme',
            components: { 'origam-selection-control': { type: 'checkbox' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('checkbox-theme', undefined)

        const wrapper = mount(OrigamSelectionControl, {
            attachTo: document.body,
            global: { plugins: [origam] },
            props: { value: 'a', type: 'radio' }
        })

        expect(wrapper.get('input').attributes('type')).toBe('radio')

        wrapper.unmount()
    })

    it('with no theme naming `type` at all, the component keeps its own default (undefined → browser default "text")', () => {
        const origam = createOrigam({})

        const wrapper = mount(OrigamSelectionControl, {
            attachTo: document.body,
            global: { plugins: [origam] },
            props: { value: 'a' }
        })

        // No regression on the untouched path — same behaviour as before
        // this fix when no theme is involved at all.
        expect(wrapper.get('input').element.type).toBe('text')

        wrapper.unmount()
    })
})
