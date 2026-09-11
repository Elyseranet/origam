// Unit tests for <OrigamCounter>
//
// Strategy: mount with createOrigam() (provides locale + theme). No stubs
// needed — OrigamCounter's only sub-component is OrigamTransition (for
// animation), which degrades gracefully without DOM layout.
//
// We exercise:
//   - BEM root class: origam-counter
//   - Display text: "value" alone, "value / max" with max set
//   - --error class when value > max (and not disabled)
//   - active prop: v-show hides the counter when active=false
//   - color / bgColor → colorClasses (utility class injected)
//   - tag prop: root element tag changes
//   - disabled: suppresses --error even when value > max

import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamCounter from '@origam/components/Counter/OrigamCounter.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

interface IMountOpts {
    props?: Record<string, unknown>
    slots?: Record<string, unknown>
}

function mountCounter (opts: IMountOpts = {}): VueWrapper {
    return mount(OrigamCounter, {
        attachTo: document.body,
        global: {
            plugins: [createOrigam()],
            stubs: {
                // Collapse the animation wrapper to a plain <span> so
                // the counter child is always rendered synchronously in jsdom.
                OrigamTransition: { template: '<span><slot/></span>' },
                OrigamSlideY: true
            }
        },
        props: opts.props ?? {},
        slots: opts.slots ?? {}
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrigamCounter — BEM root class', () => {
    it('renders the origam-counter class', () => {
        const wrapper = mountCounter({ props: { active: true, value: 0 } })
        expect(wrapper.find('.origam-counter').exists()).toBe(true)
    })
})

describe('OrigamCounter — display text', () => {
    it('renders the bare value when max is absent', () => {
        const wrapper = mountCounter({ props: { active: true, value: 7 } })
        expect(wrapper.find('.origam-counter').text()).toBe('7')
    })

    it('renders "value / max" when max is provided', () => {
        const wrapper = mountCounter({ props: { active: true, value: 3, max: 10 } })
        expect(wrapper.find('.origam-counter').text()).toBe('3 / 10')
    })

    it('works with string values', () => {
        const wrapper = mountCounter({ props: { active: true, value: '5', max: '20' } })
        expect(wrapper.find('.origam-counter').text()).toBe('5 / 20')
    })

    it('renders "0" when value is absent (default 0)', () => {
        const wrapper = mountCounter({ props: { active: true } })
        expect(wrapper.find('.origam-counter').text()).toBe('0')
    })
})

describe('OrigamCounter — error class', () => {
    it('adds origam-counter--error when value > max and not disabled', () => {
        const wrapper = mountCounter({ props: { active: true, value: 15, max: 10 } })
        expect(wrapper.find('.origam-counter--error').exists()).toBe(true)
    })

    it('does NOT add --error when value <= max', () => {
        const wrapper = mountCounter({ props: { active: true, value: 8, max: 10 } })
        expect(wrapper.find('.origam-counter--error').exists()).toBe(false)
    })

    it('does NOT add --error when value equals max', () => {
        const wrapper = mountCounter({ props: { active: true, value: 10, max: 10 } })
        expect(wrapper.find('.origam-counter--error').exists()).toBe(false)
    })

    it('does NOT add --error when disabled=true even if value > max', () => {
        const wrapper = mountCounter({ props: { active: true, value: 15, max: 10, disabled: true } })
        expect(wrapper.find('.origam-counter--error').exists()).toBe(false)
    })

    it('does NOT add --error when max is absent', () => {
        const wrapper = mountCounter({ props: { active: true, value: 999 } })
        expect(wrapper.find('.origam-counter--error').exists()).toBe(false)
    })
})

describe('OrigamCounter — active prop (v-show)', () => {
    it('is hidden via display:none when active=false', async () => {
        const wrapper = mountCounter({ props: { active: false, value: 5 } })
        await nextTick()
        const counter = wrapper.find('.origam-counter')
        // v-show renders the element but hides it with display:none
        expect(counter.exists()).toBe(true)
        expect(counter.isVisible()).toBe(false)
    })

    it('is visible when active=true', async () => {
        const wrapper = mountCounter({ props: { active: true, value: 5 } })
        await nextTick()
        expect(wrapper.find('.origam-counter').isVisible()).toBe(true)
    })

    it('re-shows when active flips from false to true', async () => {
        const wrapper = mountCounter({ props: { active: false, value: 3 } })
        await nextTick()
        expect(wrapper.find('.origam-counter').isVisible()).toBe(false)
        await wrapper.setProps({ active: true })
        await nextTick()
        expect(wrapper.find('.origam-counter').isVisible()).toBe(true)
    })
})

describe('OrigamCounter — tag prop', () => {
    it('renders as <div> by default', () => {
        const wrapper = mountCounter({ props: { active: true, value: 0 } })
        expect(wrapper.find('.origam-counter').element.tagName).toBe('DIV')
    })

    it('renders as <span> when tag="span"', () => {
        const wrapper = mountCounter({ props: { active: true, value: 0, tag: 'span' } })
        expect(wrapper.find('.origam-counter').element.tagName).toBe('SPAN')
    })

    it('renders as <p> when tag="p"', () => {
        const wrapper = mountCounter({ props: { active: true, value: 0, tag: 'p' } })
        expect(wrapper.find('.origam-counter').element.tagName).toBe('P')
    })
})

describe('OrigamCounter — color props → utility classes / inline styles', () => {
    it('adds the origam--color-primary utility class when color="primary"', () => {
        const wrapper = mountCounter({ props: { active: true, value: 0, color: 'primary' } })
        // useBothColor (textColor leg) emits origam--color-{value}
        const classes = wrapper.find('.origam-counter').classes()
        expect(classes.some(c => c.includes('primary'))).toBe(true)
    })

    it('bgColor="success" produces origam--bg-success class on .origam-counter', () => {
        // FIX: ICounterProps now extends IBgColorProps so bgColor is a recognised
        // prop. useBothColor(toRef(props, 'bgColor'), …) now receives the value
        // and emits the origam--bg-success utility class via colorClasses.
        const wrapper = mountCounter({ props: { active: true, value: 0, bgColor: 'success' } })
        const classes = wrapper.find('.origam-counter').classes()
        expect(classes.some(c => c.includes('bg-success') || c.includes('success'))).toBe(true)
    })
})

describe('OrigamCounter — custom slot', () => {
    it('renders slot content in place of the default counter text', () => {
        const wrapper = mountCounter({
            props: { active: true, value: 7, max: 10 },
            slots: {
                default: '<span class="custom-counter">Custom</span>'
            }
        })
        expect(wrapper.find('.custom-counter').exists()).toBe(true)
        expect(wrapper.find('.custom-counter').text()).toBe('Custom')
    })
})

describe('OrigamCounter — reactive updates', () => {
    it('updates the display text when value changes at runtime', async () => {
        const wrapper = mountCounter({ props: { active: true, value: 3, max: 10 } })
        expect(wrapper.find('.origam-counter').text()).toBe('3 / 10')
        await wrapper.setProps({ value: 8 })
        await nextTick()
        expect(wrapper.find('.origam-counter').text()).toBe('8 / 10')
    })

    it('flips --error class on/off when value crosses max boundary', async () => {
        const wrapper = mountCounter({ props: { active: true, value: 8, max: 10 } })
        expect(wrapper.find('.origam-counter--error').exists()).toBe(false)
        await wrapper.setProps({ value: 11 })
        await nextTick()
        expect(wrapper.find('.origam-counter--error').exists()).toBe(true)
    })
})
