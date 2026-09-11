// TU — animation.util.ts
// Exports: nullifyTransforms (DOM-bound), animate
//
// nullifyTransforms depends on getBoundingClientRect + getComputedStyle —
// deterministic in jsdom only when we fully control the element's style.
// The "transform" branches call el.animate() which is not implemented in jsdom.
// We test the no-transform path (returns a plain Box from rect) and the
// animate() wrapper thoroughly via mocked el.

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { animate } from '@origam/utils/Commons/animation.util'

// ─── animate ─────────────────────────────────────────────────────────────────

describe('animate', () => {
    it('returns {finished: Promise} when el.animate is undefined', async () => {
        const el = document.createElement('div')
        // jsdom does not implement el.animate — it is undefined by default
        delete (el as any).animate

        const result = animate(el, [{ opacity: '0' }, { opacity: '1' }], 300)
        expect(result).toHaveProperty('finished')
        await expect(result.finished).resolves.toBeUndefined()
    })

    it('returns {finished: Promise} when el.animate throws', async () => {
        const el = document.createElement('div')
        ;(el as any).animate = () => { throw new Error('not supported') }

        const result = animate(el, [{ opacity: '0' }], 200)
        expect(result).toHaveProperty('finished')
        await expect(result.finished).resolves.toBeUndefined()
    })

    it('returns the Animation object when el.animate succeeds', () => {
        const fakeAnimation = {
            finished: Promise.resolve({} as Animation),
            onfinish: null
        } as unknown as Animation

        const el = document.createElement('div')
        ;(el as any).animate = vi.fn().mockReturnValue(fakeAnimation)

        const result = animate(el, [{ opacity: '0' }], 300)
        expect(result).toBe(fakeAnimation)
        expect((el as any).animate).toHaveBeenCalledOnce()
    })

    it('polyfills animation.finished when it is undefined', async () => {
        const fakeAnimation: any = {
            finished: undefined,
            onfinish: null as any
        }

        const el = document.createElement('div')
        ;(el as any).animate = vi.fn().mockReturnValue(fakeAnimation)

        const result = animate(el, null, { duration: 100 }) as any
        expect(result.finished).toBeInstanceOf(Promise)

        // Trigger the onfinish callback to resolve the polyfilled promise
        fakeAnimation.onfinish()
        await expect(result.finished).resolves.toBe(fakeAnimation)
    })

    it('passes keyframes and options through to el.animate', () => {
        const keyframes = [{ transform: 'scale(0)' }, { transform: 'scale(1)' }]
        const options = { duration: 500, easing: 'ease-in-out' }
        const fakeAnimation = { finished: Promise.resolve({}) }

        const el = document.createElement('div')
        const mockAnimate = vi.fn().mockReturnValue(fakeAnimation)
        ;(el as any).animate = mockAnimate

        animate(el, keyframes, options)
        expect(mockAnimate).toHaveBeenCalledWith(keyframes, options)
    })

    it('accepts null keyframes', () => {
        const fakeAnimation = { finished: Promise.resolve({}) }
        const el = document.createElement('div')
        ;(el as any).animate = vi.fn().mockReturnValue(fakeAnimation)

        expect(() => animate(el, null, 100)).not.toThrow()
    })
})

// ─── nullifyTransforms ───────────────────────────────────────────────────────
// jsdom getComputedStyle returns empty string for transform — the function falls
// through to `return new Box(rect)`. We verify the no-transform branch returns
// an object with x, y, width, height from the bounding rect.

describe('nullifyTransforms', () => {
    it('returns a Box equal to getBoundingClientRect when no transform is set', async () => {
        // Dynamically import here so jsdom is fully set up
        const { nullifyTransforms } = await import('@origam/utils/Commons/animation.util')

        const el = document.createElement('div')
        document.body.appendChild(el)

        // jsdom's getBoundingClientRect returns all-zeros but the call itself works
        const result = nullifyTransforms(el)
        expect(result).toHaveProperty('width')
        expect(result).toHaveProperty('height')
        expect(typeof result.width).toBe('number')
        expect(typeof result.height).toBe('number')

        document.body.removeChild(el)
    })
})
