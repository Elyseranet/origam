// Unit tests for <OrigamOverlay> — issue #446
//
// `IOverlayEmits` declares `afterEnter` and `keydown`, both documented as
// functional in OrigamOverlay.md and demonstrated by dedicated story
// Variants — but neither was ever actually emitted:
//   - the `<origam-transition>` only bound `@after-leave`, never
//     `@after-enter`, so `afterEnter` could never fire.
//   - `handleKeydown` (the window Escape-key listener) only closed the
//     overlay on Escape; it never called `emits('keydown', e)`.
//
// `locationStrategy` defaults to `'static'` (a no-op — see
// `staticLocationStrategy` in location.util.ts), so — unlike OrigamMenu,
// which defaults to `'connected'` and requires stubbing Overlay out in
// jsdom — OrigamOverlay itself mounts and opens for real here, no stub.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamOverlay from '@origam/components/Overlay/OrigamOverlay.vue'
import { createOrigam } from '@origam/origam'

function mountOverlay (props: Record<string, unknown> = {}) {
    const origam = createOrigam({})

    return mount(OrigamOverlay, {
        props: { modelValue: true, ...props } as never,
        attachTo: document.body,
        global: {
            plugins: [origam],
            // @vue/test-utils auto-stubs the native <Transition>/<TransitionGroup>
            // (renders a transparent `<transition-stub>` that never calls
            // onEnter/onAfterEnter/onAfterLeave). Disabling that default stub
            // is required to observe `afterEnter` at all — with it left on,
            // BOTH `afterEnter` and the already-working `afterLeave` are
            // silently never called, which would make this test pass for the
            // wrong reason (nothing fires either way).
            stubs: { transition: false, 'transition-group': false }
        },
        slots: {
            activator: '<button>Activator</button>',
            default: '<div class="overlay-body">Content</div>'
        }
    })
}

describe('OrigamOverlay — afterEnter emit (issue #446)', () => {
    it('emits `afterEnter` once the enter transition completes', async () => {
        // Mounted closed, then opened — the teleported content (gated by
        // `isMounted && hasContent`, see useLazy) doesn't exist in the DOM
        // at all until the overlay is activated at least once, so this is
        // a genuine first mount-and-enter of the transitioned child, not
        // reliant on `appear`'s initial-render special case.
        const wrapper = mountOverlay({ modelValue: false })

        await wrapper.setProps({ modelValue: true })

        // jsdom never computes a real CSS transition duration, so Vue's
        // <Transition> resolves the enter phase on its own schedule (a
        // couple of animation frames, not a fixed delay) — poll instead of
        // a single fixed wait.
        const deadline = Date.now() + 2000
        while (!wrapper.emitted('afterEnter') && Date.now() < deadline) {
            await nextTick()
            await new Promise(resolve => setTimeout(resolve, 20))
        }

        expect(wrapper.emitted('afterEnter')).toBeTruthy()

        wrapper.unmount()
    })
})

// `afterLeave` was the one emit of `IOverlayEmits` that no assertion
// anywhere reached (C5 second half — "un test le prouve-t-il ?", measured
// 2026-09-08). Unlike `afterEnter`/`keydown` it was never broken: it has
// been wired since before #446. What was missing is the net, not the
// behaviour — so this pins it against a future regression rather than
// fixing one.
describe('OrigamOverlay — afterLeave emit (C5 coverage)', () => {
    it('emits `afterLeave` once the leave transition completes', async () => {
        const wrapper = mountOverlay()

        await nextTick()
        await wrapper.setProps({ modelValue: false })

        // Same polling rationale as `afterEnter` above: jsdom computes no
        // real CSS transition duration, so Vue's <Transition> resolves the
        // leave phase on its own schedule.
        const deadline = Date.now() + 2000
        while (!wrapper.emitted('afterLeave') && Date.now() < deadline) {
            await nextTick()
            await new Promise(resolve => setTimeout(resolve, 20))
        }

        expect(wrapper.emitted('afterLeave')).toBeTruthy()

        wrapper.unmount()
    })

    it('does not emit `afterLeave` while the overlay is merely opening', async () => {
        const wrapper = mountOverlay({ modelValue: false })

        await wrapper.setProps({ modelValue: true })

        const deadline = Date.now() + 500
        while (!wrapper.emitted('afterEnter') && Date.now() < deadline) {
            await nextTick()
            await new Promise(resolve => setTimeout(resolve, 20))
        }

        // The enter phase completed (guard: otherwise this would pass
        // simply because no transition ran at all).
        expect(wrapper.emitted('afterEnter')).toBeTruthy()
        expect(wrapper.emitted('afterLeave')).toBeFalsy()

        wrapper.unmount()
    })
})

describe('OrigamOverlay — keydown emit (issue #446)', () => {
    it('emits `keydown` with the real KeyboardEvent when a key is pressed while open', async () => {
        const wrapper = mountOverlay()

        await nextTick()

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
        await nextTick()

        const emitted = wrapper.emitted('keydown')
        expect(emitted).toBeTruthy()
        expect((emitted![0][0] as KeyboardEvent).key).toBe('a')

        wrapper.unmount()
    })

    it('still emits `keydown` for the Escape key (forwarding does not replace the existing close behaviour)', async () => {
        const wrapper = mountOverlay()

        await nextTick()

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        await nextTick()

        const emitted = wrapper.emitted('keydown')
        expect(emitted).toBeTruthy()
        expect((emitted![0][0] as KeyboardEvent).key).toBe('Escape')

        wrapper.unmount()
    })

    it('does not emit `keydown` once the overlay has closed (window listener removed)', async () => {
        const wrapper = mountOverlay()
        await nextTick()

        await wrapper.setProps({ modelValue: false })
        await nextTick()

        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'b' }))
        await nextTick()

        expect(wrapper.emitted('keydown')).toBeFalsy()

        wrapper.unmount()
    })
})
