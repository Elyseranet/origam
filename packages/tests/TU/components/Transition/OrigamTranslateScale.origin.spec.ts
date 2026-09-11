// Regression test for the `origin` implementation on `<OrigamTranslateScale>`
// (tickets #538/#548 — "the prop `origin` on 8 transitions: 7 removals, 1
// implementation"). Unlike its 7 siblings in the shared `ITransitionProps`
// family (Fade, ExpandX/Y, Window*Translate), `TranslateScale` genuinely
// animates a `scale(...)` — CSS-only (`transform: scale(0.9)`) AND via WAAPI
// (`translate(...) scale(sx, sy)`) — so `transform-origin` has something to
// anchor on. Both paths must apply it; see `applyOrigin` in
// `OrigamTranslateScale.vue`.
//
// jsdom NEVER resolves `var()` (see project CLAUDE.md), but this assertion
// is on a LITERAL inline style (`el.style.transformOrigin = 'top left'`),
// set directly by our own hook, not read back through a `var()`-driven
// stylesheet rule — so it resolves correctly under jsdom. See CLAUDE.md
// "`getComputedStyle` under jsdom NEVER resolves `var()`" section: inline
// styles are explicitly the exception that DOES work.
//
// The WAAPI keyframe MATH driven by `origin` (via `getDimensions()`'s
// `getComputedStyle(el).transformOrigin` read) is NOT provable here —
// jsdom's layout engine returns 0 for every box metric, so `x`/`y`/`sx`/`sy`
// would be 0 regardless of origin. That part needs Playwright against a
// real Histoire story (see the mission report to the lead).

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamTranslateScale from '@origam/components/Transition/OrigamTranslateScale.vue'

function nextFrame (): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()))
}

function mountHost (props: { origin?: string; target?: [number, number]; disabled?: boolean }) {
    const show = ref(false)

    const Host = defineComponent({
        setup () {
            return () => h(
                OrigamTranslateScale,
                props,
                {
                    default: () => show.value
                        ? h('div', { key: 'content', 'data-cy': 'content' }, 'Hello')
                        : undefined
                }
            )
        }
    })

    const wrapper = mount(Host, {
        global: { stubs: { transition: false } }
    })

    return { wrapper, show }
}

describe('OrigamTranslateScale — origin prop, CSS-only path (no target)', () => {
    it('sets transform-origin on the element before it enters', async () => {
        const { wrapper, show } = mountHost({ origin: 'top left' })

        show.value = true
        await nextTick()

        const el = wrapper.find('[data-cy="content"]').element as HTMLElement
        expect(el.style.transformOrigin).toBe('top left')
    })

    it('sets transform-origin on the element before it leaves', async () => {
        const { wrapper, show } = mountHost({ origin: 'bottom right' })

        show.value = true
        await nextTick()

        const el = wrapper.find('[data-cy="content"]').element as HTMLElement
        el.style.transformOrigin = ''

        show.value = false
        await nextTick()

        expect(el.style.transformOrigin).toBe('bottom right')
    })

    it('does NOT touch transform-origin when origin is absent (baseline)', async () => {
        const { wrapper, show } = mountHost({})

        show.value = true
        await nextTick()

        const el = wrapper.find('[data-cy="content"]').element as HTMLElement
        expect(el.style.transformOrigin).toBe('')
    })
})

describe('OrigamTranslateScale — origin prop, WAAPI path (target set)', () => {
    let animateSpy: ReturnType<typeof vi.fn>
    const originalAnimate = (Element.prototype as any).animate

    beforeEach(() => {
        animateSpy = vi.fn().mockReturnValue({
            finished: Promise.resolve(),
            onfinish: null
        })
        ;(Element.prototype as any).animate = animateSpy
    })

    afterEach(() => {
        (Element.prototype as any).animate = originalAnimate
    })

    it('sets transform-origin on the element before the WAAPI enter animation runs', async () => {
        const { wrapper, show } = mountHost({ target: [0, 0], origin: '20% 80%' })

        show.value = true
        await nextTick()
        await nextFrame()
        await nextFrame()
        await nextFrame()

        const el = wrapper.find('[data-cy="content"]').element as HTMLElement
        expect(el.style.transformOrigin).toBe('20% 80%')
        expect(animateSpy).toHaveBeenCalled()
    })

    it('does NOT touch transform-origin when origin is absent (baseline, WAAPI path)', async () => {
        const { wrapper, show } = mountHost({ target: [0, 0] })

        show.value = true
        await nextTick()
        await nextFrame()
        await nextFrame()
        await nextFrame()

        const el = wrapper.find('[data-cy="content"]').element as HTMLElement
        expect(el.style.transformOrigin).toBe('')
    })

    it('does NOT set transform-origin when disabled=true, even with origin and a target (disabled still gates both paths)', async () => {
        const { wrapper, show } = mountHost({ target: [0, 0], origin: 'center', disabled: true })

        show.value = true
        await nextTick()
        await nextFrame()

        const el = wrapper.find('[data-cy="content"]').element as HTMLElement
        expect(el.style.transformOrigin).toBe('')
        expect(animateSpy).not.toHaveBeenCalled()
    })
})
