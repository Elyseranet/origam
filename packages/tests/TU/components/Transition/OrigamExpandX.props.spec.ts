// Regression tests for defect C (ticket #538, ExpandX/ExpandY family):
// `group`, `hideOnLeave`, `leaveAbsolute` (all inherited from
// `ITransitionProps`) were declared but never read by `<OrigamExpandX>` —
// measured `0` occurrences of each identifier in the component before this
// fix. The already-shipped `.origam-transition--expand-x-move` SCSS rule
// (dead code — only `TransitionGroup` ever applies a `-move` class) is the
// evidence `group` support was intended from the start.
//
// `mode` was ALSO found dead during this investigation (not part of the
// ticket's named 4-prop list, but the same defect family: declared via
// `ITransitionProps`, defaulted via `withDefaults`, never bound to the
// underlying `<transition>`). Fixed alongside since it's the same root
// cause on the same two files, and it interacts with `group` (Vue does not
// support `mode` on `TransitionGroup`, so it must be omitted, not just
// forwarded, when `group` is true).
//
// `origin` is NOT covered here — it set `transform-origin`, which has no
// effect on a width-only animation, so it was REMOVED from this component's
// props (breaking change, #538/#548) rather than implemented — see
// `ITransitionNoOriginProps` in `interfaces/Transition/transition.interface.ts`.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import OrigamExpandX from '@origam/components/Transition/OrigamExpandX.vue'

// ─── group ───────────────────────────────────────────────────────────────
// Same verification strategy as `OrigamTransition.group-reactivity.spec.ts`:
// a plain `Transition` only ever tracks ONE child (silently drops the
// rest), `TransitionGroup` renders every keyed item. Stubs disabled so the
// REAL Vue built-ins run — the default VTU stub would hide this bug.

const ITEMS = [1, 2, 3]

function mountListHost (group: boolean) {
    const Host = defineComponent({
        setup () {
            return () => h(
                OrigamExpandX,
                { group },
                {
                    default: () => ITEMS.map(item => h(
                        'div',
                        { key: item, 'data-cy': `item-${item}` },
                        `Item ${item}`
                    ))
                }
            )
        }
    })

    return mount(Host, {
        global: { stubs: { transition: false, 'transition-group': false } }
    })
}

describe('OrigamExpandX — group prop (defect C regression)', () => {
    it('renders only the first item when group is false/absent (plain Transition)', () => {
        const wrapper = mountListHost(false)
        expect(wrapper.findAll('[data-cy^="item-"]')).toHaveLength(1)
    })

    it('renders every item when group=true (TransitionGroup)', () => {
        const wrapper = mountListHost(true)
        expect(wrapper.findAll('[data-cy^="item-"]')).toHaveLength(ITEMS.length)
    })

    it('does not warn about extraneous attributes when group=true (mode correctly omitted)', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        mountListHost(true)
        const modeWarning = warnSpy.mock.calls.find(call =>
            String(call[0]).includes('Extraneous non-props attributes')
        )
        expect(modeWarning).toBeUndefined()
        warnSpy.mockRestore()
    })
})

// ─── leaveAbsolute / hideOnLeave ────────────────────────────────────────
// Single-child host, real `<transition>` (stub disabled), toggling a
// `v-if` to drive a real enter then a real leave.

function mountToggleHost (props: { leaveAbsolute?: boolean; hideOnLeave?: boolean }) {
    const show = ref(true)

    const Host = defineComponent({
        setup () {
            return () => h(
                OrigamExpandX,
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

describe('OrigamExpandX — leaveAbsolute prop (defect C regression)', () => {
    it('pulls the leaving element out of flow (position: absolute) while it collapses', async () => {
        const { wrapper, show } = mountToggleHost({ leaveAbsolute: true })
        const el = wrapper.find('[data-cy="content"]').element as HTMLElement

        show.value = false
        await nextTick()

        expect(el.style.position).toBe('absolute')
    })

    it('does NOT touch position when leaveAbsolute is absent (baseline)', async () => {
        const { wrapper, show } = mountToggleHost({})
        const el = wrapper.find('[data-cy="content"]').element as HTMLElement

        show.value = false
        await nextTick()

        expect(el.style.position).toBe('')
    })
})

describe('OrigamExpandX — hideOnLeave prop (defect C regression)', () => {
    // jsdom's `offsetWidth` is always 0 (no real layout engine), so
    // asserting on the FINAL width value can't distinguish "shrunk to 0
    // via the rAF path" from "frozen at 0 because offsetWidth was 0 all
    // along". Vue's OWN transition module also schedules `rAF` calls
    // internally (to toggle the `-active`/`-to` classes) regardless of
    // `hideOnLeave`, so asserting "zero calls" is wrong too — instead we
    // compare the rAF call COUNT between the two scenarios: `hideOnLeave`
    // must schedule strictly fewer (Vue's own internal ones only, minus
    // our own conditional shrink-to-zero frame).
    let rafSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        rafSpy = vi.spyOn(window, 'requestAnimationFrame')
    })

    afterEach(() => {
        rafSpy.mockRestore()
    })

    it('sets display: none instantly on leave', async () => {
        const { wrapper, show } = mountToggleHost({ hideOnLeave: true })
        const el = wrapper.find('[data-cy="content"]').element as HTMLElement

        show.value = false
        await nextTick()

        expect(el.style.display).toBe('none')
    })

    it('schedules fewer requestAnimationFrame calls on leave than the baseline (rAF shrink skipped)', async () => {
        const hideHost = mountToggleHost({ hideOnLeave: true })
        rafSpy.mockClear()
        hideHost.show.value = false
        await nextTick()
        const hideOnLeaveCalls = rafSpy.mock.calls.length

        const baselineHost = mountToggleHost({})
        rafSpy.mockClear()
        baselineHost.show.value = false
        await nextTick()
        const baselineCalls = rafSpy.mock.calls.length

        expect(hideOnLeaveCalls).toBeLessThan(baselineCalls)
    })

    it('does not set display: none when hideOnLeave is absent (baseline)', async () => {
        const { wrapper, show } = mountToggleHost({})
        const el = wrapper.find('[data-cy="content"]').element as HTMLElement

        show.value = false
        await nextTick()

        expect(el.style.display).not.toBe('none')
    })
})
