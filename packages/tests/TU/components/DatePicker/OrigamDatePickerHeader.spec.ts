// Unit test for <OrigamDatePickerHeader> — the `color` prop (#550, C1).
//
// `color` came from `IColorProps` and was exposed by the story's Design
// variant, but nothing in the component read it: the prop painted nothing.
// It is now served by the standard transversal channel (`useTextColor`),
// which emits BOTH a utility class (tokenised value) and the inline
// declaration (see CLAUDE.md, "Strategy A" — on the foreground channel the
// inline declaration is deliberately kept, it is what outranks a scoped
// `color:` rule).
//
// ⛔ WHAT THIS SPEC DOES NOT PROVE. `getComputedStyle` under jsdom never
// resolves a `var()` reference and never sees an SFC's `<style scoped>` at
// all, so the *rendered* colour is not assertable here. What IS assertable,
// and is what this spec pins, is the emitted surface: the class list, the
// raw inline `style` attribute, and the rule `useStyle()` injects into
// `<head>`. The runtime colour is measured in Chromium — see
// `packages/tests/e2e/date-picker-color.spec.ts`.
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamDatePickerHeader from '@origam/components/DatePicker/OrigamDatePickerHeader.vue'
import { createOrigam } from '@origam/origam'

function mountHeader (props: Record<string, unknown> = {}) {
    return mount(OrigamDatePickerHeader, {
        props: {header: 'May 8, 2026', ...props} as never,
        global: {plugins: [createOrigam()]},
        attachTo: document.body
    })
}

describe('OrigamDatePickerHeader — color prop', () => {
    it('emits no colour surface when `color` is absent', () => {
        const wrapper = mountHeader()

        expect(wrapper.classes().some((c) => c.startsWith('origam--color-'))).toBe(false)
        expect(wrapper.attributes('style') ?? '').not.toContain('color:')
    })

    it('emits the intent foreground declaration for a tokenised value', () => {
        const wrapper = mountHeader({color: 'primary'})

        // `tokenForegroundForIntent('primary')` → the intent's OWN hue
        // (`fgSubtle`), not the white-on-saturated pair the utility class
        // resolves. The two are different roles (#514) — both are emitted.
        expect(wrapper.attributes('style')).toContain('color: var(--origam-color__action--primary---fgSubtle)')
        expect(wrapper.classes()).toContain('origam--color-primary')
    })

    it('emits a raw CSS colour untouched', () => {
        const wrapper = mountHeader({color: '#ff0080'})

        // The DOM normalises a hex literal on a REAL `color` property —
        // which is itself the proof this lands on `color:` and not on a
        // custom property (those are stored verbatim, see the Month spec).
        expect(wrapper.attributes('style')).toContain('color: rgb(255, 0, 128)')
        // A custom value has no utility class — nothing to resolve.
        expect(wrapper.classes().some((c) => c.startsWith('origam--color-'))).toBe(false)
    })

    it('changes the declaration when the value changes', async () => {
        const wrapper = mountHeader({color: 'primary'})

        await wrapper.setProps({color: 'danger'} as never)

        expect(wrapper.attributes('style')).toContain('color: var(--origam-color__feedback--danger---fgSubtle)')
        expect(wrapper.classes()).toContain('origam--color-danger')
    })

    it('carries the declaration into the rule useStyle() injects in <head>', () => {
        const wrapper = mountHeader({color: 'primary'})

        const id = wrapper.attributes('id')
        expect(id).toBeTruthy()

        const sheets = Array.from(document.head.querySelectorAll('style'))
            .map((el) => el.textContent ?? '')
            .filter((text) => text.includes(`#${id}`))

        expect(sheets.length).toBeGreaterThan(0)
        expect(sheets.join('\n')).toContain('color: var(--origam-color__action--primary---fgSubtle)')
    })
})
