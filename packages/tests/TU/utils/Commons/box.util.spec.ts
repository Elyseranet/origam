// TU — box.util.ts
// Exports: getOverflow, getTargetBox
// Box service is imported from @origam/services to construct IBox instances.

import { describe, expect, it } from 'vitest'
import { getOverflow, getTargetBox } from '@origam/utils/Commons/box.util'
import { Box } from '@origam/services/Commons/box.service'

// ─── getOverflow ─────────────────────────────────────────────────────────────

describe('getOverflow', () => {
    // Reference: getOverflow(a, b) returns how much `a` overflows `b`.
    // - x.before = max(0, b.left - a.left)   → a is too far right vs b.left
    // - x.after  = max(0, a.right - b.right)  → a right-edge exceeds b.right
    // - y.before = max(0, b.top  - a.top)     → a is too far down vs b.top
    // - y.after  = max(0, a.bottom - b.bottom) → a bottom-edge exceeds b.bottom

    it('returns all zeros when a is fully inside b', () => {
        const a = new Box({ x: 10, y: 10, width: 80, height: 80 })
        const b = new Box({ x: 0,  y: 0,  width: 100, height: 100 })
        const overflow = getOverflow(a, b)
        expect(overflow.x.before).toBe(0)
        expect(overflow.x.after).toBe(0)
        expect(overflow.y.before).toBe(0)
        expect(overflow.y.after).toBe(0)
    })

    it('returns 0 for all sides when a and b are identical', () => {
        const box = new Box({ x: 0, y: 0, width: 100, height: 100 })
        const overflow = getOverflow(box, box)
        expect(overflow.x.before).toBe(0)
        expect(overflow.x.after).toBe(0)
        expect(overflow.y.before).toBe(0)
        expect(overflow.y.after).toBe(0)
    })

    it('detects x.after overflow (a right-edge exceeds b right-edge)', () => {
        // a starts at x=20, width=100 → right=120
        // b starts at x=0,  width=100 → right=100
        const a = new Box({ x: 20, y: 0, width: 100, height: 50 })
        const b = new Box({ x: 0,  y: 0, width: 100, height: 50 })
        const overflow = getOverflow(a, b)
        expect(overflow.x.after).toBe(20) // 120 - 100
        expect(overflow.x.before).toBe(0) // b.left(0) - a.left(20) < 0 → clamped to 0
    })

    it('detects x.before overflow (a left-edge is inside b but b.left > a.left — no overflow)', () => {
        // a.left < b.left → overflow.x.before = b.left - a.left
        const a = new Box({ x: 0,  y: 0, width: 100, height: 50 })
        const b = new Box({ x: 20, y: 0, width: 100, height: 50 })
        const overflow = getOverflow(a, b)
        expect(overflow.x.before).toBe(20) // b.left(20) - a.left(0) = 20
    })

    it('detects y.after overflow (a bottom > b bottom)', () => {
        const a = new Box({ x: 0, y: 10, width: 50, height: 100 })
        const b = new Box({ x: 0, y: 0,  width: 50, height: 100 })
        const overflow = getOverflow(a, b)
        expect(overflow.y.after).toBe(10) // a.bottom(110) - b.bottom(100)
    })

    it('detects y.before overflow (b.top > a.top)', () => {
        const a = new Box({ x: 0, y: 0,  width: 50, height: 50 })
        const b = new Box({ x: 0, y: 10, width: 50, height: 50 })
        const overflow = getOverflow(a, b)
        expect(overflow.y.before).toBe(10) // b.top(10) - a.top(0)
    })

    it('can report overflow in all 4 directions simultaneously', () => {
        // a is larger than b and centered on it → overflows all sides
        const a = new Box({ x: -10, y: -10, width: 120, height: 120 })
        const b = new Box({ x: 0,   y: 0,   width: 100, height: 100 })
        const overflow = getOverflow(a, b)
        expect(overflow.x.before).toBe(10)
        expect(overflow.x.after).toBe(10)
        expect(overflow.y.before).toBe(10)
        expect(overflow.y.after).toBe(10)
    })

    it('clamps negative overflows to 0 (no "negative overflow")', () => {
        const a = new Box({ x: 25, y: 25, width: 50, height: 50 })
        const b = new Box({ x: 0,  y: 0,  width: 200, height: 200 })
        const overflow = getOverflow(a, b)
        // a is well inside b — all overflow values must be >= 0
        Object.values(overflow).forEach(axis => {
            expect(axis.before).toBeGreaterThanOrEqual(0)
            expect(axis.after).toBeGreaterThanOrEqual(0)
        })
    })
})

// ─── getTargetBox ─────────────────────────────────────────────────────────────

describe('getTargetBox', () => {
    it('wraps a [x, y] point tuple in a Box with width=0 height=0', () => {
        const box = getTargetBox([42, 99])
        expect(box.x ?? (box as any).left).toBeDefined()
        // Box.x
        expect((box as Box).x).toBe(42)
        expect((box as Box).y).toBe(99)
        expect((box as Box).width).toBe(0)
        expect((box as Box).height).toBe(0)
    })

    it('Box from tuple: left === x, top === y, right === x, bottom === y', () => {
        const box = getTargetBox([10, 20]) as Box
        expect(box.left).toBe(10)
        expect(box.top).toBe(20)
        expect(box.right).toBe(10)  // x + width = 10 + 0
        expect(box.bottom).toBe(20) // y + height = 20 + 0
    })

    it('calls getBoundingClientRect on an HTMLElement', () => {
        const mockRect = {
            x: 5, y: 10, width: 100, height: 50,
            top: 10, bottom: 60, left: 5, right: 105,
            toJSON: () => ({})
        }
        const el = {
            getBoundingClientRect: () => mockRect
        } as unknown as HTMLElement

        const result = getTargetBox(el)
        expect(result).toBe(mockRect)
    })
})
