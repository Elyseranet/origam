// Unit tests for <OrigamDatePickerField> — useDefaults wiring (issue #242)
//
// Strategy: mount the real component tree (same approach as
// OrigamSelect.spec.ts / OrigamColorPickerField.spec.ts) with createOrigam()
// under a custom theme. OrigamDatePickerField only called withDefaults(),
// never useDefaults() — its own legacy `rounded: true` / `border: true`
// booleans always won, so theme.components['origam-date-picker-field'] was
// a silent no-op. The component forwards its resolved props to the internal
// <origam-text-field> via a template-ref-gated `textFieldProps` computed
// (populates one tick after first mount) — same timing already relied on
// by OrigamSelect / OrigamNumberField / OrigamColorPickerField.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamDatePickerField from '@origam/components/DatePickerField/OrigamDatePickerField.vue'
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

class IntersectionObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

async function mountDatePickerFieldThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-date-picker-field': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    const wrapper = mount(OrigamDatePickerField, {
        props: props as never,
        attachTo: document.body,
        global: { plugins: [origam] }
    })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamDatePickerField — useDefaults (theme components wiring)', () => {
    it('renders with class origam-date-picker-field', async () => {
        const wrapper = await mountDatePickerFieldThemed({})
        expect(wrapper.classes()).toContain('origam-date-picker-field')
    })

    it('resolves rounded="lg" from theme.components[\'origam-date-picker-field\'] on the forwarded field surface', async () => {
        const wrapper = await mountDatePickerFieldThemed({ rounded: 'lg' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-lg')
    })

    it('without a theme override, the field falls back to the component\'s own legacy rounded=true (rounded-md chrome)', async () => {
        const wrapper = await mountDatePickerFieldThemed({})
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-md')
    })

    it('an explicitly passed rounded prop overrides the theme default', async () => {
        const wrapper = await mountDatePickerFieldThemed({ rounded: 'lg' }, { rounded: 'sm' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-sm')
        expect(field.classes()).not.toContain('origam--rounded-lg')
    })
})

// ---------------------------------------------------------------------------
// #411 — the `multiple` mode default chip carried hardcoded RGB literals
// (`bgColor: 'rgba(168, 168, 168, 1)'`, `color: 'rgb(255, 255, 255)'`),
// identical copy-paste to OrigamSelect's pre-#456 defect, bypassing the
// theme regardless of which theme was active. `chipSlotProps` now omits
// both so `<OrigamChip>` resolves its own themed default
// (`--origam-chip---background-color` / `--origam-chip---color`, both
// declared in the token stylesheets).
// ---------------------------------------------------------------------------
describe('OrigamDatePickerField — chip default color is theme-driven, not hardcoded (#411)', () => {
    it('does not force an inline background-color / color on the default chip', async () => {
        const wrapper = await mountDatePickerFieldThemed({}, {
            multiple: true,
            modelValue: [new Date('2024-01-01'), new Date('2024-01-02')]
        })

        const chip = wrapper.find('.origam-chip')
        expect(chip.exists()).toBe(true)

        const style = chip.attributes('style') ?? ''
        expect(style).not.toContain('168, 168, 168')
        expect(style).not.toContain('255, 255, 255')
    })
})

// ---------------------------------------------------------------------------
// #666 — `const label` locally declared in <script setup> masked the `label`
// PROP (`IDatePickerFieldProps` -> `ITextFieldProps` -> `IFieldProps.label`,
// field.interface.ts:43). Both `:aria-label` and `:title` on the forwarded
// `<origam-text-field>` read the bare `label` identifier, which Vue resolves
// to the LOCAL computed (`menu.value ? props.closeText : props.openText`)
// rather than the prop — every `<origam-date-picker-field>` announced
// "Open"/"Close" instead of its own `label`, regardless of locale.
//
// Same defect and same correction as OrigamSelect (#622 / PR #656).
//
// Mounted in `fr` on purpose: a regression that swapped the local for
// `props.label` while still reading an English literal would stay green
// against an English assertion.
//
// These assertions read ATTRIBUTES, not computed styles — jsdom is a valid
// tool here (the `getComputedStyle` / `var()` blindness documented in
// CLAUDE.md does not apply to attribute reads).
// ---------------------------------------------------------------------------
describe('OrigamDatePickerField — #666 le nom accessible est le label du champ, pas le libelle du bouton d ouverture', () => {
    it('aria-label et title sur l input refletent props.label (fr)', async () => {
        const wrapper = mount(OrigamDatePickerField, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: { label: 'Date de naissance' } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Date de naissance')
        expect(input.attributes('title')).toBe('Date de naissance')
    })

    it('ne regresse pas la locale en (memes assertions)', async () => {
        const wrapper = mount(OrigamDatePickerField, {
            global: { plugins: [createOrigam()] },
            props: { label: 'Date of birth' } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Date of birth')
        expect(input.attributes('title')).toBe('Date of birth')
    })

    it('repli sur openText quand aucun label n est fourni (fr, menu ferme)', async () => {
        const wrapper = mount(OrigamDatePickerField, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: {} as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Ouvrir')
    })

    it('repli sur closeText quand aucun label n est fourni (fr, menu ouvert des le montage)', async () => {
        const wrapper = mount(OrigamDatePickerField, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: { menu: true } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Fermer')
    })

    it('props.label gagne sur l etat du menu (le libelle ne change pas a l ouverture)', async () => {
        const wrapper = mount(OrigamDatePickerField, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: { label: 'Date de naissance', menu: true } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Date de naissance')
    })
})

// #693 — `const validationValue` locally declared in <script setup> masked the
// `validationValue` PROP (`IDatePickerFieldProps` -> `ITextFieldProps` ->
// `IInputProps` -> `IValidationProps.validationValue`,
// validation.interface.ts:47). The template's
// `:validation-value="validationValue"` on the forwarded <origam-text-field>
// read the bare identifier, which Vue resolves to the LOCAL computed
// (`model.value`) rather than the prop — and `validationValue` is ALSO
// stripped from the `filterProps` passthrough, so no second path existed:
// a consumer's `:validation-value` was silently ignored and rules ran
// against the model.
//
// Same defect family as #622 / #665 / #666.
//
// The probe is the RULE ARGUMENT: `useValidation` calls every rule with
// `validationModel.value` (validation.composable.ts:52, consumed at :152),
// which is the single observable consequence of the binding. `validateOn`
// defaults to 'input', so `validate(true)` runs onMounted — no interaction
// needed.
//
// These assertions read a JS value handed to a callback, not a computed
// style — jsdom is a valid tool here (the `getComputedStyle` / `var()`
// blindness documented in CLAUDE.md does not apply).
//
// A/B against the parent commit: the first three tests below FAIL pre-fix
// (the rule received the wrapped model array) and PASS post-fix.
// ---------------------------------------------------------------------------
describe('OrigamDatePickerField — #693 la prop validationValue du consommateur atteint la validation', () => {
    it('la regle recoit props.validationValue, pas le modele', async () => {
        const seen: Array<unknown> = []
        mount(OrigamDatePickerField, {
            props: {
                modelValue: '2024-01-01',
                validationValue: 'SENTINEL',
                rules: [(v: unknown) => { seen.push(v); return true }]
            } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        expect(seen).toEqual(['SENTINEL'])
    })

    // `null` is a SUPPLIED value under `validation.composable.ts:52` (only
    // `undefined` means "not supplied"), so it must reach OrigamInput
    // untouched. It cannot be probed through the rule argument the way the
    // test above does: `useValidation`'s own post-mount watcher is guarded by
    // `if (validationModel.value != null)` (validation.composable.ts:134), so
    // a nullish validation model never re-runs the rules — a pre-existing
    // property of the composable, unrelated to #693 and unchanged by it.
    // The forwarded prop is therefore the correct observable here. Pre-fix it
    // carried the wrapped model array; post-fix it carries null.
    it('null est une valeur fournie et atteint OrigamInput tel quel (parite avec validation.composable.ts:52)', async () => {
        const wrapper = mount(OrigamDatePickerField, {
            props: {
                modelValue: '2024-01-01',
                validationValue: null
            } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        const input = wrapper.findComponent({ name: 'OrigamInput' })
        expect(input.exists()).toBe(true)
        expect(input.props('validationValue')).toBeNull()
    })

    it('une mise a jour de validationValue re-declenche la validation avec la nouvelle valeur', async () => {
        const seen: Array<unknown> = []
        const wrapper = mount(OrigamDatePickerField, {
            props: {
                modelValue: '2024-01-01',
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
        expect(seen).not.toContainEqual(['2024-01-01'])
    })

    it('sans validationValue fournie, le repli reste le modele (non-regression du comportement historique)', async () => {
        const seen: Array<unknown> = []
        mount(OrigamDatePickerField, {
            props: {
                modelValue: '2024-01-01',
                rules: [(v: unknown) => { seen.push(v); return true }]
            } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        expect(seen).toEqual([['2024-01-01']])
    })
})
