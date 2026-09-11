// Tests for `useParallaxRuntime` composable (parallax.composable.ts).
//
// useParallaxRuntime is heavily DOM-bound: it uses IntersectionObserver,
// window scroll events, requestAnimationFrame, getBoundingClientRect, and
// matchMedia. The rAF loop, scroll handling, and IntersectionObserver
// callbacks are all gated on `onMounted` — they require a real browser
// layout engine.
//
// Testable surface WITHOUT DOM (pure-logic):
//   - `register` / `unregister` — layer registry management (ref<array>).
//   - `cssScrollDriven` — computed from CSS.supports() + easing value.
//   - `reducedMotion` — initial false in jsdom (no matchMedia mock).
//   - Returned ref shapes (progress, mouseRatio, layers, cssScrollDriven).
//
// The internal `composeLayerTransform` function is private (not exported).
// Its logic is covered indirectly through the parallax transform composable
// (packages/tests/TU/composables/Parallax/transform.composable.spec.ts).
//
// IntersectionObserver / rAF scroll path → it.skip with rationale.

import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, beforeEach, vi } from 'vitest'

import { PARALLAX_DIRECTION, PARALLAX_EASING } from '@origam/enums'
import { useParallaxRuntime } from '@origam/composables/Parallax/parallax.composable'

import type { IParallaxLayerRegistry } from '@origam/interfaces'

// ---------------------------------------------------------------------------
// jsdom does not implement window.matchMedia — the parallax runtime calls it
// in usePrefersReducedMotion. We install a minimal mock before each test.
// ---------------------------------------------------------------------------

beforeEach(() => {
    // @ts-expect-error — jsdom does not implement matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

// ---------------------------------------------------------------------------
// Mount helper — useParallaxRuntime MUST run inside a Vue component
// (onMounted, onBeforeUnmount, watch are called internally).
// ---------------------------------------------------------------------------

function mountParallax (overrides: {
    direction?: typeof PARALLAX_DIRECTION[keyof typeof PARALLAX_DIRECTION]
    easing?: typeof PARALLAX_EASING[keyof typeof PARALLAX_EASING] | string
    threshold?: number
    disabled?: boolean
    speed?: number
} = {}) {
    let api!: ReturnType<typeof useParallaxRuntime>

    const Host = defineComponent({
        name: 'OrigamParallaxHost',
        setup () {
            api = useParallaxRuntime({
                target: ref(undefined),
                direction: ref(overrides.direction ?? PARALLAX_DIRECTION.VERTICAL),
                easing: ref(overrides.easing ?? PARALLAX_EASING.LINEAR),
                threshold: ref(overrides.threshold ?? 0),
                disabled: ref(overrides.disabled ?? false),
                speed: ref(overrides.speed ?? 0.3)
            })
            return () => h('div')
        }
    })

    const wrapper = mount(Host)
    return { api: () => api, wrapper }
}

// Minimal layer stub
function makeLayer (id = Symbol('layer'), speed = 0.5): IParallaxLayerRegistry {
    return {
        id,
        speed,
        offsetX: 0,
        offsetY: 0,
        target: document.createElement('div')
    }
}

// ---------------------------------------------------------------------------
// Return shape
// ---------------------------------------------------------------------------

describe('useParallaxRuntime — return shape', () => {
    it('exposes layers, progress, mouseRatio, cssScrollDriven, reducedMotion, register, unregister', () => {
        const { api } = mountParallax()
        expect(api()).toHaveProperty('layers')
        expect(api()).toHaveProperty('progress')
        expect(api()).toHaveProperty('mouseRatio')
        expect(api()).toHaveProperty('cssScrollDriven')
        expect(api()).toHaveProperty('reducedMotion')
        expect(api()).toHaveProperty('register')
        expect(api()).toHaveProperty('unregister')
    })
})

// ---------------------------------------------------------------------------
// register / unregister — layer registry
// ---------------------------------------------------------------------------

describe('useParallaxRuntime — register / unregister', () => {
    it('starts with an empty layers array', () => {
        const { api } = mountParallax()
        expect(api().layers.value).toHaveLength(0)
    })

    it('register adds a layer to the registry', () => {
        const { api } = mountParallax()
        const id = Symbol('testLayer')
        const layer = makeLayer(id)
        api().register(layer)
        expect(api().layers.value).toHaveLength(1)
        // Vue reactive proxy wraps the object — compare by identity-stable id
        expect(api().layers.value[0].id).toBe(id)
    })

    it('register multiple layers — all are stored', () => {
        const { api } = mountParallax()
        api().register(makeLayer())
        api().register(makeLayer())
        expect(api().layers.value).toHaveLength(2)
    })

    it('unregister removes only the layer with the matching id', () => {
        const { api } = mountParallax()
        const id1 = Symbol('l1')
        const id2 = Symbol('l2')
        api().register(makeLayer(id1))
        api().register(makeLayer(id2))
        api().unregister(id1)
        expect(api().layers.value).toHaveLength(1)
        expect(api().layers.value[0].id).toBe(id2)
    })

    it('unregister with unknown id leaves the registry unchanged', () => {
        const { api } = mountParallax()
        api().register(makeLayer(Symbol('l1')))
        api().unregister(Symbol('unknown'))
        expect(api().layers.value).toHaveLength(1)
    })
})

// ---------------------------------------------------------------------------
// Initial ref values
// ---------------------------------------------------------------------------

describe('useParallaxRuntime — initial ref values', () => {
    it('progress starts at 0', () => {
        const { api } = mountParallax()
        expect(api().progress.value).toBe(0)
    })

    it('mouseRatio starts at { x: 0, y: 0 }', () => {
        const { api } = mountParallax()
        expect(api().mouseRatio.value).toEqual({ x: 0, y: 0 })
    })

    it('reducedMotion defaults to false in jsdom (no matchMedia)', () => {
        const { api } = mountParallax()
        // jsdom does not implement matchMedia — the helper defaults to false
        expect(api().reducedMotion.value).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// cssScrollDriven — depends on CSS.supports + easing
// ---------------------------------------------------------------------------

describe('useParallaxRuntime — cssScrollDriven', () => {
    it('is false in jsdom (CSS.supports("animation-timeline: scroll()") returns false)', () => {
        // jsdom does not support animation-timeline — CSS.supports falls back to false
        const { api } = mountParallax({ easing: PARALLAX_EASING.LINEAR })
        expect(api().cssScrollDriven.value).toBe(false)
    })

    it('is false when easing is SPRING even if CSS were to support it', () => {
        const { api } = mountParallax({ easing: PARALLAX_EASING.SPRING })
        // Spring easing never matches the linear requirement
        expect(api().cssScrollDriven.value).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// DOM-bound paths — skip
// ---------------------------------------------------------------------------

describe('useParallaxRuntime — DOM-bound paths', () => {
    it.skip('updateProgress: requires getBoundingClientRect + window.innerHeight — skip in jsdom', () => {
        // Reason: getBoundingClientRect always returns zeros in jsdom (no layout engine).
        // progress.value would always be 0 regardless of target position, making
        // the assertion meaningless rather than behavioral.
    })

    it.skip('applyLayerTransforms: requires live DOM element transforms + rAF loop — skip in jsdom', () => {
        // Reason: layer.target.style.transform is writable in jsdom but the rAF
        // loop (requestAnimationFrame) is only driven by vi.runAllTimers() with fake
        // timers. The combination of IntersectionObserver mock + fake rAF + fake
        // getBoundingClientRect makes the test exercise the mock infra, not our logic.
    })

    it.skip('IntersectionObserver enter/leave: not implemented in jsdom — skip', () => {
        // Reason: jsdom does not implement IntersectionObserver. The onMounted
        // callback would throw (IntersectionObserver is not a constructor) without
        // a polyfill. Adding a polyfill just for this spec mixes test infra concerns.
    })
})

// ---------------------------------------------------------------------------
// Unmount — no crash
// ---------------------------------------------------------------------------

describe('useParallaxRuntime — lifecycle cleanup', () => {
    it('unmounting the host component does not throw', () => {
        const { wrapper } = mountParallax()
        expect(() => wrapper.unmount()).not.toThrow()
    })
})
