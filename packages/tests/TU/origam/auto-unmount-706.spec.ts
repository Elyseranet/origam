/*
 * #706 — the unit-test harness must unmount every wrapper after its test.
 *
 * `TU/vitest.setup.ts` calls `enableAutoUnmount(afterEach)`. Without it a
 * wrapper that a spec never unmounts stays mounted for the rest of the
 * file, so `onBeforeUnmount` / `onScopeDispose` never run: timers, rAF
 * loops and promise continuations keep going and can resolve after vitest
 * has torn the jsdom environment down, where `window` no longer exists.
 *
 * Measured on this tree at the time of the fix: 405 spec files call
 * `mount()`, only 142 ever call `.unmount()`.
 *
 * This spec pins the harness behaviour, NOT a component. It deliberately
 * relies on state crossing an `it()` boundary — that is the only way to
 * observe what `afterEach` did.
 */
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, onBeforeUnmount } from 'vue'

let unmountHookRan = false

const Probe = defineComponent({
    name: 'AutoUnmountProbe',
    setup () {
        onBeforeUnmount(() => {
            unmountHookRan = true
        })

        return () => h('div', 'probe')
    }
})

let capturedInstance: { isUnmounted: boolean } | null = null

describe('unit-test harness — auto unmount (#706)', () => {
    it('mounts a component and deliberately does not unmount it', () => {
        const wrapper = mount(Probe)

        capturedInstance = wrapper.vm.$ as unknown as { isUnmounted: boolean }

        expect(capturedInstance.isUnmounted).toBe(false)
        expect(unmountHookRan).toBe(false)
    })

    it('finds that wrapper unmounted by the time the next test runs', () => {
        expect(capturedInstance).not.toBeNull()
        // Fails without enableAutoUnmount(afterEach): the component is still
        // mounted and its cleanup hook never ran.
        expect(capturedInstance!.isUnmounted).toBe(true)
        expect(unmountHookRan).toBe(true)
    })
})
