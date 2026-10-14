import { describe, expect, it } from 'vitest'

import { getSkeletonCellShape } from '@origam/utils/DataTable/skeleton-cell.util'

describe('getSkeletonCellShape', () => {
    it('reads the reserved select / expand keys as controls', () => {
        expect(getSkeletonCellShape({ key: 'data-table-select' })).toBe('control')
        expect(getSkeletonCellShape({ key: 'data-table-expand' })).toBe('control')
    })

    it('reads an end-aligned column as figures', () => {
        expect(getSkeletonCellShape({ key: 'amount', align: 'end' })).toBe('end')
    })

    it('falls back to text for any other column', () => {
        expect(getSkeletonCellShape({ key: 'name' })).toBe('text')
        expect(getSkeletonCellShape({ key: 'name', align: 'start' })).toBe('text')
        expect(getSkeletonCellShape({ key: null })).toBe('text')
    })

    it('a control key wins over an end alignment', () => {
        expect(getSkeletonCellShape({ key: 'data-table-select', align: 'end' })).toBe('control')
    })
})
