// Unit tests for `useChartGauge`.
//
// The composable is pure math driven by thunks (no Vue component needed for
// the bulk of assertions). We exercise:
//   - Geometry centre / radius computation from width × height × padding
//   - Value clamping: value < min, value > max, value = min, value = max
//   - Ratio normalisation: ratio in [0..1]
//   - Track / value path presence / emptiness near the boundary
//   - Custom angle + thickness overrides
//   - Min=max degenerate edge (span ≈ 0 guard)

import { describe, expect, it } from 'vitest'

import { useChartGauge } from '@origam/composables/Chart/chart-gauge.composable'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DEFAULT_PADDING = () => ({ top: 10, right: 10, bottom: 10, left: 10 })

function makeOptions (overrides: Partial<{
    value: number
    min: number
    max: number
    width: number
    height: number
    thickness: number
    startAngle: number
    endAngle: number
}> = {}) {
    const width  = overrides.width  ?? 300
    const height = overrides.height ?? 200
    return {
        value:      () => overrides.value     ?? 50,
        min:        () => overrides.min       ?? 0,
        max:        () => overrides.max       ?? 100,
        width:      () => width,
        height:     () => height,
        padding:    DEFAULT_PADDING,
        ...(overrides.thickness  != null ? { thickness:  () => overrides.thickness! }  : {}),
        ...(overrides.startAngle != null ? { startAngle: () => overrides.startAngle! } : {}),
        ...(overrides.endAngle   != null ? { endAngle:   () => overrides.endAngle! }   : {})
    }
}

// ---------------------------------------------------------------------------
// Geometry basics
// ---------------------------------------------------------------------------

describe('useChartGauge — geometry', () => {
    it('computes centerX from padding and width', () => {
        const { geometry } = useChartGauge(makeOptions({ width: 300, height: 200 }))
        // cx = (left + width - right) / 2 = (10 + 300 - 10) / 2 = 150
        expect(geometry.value.centerX).toBe(150)
    })

    it('computes centerY from padding and height', () => {
        const { geometry } = useChartGauge(makeOptions({ width: 300, height: 200 }))
        // cy = (top + height - bottom) / 2 = (10 + 200 - 10) / 2 = 100
        expect(geometry.value.centerY).toBe(100)
    })

    it('outerRadius is positive and respects thickness', () => {
        const { geometry } = useChartGauge(makeOptions({ thickness: 18 }))
        expect(geometry.value.outerRadius).toBeGreaterThan(0)
    })

    it('innerRadius is outerRadius - thickness (default thickness = 18)', () => {
        const { geometry } = useChartGauge(makeOptions())
        const { outerRadius, innerRadius } = geometry.value
        expect(outerRadius - innerRadius).toBe(18)
    })

    it('innerRadius is >= 0 even with very large thickness', () => {
        const { geometry } = useChartGauge(makeOptions({ thickness: 9999 }))
        expect(geometry.value.innerRadius).toBeGreaterThanOrEqual(0)
    })

    it('custom thickness overrides the default 18px', () => {
        const { geometry } = useChartGauge(makeOptions({ thickness: 30 }))
        const { outerRadius, innerRadius } = geometry.value
        expect(outerRadius - innerRadius).toBe(30)
    })
})

// ---------------------------------------------------------------------------
// Value clamping + ratio
// ---------------------------------------------------------------------------

describe('useChartGauge — clamping and ratio', () => {
    it('clamps value below min to min', () => {
        const { geometry } = useChartGauge(makeOptions({ value: -50, min: 0, max: 100 }))
        expect(geometry.value.clampedValue).toBe(0)
    })

    it('clamps value above max to max', () => {
        const { geometry } = useChartGauge(makeOptions({ value: 200, min: 0, max: 100 }))
        expect(geometry.value.clampedValue).toBe(100)
    })

    it('value equal to min yields ratio=0', () => {
        const { geometry } = useChartGauge(makeOptions({ value: 0, min: 0, max: 100 }))
        expect(geometry.value.ratio).toBe(0)
    })

    it('value equal to max yields ratio=1', () => {
        const { geometry } = useChartGauge(makeOptions({ value: 100, min: 0, max: 100 }))
        expect(geometry.value.ratio).toBe(1)
    })

    it('value at 50% yields ratio=0.5', () => {
        const { geometry } = useChartGauge(makeOptions({ value: 50, min: 0, max: 100 }))
        expect(geometry.value.ratio).toBeCloseTo(0.5)
    })

    it('negative range: min=−100, max=0, value=−50 yields ratio=0.5', () => {
        const { geometry } = useChartGauge(makeOptions({ value: -50, min: -100, max: 0 }))
        expect(geometry.value.ratio).toBeCloseTo(0.5)
    })

    it('min === max degenerate: span guard keeps ratio in [0,1]', () => {
        // Guard: `span = Math.max(1e-9, max - min)` prevents division by zero.
        const { geometry } = useChartGauge(makeOptions({ value: 50, min: 50, max: 50 }))
        expect(geometry.value.ratio).toBeGreaterThanOrEqual(0)
        expect(geometry.value.ratio).toBeLessThanOrEqual(1)
    })
})

// ---------------------------------------------------------------------------
// Track / value paths
// ---------------------------------------------------------------------------

describe('useChartGauge — SVG paths', () => {
    it('trackPath is always a non-empty SVG string', () => {
        const { geometry } = useChartGauge(makeOptions())
        expect(geometry.value.trackPath.length).toBeGreaterThan(0)
    })

    it('valuePath is empty when value === min (ratio ≈ 0)', () => {
        const { geometry } = useChartGauge(makeOptions({ value: 0, min: 0, max: 100 }))
        expect(geometry.value.valuePath).toBe('')
    })

    it('valuePath is non-empty when value > min', () => {
        const { geometry } = useChartGauge(makeOptions({ value: 50, min: 0, max: 100 }))
        expect(geometry.value.valuePath.length).toBeGreaterThan(0)
    })

    it('trackPath starts with "M" (SVG move command)', () => {
        const { geometry } = useChartGauge(makeOptions())
        expect(geometry.value.trackPath.startsWith('M')).toBe(true)
    })

    it('valuePath starts with "M" when non-empty', () => {
        const { geometry } = useChartGauge(makeOptions({ value: 75 }))
        expect(geometry.value.valuePath.startsWith('M')).toBe(true)
    })

    it('trackPath contains arc commands (A)', () => {
        const { geometry } = useChartGauge(makeOptions())
        expect(geometry.value.trackPath).toContain('A')
    })
})

// ---------------------------------------------------------------------------
// Angles
// ---------------------------------------------------------------------------

describe('useChartGauge — angles', () => {
    it('valueAngle equals startAngle when value === min', () => {
        const startAngle = -Math.PI * 3 / 4
        const { geometry } = useChartGauge(makeOptions({ value: 0, min: 0, max: 100 }))
        expect(geometry.value.valueAngle).toBeCloseTo(startAngle)
    })

    it('valueAngle equals endAngle when value === max', () => {
        const endAngle = Math.PI * 3 / 4
        const { geometry } = useChartGauge(makeOptions({ value: 100, min: 0, max: 100 }))
        expect(geometry.value.valueAngle).toBeCloseTo(endAngle)
    })

    it('valueAngle is between startAngle and endAngle for mid values', () => {
        const { geometry } = useChartGauge(makeOptions({ value: 50 }))
        const { valueAngle, startAngle, endAngle } = geometry.value
        expect(valueAngle).toBeGreaterThan(startAngle)
        expect(valueAngle).toBeLessThan(endAngle)
    })

    it('custom startAngle / endAngle are echoed back in geometry', () => {
        const SA = -Math.PI / 2
        const EA = Math.PI / 2
        const { geometry } = useChartGauge(makeOptions({ startAngle: SA, endAngle: EA }))
        expect(geometry.value.startAngle).toBeCloseTo(SA)
        expect(geometry.value.endAngle).toBeCloseTo(EA)
    })
})
