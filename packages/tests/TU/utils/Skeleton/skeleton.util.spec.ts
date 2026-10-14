import { describe, expect, it } from 'vitest'

import { getSkeletonHostClasses, splitSkeletonOverrides } from '@origam/utils/Skeleton/skeleton.util'

describe('getSkeletonHostClasses', () => {
    it('always carries the host class', () => {
        expect(getSkeletonHostClasses('pulse')[0]).toBe('origam--skeleton')
        expect(getSkeletonHostClasses(undefined)[0]).toBe('origam--skeleton')
    })

    it('maps each animation to its modifier, pulse being the unmodified default', () => {
        expect(getSkeletonHostClasses('pulse')[1]).toEqual({ 'origam--skeleton-wave': false, 'origam--skeleton-none': false })
        expect(getSkeletonHostClasses(undefined)[1]).toEqual({ 'origam--skeleton-wave': false, 'origam--skeleton-none': false })
        expect(getSkeletonHostClasses('wave')[1]).toEqual({ 'origam--skeleton-wave': true, 'origam--skeleton-none': false })
        expect(getSkeletonHostClasses('none')[1]).toEqual({ 'origam--skeleton-wave': false, 'origam--skeleton-none': true })
    })
})

describe('splitSkeletonOverrides', () => {
    it('sends animation and label to the group, loadingText being the default label', () => {
        const got = splitSkeletonOverrides({ animation: 'wave' }, 'origam.custom')
        expect(got.group).toEqual({ animation: 'wave', label: 'origam.custom' })
    })

    it('an explicit label in the bag wins over loadingText', () => {
        expect(splitSkeletonOverrides({ label: 'mine' }, 'origam.custom').group.label).toBe('mine')
    })

    it('sends only color, bgColor and rounded to the blocks', () => {
        const got = splitSkeletonOverrides({ color: 'primary', bgColor: 'secondary', rounded: 'lg', variant: 'card', width: 10, size: 'lg' })
        expect(got.block).toEqual({ color: 'primary', bgColor: 'secondary', rounded: 'lg' })
    })

    it('tolerates an empty / missing bag', () => {
        expect(splitSkeletonOverrides(undefined).group.animation).toBeUndefined()
        expect(splitSkeletonOverrides({}).block.color).toBeUndefined()
    })
})
