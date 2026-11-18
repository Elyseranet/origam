// #1333 — navigation rule of the chart roving tabindex.
import { describe, expect, it } from 'vitest'

import { resolveChartRovingTarget } from '../../../../ds/src/composables/Chart/chart-roving.composable'

// Series keys in DOM order: s0 has 3 points, s1 has 2.
const TWO = ['s0', 's0', 's0', 's1', 's1']
const ONE = ['', '', '']

describe('resolveChartRovingTarget', () => {
    it('Home / End reach the extremities', () => {
        expect(resolveChartRovingTarget(TWO, 3, 'first')).toBe(0)
        expect(resolveChartRovingTarget(TWO, 0, 'last')).toBe(4)
    })

    it('Left / Right stay inside the series and never wrap', () => {
        expect(resolveChartRovingTarget(TWO, 0, 'next')).toBe(1)
        expect(resolveChartRovingTarget(TWO, 2, 'next')).toBe(2)
        expect(resolveChartRovingTarget(TWO, 3, 'previous')).toBe(3)
        expect(resolveChartRovingTarget(TWO, 4, 'previous')).toBe(3)
    })

    it('Up / Down change series at the same position, clamped to a shorter series', () => {
        expect(resolveChartRovingTarget(TWO, 1, 'nextSeries')).toBe(4)
        expect(resolveChartRovingTarget(TWO, 2, 'nextSeries')).toBe(4)
        expect(resolveChartRovingTarget(TWO, 3, 'previousSeries')).toBe(0)
        expect(resolveChartRovingTarget(TWO, 1, 'previousSeries')).toBe(1)
    })

    it('with a single series Up / Down behave like Left / Right', () => {
        expect(resolveChartRovingTarget(ONE, 0, 'nextSeries')).toBe(1)
        expect(resolveChartRovingTarget(ONE, 2, 'nextSeries')).toBe(2)
        expect(resolveChartRovingTarget(ONE, 2, 'previousSeries')).toBe(1)
    })

    it('an empty chart has no target', () => {
        expect(resolveChartRovingTarget([], 0, 'next')).toBe(-1)
    })
})
