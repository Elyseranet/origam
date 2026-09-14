// Pins the root element `<OrigamIcon>` actually renders, per icon notation.
//
// The doc used to claim "`<i>` for class-icons, `<div>` for SVG / component /
// ligature", and its Anatomy block showed `<div class="origam-icon--svg">`.
// That is not what ships: `OrigamIcon` declares `withDefaults(…, {tag: 'i'})`
// and forwards `:tag="tag"` to whichever leaf `useIcon` dispatched to, so the
// leaf's own `tag: 'div'` default is never reached through the dispatcher.
// Every notation therefore renders an `<i>` root.
//
// `wrapper.element.tagName` / `wrapper.classes()` are the jsdom-reliable
// probes here — no `getComputedStyle`, no `var()` (see CLAUDE.md, #398).

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamIcon from '@origam/components/Icon/OrigamIcon.vue'
import OrigamSvgIcon from '@origam/components/Icon/OrigamSvgIcon.vue'
import { createOrigam } from '@origam/origam'

const mountIcon = (icon: unknown) => mount(OrigamIcon, {
    props: { icon } as never,
    global: { plugins: [createOrigam({})] }
})

describe('OrigamIcon — root element', () => {
    it('renders <i> for a class-icon notation', () => {
        const wrapper = mountIcon('mdi-home')

        expect(wrapper.element.tagName).toBe('I')
        expect(wrapper.classes()).toContain('origam-icon')
    })

    it('renders <i> — not <div> — for an SVG-path notation', () => {
        const wrapper = mountIcon('M12 2 L17 8')

        expect(wrapper.element.tagName).toBe('I')
        expect(wrapper.classes()).toContain('origam-icon--svg')
    })

    it('renders <i> — not <div> — for a component notation', () => {
        const wrapper = mountIcon({ template: '<span>x</span>' })

        expect(wrapper.element.tagName).toBe('I')
        expect(wrapper.classes()).toContain('origam-icon--component')
    })

    it('honours an explicit tag override', () => {
        const wrapper = mount(OrigamIcon, {
            props: { icon: 'M12 2 L17 8', tag: 'span' } as never,
            global: { plugins: [createOrigam({})] }
        })

        expect(wrapper.element.tagName).toBe('SPAN')
    })

    it('the leaf mounted DIRECTLY still defaults to <div> — the divergence is the dispatcher forwarding its own default', () => {
        const wrapper = mount(OrigamSvgIcon, { props: { icon: 'M12 2 L17 8' } as never })

        expect(wrapper.element.tagName).toBe('DIV')
    })

    it('emits no size class when `size` is unset', () => {
        const wrapper = mountIcon('mdi-home')

        expect(wrapper.classes().some(c => c.startsWith('origam-icon--size-'))).toBe(false)
    })

    it('emits the size class for a tokenised rung', () => {
        const wrapper = mount(OrigamIcon, {
            props: { icon: 'mdi-home', size: 'default' } as never,
            global: { plugins: [createOrigam({})] }
        })

        expect(wrapper.classes()).toContain('origam-icon--size-default')
    })
})
