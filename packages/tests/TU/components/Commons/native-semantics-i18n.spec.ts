// Regression tests for issues #461 (OrigamSheet) and #458 (OrigamLabel).
//
// Both assert the RENDERED DOM, never the template source.
//
// ⛔ On the i18n half: a hardcoded English string is INDISTINGUISHABLE from
// a correct English translation, so an EN-only assertion passes with the bug
// still in place. Every accessible-name case below is therefore run under a
// second locale — that is the only assertion that discriminates. (Learned
// the hard way on #450/#451/#462, where mutating the code turned 11 tests
// red on one component and exactly 1 on another, purely because the second
// one was only covered in English.)
//
// ⛔ On the keyboard half: jsdom does NOT implement the UA behaviour that
// turns Enter/Space on a <button> into a click event. Native activation
// therefore CANNOT be proven here — it is covered in
// packages/tests/e2e/sheet.spec.ts, in a real browser. What this file can
// and does pin is the structural precondition: the element really is a
// <button type="button"> and carries no role/tabindex reimplementation.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamSheet from '@origam/components/Sheet/OrigamSheet.vue'
import OrigamLabel from '@origam/components/Label/OrigamLabel.vue'
import { createOrigam } from '@origam/origam'

/** The handle only renders when the sheet is swipeable AND anchored bottom. */
const SWIPEABLE_BOTTOM = {swipeable: true, side: 'bottom'} as const

function mountWith (component: any, props: Record<string, unknown>, locale?: string) {
    return mount(component, {
        props: props as never,
        global: {plugins: [createOrigam(locale ? {locale: {locale}} : undefined)]}
    })
}

describe('OrigamSheet — drag handle semantics and accessible name (#461)', () => {
    it('renders the handle as a NATIVE button, not a div with a role', () => {
        const wrapper = mountWith(OrigamSheet, {...SWIPEABLE_BOTTOM})
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        expect(handle.exists()).toBe(true)
        expect(handle.element.tagName).toBe('BUTTON')
        expect(handle.attributes('type')).toBe('button')
    })

    it('drops the role/tabindex reimplementation the native element supersedes', () => {
        const wrapper = mountWith(OrigamSheet, {...SWIPEABLE_BOTTOM})
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        // A native <button> is focusable and exposes the button role for
        // free. Re-declaring either is the dead weight the ticket flagged.
        expect(handle.attributes('role')).toBeUndefined()
        expect(handle.attributes('tabindex')).toBeUndefined()
    })

    it('keeps the pill child, so the button still holds only phrasing content', () => {
        const wrapper = mountWith(OrigamSheet, {...SWIPEABLE_BOTTOM})
        const handle = wrapper.find('[data-cy="sheet-bottom-handle"]')

        expect(handle.find('.origam-sheet__handle-pill').exists()).toBe(true)
        // <button> may not contain interactive descendants.
        expect(handle.find('button, a, input, select, textarea').exists()).toBe(false)
    })

    it('resolves the accessible name through the locale layer (en)', () => {
        const wrapper = mountWith(OrigamSheet, {...SWIPEABLE_BOTTOM})

        expect(wrapper.find('[data-cy="sheet-bottom-handle"]').attributes('aria-label'))
            .toBe('Drag handle')
    })

    // ⛔ THE discriminating case. Under `en` the pre-fix literal and the
    // post-fix translation are byte-identical.
    it('follows the active locale — the only assertion the old bug fails', () => {
        const wrapper = mountWith(OrigamSheet, {...SWIPEABLE_BOTTOM}, 'fr')

        expect(wrapper.find('[data-cy="sheet-bottom-handle"]').attributes('aria-label'))
            .toBe('Poignée de déplacement')
    })

    it('never leaks the raw key when the locale layer is present', () => {
        for (const locale of ['en', 'fr']) {
            const wrapper = mountWith(OrigamSheet, {...SWIPEABLE_BOTTOM}, locale)
            const label = wrapper.find('[data-cy="sheet-bottom-handle"]').attributes('aria-label')

            expect(label).not.toContain('origam.sheet')
            expect(label).toBeTruthy()
        }
    })
})

describe('OrigamLabel — name is only bound where HTML allows it (#458)', () => {
    it('does NOT render name on the default <label> tag', () => {
        const wrapper = mountWith(OrigamLabel, {name: 'mon-nom', text: 'Email'})

        expect(wrapper.element.tagName).toBe('LABEL')
        // <label> takes global attributes + `for`. `name` is a W3C
        // validation error and the browser ignores it outright.
        expect(wrapper.attributes('name')).toBeUndefined()
    })

    it('still renders name when the consumer picks a tag that accepts it', () => {
        const wrapper = mountWith(OrigamLabel, {tag: 'output', name: 'mon-nom', text: 'Email'})

        expect(wrapper.element.tagName).toBe('OUTPUT')
        expect(wrapper.attributes('name')).toBe('mon-nom')
    })

    it.each([
        ['div'],
        ['span'],
        ['p']
    ])('drops name on non-form tag %s', (tag) => {
        const wrapper = mountWith(OrigamLabel, {tag, name: 'mon-nom', text: 'Email'})

        expect(wrapper.attributes('name')).toBeUndefined()
    })

    it.each([
        ['input'],
        ['select'],
        ['textarea'],
        ['button'],
        ['form'],
        ['fieldset']
    ])('keeps name on form-associated tag %s', (tag) => {
        const wrapper = mountWith(OrigamLabel, {tag, name: 'mon-nom'})

        expect(wrapper.attributes('name')).toBe('mon-nom')
    })

    it('renders no name attribute at all when the prop is omitted', () => {
        const wrapper = mountWith(OrigamLabel, {tag: 'output', text: 'Email'})

        expect(wrapper.attributes('name')).toBeUndefined()
    })
})
