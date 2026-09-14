// Regression for #696 — <OrigamNumberField> bound `:validation-value="model"`
// HARDCODED in BOTH template branches (compact, on <origam-input>, l.7; and
// regular, on <origam-text-field>, l.72), so the consumer's `validationValue`
// PROP (`INumberFieldProps` -> `ITextFieldProps` -> `IInputProps` ->
// `IValidationProps.validationValue`, validation.interface.ts:47) never
// reached the validation. `validationValue` is ALSO stripped from the
// `filterProps` passthrough, and the compact branch enumerates its props one
// by one with no passthrough at all — so there was no second path either.
//
// Same CONSEQUENCE as #693 (Select / ColorPickerField / DatePickerField),
// different mechanism: no shadowing `const` here, which is why the
// `const`/prop shadowing sweep did not surface it.
//
// TWO PROBES, deliberately:
//
//   1. The RULE ARGUMENT — `useValidation` calls every rule with
//      `validationModel.value` (validation.composable.ts:52, consumed at
//      :196 via `collectRuleErrors`), the consumer-visible consequence.
//      `validateOn` defaults to 'input', so no interaction is needed.
//   2. The FORWARDED PROP on <origam-input> — the direct observable of the
//      binding, and the only usable one for a `null` value: `useValidation`'s
//      post-mount watcher is guarded by `if (validationModel.value != null)`
//      (validation.composable.ts:134), so a nullish validation model never
//      re-runs the rules. That is a pre-existing property of the composable,
//      unrelated to #696 and unchanged by this fix.
//
// These assertions read a JS value handed to a callback and a forwarded prop,
// not a computed style — jsdom is a valid tool here (the `getComputedStyle` /
// `var()` blindness documented in CLAUDE.md does not apply).
//
// The component is mounted UNSTUBBED (unlike OrigamNumberField.spec.ts, which
// stubs OrigamTextField / OrigamInput) precisely so the real <origam-input>
// and its real `useValidation` run.
//
// A/B against the parent commit: every test below except the two explicit
// non-regression guards FAILS pre-fix (the rule / the prop carried 7, the
// model) and PASSES post-fix.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamNumberField from '@origam/components/NumberField/OrigamNumberField.vue'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never
global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

describe('OrigamNumberField — #696 mode standard : la prop validationValue atteint la validation', () => {
    it('la regle recoit props.validationValue, pas le modele', async () => {
        const seen: Array<unknown> = []
        const wrapper = mount(OrigamNumberField, {
            props: {
                modelValue: 7,
                validationValue: 'SENTINEL',
                rules: [(v: unknown) => { seen.push(v); return true }]
            } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        expect(seen).toEqual(['SENTINEL'])
        wrapper.unmount()
    })

    it('null est une valeur fournie et atteint OrigamInput tel quel (parite avec validation.composable.ts:52)', async () => {
        const wrapper = mount(OrigamNumberField, {
            props: { modelValue: 7, validationValue: null } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        const input = wrapper.findComponent({ name: 'OrigamInput' })
        expect(input.exists()).toBe(true)
        expect(input.props('validationValue')).toBeNull()
        wrapper.unmount()
    })

    it('une mise a jour de validationValue re-declenche la validation avec la nouvelle valeur', async () => {
        const seen: Array<unknown> = []
        const wrapper = mount(OrigamNumberField, {
            props: {
                modelValue: 7,
                validationValue: 'FIRST',
                rules: [(v: unknown) => { seen.push(v); return true }]
            } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()
        seen.length = 0

        await wrapper.setProps({ validationValue: 'SECOND' } as never)
        await nextTick()
        await nextTick()

        expect(seen).toContain('SECOND')
        expect(seen).not.toContain(7)
        wrapper.unmount()
    })

    it('sans validationValue fournie, le repli reste le modele (non-regression du comportement historique)', async () => {
        const wrapper = mount(OrigamNumberField, {
            props: { modelValue: 7 } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        const input = wrapper.findComponent({ name: 'OrigamInput' })
        expect(input.exists()).toBe(true)
        expect(input.props('validationValue')).toBe(7)
        wrapper.unmount()
    })
})

// The compact branch is a SEPARATE template with its own, independently
// hardcoded `:validation-value="model"` (l.7) and no `v-bind` passthrough at
// all — fixing the regular branch alone would have left it dead.
describe('OrigamNumberField — #696 mode compact : la prop validationValue atteint la validation', () => {
    it('la regle recoit props.validationValue, pas le modele', async () => {
        const seen: Array<unknown> = []
        const wrapper = mount(OrigamNumberField, {
            props: {
                compact: true,
                modelValue: 7,
                validationValue: 'SENTINEL',
                rules: [(v: unknown) => { seen.push(v); return true }]
            } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        expect(seen).toEqual(['SENTINEL'])
        wrapper.unmount()
    })

    it('null est une valeur fournie et atteint OrigamInput tel quel', async () => {
        const wrapper = mount(OrigamNumberField, {
            props: { compact: true, modelValue: 7, validationValue: null } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        const input = wrapper.findComponent({ name: 'OrigamInput' })
        expect(input.exists()).toBe(true)
        expect(input.props('validationValue')).toBeNull()
        wrapper.unmount()
    })

    it('sans validationValue fournie, le repli reste le modele (non-regression du comportement historique)', async () => {
        const wrapper = mount(OrigamNumberField, {
            props: { compact: true, modelValue: 7 } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        const input = wrapper.findComponent({ name: 'OrigamInput' })
        expect(input.exists()).toBe(true)
        expect(input.props('validationValue')).toBe(7)
        wrapper.unmount()
    })
})
