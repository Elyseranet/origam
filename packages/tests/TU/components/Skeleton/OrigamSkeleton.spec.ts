// OrigamSkeleton / OrigamSkeletonGroup — lot 1 of #1073.
//
// jsdom NEVER resolves `var()` (CLAUDE.md, #398), so nothing here asserts a
// computed style. What is pinned is what jsdom CAN observe truthfully: the
// classes emitted, the ARIA attributes, the inline declarations and the
// absence of per-instance <style> tags. The motion itself (reduced-motion,
// finite loop, 1.6 s, circle) is measured in a real browser by
// `e2e/skeleton.spec.ts`.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { h } from 'vue'

import OrigamSkeleton from '@origam/components/Skeleton/OrigamSkeleton.vue'
import OrigamSkeletonGroup from '@origam/components/Skeleton/OrigamSkeletonGroup.vue'
import { createOrigam } from '@origam/origam'
import { SKELETON_VARIANT } from '@origam/enums'

const mountSkeleton = (props: Record<string, unknown> = {}) =>
    mount(OrigamSkeleton, {props: props as never, global: {plugins: [createOrigam()]}})

const mountGroup = (props: Record<string, unknown>, blocks: Array<Record<string, unknown>>) =>
    mount(OrigamSkeletonGroup, {
        props: props as never,
        slots: {default: () => blocks.map((b) => h(OrigamSkeleton, b as never))},
        global: {plugins: [createOrigam()]}
    })

describe('OrigamSkeleton — animation', () => {
    it('pulses by default: the host class is present, no modifier', () => {
        const root = mountSkeleton().find('.origam-skeleton')

        expect(root.classes()).toContain('origam--skeleton')
        expect(root.classes()).not.toContain('origam--skeleton-wave')
        expect(root.classes()).not.toContain('origam--skeleton-none')
    })

    it('animation="wave" adds the shimmer modifier', () => {
        const root = mountSkeleton({animation: 'wave'}).find('.origam-skeleton')

        expect(root.classes()).toContain('origam--skeleton-wave')
    })

    it('animation="none" adds the static modifier', () => {
        const root = mountSkeleton({animation: 'none'}).find('.origam-skeleton')

        expect(root.classes()).toContain('origam--skeleton-none')
    })

    it('no longer declares the legacy `pulse` boolean nor a spin', () => {
        const root = mountSkeleton({variant: 'circular'}).find('.origam-skeleton')

        expect(root.classes().some((c) => c.includes('--pulse'))).toBe(false)
        expect(OrigamSkeleton.props).not.toHaveProperty('pulse')
    })
})

describe('OrigamSkeleton — shapes and dimension', () => {
    it.each(['text', 'rectangular', 'circular', 'pill'])('variant %s emits its modifier class', (variant) => {
        const root = mountSkeleton({variant}).find('.origam-skeleton')

        expect(root.classes()).toContain(`origam-skeleton--${variant}`)
    })

    it('width / height go through useDimension as inline declarations', () => {
        const root = mountSkeleton({width: 200, height: '80px'}).find('.origam-skeleton')

        expect(root.attributes('style')).toContain('width: 200px')
        expect(root.attributes('style')).toContain('height: 80px')
    })

    it('max/min dimensions are honoured too (IDimensionProps, not a half surface)', () => {
        const root = mountSkeleton({maxHeight: '50vh', minWidth: 40}).find('.origam-skeleton')

        expect(root.attributes('style')).toContain('max-height: 50vh')
        expect(root.attributes('style')).toContain('min-width: 40px')
    })
})

describe('OrigamSkeleton — one style, no per-instance <style> (#1076)', () => {
    it('injects nothing in <head>', () => {
        const before = document.head.querySelectorAll('style[id^="origam-skeleton"]').length

        mountSkeleton({width: 10})
        mountSkeleton({width: 20, loading: false})

        expect(document.head.querySelectorAll('style[id^="origam-skeleton"]').length).toBe(before)
    })
})

describe('OrigamSkeleton — loading toggle', () => {
    it('renders the slot, and no placeholder, when loading=false', () => {
        const wrapper = mount(OrigamSkeleton, {
            props: {loading: false} as never,
            slots: {default: '<p>loaded</p>'},
            global: {plugins: [createOrigam()]}
        })

        expect(wrapper.find('.origam-skeleton').exists()).toBe(false)
        expect(wrapper.text()).toContain('loaded')
    })
})

describe('OrigamSkeleton — accessibility', () => {
    it('a standalone block is its own zone: it announces itself', () => {
        const root = mountSkeleton().find('.origam-skeleton')

        expect(root.attributes('role')).toBe('status')
        expect(root.attributes('aria-busy')).toBe('true')
        expect(root.attributes('aria-label')).toBe('Loading...')
        expect(root.attributes('aria-hidden')).toBeUndefined()
    })

    it('blocks inside a group are aria-hidden and carry no role', () => {
        const wrapper = mountGroup({}, [{variant: 'text'}, {variant: 'circular'}, {variant: 'pill'}])
        const blocks = wrapper.findAll('.origam-skeleton')

        expect(blocks).toHaveLength(3)
        blocks.forEach((block) => {
            expect(block.attributes('aria-hidden')).toBe('true')
            expect(block.attributes('role')).toBeUndefined()
            expect(block.attributes('aria-label')).toBeUndefined()
        })
    })

    it('a group makes ONE announcement for the whole zone', () => {
        const wrapper = mountGroup({}, [{variant: 'text'}, {variant: 'text'}, {variant: 'text'}])

        expect(wrapper.findAll('[role="status"]')).toHaveLength(1)
        expect(wrapper.find('[role="status"]').attributes('aria-busy')).toBe('true')
        expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe('Loading...')
    })

    it('the group label is a locale key, translated', () => {
        const wrapper = mountGroup({label: 'origam.data_iterator.loading_text'}, [{variant: 'text'}])

        expect(wrapper.find('[role="status"]').attributes('aria-label')).toBe('Loading items...')
    })
})

describe('OrigamSkeletonGroup — one animation clock', () => {
    it('pulse (default): the container carries the animation class', () => {
        const wrapper = mountGroup({}, [{variant: 'text'}])

        expect(wrapper.find('.origam-skeleton-group').classes()).toContain('origam--skeleton-group-pulse')
    })

    it('wave / none: the container does not pulse', () => {
        expect(mountGroup({animation: 'wave'}, [{variant: 'text'}]).find('.origam-skeleton-group').classes())
            .not.toContain('origam--skeleton-group-pulse')
        expect(mountGroup({animation: 'none'}, [{variant: 'text'}]).find('.origam-skeleton-group').classes())
            .not.toContain('origam--skeleton-group-pulse')
    })

    it('blocks inherit the group animation, and may override it', () => {
        const wrapper = mountGroup({animation: 'wave'}, [{variant: 'text'}, {variant: 'text', animation: 'none'}])
        const [inherits, overrides] = wrapper.findAll('.origam-skeleton')

        expect(inherits.classes()).toContain('origam--skeleton-wave')
        expect(overrides.classes()).toContain('origam--skeleton-none')
        expect(overrides.classes()).not.toContain('origam--skeleton-wave')
    })
})

describe('OrigamSkeleton — variants (lot 3 of #1073: card / list-item removed)', () => {
    it('exposes the four primitives and nothing else', () => {
        expect(Object.values(SKELETON_VARIANT).sort()).toEqual(['circular', 'pill', 'rectangular', 'text'])
    })

    it.each(Object.values(SKELETON_VARIANT))('variant="%s" renders ONE block, never a composite wrapper', (variant) => {
        const wrapper = mountSkeleton({variant})

        expect(wrapper.findAll('.origam-skeleton')).toHaveLength(1)
        expect(wrapper.find('.origam-skeleton').classes()).toContain(`origam-skeleton--${variant}`)
        expect(wrapper.find('.origam-skeleton-wrapper').exists()).toBe(false)
        expect(wrapper.find('.origam-skeleton__lines').exists()).toBe(false)
    })
})
