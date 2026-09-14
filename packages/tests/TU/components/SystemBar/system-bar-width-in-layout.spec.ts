// Regression for #383 — same form as OrigamBottomNav: inside an
// <OrigamLayout> ancestor, `useLayoutItem` always writes
// `width: calc(100% - left - right)` in the SAME flattened `useStyle()`
// rule as the consumer's own `dimensionStyles` width. Source order decided
// which `width` declaration won, and `dimensionStyles` was placed BEFORE
// `layoutItemStyles` — so the layout's calc() always overwrote a
// consumer-supplied `width` the moment an `<OrigamLayout>` ancestor exists.

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

describe('OrigamSystemBar — explicit width survives inside an <OrigamLayout> (#383)', () => {
    it('a consumer-supplied width is NOT overwritten by the layout calc() once inside <OrigamLayout>', async () => {
        const wrapper = mountInLayout({ width: '320px' })
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-system-bar')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)

        const calcIndex = rule.indexOf('width: calc(100%')
        const explicitIndex = rule.indexOf('width: 320px')
        expect(explicitIndex).toBeGreaterThan(-1)
        if (calcIndex !== -1) {
            expect(explicitIndex).toBeGreaterThan(calcIndex)
        }
        wrapper.unmount()
    })

    it('WITHOUT an explicit width, the layout still reserves the full width via calc()', async () => {
        const wrapper = mountInLayout({})
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-system-bar')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)
        expect(rule).toContain('width: calc(100%')
        wrapper.unmount()
    })
})
