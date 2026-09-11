// Tests for the classes-first refactor of `useElevation`.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IElevationProps } from '@origam/interfaces'

import { useElevation } from '@origam/composables/Commons/elevation.composable'

function mountWith (initial: IElevationProps['elevation']) {
    const props = reactive<IElevationProps>({ elevation: initial })
    let api!: ReturnType<typeof useElevation>

    const Host = defineComponent({
        name: 'OrigamElevationHost',
        setup () {
            api = useElevation(props)
            return () => h('div')
        }
    })

    mount(Host)
    return { props, api: () => api }
}

describe('useElevation — classes-first', () => {
    it('utility rung "md" → emits origam--shadow-md class AND token style', () => {
        const { api } = mountWith('md')
        expect(api().elevationClasses.value).toContain('origam--shadow-md')
        expect(api().elevationStyles.value).toContain('box-shadow: var(--origam-shadow---md)')
    })

    it.each(['none', 'xs', 'sm', 'md', 'lg', 'xl'])('utility rung %s → utility class', (rung) => {
        const { api } = mountWith(rung)
        expect(api().elevationClasses.value).toContain(`origam--shadow-${rung}`)
    })

    it('non-utility rung "2xl" → no utility class, inline style still emitted', () => {
        const { api } = mountWith('2xl')
        const cls = api().elevationClasses.value
        expect(cls.some(c => /^origam--shadow-/.test(c))).toBe(false)
        expect(api().elevationStyles.value).toContain('box-shadow: var(--origam-shadow---2xl)')
    })

    it('Material number 8 → maps to "md" rung utility', () => {
        const { api } = mountWith(8)
        expect(api().elevationClasses.value).toContain('origam--shadow-md')
    })

    it('elevation undefined → no class, no style', () => {
        const { api } = mountWith(undefined)
        expect(api().elevationClasses.value).toEqual([])
        expect(api().elevationStyles.value).toEqual([])
    })

    it('elevated marker class still present alongside utility', () => {
        const { api } = mountWith('lg')
        const cls = api().elevationClasses.value
        expect(cls.some(c => /--elevated$/.test(c))).toBe(true)
        expect(cls).toContain('origam--shadow-lg')
    })
})

describe('useElevation — custom box-shadow passthrough', () => {
    it('custom shadow string → emits verbatim box-shadow style', () => {
        const { api } = mountWith('0 4px 12px rgba(0,0,0,.24)')
        expect(api().elevationStyles.value).toEqual(['box-shadow: 0 4px 12px rgba(0,0,0,.24)'])
    })

    it('custom shadow string → does NOT silently drop to no shadow (regression guard)', () => {
        // Before the fix, `parseInt('0 4px 12px rgba(...)', 10)` read the
        // leading `0` and resolved to the `none` rung — no shadow at all.
        const { api } = mountWith('0 4px 12px rgba(0,0,0,.24)')
        expect(api().elevationStyles.value).not.toEqual([])
        expect(api().elevationStyles.value.some(s => s.includes('shadow---none'))).toBe(false)
    })

    it('custom shadow string → elevated marker class present, no wrong utility class', () => {
        const { api } = mountWith('0 4px 12px rgba(0,0,0,.24)')
        const cls = api().elevationClasses.value
        expect(cls.some(c => /--elevated$/.test(c))).toBe(true)
        expect(cls.some(c => /^origam--shadow-/.test(c))).toBe(false)
    })

    it('custom var(...) reference → emits verbatim box-shadow style', () => {
        const { api } = mountWith('var(--origam-shadow---card)')
        expect(api().elevationStyles.value).toEqual(['box-shadow: var(--origam-shadow---card)'])
    })

    it('custom calc(...) expression → emits verbatim box-shadow style', () => {
        const { api } = mountWith('0 calc(2px + 1px) 8px #000')
        expect(api().elevationStyles.value).toEqual(['box-shadow: 0 calc(2px + 1px) 8px #000'])
    })

    it('inset custom shadow → emits verbatim box-shadow style', () => {
        const { api } = mountWith('inset 0 0 0 2px #fff')
        expect(api().elevationStyles.value).toEqual(['box-shadow: inset 0 0 0 2px #fff'])
    })

    it('multiple comma-separated custom shadow layers → emits verbatim box-shadow style', () => {
        const { api } = mountWith('0 1px 2px #000, 0 2px 8px #000')
        expect(api().elevationStyles.value).toEqual(['box-shadow: 0 1px 2px #000, 0 2px 8px #000'])
    })

    it('leading/trailing whitespace on a custom shadow is trimmed', () => {
        const { api } = mountWith('  0 4px 12px rgba(0,0,0,.24)  ')
        expect(api().elevationStyles.value).toEqual(['box-shadow: 0 4px 12px rgba(0,0,0,.24)'])
    })

    it.each(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'])('named rung "%s" is unaffected by the custom passthrough', (rung) => {
        const { api } = mountWith(rung)
        expect(api().elevationStyles.value).toEqual([`box-shadow: var(--origam-shadow---${rung})`])
    })

    it.each([0, 1, 3, 8, 16, 24])('Material number %i is unaffected by the custom passthrough', (level) => {
        const { api } = mountWith(level)
        expect(api().elevationStyles.value[0]).toMatch(/^box-shadow: var\(--origam-shadow---\w+\)$/)
    })

    it('empty string elevation → no style (unchanged pre-existing behaviour)', () => {
        const { api } = mountWith('')
        expect(api().elevationStyles.value).toEqual([])
    })

    it('plain gibberish string (no unit/color/function signal) → no style (unchanged pre-existing behaviour)', () => {
        const { api } = mountWith('not-a-shadow')
        expect(api().elevationStyles.value).toEqual([])
    })
})
