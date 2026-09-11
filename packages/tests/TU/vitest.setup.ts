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
 */
if (typeof window !== 'undefined') {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }))

    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
    }))

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
