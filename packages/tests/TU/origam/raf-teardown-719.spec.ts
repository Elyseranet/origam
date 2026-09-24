/*
 * #719 — no `requestAnimationFrame` continuation may outlive its owner.
 *
 * Same family as #706: asynchronous work that nothing awaits and nothing
 * cancels, which resolves AFTER the jsdom environment has been torn down.
 * `window` no longer exists, the continuation explodes, and vitest fails
 * the WHOLE run on an unhandled `ReferenceError: window is not defined`
 * — with zero red tests. Measured three times in CI (#701 / #704 / #715).
 *
 * ⛔ WHAT THESE TESTS REPRODUCE, AND WHAT THEY DO NOT
 *
 * Nobody has ever reproduced #706 by TIMING — the race is a 16-to-48 ms
 * window and it is not addressable from a test. What IS addressable is
 * the CONDITION: a continuation that is still pending when the
 * environment goes away. That is what is measured here, in two shapes:
 *
 *   1. `pendingFramesFrom(<file>)` after `unmount()` — the load-bearing
 *      contract. Pre-fix a frame stays armed on a destroyed component;
 *      post-fix the scope cancelled it. Deterministic, no timing.
 *
 *   2. "fire the surviving callback with the globals deleted" — the #706
 *      condition itself, standing in for vitest's env teardown. Only
 *      applies to the sites whose continuation actually dereferences a
 *      global that teardown removes.
 *
 * The rAF scheduler is replaced by a deterministic fake for the whole
 * file: the real jsdom one fires on a ~16 ms timer that no test can hold
 * a callback across. The fake honours `cancelAnimationFrame` exactly
 * like the platform does — a cancelled id is dropped and never fires —
 * so "the fix cancels the frame" and "the frame never runs" are the same
 * measurement, not two.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, provide, ref } from 'vue'

import OrigamField from '@origam/components/Field/OrigamField.vue'
import OrigamInfiniteScroll from '@origam/components/InfiniteScroll/OrigamInfiniteScroll.vue'
import OrigamInfiniteScrollIntersect from '@origam/components/InfiniteScroll/OrigamInfiniteScrollIntersect.vue'
import OrigamMasonry from '@origam/components/Masonry/OrigamMasonry.vue'
import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'

import { createOrigam } from '@origam/origam'

import { ORIGAM_GO_TO_KEY, ORIGAM_LOCALE_KEY } from '@origam/consts'
import { ORIGAM_DISPLAY_KEY } from '@origam/consts/Commons/display.const'

import { INFINITE_SCROLL_MODE, INFINITE_SCROLL_SIDE, INFINITE_SCROLL_STATUS } from '@origam/enums'

import { createDisplay } from '@origam/composables/Commons/display.composable'
import { createGoTo } from '@origam/composables/Commons/goTo.composable'
import { useMasonry } from '@origam/composables/Masonry/masonry.composable'
import { useSsrBoot } from '@origam/composables/Commons/ssrBoot.composable'
import { useVirtual } from '@origam/composables/Commons/virtual.composable'

import {
    flushFramesFrom,
    installFakeRaf,
    pendingFramesFrom,
    withoutGlobals
} from '../probe/raf-teardown.harness'

/*********************************************************
 * Deterministic rAF harness
 *
 * ⛔ MOVED, not rewritten (#753). The harness this spec shipped inline
 * now lives in `TU/probe/raf-teardown.harness.ts` so #753's spec can use
 * the same instrument instead of a second copy that would drift. The
 * bodies are unchanged; only their home moved. Every assertion below is
 * byte-for-byte what #719 merged.
 ********************************************************/

beforeEach(() => {
    installFakeRaf()
})

afterEach(() => {
    vi.unstubAllGlobals()
})

/*********************************************************
 * useSsrBoot
 ********************************************************/

describe('useSsrBoot — boot frame (#719)', () => {
    const host = defineComponent({
        setup () {
            const { isBooted } = useSsrBoot()

            return () => h('div', String(isBooted.value))
        }
    })

    it('arms exactly one frame on mount (positive control)', () => {
        const wrapper = mount(host)

        expect(pendingFramesFrom('ssrBoot.composable.ts')).toBe(1)

        wrapper.unmount()
    })

    it('leaves no frame armed after unmount', () => {
        const wrapper = mount(host)

        wrapper.unmount()

        expect(pendingFramesFrom('ssrBoot.composable.ts')).toBe(0)
    })

    it('still boots when it is NOT unmounted (negative control)', async () => {
        const wrapper = mount(host)

        flushFramesFrom('ssrBoot.composable.ts')
        await nextTick()

        expect(wrapper.text()).toBe('true')

        wrapper.unmount()
    })
})

/*********************************************************
 * useVirtual
 ********************************************************/

const mountVirtual = () => {
    const items = ref<number[]>(Array.from({ length: 200 }, (_, i) => i))

    const inner = defineComponent({
        setup () {
            const virtual = useVirtual({ itemHeight: 24, height: 300 }, items)

            return () => h('div', {
                ref: (el) => {
                    virtual.containerRef.value = el as HTMLElement
                }
            }, [h('div', { ref: (el) => {
                virtual.markerRef.value = el as HTMLElement
            } })])
        }
    })

    // `useVirtual` injects a display instance (`useDisplay`) and a goTo
    // instance + locale (`useGoTo` → `useRtl`); all three throw when
    // absent. Provided with the real factories so the composable under
    // test runs its real code path.
    const locale = {
        isRtl: ref(false),
        rtlClasses: ref({}),
        current: ref('en'),
        fallback: ref('en'),
        messages: ref({}),
        t: (k: string) => k,
        n: (v: number) => String(v),
        d: (v: Date) => String(v),
        locale: ref('en')
    } as never

    const host = defineComponent({
        setup () {
            provide(ORIGAM_DISPLAY_KEY, createDisplay())
            provide(ORIGAM_LOCALE_KEY, locale)
            provide(ORIGAM_GO_TO_KEY, createGoTo({}, locale))

            return () => h(inner)
        }
    })

    return { host, items }
}

describe('useVirtual — recompute frames (#719)', () => {
    it('leaves no frame armed after the scope is disposed', async () => {
        const { host, items } = mountVirtual()
        const wrapper = mount(host)

        await nextTick()

        // `watch(items, …)` → calculateVisibleItems() → arms the
        // coalescing frame. Positive control for the teardown assertion
        // below: if this is 0, the test proves nothing.
        items.value = [...items.value, 999]
        await nextTick()

        expect(pendingFramesFrom('virtual.composable.ts')).toBeGreaterThan(0)

        wrapper.unmount()

        expect(pendingFramesFrom('virtual.composable.ts')).toBe(0)
    })

    it('does not schedule a new frame once the scope is disposed', async () => {
        const { host, items } = mountVirtual()
        const wrapper = mount(host)

        await nextTick()
        wrapper.unmount()

        // A dangling callback reaching `calculateVisibleItems` after
        // teardown is what throws: the SCHEDULER (`requestAnimationFrame`,
        // a bare global) is the line that explodes, exactly like
        // `OrigamImg.vue:316` did through `window.setTimeout`.
        items.value = [...items.value, 1000]
        await nextTick()

        expect(pendingFramesFrom('virtual.composable.ts')).toBe(0)
    })
})

/*********************************************************
 * useMasonry
 ********************************************************/

const mountMasonry = () => {
    let observerCallback: (() => void) | null = null

    class CapturingResizeObserver {
        constructor (cb: () => void) {
            observerCallback = cb
        }

        observe () {}
        unobserve () {}
        disconnect () {}
    }

    vi.stubGlobal('ResizeObserver', CapturingResizeObserver)

    const host = defineComponent({
        setup () {
            const { containerRef } = useMasonry({
                columnsRef: ref(3),
                gapRef: ref(8)
            })

            return () => h('div', {
                ref: (el) => {
                    containerRef.value = el as HTMLElement
                }
            })
        }
    })

    return { host, fireResize: () => observerCallback?.() }
}

describe('useMasonry — layout frames (#719)', () => {
    it('leaves no frame armed after unmount', async () => {
        const { host } = mountMasonry()
        const wrapper = mount(host)

        await nextTick()

        // First-paint measurement armed a frame (positive control).
        expect(pendingFramesFrom('masonry.composable.ts')).toBe(1)

        wrapper.unmount()

        expect(pendingFramesFrom('masonry.composable.ts')).toBe(0)
    })

    it('does not arm a frame from a ResizeObserver tick after unmount', async () => {
        const { host, fireResize } = mountMasonry()
        const wrapper = mount(host)

        await nextTick()

        // Positive control: while mounted, an observer tick DOES arm one.
        flushFramesFrom('masonry.composable.ts')
        expect(pendingFramesFrom('masonry.composable.ts')).toBe(0)
        fireResize()
        expect(pendingFramesFrom('masonry.composable.ts')).toBe(1)

        flushFramesFrom('masonry.composable.ts')
        wrapper.unmount()

        // The observer callback is itself a deferred continuation: at
        // unmount there was no handle to cancel, so only the disposed
        // flag can stop this one.
        fireResize()

        expect(pendingFramesFrom('masonry.composable.ts')).toBe(0)
    })
})

/*********************************************************
 * OrigamMasonry — the COMPONENT half of the same defect
 *
 * Found by the extended sweep, not by the ticket's own list. Shipping
 * `useMasonry` guarded while the `.vue` kept two uncancelled frames
 * would have been half a fix.
 ********************************************************/

describe('OrigamMasonry — layout frames (#719)', () => {
    it('arms a frame on mount and cancels it on unmount', async () => {
        const wrapper = mount(OrigamMasonry, {
            global: { plugins: [createOrigam()] }
        })

        await nextTick()

        // Positive control: `onMounted` defers the first relayout.
        expect(pendingFramesFrom('OrigamMasonry.vue')).toBe(1)

        wrapper.unmount()

        expect(pendingFramesFrom('OrigamMasonry.vue')).toBe(0)
    })

    /*
     * ⛔ NOT an A/B test — it passes on the parent commit too, measured.
     *
     * Both deferred bodies end in `getComputedStyle` (`resolveGapPx`
     * reads the painted gap, `relayout()` measures the container), so the
     * crash LOOKS reachable. It is not: `relayout()` returns early on
     * `!containerRef.value`, and Vue nulls that template ref at unmount,
     * so the pre-fix frame fires and bails before touching a global.
     *
     * Kept because it pins that early return. The day someone moves the
     * `getComputedStyle` read above the guard, this turns red — and the
     * contract that actually carries the fix here is the previous test.
     */
    it('the surviving frame does not throw when the DOM globals are gone', async () => {
        const wrapper = mount(OrigamMasonry, {
            global: { plugins: [createOrigam()] }
        })

        await nextTick()
        wrapper.unmount()

        expect(() => withoutGlobals(
            ['window', 'getComputedStyle'],
            () => flushFramesFrom('OrigamMasonry.vue')
        )).not.toThrow()
    })

    /*
     * ⛔ NOT an A/B test either — measured green on the parent commit.
     * Vue stops the watcher at unmount, so nothing re-arms whether the
     * `disposed` flag exists or not. What it does pin is its own positive
     * control: a gap swap MUST still arm a frame while mounted. Remove
     * the `scheduleFrame` call and this goes red.
     */
    it('does not arm a frame from a gap change after unmount', async () => {
        const wrapper = mount(OrigamMasonry, {
            props: { gap: 'md' } as never,
            global: { plugins: [createOrigam()] }
        })

        await nextTick()
        flushFramesFrom('OrigamMasonry.vue')

        // Positive control: while mounted, a gap swap DOES arm one.
        await wrapper.setProps({ gap: 'lg' } as never)
        await nextTick()

        expect(pendingFramesFrom('OrigamMasonry.vue')).toBe(1)

        flushFramesFrom('OrigamMasonry.vue')
        wrapper.unmount()

        expect(pendingFramesFrom('OrigamMasonry.vue')).toBe(0)
    })
})

/*********************************************************
 * OrigamInfiniteScroll
 ********************************************************/

const mountInfiniteScroll = () => {
    const loads: Array<{ done: (status: string) => void }> = []

    const wrapper = mount(OrigamInfiniteScroll, {
        props: {
            side: INFINITE_SCROLL_SIDE.END,
            mode: INFINITE_SCROLL_MODE.INTERSECT,
            onLoad: (payload: never) => {
                loads.push(payload)
            }
        } as never,
        global: { plugins: [createOrigam()] }
    })

    return { wrapper, loads }
}

/** Drive the intersect child's `@intersect`, which is what reaches `done`. */
const triggerLoad = async (wrapper: ReturnType<typeof mountInfiniteScroll>['wrapper']) => {
    await nextTick()

    const intersect = wrapper.findComponent(OrigamInfiniteScrollIntersect)

    intersect.vm.$emit('intersect', { side: INFINITE_SCROLL_SIDE.END, isIntersecting: true })

    await nextTick()
}

describe('OrigamInfiniteScroll — triple rAF after `done()` (#719)', () => {
    it('arms a frame after `done()` and cancels it on unmount', async () => {
        const { wrapper, loads } = mountInfiniteScroll()

        await triggerLoad(wrapper)

        expect(loads).toHaveLength(1)

        loads[0].done(INFINITE_SCROLL_STATUS.OK)

        // `done()` defers through two nextTicks before arming the first
        // of three chained frames.
        await nextTick()
        await nextTick()

        // Positive control — without it the unmount assertion below would
        // pass on an empty queue and prove nothing.
        expect(pendingFramesFrom('OrigamInfiniteScroll.vue')).toBe(1)

        wrapper.unmount()

        expect(pendingFramesFrom('OrigamInfiniteScroll.vue')).toBe(0)
    })

    it('the surviving frame does not throw when `window` is gone', async () => {
        const { wrapper, loads } = mountInfiniteScroll()

        await triggerLoad(wrapper)
        loads[0].done(INFINITE_SCROLL_STATUS.OK)
        await nextTick()
        await nextTick()

        wrapper.unmount()

        // The #706 condition itself. Pre-fix the frame survives unmount,
        // fires here, and its body calls `window.requestAnimationFrame`
        // for the next rung — THE THROW IS IN THE SCHEDULER, exactly the
        // shape that made the first scanner miss `OrigamImg.vue:316`.
        expect(() => withoutGlobals(['window'], () => flushFramesFrom('OrigamInfiniteScroll.vue'))).not.toThrow()
    })

    it('still re-arms the intersection while mounted (negative control)', async () => {
        const { wrapper, loads } = mountInfiniteScroll()

        await triggerLoad(wrapper)
        loads[0].done(INFINITE_SCROLL_STATUS.OK)
        await nextTick()
        await nextTick()

        // Three chained frames, then `intersecting()` → a second `load`.
        flushFramesFrom('OrigamInfiniteScroll.vue')
        await nextTick()

        expect(loads.length).toBeGreaterThan(1)

        wrapper.unmount()
    })
})

/*********************************************************
 * OrigamSelect
 ********************************************************/

const mountSelect = () => mount(OrigamSelect, {
    props: {
        items: ['alpha', 'beta', 'gamma'],
        modelValue: 'beta'
    } as never,
    global: { plugins: [createOrigam()] }
})

describe('OrigamSelect — scroll-to-index frame (#719)', () => {
    it('arms a frame when the menu opens and cancels it on unmount', async () => {
        const wrapper = mountSelect()

        await nextTick()
        flushFramesFrom('OrigamSelect.vue')

        await wrapper.setProps({ menu: true } as never)
        await nextTick()

        // Positive control.
        expect(pendingFramesFrom('OrigamSelect.vue')).toBe(1)

        wrapper.unmount()

        expect(pendingFramesFrom('OrigamSelect.vue')).toBe(0)
    })
})

/*********************************************************
 * OrigamField
 ********************************************************/

const mountField = () => mount(OrigamField, {
    props: { label: 'Label' } as never,
    global: { plugins: [createOrigam()] }
})

describe('OrigamField — floating-label frame (#719)', () => {
    it('arms a frame when the field turns active and cancels it on unmount', async () => {
        const wrapper = mountField()

        await nextTick()
        flushFramesFrom('OrigamField.vue')

        await wrapper.setProps({ dirty: true } as never)
        await nextTick()

        // Positive control.
        expect(pendingFramesFrom('OrigamField.vue')).toBe(1)

        wrapper.unmount()

        expect(pendingFramesFrom('OrigamField.vue')).toBe(0)
    })

    it('the surviving frame does not throw when the DOM globals are gone', async () => {
        const wrapper = mountField()

        await nextTick()
        flushFramesFrom('OrigamField.vue')

        await wrapper.setProps({ dirty: true } as never)
        await nextTick()

        wrapper.unmount()

        // `getComputedStyle` is a BARE global here, not `window.…`, and
        // `globalThis === window` under jsdom means deleting `window`
        // alone leaves it callable — measured. Both names are therefore
        // removed, which is what vitest's env teardown does.
        expect(() => withoutGlobals(['window', 'getComputedStyle'], () => flushFramesFrom('OrigamField.vue'))).not.toThrow()
    })
})
