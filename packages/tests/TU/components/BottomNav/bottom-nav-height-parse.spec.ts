// Regression for #384 — `Number(props.height)` returns NaN for any CSS
// length string (`Number('96px')` === NaN). The invalid `height: NaN`
// declaration is silently dropped by the browser (and by jsdom's CSS
// parser), so a valid `height: 96px` written earlier by `dimensionStyles`
// survives — the component LOOKS like it works. What is actually broken is
// the documented contract: `density="compact"` promises `height - 8px`,
// and that subtraction never applies unless the consumer passes a bare
// number (`:height="96"`), which the Histoire control itself never
// produces.
//
// A second pass (still #384) found the FIRST fix itself regressed any
// non-px unit: it re-serialised `height` through the numeric, px-only
// `height` computed for EVERY `density`, so `height="50vh"` silently
// rendered a fixed `50px` — proven at runtime via Playwright against a
// live Histoire `Design` variant (computed height measured `50px` against
// a viewport-relative expectation of ~306px). Fixed by only overriding
// `height` at all in `density="compact"`, and expressing the subtraction
// as a native CSS `calc(<unit-preserving-value> - 8px)` instead of a JS
// numeric result — `calc(96px - 8px)` resolves to `88px` in the browser,
// matching the documented contract for an already-px value, and
// `calc(50vh - 8px)` resolves correctly for any other unit where a JS
// subtraction could not. See `bottom-nav-height-unit.spec.ts` (Playwright,
// e2e) for the browser-resolved proof across units.
//
// `afterEach` style-tag cleanup added below: without it, `useStyle`'s
// injected `<style>` tags from an EARLIER test in this file were still in
// `document.head` when a LATER test queried `injectedRuleFor(id)` — since
// that helper returns the FIRST `<style>` whose text includes `#${id}`,
// and `wrapper.unmount()` does not itself strip the tag, a later test's
// own (correct) style could be shadowed by an as-yet-unremoved earlier
// one. Caught while updating this spec: the "WITHOUT compact density"
// case measured `calc(96px - 8px)` — leaked from the PRECEDING compact
// test — until cleanup was added, matching the pattern already used in
// the sibling `drawer-width-parse.spec.ts`.

import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { OrigamBottomNav } from '@origam/components'
import { createOrigam } from '@origam/origam'

global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as never

afterEach(() => {
    document.body.innerHTML = ''
    document.head.querySelectorAll('style').forEach(el => el.remove())
})

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
        // useStyle() mechanism as #383). It's a native `calc()` expression
        // (not a pre-computed `88px`) so the browser — not jsdom, which
        // cannot resolve calc() either — is what actually proves it
        // equals 88px; see `bottom-nav-height-unit.spec.ts` (Playwright).
        const heightDeclarations = [...rule.matchAll(/height:\s*([^;]+);/g)].map(m => m[1].trim())
        expect(heightDeclarations.length).toBeGreaterThan(0)
        expect(heightDeclarations[heightDeclarations.length - 1]).toBe('calc(96px - 8px)')
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

    it('a bare numeric height (already worked before the fix) still works: height="96" + compact -> calc(96px - 8px)', async () => {
        const wrapper = mountBar({ height: 96, density: 'compact' })
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-bottom-nav')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)
        const heightDeclarations = [...rule.matchAll(/height:\s*([^;]+);/g)].map(m => m[1].trim())
        expect(heightDeclarations[heightDeclarations.length - 1]).toBe('calc(96px - 8px)')
        wrapper.unmount()
    })

    it('height="50vh" + density="compact": the override preserves the unit as calc(50vh - 8px), not a coerced px number', async () => {
        const wrapper = mountBar({ height: '50vh', density: 'compact' })
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-bottom-nav')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)
        const heightDeclarations = [...rule.matchAll(/height:\s*([^;]+);/g)].map(m => m[1].trim())
        expect(heightDeclarations[heightDeclarations.length - 1]).toBe('calc(50vh - 8px)')
        wrapper.unmount()
    })

    it('height="50vh" WITHOUT compact density: no override at all, dimensionStyles\' unit-preserving value wins', async () => {
        const wrapper = mountBar({ height: '50vh' })
        await nextTick()
        await nextTick()

        const bar = wrapper.find('.origam-bottom-nav')
        const id = bar.attributes('id') ?? ''
        const rule = injectedRuleFor(id)
        const heightDeclarations = [...rule.matchAll(/height:\s*([^;]+);/g)].map(m => m[1].trim())
        expect(heightDeclarations).toEqual(['50vh'])
        wrapper.unmount()
    })
})
