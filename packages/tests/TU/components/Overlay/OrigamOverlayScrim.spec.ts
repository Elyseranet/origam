// Unit tests for <OrigamOverlayScrim> — issue #447
//
// 1. `tag` prop is declared (`IOverlayScrimProps extends ITagProps`) and the
//    story exposes a "Tag" `HstSelect` control, but the template hardcoded
//    the root to `<div v-if="active" ...>` — the prop was never consumed.
//
// 2. ⛔ CORRECTION to the issue's own claim — the "Disabled (transition)"
//    story control is NOT fabricated. `disabled` IS declared on
//    `IOverlayScrimProps`, via `ITransitionComponentProps` (`transition?:
//    boolean | string | TTransitionProps; disabled?: boolean` — the "does
//    this component accept a `transition` override" mixin, shared by
//    Badge/BottomNav/ColorPickerField/Counter/DatePickerField/Drawer/Img/
//    Messages/Overlay/Select/Snackbar/Tooltip/Window). Verified against
//    `packages/ds/src/interfaces/Commons/transition-component.interface.ts`,
//    not assumed. The story control stays.
//
//    The REAL bug: the template never forwards `disabled` to
//    `<origam-transition>` (`<origam-transition :transition="transition">`
//    — no `:disabled` binding), so the declared prop is genuinely
//    unconsumed — the `unconsumed-props` guard already had
//    `OrigamOverlayScrim.disabled` baselined as a known violation before
//    this fix. Fixed by adding `:disabled="disabled"` to the binding.

import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import OrigamOverlayScrim from '@origam/components/Overlay/OrigamOverlayScrim.vue'

describe('OrigamOverlayScrim — tag prop (issue #447)', () => {
    it('renders a <div> root by default (tag unset)', () => {
        const wrapper = mount(OrigamOverlayScrim, {
            props: { active: true },
            global: { stubs: { transition: false } }
        })
        expect(wrapper.find('.origam-scrim').element.tagName).toBe('DIV')
    })

    it('renders the element named by `tag` when set (e.g. "aside")', () => {
        const wrapper = mount(OrigamOverlayScrim, {
            props: { active: true, tag: 'aside' },
            global: { stubs: { transition: false } }
        })
        const scrim = wrapper.find('.origam-scrim')
        expect(scrim.exists()).toBe(true)
        expect(scrim.element.tagName).toBe('ASIDE')
    })

    it('renders a different tag (e.g. "section") to prove the prop actually drives the root, not a hardcoded branch', () => {
        const wrapper = mount(OrigamOverlayScrim, {
            props: { active: true, tag: 'section' },
            global: { stubs: { transition: false } }
        })
        expect(wrapper.find('.origam-scrim').element.tagName).toBe('SECTION')
    })
})

// A spy stub standing in for `<origam-transition>` — records every
// `disabled` value it was mounted/updated with, so the assertion is "the
// prop was forwarded", not "the transition behaved a certain way in jsdom"
// (jsdom has no real CSS transitions, so timing-based assertions here would
// be indirect at best).
const receivedDisabled: Array<boolean | undefined> = []
const OrigamTransitionSpyStub = defineComponent({
    name: 'OrigamTransition',
    props: { transition: {}, disabled: { type: Boolean, default: undefined } },
    setup (props, { slots }) {
        return () => {
            receivedDisabled.push(props.disabled)
            return h('div', slots.default?.())
        }
    }
})

describe('OrigamOverlayScrim — disabled prop forwarded to the transition (issue #447)', () => {
    it('forwards disabled=true to <origam-transition>', () => {
        receivedDisabled.length = 0
        mount(OrigamOverlayScrim, {
            props: { active: true, disabled: true },
            global: { stubs: { OrigamTransition: OrigamTransitionSpyStub } }
        })
        expect(receivedDisabled.at(-1)).toBe(true)
    })

    it('forwards disabled=false (the default) to <origam-transition>', () => {
        receivedDisabled.length = 0
        mount(OrigamOverlayScrim, {
            props: { active: true },
            global: { stubs: { OrigamTransition: OrigamTransitionSpyStub } }
        })
        expect(receivedDisabled.at(-1)).toBeFalsy()
    })
})
