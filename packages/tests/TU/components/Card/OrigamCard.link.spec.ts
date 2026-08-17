// OrigamCard — link / clickability surface.
//
// ⚠️ TWO PRODUCT BUGS FOUND BY THIS FILE, both since repaired.
//
// 1. `isClickable` short-circuit. OrigamCard.vue gated its clickability on:
//
//        !props.disabled && props.link && (props.link || link.isClickable.value)
//
//    The leading `props.link &&` short-circuits the whole parenthesis, so
//    `link.isClickable.value` — the disjunct that exists precisely to make an
//    `href` / `to` / `@click` card interactive — was dead code. A card given
//    only an `href` rendered as an `<a>` (so `useLink` had detected the link)
//    yet carried neither `origam-card--link` nor the `__overlay` element, and
//    its ripple and navigation were both inert. The same defect was repaired
//    in `OrigamListItem` and `OrigamChip` before it; Card was the last holdout.
//
//        !props.disabled && (props.link || link.isClickable.value)
//
//    Card has no group notion (no `useGroupItem` / injected group), so unlike
//    Chip and ListItem there is no `!!group` disjunct to carry over.
//
// 2. `href` rendered as `"[object Object]"`. The template bound
//    `:href="link.href"` where `useLink` returns `href` as a *computed ref*.
//    A ref nested in a plain (non-reactive) object is NOT auto-unwrapped by
//    the template compiler, so every card — including one with no `href` at
//    all — emitted a literal `href="[object Object]"` attribute, and a card
//    with a real `href` pointed nowhere. `OrigamListItem` already bound
//    `link.href.value`. `OrigamChip` carried the identical defect and is
//    covered at the bottom of this file.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

import OrigamCard from '@origam/components/Card/OrigamCard.vue'
import OrigamChip from '@origam/components/Chip/OrigamChip.vue'
import { createOrigam } from '@origam/origam'

function mountCard (attrs = '', listeners: Record<string, unknown> = {}) {
    const Host = defineComponent({
        components: { OrigamCard },
        template: `<origam-card ${attrs} v-on="listeners">content</origam-card>`,
        setup: () => ({ listeners })
    })

    return mount(Host, { global: { plugins: [createOrigam()] } })
}

// The root is a substitution element (`<component :is="link.tag">`), so it is
// a `<div>` or an `<a>` depending on the link props. Always locate it by class
// rather than by tag.
function root (wrapper: VueWrapper) {
    return wrapper.find('.origam-card')
}

function isClickable (wrapper: VueWrapper): boolean {
    return root(wrapper).classes().includes('origam-card--link')
}

// ---------------------------------------------------------------------------
// isClickable — the repaired short-circuit
// ---------------------------------------------------------------------------

describe('OrigamCard — isClickable', () => {
    it('is not clickable when given no link surface at all', () => {
        const wrapper = mountCard()

        expect(isClickable(wrapper)).toBe(false)
        expect(wrapper.find('.origam-card__overlay').exists()).toBe(false)
    })

    it('is clickable from `href` alone', () => {
        const wrapper = mountCard('href="/somewhere"')

        expect(isClickable(wrapper)).toBe(true)
        expect(wrapper.find('.origam-card__overlay').exists()).toBe(true)
    })

    it('is clickable from `to` alone', () => {
        const wrapper = mountCard('to="/somewhere"')

        expect(isClickable(wrapper)).toBe(true)
        expect(wrapper.find('.origam-card__overlay').exists()).toBe(true)
    })

    it('is clickable from a bound click listener alone', () => {
        const wrapper = mountCard('', { click: () => {} })

        expect(isClickable(wrapper)).toBe(true)
    })

    it('is still clickable from the explicit `link` prop', () => {
        const wrapper = mountCard('link')

        expect(isClickable(wrapper)).toBe(true)
        expect(wrapper.find('.origam-card__overlay').exists()).toBe(true)
    })

    it('is not clickable when disabled, whatever the link surface', () => {
        for (const attrs of ['link disabled', 'href="/x" disabled', 'to="/x" disabled']) {
            const wrapper = mountCard(attrs)

            expect(isClickable(wrapper), `attrs: ${attrs}`).toBe(false)
            expect(wrapper.find('.origam-card__overlay').exists(), `attrs: ${attrs}`).toBe(false)
        }
    })
})

// ---------------------------------------------------------------------------
// href — the repaired ref-unwrapping
// ---------------------------------------------------------------------------

describe('OrigamCard — href attribute', () => {
    it('renders the real href value, not the ref object', () => {
        const wrapper = mountCard('href="/somewhere"')

        expect(root(wrapper).attributes('href')).toBe('/somewhere')
    })

    it('emits no href attribute when none was given', () => {
        const wrapper = mountCard()

        expect(root(wrapper).attributes('href')).toBeUndefined()
    })
})

describe('OrigamChip — href attribute', () => {
    it('renders the real href value, not the ref object', () => {
        const Host = defineComponent({
            components: { OrigamChip },
            template: '<origam-chip href="/somewhere">chip</origam-chip>'
        })
        const wrapper = mount(Host, { global: { plugins: [createOrigam()] } })

        expect(wrapper.find('.origam-chip').attributes('href')).toBe('/somewhere')
    })
})
