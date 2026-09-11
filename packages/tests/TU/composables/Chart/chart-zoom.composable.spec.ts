// Unit tests for `useChartZoom`.
//
// The composable manages an interactive zoom/pan window over a categorical
// dataset. All state is reactive refs; the math is pure. Tests cover:
//   - Initial state (unzoomed window)
//   - zoomTo / zoomReset invariants
//   - applyZoom clamps: start < 0, end > maxIdx, swap when start > end
//   - MIN_VISIBLE_CATEGORIES floor
//   - zoomBy (zoom-in / zoom-out)
//   - panBy: preserved window size, boundary clamps
//   - pxToCategoryIndex / categoryIndexToPx pixel↔index conversion
//   - isZoomed flag
//   - Edge cases: dataLength=0, dataLength=1

import { describe, expect, it } from 'vitest'

import { useChartZoom } from '@origam/composables/Chart/chart-zoom.composable'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeZoom (dataLength: number) {
    return useChartZoom({ dataLength: () => dataLength })
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('useChartZoom — initial state', () => {
    it('zoomStart starts at 0', () => {
        const z = makeZoom(10)
        expect(z.zoomStart.value).toBe(0)
    })

    it('isZoomed is false on creation', () => {
        const z = makeZoom(10)
        expect(z.isZoomed.value).toBe(false)
    })

    it('effectiveEnd resolves to dataLength - 1 when unzoomed', () => {
        const z = makeZoom(8)
        expect(z.zoomEnd.value).toBe(7)
    })

    it('WHEEL_ZOOM_STEP is positive', () => {
        const z = makeZoom(5)
        expect(z.WHEEL_ZOOM_STEP).toBeGreaterThan(0)
    })
})

// ---------------------------------------------------------------------------
// zoomTo
// ---------------------------------------------------------------------------

describe('useChartZoom — zoomTo', () => {
    it('zooms to an explicit [start, end] range', () => {
        const z = makeZoom(10)
        z.zoomTo(2, 6)
        expect(z.zoomStart.value).toBe(2)
        expect(z.zoomEnd.value).toBe(6)
    })

    it('clamps start to 0 when passed negative', () => {
        const z = makeZoom(10)
        z.zoomTo(-5, 4)
        expect(z.zoomStart.value).toBe(0)
    })

    it('clamps end to dataLength - 1', () => {
        const z = makeZoom(10)
        z.zoomTo(0, 999)
        expect(z.zoomEnd.value).toBe(9)
    })

    it('swaps start and end when start > end', () => {
        const z = makeZoom(10)
        z.zoomTo(7, 3)
        expect(z.zoomStart.value).toBeLessThan(z.zoomEnd.value)
    })

    it('enforces MIN_VISIBLE_CATEGORIES=2 (e−s≥1)', () => {
        // zoomTo(5, 5) collapses to [5, 5] which violates min 2 visible.
        // Engine should push end to start + 1 = 6.
        const z = makeZoom(10)
        z.zoomTo(5, 5)
        expect(z.zoomEnd.value - z.zoomStart.value).toBeGreaterThanOrEqual(1)
    })

    it('isZoomed becomes true after zoomTo', () => {
        const z = makeZoom(10)
        z.zoomTo(1, 5)
        expect(z.isZoomed.value).toBe(true)
    })

    it('rounds fractional start / end to integers', () => {
        const z = makeZoom(10)
        z.zoomTo(1.2, 4.8)
        expect(Number.isInteger(z.zoomStart.value)).toBe(true)
        expect(Number.isInteger(z.zoomEnd.value)).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// zoomReset
// ---------------------------------------------------------------------------

describe('useChartZoom — zoomReset', () => {
    it('restores start to 0', () => {
        const z = makeZoom(10)
        z.zoomTo(2, 7)
        z.zoomReset()
        expect(z.zoomStart.value).toBe(0)
    })

    it('restores effectiveEnd to dataLength - 1', () => {
        const z = makeZoom(10)
        z.zoomTo(2, 7)
        z.zoomReset()
        expect(z.zoomEnd.value).toBe(9)
    })

    it('isZoomed is false after reset', () => {
        const z = makeZoom(10)
        z.zoomTo(2, 7)
        z.zoomReset()
        expect(z.isZoomed.value).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// zoomBy
// ---------------------------------------------------------------------------

describe('useChartZoom — zoomBy', () => {
    it('positive delta narrows the window (zoom IN)', () => {
        const z = makeZoom(20)
        const before = z.zoomEnd.value - z.zoomStart.value
        z.zoomBy(0.2, 0.5)
        const after = z.zoomEnd.value - z.zoomStart.value
        expect(after).toBeLessThan(before)
    })

    it('negative delta widens the window (zoom OUT)', () => {
        const z = makeZoom(20)
        z.zoomTo(4, 16)
        const before = z.zoomEnd.value - z.zoomStart.value
        z.zoomBy(-0.2, 0.5)
        const after = z.zoomEnd.value - z.zoomStart.value
        expect(after).toBeGreaterThan(before)
    })

    it('does not collapse below MIN_VISIBLE_CATEGORIES even with extreme delta', () => {
        const z = makeZoom(10)
        z.zoomTo(3, 6)
        for (let i = 0; i < 20; i++) z.zoomBy(0.9, 0.5)
        expect(z.zoomEnd.value - z.zoomStart.value).toBeGreaterThanOrEqual(1)
    })

    it('is a no-op when dataLength=0', () => {
        const z = makeZoom(0)
        z.zoomBy(0.5, 0.5)
        expect(z.zoomStart.value).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// panBy
// ---------------------------------------------------------------------------

describe('useChartZoom — panBy', () => {
    it('shifts the window right without changing its size', () => {
        const z = makeZoom(20)
        z.zoomTo(2, 7)
        const size = z.zoomEnd.value - z.zoomStart.value
        z.panBy(3)
        expect(z.zoomEnd.value - z.zoomStart.value).toBe(size)
    })

    it('does not push the window past the right edge', () => {
        const z = makeZoom(10)
        z.zoomTo(0, 4)
        z.panBy(9999)
        expect(z.zoomEnd.value).toBe(9)
    })

    it('does not push the window before index 0', () => {
        const z = makeZoom(10)
        z.zoomTo(5, 9)
        z.panBy(-9999)
        expect(z.zoomStart.value).toBe(0)
    })

    it('is a no-op when dataLength=0', () => {
        const z = makeZoom(0)
        z.panBy(5)
        expect(z.zoomStart.value).toBe(0)
    })
})

// ---------------------------------------------------------------------------
// pxToCategoryIndex / categoryIndexToPx
// ---------------------------------------------------------------------------

describe('useChartZoom — pixel ↔ index conversion', () => {
    it('pxToCategoryIndex returns 0 for the left edge pixel', () => {
        const z = makeZoom(5)
        const idx = z.pxToCategoryIndex(0, 0, 400)
        expect(idx).toBeCloseTo(0)
    })

    it('pxToCategoryIndex returns dataLength-1 for the right edge pixel', () => {
        const z = makeZoom(5)
        const idx = z.pxToCategoryIndex(400, 0, 400)
        expect(idx).toBeCloseTo(4)
    })

    it('pxToCategoryIndex clamps px outside plot to [start, end]', () => {
        const z = makeZoom(5)
        const below = z.pxToCategoryIndex(-100, 0, 400)
        const above = z.pxToCategoryIndex(9999, 0, 400)
        expect(below).toBeCloseTo(0)
        expect(above).toBeCloseTo(4)
    })

    it('categoryIndexToPx returns plotX0 for index at zoomStart', () => {
        const z = makeZoom(5)
        const px = z.categoryIndexToPx(0, 50, 350)
        expect(px).toBeCloseTo(50)
    })

    it('categoryIndexToPx returns plotX1 for index at effectiveEnd', () => {
        const z = makeZoom(5)
        const px = z.categoryIndexToPx(4, 50, 350)
        expect(px).toBeCloseTo(350)
    })

    it('round-trip: index → px → index recovers the original index', () => {
        const z = makeZoom(10)
        z.zoomTo(1, 8)
        const originalIdx = 4
        const px = z.categoryIndexToPx(originalIdx, 0, 400)
        const recovered = z.pxToCategoryIndex(px, 0, 400)
        expect(recovered).toBeCloseTo(originalIdx, 0)
    })

    it('pxToCategoryIndex returns 0 when dataLength=1', () => {
        const z = makeZoom(1)
        expect(z.pxToCategoryIndex(200, 0, 400)).toBe(0)
    })
})
