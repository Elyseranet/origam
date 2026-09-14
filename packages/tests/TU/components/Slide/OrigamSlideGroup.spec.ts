// Unit tests for <OrigamSlideGroup> — no prior spec existed for this
// component at all.
//
// Context: the component's own inline comments document THREE real,
// previously-shipped bugs that were fixed with zero regression coverage:
//
//  1. `slideGroupNextClasses` used `!hasPrev.value` (copy-paste from the
//     prev affix) instead of `!hasNext.value` — the next arrow stayed
//     enabled once you scrolled past the very start, and never disabled
//     itself at the true end.
//  2. `scrollTo()` added `scrollWidth - containerWidth` on top of the
//     step, jumping straight to the far end on the first click.
//  3. `scrollToPosition()` applied the RTL mirroring unconditionally,
//     sending every "go to N" call to `(maxScroll − N)` even in LTR.
//
// (2) and (3) require the ResizeObserver → containerSize/contentSize
// pipeline (never fires in jsdom with the standard observe/unobserve/
// disconnect mock) and useGoTo's animation loop, which are not
// meaningfully headless-testable — documented as a residual manual/e2e
// scenario below rather than faked into a false-positive unit test.
//
// (1) — the affix "disabled" classes — IS testable headlessly: hasPrev /
// hasNext read `scrollOffset` (a real reactive ref updated by the
// `@scroll` handler) plus `containerRef.value.scrollWidth/clientWidth`
// (plain DOM properties). Overriding those two properties on the actual
// mounted container element, then dispatching a real `scroll` event to
// update `scrollOffset`, exercises the exact computed chain the fix
// touches — asserted below by literally reintroducing the pre-fix
// `!hasPrev.value` line and confirming the test goes red.

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import OrigamSlideGroup from '@origam/components/Slide/OrigamSlideGroup.vue'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() }) as any
})

const mountGroup = (props: Record<string, any> = {}, slots: Record<string, any> = {}) =>
    mount(OrigamSlideGroup, {
        props,
        slots: {
            default: '<div class="item" style="width: 100px">Item</div>',
            ...slots
        },
        attachTo: document.body,
        global: { plugins: [createOrigam()] }
    })

/**
 * Patches `scrollWidth` / `clientWidth` (own-property overrides, read by
 * hasNext/hasPrev on every recompute) and `scrollLeft` (getter/setter
 * backed by a local variable, since jsdom's native scrollLeft silently
 * clamps to 0 when scrollWidth/clientWidth report no overflow) on the
 * `.origam-slide-group__container` element, then fires a real `scroll`
 * event so the component's own `scrollOffset` ref — and therefore
 * hasPrev/hasNext — recomputes from the patched geometry.
 */
const scrollContainerTo = async (
    wrapper: ReturnType<typeof mountGroup>,
    { scrollWidth, clientWidth, scrollLeft }: { scrollWidth: number, clientWidth: number, scrollLeft: number }
) => {
    const containerWrapper = wrapper.find('.origam-slide-group__container')
    const container = containerWrapper.element as HTMLElement

    Object.defineProperty(container, 'scrollWidth', { configurable: true, value: scrollWidth })
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: clientWidth })

    let current = 0
    Object.defineProperty(container, 'scrollLeft', {
        configurable: true,
        get: () => current,
        set: (v: number) => { current = v }
    })

    container.scrollLeft = scrollLeft
    // `.trigger()` awaits nextTick internally so the resulting scrollOffset
    // ref update (and the hasPrev/hasNext computeds it drives) is flushed
    // to the DOM before we assert — a raw `dispatchEvent()` without that
    // flush reads the class list from the pre-update render.
    await containerWrapper.trigger('scroll')

    return container
}

// ---------------------------------------------------------------------------
// direction — DIRECTION.HORIZONTAL / VERTICAL drives isHorizontal
// ---------------------------------------------------------------------------
describe('OrigamSlideGroup — direction', () => {
    it('defaults to horizontal (no --vertical modifier class)', () => {
        const wrapper = mountGroup()
        expect(wrapper.classes()).not.toContain('origam-slide-group--vertical')
        wrapper.unmount()
    })

    it('adds origam-slide-group--vertical when direction="vertical"', () => {
        const wrapper = mountGroup({ direction: 'vertical' })
        expect(wrapper.classes()).toContain('origam-slide-group--vertical')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Affix disabled classes — the fixed "next used !hasPrev" bug
// ---------------------------------------------------------------------------
describe('OrigamSlideGroup — affix disabled classes (regression: next must track hasNext, not hasPrev)', () => {
    it('at the start of the content (scrollLeft=0) prev is disabled and next is NOT', async () => {
        const wrapper = mountGroup({ showArrows: 'always' })
        await scrollContainerTo(wrapper, { scrollWidth: 500, clientWidth: 200, scrollLeft: 0 })

        expect(wrapper.find('.origam-slide-group__prev').classes()).toContain('origam-slide-group__prev--disabled')
        expect(wrapper.find('.origam-slide-group__next').classes()).not.toContain('origam-slide-group__next--disabled')
        wrapper.unmount()
    })

    it('at the true end of the content (scrollLeft=scrollSizeMax) next is disabled and prev is NOT', async () => {
        const wrapper = mountGroup({ showArrows: 'always' })
        // scrollSizeMax = scrollWidth(500) - clientWidth(200) = 300
        await scrollContainerTo(wrapper, { scrollWidth: 500, clientWidth: 200, scrollLeft: 300 })

        expect(wrapper.find('.origam-slide-group__prev').classes()).not.toContain('origam-slide-group__prev--disabled')
        expect(wrapper.find('.origam-slide-group__next').classes()).toContain('origam-slide-group__next--disabled')
        wrapper.unmount()
    })

    it('mid-scroll (neither start nor end) both affixes are enabled', async () => {
        const wrapper = mountGroup({ showArrows: 'always' })
        await scrollContainerTo(wrapper, { scrollWidth: 500, clientWidth: 200, scrollLeft: 150 })

        expect(wrapper.find('.origam-slide-group__prev').classes()).not.toContain('origam-slide-group__prev--disabled')
        expect(wrapper.find('.origam-slide-group__next').classes()).not.toContain('origam-slide-group__next--disabled')
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// hasAffixes — showArrows switch, branches that don't require geometry/
// display mocking
// ---------------------------------------------------------------------------
describe('OrigamSlideGroup — hasAffixes (showArrows)', () => {
    it('showArrows="always" always renders the prev/next affixes', () => {
        const wrapper = mountGroup({ showArrows: 'always' })
        expect(wrapper.find('.origam-slide-group__prev').exists()).toBe(true)
        expect(wrapper.find('.origam-slide-group__next').exists()).toBe(true)
        wrapper.unmount()
    })

    it('default (no showArrows) hides the affixes when not overflowing and not scrolled (desktop, jsdom default width)', () => {
        const wrapper = mountGroup()
        expect(wrapper.find('.origam-slide-group__prev').exists()).toBe(false)
        expect(wrapper.find('.origam-slide-group__next').exists()).toBe(false)
        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// Residual manual/e2e scenarios — NOT covered here (documented, not faked)
// ---------------------------------------------------------------------------
// - scrollTo() step arithmetic ("prev"/"next" moving exactly one
//   container-width, not jumping to the far end) requires containerSize /
//   contentSize populated by a REAL ResizeObserver callback firing with
//   contentRect entries — the standard observe/unobserve/disconnect mock
//   used across this test suite never invokes that callback, so
//   containerSize stays 0 and scrollToPosition's early-return guard
//   (`Math.abs(newPosition - scrollPosition) < 16`) always short-circuits
//   before goTo() is ever called. Covered by the e2e slide-group spec.
// - scrollToPosition()'s RTL mirroring (`scrollWidth - containerWidth -
//   newPosition`) needs the same containerSize pipeline plus a real RTL
//   document direction. Same residual e2e coverage.
