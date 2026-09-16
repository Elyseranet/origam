/*
 * #753 — the rest of the "async work that outlives its owner" family.
 *
 * Continuation of #719, which closed six ONE-SHOT `requestAnimationFrame`
 * sites. The widened sweep found the harder half: three SELF-RESCHEDULING
 * loops and two cross-cutting utilities.
 *
 * ⛔ WHY A SELF-RESCHEDULING LOOP NEEDS A DIFFERENT PROOF
 *
 * For a one-shot site, "the frame was cancelled at teardown" is the whole
 * contract, and `pendingFramesFrom(...) === 0` after `unmount()` measures
 * it. A loop is not the same object: cancelling the frame that is armed
 * buys nothing if the NEXT turn arms another one. What has to be measured
 * is that the re-scheduling STOPS.
 *
 * So every loop here carries a third assertion on top of the two #719
 * shapes — `runs the surviving body and proves it refuses to re-arm`. It
 * captures the callback while the owner is alive, unmounts, then invokes
 * that captured callback by hand and asserts the queue is STILL empty.
 * That is the only shape that distinguishes "one turn was cancelled" from
 * "the loop stopped": a merely-cancelled loop re-arms on that call and
 * the queue comes back to 1.
 *
 * ⛔ EVERY BLOCK IS AN A/B AGAINST THE PARENT COMMIT
 *
 * A leak fix is invisible — nothing changes on screen and the suite was
 * already green. A probe that passes before the fix proves nothing, which
 * is the natural trap of this family. Each `describe` therefore also
 * carries a POSITIVE CONTROL that arms the unguarded shape by hand and
 * shows the probe goes red on it. Measured A/B against `origin/develop`
 * is recorded in the PR body.
 *
 * The scheduler harness is shared with #719's spec
 * (`TU/probe/raf-teardown.harness.ts`) — not a second copy.
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'

import OrigamCarousel from '@origam/components/Carousel/OrigamCarousel.vue'
import OrigamOtpInputField from '@origam/components/OtpInputField/OrigamOtpInputField.vue'

import { createOrigam } from '@origam/origam'

import { ORIGAM_GO_TO_KEY, ORIGAM_LOCALE_KEY } from '@origam/consts'
import { RIPPLES } from '@origam/consts/Commons/ripple.const'

import ClickOutside from '@origam/directives/ClickOutside/clickOutside.directive'
import Ripple from '@origam/directives/Ripple/ripple.directive'

import type { IRippleHtmlElement } from '@origam/interfaces/Commons/ripple.interface'

import { createGoTo, useGoTo } from '@origam/composables/Commons/goTo.composable'
import { useAudio } from '@origam/composables/Commons/audio.composable'
import { connectedLocationStrategy } from '@origam/utils/Commons/location.util'

import {
    flushFramesFrom,
    flushTimersFrom,
    installFakeSchedulers,
    pendingFramesFrom,
    pendingTimersFrom
} from '../probe/raf-teardown.harness'

beforeEach(() => {
    installFakeSchedulers()
})

afterEach(() => {
    vi.unstubAllGlobals()
})

/*********************************************************
 * useAudio — the worst of the three loops
 *
 * `getSongData` re-arms itself every frame while `isPlaying` is true.
 * Nothing set `isPlaying` to false at teardown and no
 * `cancelAnimationFrame` existed anywhere in the file, so the loop ran
 * FOREVER after the component was gone.
 ********************************************************/

describe('useAudio — self-rescheduling visualiser loop (#753)', () => {
    const SOURCE = 'audio.composable.ts'

    /**
     * jsdom ships no Web Audio API. The stub is the minimum `onAudio`
     * touches; it exists so the loop can be STARTED, not to test audio.
     */
    const stubAudioContext = () => {
        vi.stubGlobal('AudioContext', class {
            destination = {}

            createMediaElementSource () {
                return {connect: () => undefined}
            }

            createAnalyser () {
                return {
                    connect: () => undefined,
                    fftSize: 0,
                    frequencyBinCount: 32,
                    getByteFrequencyData: () => undefined
                }
            }
        })
    }

    const mountAudio = () => {
        stubAudioContext()

        const playAudio = ref(false)
        const api: {value: ReturnType<typeof useAudio> | null} = {value: null}

        const host = defineComponent({
            setup () {
                const audio = useAudio({audio: 'x.mp3', get playAudio () {
                    return playAudio.value
                }} as never)

                audio.audioRef.value = {play: () => undefined, pause: () => undefined}
                api.value = audio

                return () => h('div')
            }
        })

        const wrapper = mount(host)

        return {wrapper, playAudio, api}
    }

    const start = async (playAudio: {value: boolean}) => {
        playAudio.value = true
        await nextTick()
    }

    it('arms a frame while playing, and the loop re-arms itself (positive control)', async () => {
        const {wrapper, playAudio} = mountAudio()

        await start(playAudio)

        expect(pendingFramesFrom(SOURCE)).toBe(1)

        // The defining property of this site: running the body puts
        // another frame back on the queue. Six rounds, six re-arms.
        expect(flushFramesFrom(SOURCE, 6)).toBe(6)
        expect(pendingFramesFrom(SOURCE)).toBe(1)

        wrapper.unmount()
    })

    it('leaves no frame armed after unmount', async () => {
        const {wrapper, playAudio} = mountAudio()

        await start(playAudio)
        expect(pendingFramesFrom(SOURCE)).toBe(1)

        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })

    /**
     * ⛔ THE LOOP-SPECIFIC ASSERTION.
     *
     * `getSongData` is invoked by hand AFTER unmount, exactly as a frame
     * that had already been handed to the scheduler would invoke it. A
     * body that was only "cancelled once" re-arms here and the queue
     * comes back to 1. A body that STOPPED leaves it at 0.
     */
    it('refuses to re-arm when its body runs after unmount (the loop STOPS)', async () => {
        const {wrapper, playAudio, api} = mountAudio()

        await start(playAudio)

        const audio = api.value!

        wrapper.unmount()

        // Re-entering through the public entry point is the closest
        // stand-in for the in-flight frame: `onPlay` ends in
        // `getSongData()`, the same body the scheduler would have run.
        audio.onPlay()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })

    it('still visualises while mounted (negative control — no behaviour change)', async () => {
        const {wrapper, playAudio} = mountAudio()

        await start(playAudio)

        expect(pendingFramesFrom(SOURCE)).toBe(1)
        flushFramesFrom(SOURCE, 1)
        expect(pendingFramesFrom(SOURCE)).toBe(1)

        wrapper.unmount()
    })
})

/*********************************************************
 * scrollTo / useGoTo — the cross-cutting loop
 *
 * `step` re-arms itself every frame until the target is reached. Nothing
 * cancelled it, and the bare `requestAnimationFrame` in its own body is
 * the exact shape that threw in #706.
 ********************************************************/

describe('useGoTo — self-rescheduling scroll loop (#753)', () => {
    const SOURCE = 'goTo.util.ts'

    const mountGoTo = () => {
        const api: {go: ReturnType<typeof useGoTo> | null} = {go: null}

        const host = defineComponent({
            setup () {
                api.go = useGoTo()

                return () => h('div')
            }
        })

        const wrapper = mount(host, {
            global: {
                provide: {
                    [ORIGAM_LOCALE_KEY as symbol]: {isRtl: ref(false)},
                    [ORIGAM_GO_TO_KEY as symbol]: createGoTo(undefined, {isRtl: ref(false)} as never)
                }
            }
        })

        return {wrapper, api}
    }

    /**
     * A scroll only animates when it has somewhere to go, so the
     * container is given a scrollable height first.
     *
     * ⛔ MEASURED TRAP, it cost a false green. `getContainer(undefined)`
     * returns `document.scrollingElement`, and under this jsdom that is
     * `document.body`, NOT `document.documentElement` — verified:
     * `document.scrollingElement === document.documentElement` reads
     * `false`. Sizing `documentElement` therefore left the real container
     * at `scrollHeight = 0`, `clampTarget` clamped the target to 0, the
     * `targetLocation === startLocation` early return fired, and NO frame
     * was ever armed. The probe then measured an empty queue and would
     * have reported "no frame survives unmount" on completely unguarded
     * code. Size whatever `scrollingElement` actually is.
     */
    const makeScrollable = () => {
        const container = (document.scrollingElement ?? document.body) as HTMLElement

        Object.defineProperty(container, 'scrollHeight', {value: 5000, configurable: true})
    }

    it('arms a frame while scrolling, and the loop re-arms itself (positive control)', async () => {
        makeScrollable()
        const {wrapper, api} = mountGoTo()

        void api.go!(400)
        await nextTick()

        expect(pendingFramesFrom(SOURCE)).toBe(1)

        // `step` puts the next frame back — the loop property.
        expect(flushFramesFrom(SOURCE, 3)).toBe(3)

        wrapper.unmount()
    })

    it('leaves no frame armed after unmount', async () => {
        makeScrollable()
        const {wrapper, api} = mountGoTo()

        void api.go!(400)
        await nextTick()
        expect(pendingFramesFrom(SOURCE)).toBe(1)

        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })

    /**
     * ⛔ THE LOOP-SPECIFIC ASSERTION — see the file banner.
     *
     * The abort is what makes `step` return before its own
     * `requestAnimationFrame`. Draining after unmount must therefore run
     * ZERO rounds and leave the queue empty, not one round that re-arms.
     */
    it('stops rescheduling after unmount (the loop STOPS)', async () => {
        makeScrollable()
        const {wrapper, api} = mountGoTo()

        void api.go!(400)
        await nextTick()

        wrapper.unmount()

        expect(flushFramesFrom(SOURCE, 6)).toBe(0)
        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })

    it('still animates while mounted (negative control — no behaviour change)', async () => {
        makeScrollable()
        const {wrapper, api} = mountGoTo()

        void api.go!(400)
        await nextTick()

        expect(flushFramesFrom(SOURCE, 2)).toBe(2)
        expect(pendingFramesFrom(SOURCE)).toBe(1)

        wrapper.unmount()
    })
})

/*********************************************************
 * connectedLocationStrategy — the site only the RUNTIME probe found
 *
 * The static sweep classified this file as "already has a teardown"
 * because a `onScopeDispose` existed — it only disconnected the
 * `ResizeObserver`. Three rAF sites lived beside it, none cancelled.
 ********************************************************/

describe('connectedLocationStrategy — frames beside an existing teardown (#753)', () => {
    const SOURCE = 'location.util.ts'

    const mountStrategy = () => {
        const target = document.createElement('div')
        const contentEl = document.createElement('div')

        document.body.append(target, contentEl)

        const api: {update: (() => unknown) | null} = {update: null}

        const host = defineComponent({
            setup () {
                const data = {
                    target: shallowRef<HTMLElement | undefined>(target),
                    contentEl: shallowRef<HTMLElement | undefined>(contentEl),
                    isActive: ref(true),
                    updateLocation: ref(() => undefined)
                }

                const {updateLocation} = connectedLocationStrategy(
                    data as never,
                    {location: 'bottom', origin: 'auto', offset: 0} as never,
                    ref({})
                )

                api.update = updateLocation as () => unknown

                return () => h('div')
            }
        })

        const wrapper = mount(host)

        return {wrapper, api}
    }

    it('arms a frame on every updateLocation (positive control)', () => {
        const {wrapper, api} = mountStrategy()

        const before = pendingFramesFrom(SOURCE)

        api.update!()

        expect(pendingFramesFrom(SOURCE)).toBeGreaterThan(before)

        wrapper.unmount()
    })

    it('leaves no frame armed after unmount', async () => {
        const {wrapper, api} = mountStrategy()

        api.update!()
        await nextTick()

        expect(pendingFramesFrom(SOURCE)).toBeGreaterThan(0)

        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })

    /**
     * The `nextTick`-deferred pair (`:330`/`:332`, absent from the
     * ticket's list) can arm AFTER teardown, when there is no handle
     * left to cancel. That case is covered by the `disposed` flag, not
     * by cancellation — so it is measured separately: call the entry
     * point AFTER unmount and assert nothing lands on the queue.
     */
    it('arms nothing when updateLocation is reached after unmount', () => {
        const {wrapper, api} = mountStrategy()

        wrapper.unmount()

        api.update!()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })
})

/*********************************************************
 * Positive control for the PROBE itself
 *
 * Everything above asserts an ABSENCE. An absence assertion passes just
 * as happily on a probe that cannot see anything at all — a typo in the
 * source-file name, a harness that never records. These two tests build
 * the unguarded shape by hand, in this file, and prove the probe goes
 * red on it.
 ********************************************************/

describe('probe self-check — an unguarded continuation IS seen (#753)', () => {
    it('sees a one-shot frame that nothing cancels', () => {
        requestAnimationFrame(() => undefined)

        expect(pendingFramesFrom('raf-teardown-753.spec.ts')).toBe(1)
    })

    it('sees a self-rescheduling loop that never stops', () => {
        const loop = () => {
            requestAnimationFrame(loop)
        }

        loop()

        // Unguarded: every round re-arms, so all 6 rounds are consumed
        // and the queue is STILL non-empty. This is exactly the reading
        // the three `the loop STOPS` tests above assert the opposite of.
        expect(flushFramesFrom('raf-teardown-753.spec.ts', 6)).toBe(6)
        expect(pendingFramesFrom('raf-teardown-753.spec.ts')).toBe(1)
    })
})


/*********************************************************
 * OrigamCarousel — the site the ticket does NOT list, and the
 * nastiest of the four my own sweep added
 *
 * `onBeforeUnmount` cancelled `slideTimeout`, but not the frame whose
 * body is `startTimeout` — and `startTimeout` arms a NEW `setTimeout`.
 * So the teardown ran, then the frame rebuilt a timer nobody would ever
 * cancel, on a component that no longer exists.
 ********************************************************/

describe('OrigamCarousel — a frame that RE-ARMS an uncancellable timer (#753)', () => {
    const SOURCE = 'OrigamCarousel.vue'

    const mountCarousel = () => mount(OrigamCarousel, {
        props: {items: [{src: 'a'}, {src: 'b'}], cycle: true, interval: 100} as never,
        global: {plugins: [createOrigam()]}
    })

    it('arms the restart frame when the interval changes (positive control)', async () => {
        const wrapper = mountCarousel()

        await wrapper.setProps({interval: 250} as never)

        expect(pendingFramesFrom(SOURCE)).toBeGreaterThan(0)

        wrapper.unmount()
    })

    it('leaves no frame armed after unmount', async () => {
        const wrapper = mountCarousel()

        await wrapper.setProps({interval: 250} as never)
        expect(pendingFramesFrom(SOURCE)).toBeGreaterThan(0)

        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })

    /**
     * ⛔ THIS ONE IS A NEGATIVE CONTROL, NOT A DEFECT PROBE — and saying
     * so is the point.
     *
     * I first wrote it as the assertion that named the defect: "the
     * surviving frame REBUILDS an uncancellable timer". The A/B against
     * the parent commit says otherwise — it passes on the UNFIXED code
     * too, so it discriminates nothing.
     *
     * The reason is a guard in another function: `startTimeout` opens on
     * `if (!props.cycle || !origamWindowRef.value) return`, and after
     * unmount that ref is `undefined`, so the surviving frame's body
     * exits immediately. The frame really does outlive the component
     * (the test above is red on the parent); its body is simply inert.
     *
     * Kept, relabelled, because it pins that incidental guard: if
     * someone later makes `startTimeout` tolerate a missing ref, this
     * goes red and the leak becomes real.
     */
    it('does not rebuild a slide timer after unmount (negative control)', async () => {
        const wrapper = mountCarousel()

        await wrapper.setProps({interval: 250} as never)

        wrapper.unmount()

        flushFramesFrom(SOURCE, 4)

        expect(pendingTimersFrom(SOURCE)).toBe(0)
    })
})

/*********************************************************
 * OrigamOtpInputField — rank 2, the `!` on a ref that is null
 ********************************************************/

describe('OrigamOtpInputField — focus frames (#753)', () => {
    const SOURCE = 'OrigamOtpInputField.vue'

    const mountOtp = () => mount(OrigamOtpInputField, {
        props: {length: 4} as never,
        global: {plugins: [createOrigam()]},
        attachTo: document.body
    })

    const pressArrow = async (wrapper: ReturnType<typeof mountOtp>) => {
        const input = wrapper.find('input')

        if (input.exists()) await input.trigger('keydown', {key: 'ArrowRight'})
    }

    it('arms a focus frame on keydown (positive control)', async () => {
        const wrapper = mountOtp()

        await pressArrow(wrapper)

        expect(pendingFramesFrom(SOURCE)).toBeGreaterThan(0)

        wrapper.unmount()
    })

    it('leaves no frame armed after unmount', async () => {
        const wrapper = mountOtp()

        await pressArrow(wrapper)
        expect(pendingFramesFrom(SOURCE)).toBeGreaterThan(0)

        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })
})

/*********************************************************
 * Directives — ELEMENT scope, not a Vue scope
 *
 * Neither `ClickOutside` nor `Ripple` sits in an effect scope, so
 * neither can reach `onScopeDispose`. Their hooks are plain functions,
 * which makes them the easiest sites in the whole ticket to drive
 * honestly: call `mounted`, provoke the work, call `unmounted`.
 ********************************************************/

describe('ClickOutside — deferred handler (#753)', () => {
    const SOURCE = 'clickOutside.util.ts'

    const setup = () => {
        const el = document.createElement('div')

        document.body.appendChild(el)

        const handler = vi.fn()
        const binding = {value: handler, instance: {$: {uid: 1}}} as never

        ClickOutside.mounted(el, binding)

        return {el, binding, handler}
    }

    const clickOutside = (el: HTMLElement) => {
        el._clickOutside!.lastMousedownWasOutside = true
        document.dispatchEvent(new MouseEvent('click', {bubbles: true}))
    }

    it('arms a deferred handler on an outside click (positive control)', () => {
        const {el, binding} = setup()

        clickOutside(el)

        expect(pendingTimersFrom(SOURCE)).toBe(1)

        ClickOutside.unmounted(el, binding)
    })

    it('cancels the deferred handler when the directive unmounts', () => {
        const {el, binding} = setup()

        clickOutside(el)
        expect(pendingTimersFrom(SOURCE)).toBe(1)

        ClickOutside.unmounted(el, binding)

        expect(pendingTimersFrom(SOURCE)).toBe(0)
    })

    /**
     * The scenario that makes this site more than theoretical: the
     * outside click is what CLOSES the component, so the teardown lands
     * between arming the timer and running it. Pre-fix the handler fired
     * on a component that was already gone.
     */
    it('never calls the handler when the element unmounts first', () => {
        const {el, binding, handler} = setup()

        clickOutside(el)
        ClickOutside.unmounted(el, binding)

        flushTimersFrom(SOURCE, 3)

        expect(handler).not.toHaveBeenCalled()
    })
})

describe('Ripple — animation phase timers (#753)', () => {
    const SOURCE = 'ripple.const.ts'

    const setup = () => {
        const el = document.createElement('div') as IRippleHtmlElement

        document.body.appendChild(el)
        Ripple.mounted(el, {value: true, instance: {$: {uid: 1}}, modifiers: {}} as never)

        return el
    }

    it('arms a phase timer when a ripple is shown (positive control)', () => {
        const el = setup()

        RIPPLES.show({} as never, el, {})

        expect(pendingTimersFrom(SOURCE)).toBe(1)

        Ripple.unmounted(el)
    })

    it('cancels the phase timers when the directive unmounts', () => {
        const el = setup()

        RIPPLES.show({} as never, el, {})
        expect(pendingTimersFrom(SOURCE)).toBe(1)

        Ripple.unmounted(el)

        expect(pendingTimersFrom(SOURCE)).toBe(0)
    })

    /**
     * ⛔ ALSO A NEGATIVE CONTROL — it passes on the parent commit too.
     *
     * `RIPPLES.show` already opened on `if (!el?._ripple?.enabled)
     * return`, and `Ripple.unmounted` does `delete el._ripple`, so
     * showing a ripple after unmount was ALREADY a no-op before this
     * fix. Nothing here was broken.
     *
     * What this pins is the ORDER inside `unmounted`: the handles live
     * on `el._ripple`, so the purge has to happen BEFORE the
     * `delete` — purge after and the handles are unreachable while the
     * timers keep running. That ordering is asserted by the test above
     * (red on the parent), not by this one.
     */
    it('arms nothing once the element has been unmounted (negative control)', () => {
        const el = setup()

        Ripple.unmounted(el)

        RIPPLES.show({} as never, el, {})

        expect(pendingTimersFrom(SOURCE)).toBe(0)
    })
})
