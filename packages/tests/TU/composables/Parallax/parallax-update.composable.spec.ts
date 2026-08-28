// Regression coverage for #449 — `<OrigamParallaxLayer>` registered a
// PLAIN SNAPSHOT of `speed`/`offsetX`/`offsetY` once, at mount
// (`parallax.register({ speed: props.speed ?? 1, ... })`). The parent's
// rAF loop (`applyLayerTransforms`) and CSS scroll-driven path
// (`startCss`) both read those three fields straight off that SAME
// object on every frame / re-publish — neither is a Vue effect, so a
// later reactive change to those props had ZERO effect on the running
// animation.
//
// `useParallaxRuntime` gains an `update(id, patch)` accessor that patches
// the registered layer IN PLACE (preserving object/`target` identity —
// the rAF loop's `layerLerp` WeakMap keys off `target`). This spec
// exercises `update` directly, at the composable level, without any
// DOM/rAF/IntersectionObserver machinery — see the sibling
// `parallax.composable.spec.ts` for why those paths are asserted at the
// e2e level instead (jsdom cannot lay out elements or implement
// IntersectionObserver).

import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, beforeEach, vi } from 'vitest'

import { PARALLAX_DIRECTION, PARALLAX_EASING } from '@origam/enums'
import { useParallaxRuntime } from '@origam/composables/Parallax/parallax.composable'

import type { IParallaxLayerRegistry } from '@origam/interfaces'

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

function mountParallax (overrides: {
    easing?: typeof PARALLAX_EASING[keyof typeof PARALLAX_EASING] | string
} = {}) {
    let api!: ReturnType<typeof useParallaxRuntime>

    const Host = defineComponent({
        name: 'OrigamParallaxHost',
        setup () {
            api = useParallaxRuntime({
                target: ref(undefined),
                direction: ref(PARALLAX_DIRECTION.VERTICAL),
                easing: ref(overrides.easing ?? PARALLAX_EASING.SPRING),
                threshold: ref(0),
                disabled: ref(false),
                speed: ref(0.3)
            })
            return () => h('div')
        }
    })

    const wrapper = mount(Host)
    return { api: () => api, wrapper }
}

function makeLayer (id = Symbol('layer'), speed = 0.5): IParallaxLayerRegistry {
    return {
        id,
        speed,
        offsetX: 0,
        offsetY: 0,
        target: document.createElement('div')
    }
}

describe('useParallaxRuntime — update (#449)', () => {
    it('exposes an update function', () => {
        const { api } = mountParallax()
        expect(api()).toHaveProperty('update')
        expect(typeof api().update).toBe('function')
    })

    it('patches speed/offsetX/offsetY on the registered layer in place', () => {
        const { api } = mountParallax()
        const id = Symbol('layer')
        api().register(makeLayer(id, 0.5))

        api().update(id, { speed: 1.5, offsetX: 20, offsetY: -10 })

        const layer = api().layers.value.find(l => l.id === id)
        expect(layer?.speed).toBe(1.5)
        expect(layer?.offsetX).toBe(20)
        expect(layer?.offsetY).toBe(-10)
    })

    it('preserves the target element identity — the rAF spring easing WeakMap keys off it', () => {
        const { api } = mountParallax()
        const id = Symbol('layer')
        const layer = makeLayer(id, 0.5)
        api().register(layer)

        api().update(id, { speed: 2, offsetX: 0, offsetY: 0 })

        const stored = api().layers.value.find(l => l.id === id)
        expect(stored?.target).toBe(layer.target)
    })

    it('is a no-op for an unknown id — does not throw, does not register a phantom layer', () => {
        const { api } = mountParallax()
        api().register(makeLayer())

        expect(() => api().update(Symbol('unknown'), { speed: 1, offsetX: 0, offsetY: 0 })).not.toThrow()
        expect(api().layers.value).toHaveLength(1)
    })

    // `cssScrollDriven` requires CSS.supports('animation-timeline: scroll()')
    // AND easing === 'linear'. jsdom's answer to that query is
    // environment-dependent (jsdom 30 started returning `true`, flipping this
    // suite's assumption without a single line of origam changing — see the
    // `mountWithCssSupport` doc comment in the sibling `parallax.composable.spec.ts`).
    // The browser's answer is therefore STUBBED here too, never inherited.
    async function mountWithStubbedCssSupport (supported: boolean, easing: typeof PARALLAX_EASING[keyof typeof PARALLAX_EASING]) {
        vi.resetModules()

        const supports = vi.spyOn(CSS, 'supports').mockReturnValue(supported)
        const { useParallaxRuntime: fresh } = await import('@origam/composables/Parallax/parallax.composable')

        let api!: ReturnType<typeof fresh>

        const Host = defineComponent({
            name: 'OrigamParallaxCssHost',
            setup () {
                api = fresh({
                    target: ref(undefined),
                    direction: ref(PARALLAX_DIRECTION.VERTICAL),
                    easing: ref(easing),
                    threshold: ref(0),
                    disabled: ref(false),
                    speed: ref(0.3)
                })
                return () => h('div')
            }
        })

        const wrapper = mount(Host)

        supports.mockRestore()

        return { api: () => api, wrapper }
    }

    it('re-publishes the CSS custom properties on update() when the CSS scroll-driven path is active', async () => {
        const { api } = await mountWithStubbedCssSupport(true, PARALLAX_EASING.LINEAR)
        const id = Symbol('layer')
        const layer = makeLayer(id, 0.5)
        api().register(layer)

        api().update(id, { speed: 2, offsetX: 5, offsetY: 5 })

        expect(layer.target.style.getPropertyValue('--origam-parallax__layer---speed')).toBe('2')
        expect(layer.target.style.getPropertyValue('--origam-parallax__layer---offset-x')).toBe('5px')
        expect(layer.target.style.getPropertyValue('--origam-parallax__layer---offset-y')).toBe('5px')
    })

    it('does not touch CSS custom properties on update() when the JS rAF path is active', async () => {
        const { api } = await mountWithStubbedCssSupport(false, PARALLAX_EASING.SPRING)
        const id = Symbol('layer')
        const layer = makeLayer(id, 0.5)
        api().register(layer)

        api().update(id, { speed: 2, offsetX: 5, offsetY: 5 })

        expect(layer.target.style.getPropertyValue('--origam-parallax__layer---speed')).toBe('')
    })
})
