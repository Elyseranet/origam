// Unit tests for <OrigamCard> — hover listener gating (stateFlag phase B follow-up)
//
// Context: useStateFlag's hover suffix went from the dead `--hovered` to the
// styled `--hover` (see stateFlag.composable.ts). Before this fix, Card's
// `@mouseenter`/`@mouseleave` were bound unconditionally, so a `flat` or
// `disabled` Card silently started painting cursor:pointer + a ripple
// overlay + box-shadow-hover on real mouse hover — a decorative card looked
// interactive by accident. `isHoverable` (`!disabled && !flat`) restores the
// guard the hand-rolled `origam-card--hover` class always carried.
//
// These specs assert the CLASS PRESENCE contract (jsdom does not resolve
// `var()`/cascade, so the actual cursor/box-shadow effect was verified
// separately in a real browser — see the commit message). What's testable
// and load-bearing here: does the listener fire, and does it produce the
// class.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamCard from '@origam/components/Card/OrigamCard.vue'

async function hoverCard (props: Record<string, unknown>) {
    const wrapper = mount(OrigamCard, { props: props as never })
    await wrapper.trigger('mouseenter')
    return wrapper
}

describe('OrigamCard — hover listener gating (isHoverable)', () => {
    it('a normal card (not flat, not disabled) still reacts to a real mouse hover', async () => {
        const wrapper = await hoverCard({})
        expect(wrapper.classes()).toContain('origam-card--hover')
    })

    it('a flat card does NOT react to a real mouse hover', async () => {
        const wrapper = await hoverCard({ flat: true })
        expect(wrapper.classes()).not.toContain('origam-card--hover')
    })

    it('a disabled card does NOT react to a real mouse hover', async () => {
        const wrapper = await hoverCard({ disabled: true })
        expect(wrapper.classes()).not.toContain('origam-card--hover')
    })

    it('mouseleave on a normal card removes the class again', async () => {
        const wrapper = await hoverCard({})
        expect(wrapper.classes()).toContain('origam-card--hover')
        await wrapper.trigger('mouseleave')
        expect(wrapper.classes()).not.toContain('origam-card--hover')
    })

    it('an explicit hover=true prop (forced, not flat/disabled) shows the class without any interaction', () => {
        const wrapper = mount(OrigamCard, { props: { hover: true } as never })
        expect(wrapper.classes()).toContain('origam-card--hover')
    })

    it('KNOWN REMAINING DIFFERENCE: hover=true forced on a flat card still emits the class from useStateFlag, even though the hand-rolled condition (hover && !flat) would say no — the two guards are NOT an exact duplicate', () => {
        // `forced` inside useStateFlag short-circuits on `props.hover === true`
        // regardless of `disabled`/`flat` — only the mouseenter/mouseleave
        // *listener* was gated by `isHoverable`, not the `hover` prop's own
        // forced branch. Documented, not silently patched — see PHASE B report.
        const wrapper = mount(OrigamCard, { props: { hover: true, flat: true } as never })
        expect(wrapper.classes()).toContain('origam-card--hover')
    })
})
