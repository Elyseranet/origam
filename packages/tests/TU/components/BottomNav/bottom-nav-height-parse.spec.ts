// Regression for #384 — `Number(props.height)` returns NaN for any CSS
// length string (`Number('96px')` === NaN). The invalid `height: NaN`
// declaration is silently dropped by the browser (and by jsdom's CSS
// parser), so a valid `height: 96px` written earlier by `dimensionStyles`
// survives — the component LOOKS like it works. What is actually broken is
// the documented contract: `density="compact"` promises `height - 8px`,
// and that subtraction never applies unless the consumer passes a bare
// number (`:height="96"`), which the Histoire control itself never
// produces.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { OrigamBottomNav } from '@origam/components'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

const injectedRuleFor = (id: string): string => {
    for (const styleEl of Array.from(document.head.querySelectorAll('style'))) {
        if (styleEl.textContent?.includes(`#${id}`)) return styleEl.textContent
    }
    return ''
}

function mountBar (props: Record<string, unknown> = {}) {
    return mount(OrigamBottomNav, {
        props: { modelValue: true, order: 0, ...props } as never,
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })
}

describe('OrigamBottomNav — height minus 8px in compact density, CSS-length height (#384)', () => {
    it('height="96px" + density="compact" actually reserves 88px (density-aware value), not the raw 96px', async () => {
        const wrapper = mountBar({ height: '96px', density: 'compact' })
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-bottom-nav')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)

        // The density-aware override must be the LAST `height:` declaration
        // in the flattened rule (source order decides the winner, same
        // useStyle() mechanism as #383) and must read 88px, not 96px/NaN.
        const heightDeclarations = [...rule.matchAll(/height:\s*([^;]+);/g)].map(m => m[1].trim())
        expect(heightDeclarations.length).toBeGreaterThan(0)
        expect(heightDeclarations[heightDeclarations.length - 1]).toBe('88px')
        wrapper.unmount()
    })

    it('height="96px" WITHOUT compact density keeps the raw 96px', async () => {
        const wrapper = mountBar({ height: '96px' })
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-bottom-nav')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)
        const heightDeclarations = [...rule.matchAll(/height:\s*([^;]+);/g)].map(m => m[1].trim())
        expect(heightDeclarations[heightDeclarations.length - 1]).toBe('96px')
        wrapper.unmount()
    })

    it('a bare numeric height (already worked before the fix) still works: height="96" + compact -> 88px', async () => {
        const wrapper = mountBar({ height: 96, density: 'compact' })
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-bottom-nav')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)
        const heightDeclarations = [...rule.matchAll(/height:\s*([^;]+);/g)].map(m => m[1].trim())
        expect(heightDeclarations[heightDeclarations.length - 1]).toBe('88px')
        wrapper.unmount()
    })
})
