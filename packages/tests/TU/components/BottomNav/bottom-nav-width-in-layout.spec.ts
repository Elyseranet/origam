// Regression for #383 — inside an <OrigamLayout> ancestor, `useLayoutItem`
// always writes `width: calc(100% - left - right)` in the SAME flattened
// `useStyle()` rule as the consumer's own `dimensionStyles` width. Because
// `useStyle` collapses every style source into ONE `#id{...}` rule, source
// ORDER decides which `width` declaration wins — and `dimensionStyles` was
// placed BEFORE `layoutItemStyles`, so the layout's calc() always overwrote
// a consumer-supplied `width` the moment an `<OrigamLayout>` ancestor exists.
// This is the DOCUMENTED default usage (`<OrigamLayout><OrigamBottomNav/></OrigamLayout>`),
// so the bug hit every consumer that follows the basic-usage example in the doc.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { OrigamBottomNav, OrigamLayout } from '@origam/components'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

function mountInLayout (props: Record<string, unknown> = {}) {
    const Host = defineComponent({
        setup () {
            return () => h(OrigamLayout, null, {
                default: () => h(OrigamBottomNav, { modelValue: true, order: 0, ...props })
            })
        }
    })
    return mount(Host, {
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

// `useStyle()` flattens every style source into ONE injected `<style>` rule
// (`#id{...}`) rather than an inline `style=""` attribute — read the actual
// injected rule text, matching how the ticket's own proof was gathered.
const injectedRuleFor = (id: string): string => {
    for (const styleEl of Array.from(document.head.querySelectorAll('style'))) {
        if (styleEl.textContent?.includes(`#${id}`)) return styleEl.textContent
    }
    return ''
}

describe('OrigamBottomNav — explicit width survives inside an <OrigamLayout> (#383)', () => {
    it('a consumer-supplied width is NOT overwritten by the layout calc() once inside <OrigamLayout>', async () => {
        const wrapper = mountInLayout({ width: '320px' })
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-bottom-nav')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)
        expect(rule).toContain('width: 320px')
        // Both declarations may be present in the flattened rule (the
        // layout's calc() default, then the consumer's override) — what
        // matters for the CSS cascade is that the consumer's value comes
        // LAST, so it is the one the browser actually applies.
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

        const bar = wrapper.find('.origam-bottom-nav')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)
        expect(rule).toContain('width: calc(100%')
        wrapper.unmount()
    })
})
