// Unit tests for <OrigamSelect> — useDefaults wiring (issue #242)
//
// Strategy: mount with createOrigam() plugin under a custom theme.
// OrigamSelect did not call useDefaults() so any theme config targeting
// `origam-select` (rounded, border, density, …) was a silent no-op — the
// component kept its own hardcoded `rounded: true` / `border: true`
// legacy-boolean defaults, which resolve to the `rounded-md` fallback
// instead of the theme's radius. This is the exact regression a sibling
// text-field did NOT have (OrigamTextField already called useDefaults),
// producing a visible radius mismatch between an <origam-select> trigger
// and an <origam-text-field> under the same theme (cartoon: 14px vs 20px).
//
// Select forwards its resolved `rounded` prop down through
// OrigamTextField -> OrigamField (both already wired), via a
// template-ref-gated `filterProps` computed — the very first render pass
// runs before the ref populates, so assertions must `await nextTick()`
// (mirrors real browser behaviour: Vue flushes the scheduled update
// before paint, well before any user-visible frame).

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

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

// jsdom does not provide a working IntersectionObserver — `new
// IntersectionObserver().observe()` throws ("observe is not a function") once
// Select's internal virtual-scroll list mounts its `v-intersect` sentinel.
// Same stub as OrigamInfiniteScroll.spec.ts / OrigamTextField.spec.ts.
class IntersectionObserverMock {
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = vi.fn(() => [])
}
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock)

async function mountSelectThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-select': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
    const wrapper = mount(OrigamSelect, { props: props as never, global: { plugins: [origam] } })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamSelect — useDefaults (theme components wiring)', () => {
    it('renders with class origam-select', async () => {
        const wrapper = await mountSelectThemed({})
        expect(wrapper.classes()).toContain('origam-select')
    })

    it('resolves rounded="lg" from theme.components[\'origam-select\'] on the forwarded field surface (parity with a themed text-field)', async () => {
        const wrapper = await mountSelectThemed({ rounded: 'lg' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-lg')
        expect(field.attributes('style') || '').toContain('border-radius: var(--origam-radius---lg, 12px)')
    })

    it('without a theme override, the field falls back to the component\'s own legacy rounded=true (rounded-md chrome) — NOT silently ignored', async () => {
        const wrapper = await mountSelectThemed({})
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-md')
    })

    it('an explicitly passed rounded prop overrides the theme default', async () => {
        const wrapper = await mountSelectThemed({ rounded: 'lg' }, { rounded: 'sm' })
        const field = wrapper.find('.origam-field')
        expect(field.classes()).toContain('origam--rounded-sm')
        expect(field.classes()).not.toContain('origam--rounded-lg')
    })
})

// ---------------------------------------------------------------------------
// #456 — click:control / mousedown:control were declared in ISelectEmits but
// never fired: `defineEmits<ISelectEmits>()`'s return value was never
// captured (no `emit(...)` call existed anywhere in the file). Regression
// tests below mount the component directly (no theme) and assert the
// control surface fires both.
// ---------------------------------------------------------------------------
describe('OrigamSelect — click:control / mousedown:control (#456)', () => {
    it('emits click:control when the field control is clicked', async () => {
        const wrapper = await mountSelectThemed({}, {items: ['a', 'b']})

        await wrapper.find('.origam-field').trigger('click')

        expect(wrapper.emitted('click:control')).toBeTruthy()
        expect(wrapper.emitted('click:control')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    })

    it('emits mousedown:control when the field control receives a mousedown', async () => {
        const wrapper = await mountSelectThemed({}, {items: ['a', 'b']})

        await wrapper.find('.origam-field').trigger('mousedown')

        expect(wrapper.emitted('mousedown:control')).toBeTruthy()
        expect(wrapper.emitted('mousedown:control')?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    })
})

// ---------------------------------------------------------------------------
// #456 — the `chips` mode default chip carried hardcoded RGB literals
// (`bgColor: 'rgba(168, 168, 168, 1)'`, `color: 'rgb(255, 255, 255)'`),
// bypassing the theme regardless of which theme was active. `chipSlotProps`
// now omits both so `<OrigamChip>` resolves its own themed default
// (`--origam-chip---background-color` / `--origam-chip---color`, both
// emitted by the token pipeline).
// ---------------------------------------------------------------------------
describe('OrigamSelect — chip default color is theme-driven, not hardcoded (#456)', () => {
    it('does not force an inline background-color / color on the default chip', async () => {
        const wrapper = await mountSelectThemed({}, {
            items: ['a', 'b'],
            multiple: true,
            chips: true,
            modelValue: ['a']
        })

        const chip = wrapper.find('.origam-chip')
        expect(chip.exists()).toBe(true)

        const style = chip.attributes('style') ?? ''
        expect(style).not.toContain('168, 168, 168')
        expect(style).not.toContain('255, 255, 255')
    })
})

// ---------------------------------------------------------------------------
// LOT1/4 emits fix — `update:focused` / `click:clear` / `click:append` /
// `click:prepend` / `click:appendInner` / `click:prependInner` were declared
// in `ISelectEmits` but never fired: `v-model:focused="isFocused"` on the
// nested `<origam-text-field>` only CONSUMED the echo into a local ref, and
// `handleClear` never re-emitted after doing its own clearing logic. Guard
// `unemitted-declarations` — see `packages/ds/scripts/guards/unemitted-declarations.mjs`.
// ---------------------------------------------------------------------------
describe('OrigamSelect — update:focused / click:clear relay (LOT1 emits fix)', () => {
    it('emits update:focused when the underlying input focuses/blurs', async () => {
        const wrapper = mount(OrigamSelect, {
            props: { label: 'Country' } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()

        const input = wrapper.find('input')
        await input.trigger('focus')
        await nextTick()
        await input.trigger('blur')
        await nextTick()

        expect(wrapper.emitted('update:focused')).toEqual([[true], [false]])
    })
})

// ---------------------------------------------------------------------------
// #622 — `const label` locally-declared in <script setup> masked the `label`
// PROP declared on `ISelectProps` (-> `IFieldProps`). Both `:aria-label`
// and `:title` on the forwarded `<origam-text-field>` read the bare `label`
// identifier, which Vue resolves to the LOCAL computed
// (`menu.value ? props.closeText : props.openText`) rather than the prop —
// every `<origam-select>` announced "Open"/"Close" instead of its own
// `label`, regardless of locale.
//
// Mounted in `fr` on purpose: a regression that only swaps the local for
// `props.label` while still reading it under an English literal would stay
// green against an English assertion. `fr` is the only filter that catches
// it here (see BRIEF-VAGUE3-DIVERS.md).
// ---------------------------------------------------------------------------
describe('OrigamSelect — #622 le nom accessible est le label du champ, pas le libelle du bouton d ouverture', () => {
    it('aria-label sur l input reflete props.label (fr)', async () => {
        const wrapper = mount(OrigamSelect, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: { label: 'Pays', items: ['France', 'Belgique'] } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Pays')
        expect(input.attributes('title')).toBe('Pays')
    })

    it('ne regresse pas la locale en (memes assertions)', async () => {
        const wrapper = mount(OrigamSelect, {
            global: { plugins: [createOrigam()] },
            props: { label: 'Country', items: ['France', 'Belgium'] } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Country')
    })

    it('repli sur openText/closeText quand aucun label n est fourni (fr, menu ferme)', async () => {
        const wrapper = mount(OrigamSelect, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: { items: ['France', 'Belgique'] } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Ouvrir')
    })

    it('repli sur openText/closeText quand aucun label n est fourni (fr, menu ouvert des le montage)', async () => {
        // `menu` is the documented v-model prop backing the internal open
        // state (`menuState = useVModel(props, 'menu')`). Driving it at
        // MOUNT time (rather than via a later `setProps`/synthetic
        // keydown) is the deterministic way to reach the "open" state in
        // jsdom for this v-model chain — a live focus -> control ->
        // overlay toggle is an e2e concern the suite already covers.
        const wrapper = mount(OrigamSelect, {
            global: { plugins: [createOrigam({ locale: { locale: 'fr' } })] },
            props: { items: ['France', 'Belgique'], menu: true } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-label')).toBe('Fermer')
    })

    it('aria-controls est absent au repos (mesure #622)', async () => {
        const wrapper = mount(OrigamSelect, {
            global: { plugins: [createOrigam()] },
            props: { label: 'Country', items: ['France', 'Belgium'] } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-expanded')).toBe('false')
        expect(input.attributes('aria-haspopup')).toBe('listbox')
        expect(input.attributes('aria-controls')).toBeUndefined()
    })

    it('aria-controls est present quand le menu est ouvert des le montage (mesure #622)', async () => {
        const wrapper = mount(OrigamSelect, {
            global: { plugins: [createOrigam()] },
            props: { label: 'Country', items: ['France', 'Belgium'], menu: true } as never
        })
        await nextTick()

        const input = wrapper.find('input')
        expect(input.attributes('aria-expanded')).toBe('true')
        expect(input.attributes('aria-controls')).toBeTruthy()
    })
})

// ---------------------------------------------------------------------------
// #693 — `const validationValue` locally declared in <script setup> masked the
// `validationValue` PROP (`ISelectProps` -> `IInputProps` ->
// `IValidationProps.validationValue`, validation.interface.ts:47). The
// template's `:validation-value="validationValue"` on the forwarded
// <origam-text-field> read the bare identifier, which Vue resolves to the
// LOCAL computed (`model.externalValue`) rather than the prop — and
// `validationValue` is ALSO stripped from the `filterProps` passthrough
// (OrigamSelect.vue), so no second path existed: a consumer's
// `:validation-value` was silently ignored and rules ran against the model.
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
// (the rule received 'a', the model) and PASS post-fix.
// ---------------------------------------------------------------------------
describe('OrigamSelect — #693 la prop validationValue du consommateur atteint la validation', () => {
    it('la regle recoit props.validationValue, pas le modele', async () => {
        const seen: Array<unknown> = []
        mount(OrigamSelect, {
            props: {
                items: ['a', 'b'],
                modelValue: 'a',
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
    // carried 'a' (the model); post-fix it carries null.
    it('null est une valeur fournie et atteint OrigamInput tel quel (parite avec validation.composable.ts:52)', async () => {
        const wrapper = mount(OrigamSelect, {
            props: {
                items: ['a', 'b'],
                modelValue: 'a',
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
        const wrapper = mount(OrigamSelect, {
            props: {
                items: ['a', 'b'],
                modelValue: 'a',
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
        expect(seen).not.toContain('a')
    })

    it('sans validationValue fournie, le repli reste le modele (non-regression du comportement historique)', async () => {
        const seen: Array<unknown> = []
        mount(OrigamSelect, {
            props: {
                items: ['a', 'b'],
                modelValue: 'a',
                rules: [(v: unknown) => { seen.push(v); return true }]
            } as never,
            global: { plugins: [createOrigam()] }
        })
        await nextTick()
        await nextTick()

        expect(seen).toEqual(['a'])
    })
})
