// TU — point.util.ts
// Exports: elementToViewport, viewportToElement, getOffset, anchorToPoint,
//          inViewport, getCenter
//
// inViewport depends on window.innerHeight/innerWidth (jsdom: both exist as 0
// by default) — tested with explicit window size overrides.

import { describe, expect, it } from 'vitest'
import {
    elementToViewport,
    viewportToElement,
    getOffset,
    anchorToPoint,
    inViewport,
    getCenter,
} from '@origam/utils/Commons/point.util'
import { Box } from '@origam/services/Commons/box.service'

// ─── elementToViewport ────────────────────────────────────────────────────────

describe('elementToViewport', () => {
    it('adds offset to element point', () => {
        const result = elementToViewport({ x: 10, y: 20 }, { x: 5, y: 15 })
        expect(result).toEqual({ x: 15, y: 35 })
    })

    it('handles zero offsets', () => {
        const result = elementToViewport({ x: 7, y: 3 }, { x: 0, y: 0 })
        expect(result).toEqual({ x: 7, y: 3 })
    })

    it('handles negative offset', () => {
        const result = elementToViewport({ x: 10, y: 10 }, { x: -3, y: -5 })
        expect(result).toEqual({ x: 7, y: 5 })
    })
})

// ─── viewportToElement ────────────────────────────────────────────────────────

describe('viewportToElement', () => {
    it('subtracts offset from viewport point', () => {
        const result = viewportToElement({ x: 15, y: 35 }, { x: 5, y: 15 })
        expect(result).toEqual({ x: 10, y: 20 })
    })

    it('is the inverse of elementToViewport', () => {
        const point = { x: 50, y: 80 }
        const offset = { x: 20, y: 30 }
        const inViewportSpace = elementToViewport(point, offset)
        const back = viewportToElement(inViewportSpace, offset)
        expect(back).toEqual(point)
    })
})

// ─── getOffset ────────────────────────────────────────────────────────────────

describe('getOffset', () => {
    it('returns the difference between two points', () => {
        const result = getOffset({ x: 10, y: 20 }, { x: 3, y: 5 })
        expect(result).toEqual({ x: 7, y: 15 })
    })

    it('can produce negative offsets', () => {
        const result = getOffset({ x: 0, y: 0 }, { x: 5, y: 10 })
        expect(result).toEqual({ x: -5, y: -10 })
    })

    it('returns {x:0, y:0} for identical points', () => {
        expect(getOffset({ x: 5, y: 5 }, { x: 5, y: 5 })).toEqual({ x: 0, y: 0 })
    })
})

// ─── anchorToPoint ────────────────────────────────────────────────────────────

describe('anchorToPoint', () => {
    const box = new Box({ x: 10, y: 20, width: 100, height: 60 })

    describe('top side', () => {
        it('top + left → top-left corner', () => {
            const pt = anchorToPoint({ side: 'top', align: 'left' }, box)
            expect(pt.x).toBe(box.x)         // 0 + offset.x
            expect(pt.y).toBe(box.y)         // 0 + offset.y
        })

        it('top + center → top-center', () => {
            const pt = anchorToPoint({ side: 'top', align: 'center' }, box)
            expect(pt.x).toBe(box.x + box.width / 2)  // 10 + 50
            expect(pt.y).toBe(box.y)
        })

        it('top + right → top-right corner', () => {
            const pt = anchorToPoint({ side: 'top', align: 'right' }, box)
            expect(pt.x).toBe(box.x + box.width)
            expect(pt.y).toBe(box.y)
        })
    })

    describe('bottom side', () => {
        it('bottom + left → bottom-left corner', () => {
            const pt = anchorToPoint({ side: 'bottom', align: 'left' }, box)
            expect(pt.x).toBe(box.x)
            expect(pt.y).toBe(box.y + box.height)
        })

        it('bottom + center → bottom-center', () => {
            const pt = anchorToPoint({ side: 'bottom', align: 'center' }, box)
            expect(pt.x).toBe(box.x + box.width / 2)
            expect(pt.y).toBe(box.y + box.height)
        })
    })

    describe('left side', () => {
        it('left + top → left-top corner', () => {
            const pt = anchorToPoint({ side: 'left', align: 'top' }, box)
            expect(pt.x).toBe(box.x)
            expect(pt.y).toBe(box.y)
        })

        it('left + center → left-center', () => {
            const pt = anchorToPoint({ side: 'left', align: 'center' }, box)
            expect(pt.x).toBe(box.x)
            expect(pt.y).toBe(box.y + box.height / 2)
        })

        it('left + bottom → left-bottom corner', () => {
            const pt = anchorToPoint({ side: 'left', align: 'bottom' }, box)
            expect(pt.x).toBe(box.x)
            expect(pt.y).toBe(box.y + box.height)
        })
    })

    describe('right side', () => {
        it('right + top → right-top corner', () => {
            const pt = anchorToPoint({ side: 'right', align: 'top' }, box)
            expect(pt.x).toBe(box.x + box.width)
            expect(pt.y).toBe(box.y)
        })

        it('right + center → right-center', () => {
            const pt = anchorToPoint({ side: 'right', align: 'center' }, box)
            expect(pt.x).toBe(box.x + box.width)
            expect(pt.y).toBe(box.y + box.height / 2)
        })
    })

    describe('center side (fallback)', () => {
        it('center + center → box center', () => {
            const pt = anchorToPoint({ side: 'center', align: 'center' }, box)
            expect(pt.x).toBe(box.x + box.width / 2)
            expect(pt.y).toBe(box.y + box.height / 2)
        })
    })
})

// ─── inViewport ───────────────────────────────────────────────────────────────

describe('inViewport', () => {
    // jsdom window.innerHeight and window.innerWidth are typically 768 and 1024.
    it('returns true when element is fully inside viewport', () => {
        const el = { top: 10, bottom: 100, left: 10, right: 200 }
        // window dimensions in jsdom are generally 768×1024 — element fits
        Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 768 })
        Object.defineProperty(window, 'innerWidth',  { writable: true, configurable: true, value: 1024 })
        expect(inViewport(el as DOMRect)).toBe(true)
    })

    it('returns false when element is entirely above the viewport (bottom < 0)', () => {
        const el = { top: -100, bottom: -10, left: 0, right: 100 }
        expect(inViewport(el as DOMRect)).toBe(false)
    })

    it('returns false when element is entirely to the left of the viewport (right < 0)', () => {
        const el = { top: 10, bottom: 50, left: -200, right: -10 }
        expect(inViewport(el as DOMRect)).toBe(false)
    })
})

// ─── getCenter ────────────────────────────────────────────────────────────────

describe('getCenter', () => {
    it('returns half-width and half-height as the center', () => {
        const el = { width: 100, height: 60, x: 0, y: 0 } as DOMRect
        const center = getCenter(el)
        expect(center.x).toBe(50)
        expect(center.y).toBe(30)
    })

    it('returns {x:0, y:0} for null/falsy element', () => {
        const center = getCenter(null as any)
        expect(center).toEqual({ x: 0, y: 0 })
    })

    it('returns {x:0, y:0} for zero-sized element', () => {
        const center = getCenter({ width: 0, height: 0 } as DOMRect)
        expect(center).toEqual({ x: 0, y: 0 })
    })
})
