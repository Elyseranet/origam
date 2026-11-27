// #1591 — pointer axes of useParallaxRuntime. jsdom has no layout, so the
// host rect is stubbed; only INLINE styles are read (no var() involved).
// The real-browser verdict lives in e2e/parallax-axes.spec.ts.

import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PARALLAX_DIRECTION, PARALLAX_EASING } from '@origam/enums'
import { useParallaxRuntime } from '@origam/composables/Parallax/parallax.composable'

import type { IParallaxLayerRegistry } from '@origam/interfaces'

function mockMedia (fine: boolean, reduced = false) {
    // @ts-expect-error — jsdom does not implement matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('pointer: fine') ? fine : reduced,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn()
    }))
}

function setup (layer: Partial<IParallaxLayerRegistry>, direction = PARALLAX_DIRECTION.BOTH) {
    const host = document.createElement('div')
    host.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100, right: 200, bottom: 100, x: 0, y: 0, toJSON: () => ({}) })
    const target = document.createElement('div')
    const registry: IParallaxLayerRegistry = { id: Symbol('l'), speed: 0.5, offsetX: 0, offsetY: 0, target, ...layer }
    const Comp = defineComponent({
        setup () {
            const api = useParallaxRuntime({
                target: ref(host),
                direction: ref(direction),
                easing: ref(PARALLAX_EASING.EASE_OUT),
                threshold: ref(0),
                disabled: ref(false),
                speed: ref(0.5)
            })
            api.register(registry)
            return () => h('div')
        }
    })
    mount(Comp)
    return { host, target }
}

const move = (host: HTMLElement, clientX: number, clientY: number) =>
    host.dispatchEvent(new MouseEvent('mousemove', { clientX, clientY }))

// Where the pointer-driven offset ended up, whichever property carries it.
const pointerOffset = (el: HTMLElement) => el.style.getPropertyValue('translate')

beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', class { observe () {} disconnect () {} })
})
afterEach(() => vi.unstubAllGlobals())

describe('useParallaxRuntime — pointer axes (#1591)', () => {
    it('direction="both" without mouseY: the pointer moves X only (legacy), Y stays still', () => {
        mockMedia(true)
        const { host, target } = setup({})
        move(host, 200, 100)
        expect(pointerOffset(target)).toBe('50px')
    })

    it('mouseX / mouseY give independent px amplitudes at the host edge', () => {
        mockMedia(true)
        const { host, target } = setup({ mouseX: 40, mouseY: 24 })
        move(host, 200, 100)
        expect(pointerOffset(target)).toBe('40px 24px')
        move(host, 0, 0)
        expect(pointerOffset(target)).toBe('-40px -24px')
    })

    it('mouseX / mouseY activate the pointer even when direction is not "both"', () => {
        mockMedia(true)
        const { host, target } = setup({ mouseY: 10 }, PARALLAX_DIRECTION.VERTICAL)
        move(host, 100, 100)
        expect(pointerOffset(target)).toBe('0px 10px')
    })

    it('no fine pointer (touch): no listener, nothing moves', () => {
        mockMedia(false)
        const { host, target } = setup({ mouseX: 40, mouseY: 24 })
        move(host, 200, 100)
        expect(pointerOffset(target)).toBe('')
    })

    it('prefers-reduced-motion: no listener, nothing moves', () => {
        mockMedia(true, true)
        const { host, target } = setup({ mouseX: 40, mouseY: 24 })
        move(host, 200, 100)
        expect(pointerOffset(target)).toBe('')
    })
})
