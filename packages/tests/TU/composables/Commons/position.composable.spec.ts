// Tests for `usePosition` composable.
// Pure computed logic — no DOM required.

import { defineComponent, h, reactive } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { IPositionProps } from '@origam/interfaces'

import { usePosition } from '@origam/composables/Commons/position.composable'

// ─── helpers ────────────────────────────────────────────────────────────────

function mountPosition (initial: IPositionProps, name?: string) {
    const props = reactive<IPositionProps>({ ...initial })
    let api!: ReturnType<typeof usePosition>

    const Host = defineComponent({
        name: name ?? 'OrigamPositionHost',
        setup () {
            api = usePosition(props, name ?? 'origam-position-host')
            return () => h('div')
        }
    })

    mount(Host)
    return { props, api: () => api }
}

// ─── positionClasses ─────────────────────────────────────────────────────────

describe('usePosition — positionClasses', () => {
    it('returns undefined when position is not set', () => {
        const { api } = mountPosition({})
        expect(api().positionClasses.value).toBeUndefined()
    })

    it('returns "{name}--{position}" class when position is set', () => {
        const { api } = mountPosition({ position: 'fixed' }, 'origam-app-bar')
        expect(api().positionClasses.value).toBe('origam-app-bar--fixed')
    })

    it('uses the provided name in the class', () => {
        const { api } = mountPosition({ position: 'sticky' }, 'origam-footer')
        expect(api().positionClasses.value).toBe('origam-footer--sticky')
    })

    it('returns reactively when position prop changes', () => {
        const { props, api } = mountPosition({ position: 'fixed' }, 'origam-btn')
        expect(api().positionClasses.value).toBe('origam-btn--fixed')
        props.position = 'sticky'
        expect(api().positionClasses.value).toBe('origam-btn--sticky')
    })

    it('becomes undefined when position is cleared', () => {
        const { props, api } = mountPosition({ position: 'fixed' }, 'origam-btn')
        props.position = undefined
        expect(api().positionClasses.value).toBeUndefined()
    })
})

// ─── positionStyles ──────────────────────────────────────────────────────────

describe('usePosition — positionStyles', () => {
    it('returns empty array when no offset props are set', () => {
        const { api } = mountPosition({})
        expect(api().positionStyles.value).toEqual([])
    })

    it('includes "top: <value>" when top prop is set', () => {
        const { api } = mountPosition({ top: '10px' })
        expect(api().positionStyles.value).toContain('top: 10px')
    })

    it('includes "bottom: <value>" when bottom is set', () => {
        const { api } = mountPosition({ bottom: '20px' })
        expect(api().positionStyles.value).toContain('bottom: 20px')
    })

    it('includes "left: <value>" when left is set', () => {
        const { api } = mountPosition({ left: '5px' })
        expect(api().positionStyles.value).toContain('left: 5px')
    })

    it('includes "right: <value>" when right is set', () => {
        const { api } = mountPosition({ right: '0' })
        expect(api().positionStyles.value).toContain('right: 0')
    })

    it('includes all four offsets when all are set', () => {
        const { api } = mountPosition({ top: '0', bottom: '0', left: '0', right: '0' })
        const styles = api().positionStyles.value
        expect(styles).toContain('top: 0')
        expect(styles).toContain('bottom: 0')
        expect(styles).toContain('left: 0')
        expect(styles).toContain('right: 0')
    })

    it('accepts numeric values', () => {
        const { api } = mountPosition({ top: 10 })
        expect(api().positionStyles.value).toContain('top: 10')
    })

    it('updates reactively when top changes', () => {
        const { props, api } = mountPosition({ top: '5px' })
        expect(api().positionStyles.value).toContain('top: 5px')
        props.top = '50px'
        expect(api().positionStyles.value).toContain('top: 50px')
    })

    it('does NOT include a layer when its value is undefined', () => {
        const { api } = mountPosition({ top: '10px', bottom: undefined })
        const styles = api().positionStyles.value
        expect(styles.some(s => s.startsWith('bottom:'))).toBe(false)
    })
})
