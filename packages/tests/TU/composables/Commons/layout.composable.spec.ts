// Tests for `useLayout`, `useLayoutItem`, and `useCreateLayout` composables.
//
// Strategy:
//   - `useLayout` requires ORIGAM_LAYOUT_KEY provided — tested via
//     useCreateLayout (which is the only producer of that key).
//   - `useLayoutItem` without a parent layout falls back to inert styles
//     (no throw) — that orphan path is the critical regression guard from
//     the "crash in stories/modal" incident.
//   - `useCreateLayout` is tested for its public API shape, layering logic
//     and mainRect / mainStyles defaults without mounting real layout trees.

import { defineComponent, h, nextTick, provide, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { ORIGAM_LAYOUT_KEY } from '@origam/consts/Commons/layout.const'

import { useCreateLayout, useLayout, useLayoutItem } from '@origam/composables/Commons/layout.composable'

// ─── useLayout — missing provider ───────────────────────────────────────────

describe('useLayout — missing injection', () => {
    it('throws inside setup when ORIGAM_LAYOUT_KEY is not provided', () => {
        // Vue traps component errors in warnings in test mode — mount() does not
        // re-throw them. We catch directly inside setup.
        let threwInSetup = false
        const Host = defineComponent({
            name: 'OrigamLayoutNoProvider',
            setup () {
                try {
                    useLayout()
                } catch (e) {
                    threwInSetup = e instanceof Error
                }
                return () => h('div')
            }
        })
        mount(Host)
        expect(threwInSetup).toBe(true)
    })
})

// ─── useLayoutItem — orphan (no parent layout) ────────────────────────────────

describe('useLayoutItem — orphan mode (no parent layout provider)', () => {
    function mountOrphan () {
        let api!: ReturnType<typeof useLayoutItem>
        const Host = defineComponent({
            name: 'OrigamLayoutItemOrphan',
            setup () {
                api = useLayoutItem({
                    id: 'test-item',
                    order: ref(0),
                    position: ref('top' as const),
                    layoutSize: ref(64),
                    elementSize: ref(64),
                    active: ref(true),
                    absolute: ref(false)
                })
                return () => h('div')
            }
        })
        mount(Host)
        return { api: () => api }
    }

    it('does not throw when no layout is provided', () => {
        expect(() => mountOrphan()).not.toThrow()
    })

    it('layoutItemStyles is an empty CSSProperties object in orphan mode', () => {
        const { api } = mountOrphan()
        expect(api().layoutItemStyles.value).toEqual({})
    })

    it('layoutItemScrimStyles is an empty object in orphan mode', () => {
        const { api } = mountOrphan()
        expect(api().layoutItemScrimStyles.value).toEqual({})
    })

    it('layoutId is the orphan fallback string', () => {
        const { api } = mountOrphan()
        expect(api().layoutId).toBe('origam-layout-orphan')
    })
})

// ─── useCreateLayout — API shape ─────────────────────────────────────────────

describe('useCreateLayout — API shape', () => {
    function mountLayout (props: Parameters<typeof useCreateLayout>[0] = {}) {
        let api!: ReturnType<typeof useCreateLayout>
        const Host = defineComponent({
            name: 'OrigamCreateLayoutHost',
            setup () {
                api = useCreateLayout(props)
                return () => h('div')
            }
        })
        mount(Host)
        return { api: () => api }
    }

    it('returns layoutClasses, layoutStyles, items, layoutId, layoutRef', () => {
        const { api } = mountLayout()
        const keys = Object.keys(api())
        expect(keys).toContain('layoutClasses')
        expect(keys).toContain('layoutStyles')
        expect(keys).toContain('items')
        expect(keys).toContain('layoutId')
        expect(keys).toContain('layoutRef')
    })

    it('layoutClasses includes "origam-layout"', () => {
        const { api } = mountLayout()
        const cls = api().layoutClasses.value
        // It can be an array of strings/objects
        const flat = JSON.stringify(cls)
        expect(flat).toContain('origam-layout')
    })

    it('fullHeight=true adds "origam-layout--full-height" to layoutClasses', () => {
        const { api } = mountLayout({ fullHeight: true })
        const flat = JSON.stringify(api().layoutClasses.value)
        expect(flat).toContain('origam-layout--full-height')
    })

    it('items starts as an empty array (no registered items)', () => {
        const { api } = mountLayout()
        expect(api().items.value).toEqual([])
    })

    it('layoutId defaults to "layout-{uid}"', () => {
        const { api } = mountLayout()
        expect(api().layoutId.value).toMatch(/^layout-\d+$/)
    })

    it('custom id prop is used as layoutId', () => {
        const { api } = mountLayout({ id: 'my-layout' })
        expect(api().layoutId.value).toBe('my-layout')
    })

    it('mainStyles (layoutStyles) contains CSS custom properties for layout positions', () => {
        const { api } = mountLayout()
        // layoutStyles is a ComputedRef<StyleValue> — access .value to get the actual object
        const styles = (api().layoutStyles as unknown as { value: Record<string, unknown> }).value
            ?? (api().layoutStyles as unknown as Record<string, unknown>)
        expect(styles).toHaveProperty('--origam-layout---position-left')
    })
})

// ─── useLayout — via provider ─────────────────────────────────────────────────

describe('useLayout — via useCreateLayout provider', () => {
    it('getLayoutItem returns the layout API when injected', () => {
        let layoutApi!: ReturnType<typeof useLayout>
        const Inner = defineComponent({
            name: 'OrigamLayoutInner',
            setup () {
                layoutApi = useLayout()
                return () => h('div')
            }
        })
        const Outer = defineComponent({
            name: 'OrigamLayoutOuter',
            setup () {
                useCreateLayout({})
                return () => h(Inner)
            }
        })
        mount(Outer)
        expect(typeof layoutApi.getLayoutItem).toBe('function')
        expect(layoutApi.mainRect).toBeDefined()
        expect(layoutApi.mainStyles).toBeDefined()
    })
})
