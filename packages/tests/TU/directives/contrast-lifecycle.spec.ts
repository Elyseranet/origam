// v-contrast (#483) — the directive schedules a rAF + setTimeout pair on
// every `mounted` AND `updated`, but ships no `unmounted` hook and never
// cancels the previous pair before scheduling a new one. Both are resource
// leaks: the callbacks keep a live reference to a (possibly detached) DOM
// node and keep doing work on a dead component.
//
// These specs measure something OBSERVABLE — the number of timers still in
// flight (`vi.getTimerCount()`, backed by vitest's fake-timer clock, which
// tracks setTimeout AND requestAnimationFrame uniformly) — not merely that
// an `unmounted` hook exists.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, ref, withDirectives } from 'vue'

import vContrast from '@origam/directives/Contrast/contrast.directive'

describe('v-contrast — timer lifecycle (#483)', () => {
    let container: HTMLDivElement

    beforeEach(() => {
        vi.useFakeTimers()
        container = document.createElement('div')
        document.body.appendChild(container)
    })

    afterEach(() => {
        vi.useRealTimers()
        container.remove()
    })

    it('has zero timers in flight once the host element unmounts', () => {
        const app = createApp({
            render: () => withDirectives(h('span', 'hello'), [[vContrast]])
        })

        app.mount(container)

        // `mounted` schedules exactly one rAF + one setTimeout.
        expect(vi.getTimerCount()).toBe(2)

        app.unmount()

        // RED before the fix: the directive has no `unmounted` hook, so both
        // timers are still pending and will fire on a detached node.
        expect(vi.getTimerCount()).toBe(0)
    })

    it('does not accumulate a growing pair of timers across `updated` re-renders', async () => {
        const enabled = ref(true)
        const app = createApp({
            render: () => withDirectives(h('span', String(enabled.value)), [[vContrast, enabled.value]])
        })

        app.mount(container)
        expect(vi.getTimerCount()).toBe(2)

        for (let i = 0; i < 5; i += 1) {
            enabled.value = !enabled.value
             
            await nextTick()
        }

        // RED before the fix: `schedule()` never cancels the previous pair,
        // so 1 mount + 5 updates leaves 12 timers in flight instead of 2.
        expect(vi.getTimerCount()).toBe(2)

        app.unmount()
        expect(vi.getTimerCount()).toBe(0)
    })
})
