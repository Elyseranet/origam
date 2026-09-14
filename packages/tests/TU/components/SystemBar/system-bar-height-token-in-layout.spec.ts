// Regression for #440 (cause 3) — inside an <OrigamLayout> ancestor,
// `useLayoutItem({ elementSize: height })` used to unconditionally write a
// literal `height: {n}px` into the SAME flattened `#id{...}` rule useStyle()
// generates. An ID selector (specificity 1,0,0) always beats the component's
// own `.origam-system-bar--window { height: var(--origam-system-bar---height-
// window, 32px) }` class rule (0,1,0), so `--origam-system-bar---height` /
// `---height-window` were dead tokens in the only documented usage of the
// component (inside a layout): overriding them via a theme changed nothing.
//
// Fix: only force the literal `elementSize` when the consumer passes an
// explicit `height` prop (an intentional override, which SHOULD win over the
// theme). Otherwise `elementSize` stays undefined, no inline height is
// emitted, and the CSS var resolves the visual height. `layoutSize` keeps
// carrying the JS default for sibling offset math either way.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { OrigamLayout, OrigamSystemBar } from '@origam/components'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

function mountInLayout (props: Record<string, unknown> = {}) {
    const Host = defineComponent({
        setup () {
            return () => h(OrigamLayout, null, {
                default: () => h(OrigamSystemBar, { order: 0, ...props })
            })
        }
    })
    return mount(Host, {
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

const injectedRuleFor = (id: string): string => {
    for (const styleEl of Array.from(document.head.querySelectorAll('style'))) {
        if (styleEl.textContent?.includes(`#${id}`)) return styleEl.textContent
    }
    return ''
}

describe('OrigamSystemBar — height token channel survives inside an <OrigamLayout> (#440-3)', () => {
    it('WITHOUT an explicit height prop, no literal inline height is injected — the CSS var / theme channel is left free to resolve it', async () => {
        const wrapper = mountInLayout({})
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-system-bar')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)

        expect(rule).not.toMatch(/height:\s*24px/)
        expect(rule).not.toMatch(/height:\s*32px/)
        wrapper.unmount()
    })

    it('WITH an explicit height prop, the consumer value still wins as a literal (intentional override, unchanged behaviour)', async () => {
        const wrapper = mountInLayout({ height: 48 })
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-system-bar')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)

        expect(rule).toMatch(/height:\s*48px/)
        wrapper.unmount()
    })
})
