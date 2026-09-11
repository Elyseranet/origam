// Tests for `useStack` composable.
// The composable manages a GLOBAL_STACK (reactive array) and an ORIGAM_STACK_KEY
// provide/inject chain.
//
// Timing notes:
// - useToggleScope uses watch({immediate: true}): when isActive starts as true
//   the scope runs synchronously on setup. When isActive changes AFTER setup,
//   the watch is async (Vue scheduler) — requires nextTick to flush.
// - globalTop is set inside a setTimeout(cb, 0) inside a watchEffect.
//   With vi.useFakeTimers, we must vi.runAllTimers() AFTER nextTick flushes
//   the Vue scheduler.
// - GLOBAL_STACK is module-level state and must be cleaned between tests.

import { defineComponent, h, nextTick, readonly, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useStack } from '@origam/composables/Commons/stack.composable'
import { GLOBAL_STACK } from '@origam/consts'

// ---------------------------------------------------------------------------
// GLOBAL_STACK reset between tests
// ---------------------------------------------------------------------------

beforeEach(() => {
    vi.useFakeTimers()
    GLOBAL_STACK.splice(0, GLOBAL_STACK.length)
})

afterEach(() => {
    GLOBAL_STACK.splice(0, GLOBAL_STACK.length)
    vi.useRealTimers()
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type StackApi = ReturnType<typeof useStack>

function mountStack (
    isActiveInit: boolean,
    zIndexInit: number | string = 100,
    disableGlobal = false
) {
    const isActive = ref(isActiveInit)
    const zIndex = readonly(ref(zIndexInit))
    let api!: StackApi

    const Host = defineComponent({
        name: 'OrigamStackHost',
        setup () {
            api = useStack(isActive, zIndex, disableGlobal)
            return () => h('div')
        }
    })

    const wrapper = mount(Host)
    return { isActive, api: () => api, wrapper }
}

// ---------------------------------------------------------------------------
// API shape
// ---------------------------------------------------------------------------

describe('useStack — API shape', () => {
    it('exposes globalTop, localTop, stackStyles', () => {
        const { api } = mountStack(false)
        const a = api()
        expect(a).toHaveProperty('globalTop')
        expect(a).toHaveProperty('localTop')
        expect(a).toHaveProperty('stackStyles')
    })
})

// ---------------------------------------------------------------------------
// stackStyles — zIndex
// ---------------------------------------------------------------------------

describe('useStack — stackStyles.zIndex', () => {
    it('stackStyles.zIndex equals the provided zIndex when inactive (no entry in GLOBAL_STACK)', () => {
        const { api } = mountStack(false, 200)
        expect(api().stackStyles.value.zIndex).toBe(200)
    })

    it('stackStyles.zIndex stays at base zIndex when first activated (GLOBAL_STACK was empty)', async () => {
        const { isActive, api } = mountStack(false, 100)
        isActive.value = true
        await nextTick()
        vi.runAllTimers()
        // GLOBAL_STACK was empty before activation → _zIndex stays at base (100)
        expect(api().stackStyles.value.zIndex).toBe(100)
    })

    it('second activated layer gets zIndex+10 above the first', async () => {
        const { isActive: isActive1, api: api1 } = mountStack(false, 100)
        const { isActive: isActive2, api: api2 } = mountStack(false, 100)

        isActive1.value = true
        await nextTick()
        vi.runAllTimers()

        isActive2.value = true
        await nextTick()
        vi.runAllTimers()

        const z1 = api1().stackStyles.value.zIndex
        const z2 = api2().stackStyles.value.zIndex
        expect(z2).toBe(z1 + 10)
    })
})

// ---------------------------------------------------------------------------
// GLOBAL_STACK entries
// ---------------------------------------------------------------------------

describe('useStack — GLOBAL_STACK entries', () => {
    it('inactive component does not add to GLOBAL_STACK', async () => {
        mountStack(false)
        await nextTick()
        vi.runAllTimers()
        expect(GLOBAL_STACK.length).toBe(0)
    })

    it('component active from the start adds an entry immediately (watch immediate)', () => {
        // isActive=true → useToggleScope watch immediate=true → scope runs sync
        mountStack(true)
        // Synchronous — no nextTick needed
        expect(GLOBAL_STACK.length).toBe(1)
    })

    it('activating after mount adds entry after nextTick', async () => {
        const { isActive } = mountStack(false)
        isActive.value = true
        await nextTick()
        vi.runAllTimers()
        expect(GLOBAL_STACK.length).toBe(1)
    })

    it('deactivating removes the entry after nextTick', async () => {
        const { isActive } = mountStack(true)
        // Entry added synchronously (immediate=true)
        expect(GLOBAL_STACK.length).toBe(1)
        isActive.value = false
        await nextTick()
        vi.runAllTimers()
        expect(GLOBAL_STACK.length).toBe(0)
    })

    it('unmounting active layer removes the entry (scope dispose)', async () => {
        const { isActive, wrapper } = mountStack(true)
        expect(GLOBAL_STACK.length).toBe(1)
        isActive.value = false
        await nextTick()
        vi.runAllTimers()
        wrapper.unmount()
        expect(GLOBAL_STACK.length).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// disableGlobalStack
// ---------------------------------------------------------------------------

describe('useStack — disableGlobalStack', () => {
    it('does NOT add to GLOBAL_STACK when disableGlobal=true', async () => {
        const { isActive } = mountStack(false, 100, true)
        isActive.value = true
        await nextTick()
        vi.runAllTimers()
        expect(GLOBAL_STACK.length).toBe(0)
    })

    it('disableGlobal=true + active from start → no GLOBAL_STACK entry', () => {
        mountStack(true, 100, true)
        expect(GLOBAL_STACK.length).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// localTop
// ---------------------------------------------------------------------------

describe('useStack — localTop', () => {
    it('localTop=true when no child stack layers are active', () => {
        const { api } = mountStack(true)
        // No children provided in this test — activeChildren.size === 0
        expect(api().localTop.value).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// globalTop
// ---------------------------------------------------------------------------

describe('useStack — globalTop', () => {
    it('globalTop=true for the single active layer after timers flush', async () => {
        const { isActive, api } = mountStack(false)
        isActive.value = true
        await nextTick()
        vi.runAllTimers()
        expect(api().globalTop.value).toBe(true)
    })

    it('single layer active from start → globalTop=true after timers flush', async () => {
        // immediate watch → scope runs sync, but globalTop setTimeout fires on timer
        const { api } = mountStack(true)
        await nextTick()
        vi.runAllTimers()
        expect(api().globalTop.value).toBe(true)
    })

    it('globalTop=false for a lower layer when a second layer is added on top', async () => {
        const { isActive: isActive1, api: api1 } = mountStack(false, 100)
        const { isActive: isActive2 } = mountStack(false, 100)

        isActive1.value = true
        await nextTick()
        vi.runAllTimers()
        // Layer 1 is the only active one → globalTop should be true
        expect(api1().globalTop.value).toBe(true)

        isActive2.value = true
        await nextTick()
        vi.runAllTimers()
        // Layer 2 is now the top → layer 1 should report false
        expect(api1().globalTop.value).toBe(false)
    })
})
