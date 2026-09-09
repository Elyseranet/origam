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

// All three emits of `IOverlayScrimEmits` (`click`, `mouseenter`,
// `mouseleave`) were declared, correctly wired in the template, and reached
// by no assertion anywhere — the whole emit surface of this component was
// uncovered (C5 second half, measured 2026-09-08). They are what
// `OrigamOverlay` binds through `scrimEvents` to close the overlay when the
// backdrop is clicked, so a silent regression here breaks dismissal on every
// scrim-bearing component (Dialog, Drawer, Snackbar…).
//
// `stubs: { transition: false }` is required: the auto-stubbed
// `<transition-stub>` renders no real child element, so there would be
// nothing to dispatch a mouse event on and every assertion below would fail
// for the wrong reason.
describe('OrigamOverlayScrim — forwarded pointer emits (C5 coverage)', () => {
    const mountScrim = () => mount(OrigamOverlayScrim, {
        props: { active: true },
        global: { stubs: { transition: false } }
    })

    it('emits `click` carrying the real MouseEvent', async () => {
        const wrapper = mountScrim()

        await wrapper.find('.origam-scrim').trigger('click')

        const emitted = wrapper.emitted('click')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBeInstanceOf(Event)
        expect((emitted![0][0] as Event).type).toBe('click')
    })

    it('emits `mouseenter` carrying the real MouseEvent', async () => {
        const wrapper = mountScrim()

        await wrapper.find('.origam-scrim').trigger('mouseenter')

        const emitted = wrapper.emitted('mouseenter')
        expect(emitted).toBeTruthy()
        expect((emitted![0][0] as Event).type).toBe('mouseenter')
    })

    it('emits `mouseleave` carrying the real MouseEvent', async () => {
        const wrapper = mountScrim()

        await wrapper.find('.origam-scrim').trigger('mouseleave')

        const emitted = wrapper.emitted('mouseleave')
        expect(emitted).toBeTruthy()
        expect((emitted![0][0] as Event).type).toBe('mouseleave')
    })

    it('emits nothing before the user interacts (guard against a handler firing on mount)', () => {
        const wrapper = mountScrim()

        expect(wrapper.emitted('click')).toBeFalsy()
        expect(wrapper.emitted('mouseenter')).toBeFalsy()
        expect(wrapper.emitted('mouseleave')).toBeFalsy()
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

// ---------------------------------------------------------------------------
// Emits — critère C5 de la famille Overlay (ticket J157)
//
// Le constat du classeur était juste sur les FAITS et sur le VERDICT, pour
// une raison qu'il faut garder en tête : les trois emits sont bien câblés
// (handleClick / handleMouseenter / handleMouseleave), mais rien ne le
// prouvait DIRECTEMENT — la seule couverture passait par Drawer, Dialog et
// Picker. Un composant dont les emits ne sont éprouvés qu'à travers ses
// consommateurs perd son filet dès que ces consommateurs changent de
// structure, et c'est exactement ce qui rend une régression invisible.
//
// Ce bloc n'est donc PAS un correctif : c'est le filet manquant.
// ---------------------------------------------------------------------------

describe('OrigamOverlayScrim — emits (C5, ticket J157)', () => {
    it('émet `click` avec l\'événement natif', async () => {
        const wrapper = mount(OrigamOverlayScrim, {
            props: { active: true },
            global: { stubs: { transition: false } }
        })

        await wrapper.find('.origam-scrim').trigger('click')

        expect(wrapper.emitted('click')).toHaveLength(1)
        expect(wrapper.emitted('click')?.[0][0]).toBeInstanceOf(Event)
    })

    it('émet `mouseenter` puis `mouseleave`, chacun une seule fois', async () => {
        const wrapper = mount(OrigamOverlayScrim, {
            props: { active: true },
            global: { stubs: { transition: false } }
        })

        const scrim = wrapper.find('.origam-scrim')

        await scrim.trigger('mouseenter')
        await scrim.trigger('mouseleave')

        expect(wrapper.emitted('mouseenter')).toHaveLength(1)
        expect(wrapper.emitted('mouseleave')).toHaveLength(1)
    })

    it('n\'émet RIEN tant que le scrim est inactif (il n\'est pas rendu)', () => {
        const wrapper = mount(OrigamOverlayScrim, {
            props: { active: false },
            global: { stubs: { transition: false } }
        })

        // Contrôle négatif : sans lui, les tests ci-dessus resteraient verts
        // sur un composant qui émettrait en permanence.
        expect(wrapper.find('.origam-scrim').exists()).toBe(false)
        expect(wrapper.emitted('click')).toBeUndefined()
    })
})
