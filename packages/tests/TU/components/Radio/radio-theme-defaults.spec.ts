// Regression coverage for #279 — `<OrigamRadio>` never called `useDefaults()`
// on its own props, so `theme.components['origam-radio']` was completely
// inert: a theme could declare a prop, but the component's resolved value
// always stayed `undefined` (falling straight through to `withDefaults()`,
// which never sets it).
//
// This spec mounts the REAL component chain (Radio → Input → RadioBtn →
// SelectionControl → Icon) — no stubs — because the bug lives in the
// forwarding chain between Radio's own resolved props and its descendants,
// which a stubbed `filterProps` would mask (see OrigamRadio.spec.ts's own
// documented skips for the same reason).
//
// ⛔ Originally written against `activeBgColor` (fixed as `rgb(255, 0, 128)`
// on the theme). That prop was removed in the state-color purge (folded
// into the `hover` / `active` object props elsewhere in the DS) — but Radio
// never wired `active` to a color axis at all: `OrigamSelectionControl.vue`
// paints the checked glyph via a STATIC `:color="bgColor"` binding
// (`OrigamSelectionControl.vue:26`), independent of any hover/active state.
// There is no `:active="{ bgColor: ... }"` equivalent for this component —
// migrating the assertion to `bgColor` preserves the test's actual intent
// ("the theme colors the checked glyph") using the API that really drives
// it. Radio having no way to paint a distinct ACTIVE-state color is a
// separate design gap, not something this spec's migration should paper
// over — flagged to the design/lead, not fixed here.

import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamRadio from '@origam/components/Radio/OrigamRadio.vue'

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

const THEME: IOrigamTheme = {
    name: 'radio-defaults-theme',
    mode: 'light',
    components: {
        'origam-radio': { bgColor: 'rgb(255, 0, 128)' }
    },
    vars: {}
}

const mountThemedRadio = (props: Record<string, unknown> = {}) => {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('radio-defaults-theme', 'light')

    return mount(OrigamRadio, {
        attachTo: document.body,
        global: { plugins: [origam] },
        props: { modelValue: true, ...props }
    })
}

describe('OrigamRadio — theme.components["origam-radio"] resolution (#279)', () => {
    it('applies the theme bgColor to the checked glyph icon', async () => {
        const wrapper = mountThemedRadio()
        await nextTick()
        await nextTick()
        const icon = wrapper.find('.origam-icon')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('style') ?? '').toContain('rgb(255, 0, 128)')
        wrapper.unmount()
    })

    it('an explicit prop on the consumer still wins over the theme default', async () => {
        const wrapper = mountThemedRadio({ bgColor: 'rgb(10, 20, 30)' })
        await nextTick()
        await nextTick()
        const icon = wrapper.find('.origam-icon')
        expect(icon.attributes('style') ?? '').toContain('rgb(10, 20, 30)')
        expect(icon.attributes('style') ?? '').not.toContain('rgb(255, 0, 128)')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// #241 — Radio side of the same fix already locked in for Checkbox
// (OrigamCheckbox.spec.ts's `useDefaults (theme components wiring)` block).
// `IRadioBtnProps` extends `ISelectionControlProps`, exactly like
// `ICheckboxBtnProps` — the fix lives one level down, in
// `OrigamSelectionControl` itself, so it is NOT Checkbox-specific. This
// block is the Radio-side equivalent, strict mirror of the Checkbox
// assertions, so the family stays symmetrically covered (an asymmetric
// lock — Checkbox verified, Radio not — would let a future regression on
// Radio alone pass unnoticed).
//
// Uses its own `mountRadioThemed(componentDefaults, props)` helper
// (mirrors `mountCheckboxThemed` in OrigamCheckbox.spec.ts) rather than
// the fixed-shape `mountThemedRadio` above, so `theme.components['origam-radio']`
// can be parameterised per test the same way.
// ---------------------------------------------------------------------------

async function mountRadioThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
    const theme = { name: 'brandx-radio', mode: 'light' as const, components: { 'origam-radio': componentDefaults }, vars: {} }
    const origam = createOrigam({ themes: [theme] })
    origam._defaultsRef.value = origam._activeDefaultsFor('brandx-radio', 'light')
    const wrapper = mount(OrigamRadio, {
        props: props as never,
        global: { plugins: [origam] }
    })
    await nextTick()
    await nextTick()
    return wrapper
}

describe('OrigamRadio — useDefaults (theme components wiring) — #241 parity with Checkbox', () => {
    it('resolves rounded="lg" from theme.components[\'origam-radio\'] onto the selection-control state-layer box (issue #241)', async () => {
        const wrapper = await mountRadioThemed({ rounded: 'lg' })
        const inputEl = wrapper.find('.origam-selection-control__input')
        expect(inputEl.classes()).toContain('origam--rounded-lg')
        expect(inputEl.attributes('style') || '').toContain('border-radius: var(--origam-radius---lg, 12px)')
        wrapper.unmount()
    })

    it('resolves border={true} and elevation="md" from theme defaults onto the same state-layer box', async () => {
        const wrapper = await mountRadioThemed({ border: true, elevation: 'md' })
        const inputEl = wrapper.find('.origam-selection-control__input')
        expect(inputEl.classes()).toContain('origam--border-thin')
        expect(inputEl.classes()).toContain('origam--shadow-md')
        expect(inputEl.attributes('style') || '').toContain('box-shadow: var(--origam-shadow---md)')
        wrapper.unmount()
    })
})
