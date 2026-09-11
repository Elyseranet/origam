import { config } from '@vue/test-utils'
import { vi, beforeEach, afterEach } from 'vitest'

/*
 * Polyfill PointerEvent on jsdom (jsdom@25+ ships without it).
 * Required by useSheetSwipe tests that dispatch synthetic gestures.
 * Mirrors the public PointerEvent shape needed by the composable —
 * pointerId / pointerType / button / clientX / clientY / pressure.
 */
if (typeof window !== 'undefined' && typeof (window as { PointerEvent?: unknown }).PointerEvent === 'undefined') {
    class PointerEventPolyfill extends MouseEvent {
        pointerId: number
        width: number
        height: number
        pressure: number
        tangentialPressure: number
        tiltX: number
        tiltY: number
        twist: number
        pointerType: string
        isPrimary: boolean

        constructor(type: string, init: PointerEventInit = {}) {
            super(type, init)
            this.pointerId = init.pointerId ?? 0
            this.width = init.width ?? 1
            this.height = init.height ?? 1
            this.pressure = init.pressure ?? 0
            this.tangentialPressure = init.tangentialPressure ?? 0
            this.tiltX = init.tiltX ?? 0
            this.tiltY = init.tiltY ?? 0
            this.twist = init.twist ?? 0
            this.pointerType = init.pointerType ?? ''
            this.isPrimary = init.isPrimary ?? false
        }
    }
    ;(window as { PointerEvent: unknown }).PointerEvent = PointerEventPolyfill
    ;(globalThis as { PointerEvent: unknown }).PointerEvent = PointerEventPolyfill
}

/* Vue Test Utils global stubs */
config.global.mocks = {
    $t: (key: string) => key,
    $route: {
        params: {},
        query: {}
    },
    $router: {
        push: vi.fn(),
        replace: vi.fn()
    }
}

/*
 * jsdom doesn't ship ResizeObserver / IntersectionObserver / matchMedia.
 * Some specs opt-out of jsdom via `@vitest-environment node` — guard
 * the window-touching mocks behind a typeof check so node-env specs
 * don't crash on import of the setup file.
 *
 * Production code calls `new ResizeObserver(cb)` / `new IntersectionObserver(cb)`
 * (see resizeObserver.composable.ts / intersectionObserver.composable.ts), so
 * the mock assigned to the global MUST itself be constructible. Vitest 4
 * tightened `vi.fn()`'s construct trap to forward `new` straight to the
 * implementation instead of silently succeeding via the "a constructor that
 * returns an object overrides `this`" loophole — an arrow-function
 * implementation is never constructible in JS, mocked or not, so `new` on it
 * now throws "TypeError: ... is not a constructor" (vitest 4 warns about this
 * exact anti-pattern: "The vi.fn() mock did not use 'function' or 'class' in
 * its implementation"). A real `class` implementation fixes it because a
 * class IS constructible, matching the real ResizeObserver/IntersectionObserver
 * contract these mocks stand in for.
 */
if (typeof window !== 'undefined') {
    class ResizeObserverMock {
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
    }

    class IntersectionObserverMock {
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
    }

    global.ResizeObserver = vi.fn(ResizeObserverMock) as unknown as typeof ResizeObserver
    global.IntersectionObserver = vi.fn(IntersectionObserverMock) as unknown as typeof IntersectionObserver

    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn()
        }))
    })
}

beforeEach(() => {
    vi.clearAllMocks()
})

afterEach(() => {
    vi.restoreAllMocks()
})
