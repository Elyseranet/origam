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

import {
    LAYOUT_DEFAULT_OFFSET,
    LAYOUT_ITEM_HIDDEN_OFFSET,
    LAYOUT_ITEM_ZINDEX_STEP,
    LAYOUT_OVERLAP_SEPARATOR,
    LAYOUT_SCRIM_ZINDEX_OFFSET,
    ORIGAM_LAYOUT_KEY,
    ROOT_ZINDEX
} from '@origam/consts/Commons/layout.const'

import { useLayout } from '@origam/composables/Commons/layout.composable'
import { useLayoutItem } from '@origam/composables/Commons/layoutItem.composable'
import { useCreateLayout } from '@origam/composables/Commons/createLayout.composable'

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
        expect(api().layoutId.value).toMatch(/^layout-.+$/)
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

    it('reserved-space custom properties default to LAYOUT_DEFAULT_OFFSET with no item registered', () => {
        const { api } = mountLayout()
        const styles = (api().layoutStyles as unknown as { value: Record<string, unknown> }).value
        expect(styles['--origam-layout---position-left']).toBe(LAYOUT_DEFAULT_OFFSET)
        expect(styles['--origam-layout---position-right']).toBe(LAYOUT_DEFAULT_OFFSET)
        expect(styles['--origam-layout---position-top']).toBe(LAYOUT_DEFAULT_OFFSET)
        expect(styles['--origam-layout---position-bottom']).toBe(LAYOUT_DEFAULT_OFFSET)
    })
})

// ─── useCreateLayout — registered item (stacking + offsets) ──────────────────
//
// The describes above never register a real item, so the whole
// `register()` closure — z-index ladder, scrim offset, off-screen
// transform, overlaps parsing — was uncovered. These constants now live in
// consts/Commons/layout.const.ts; the tests below pin their effect on the
// emitted styles.

describe('useCreateLayout — registered layout item', () => {
    function mountWithItems (
        layoutProps: Parameters<typeof useCreateLayout>[0] = {},
        items: Array<{ id: string; position: 'top' | 'bottom' | 'left' | 'right'; order: number; size: number; active?: boolean }> = []
    ) {
        const apis: Record<string, ReturnType<typeof useLayoutItem>> = {}

        const Inner = defineComponent({
            name: 'OrigamLayoutItemRegistered',
            setup () {
                for (const item of items) {
                    apis[item.id] = useLayoutItem({
                        id: item.id,
                        order: ref(item.order),
                        position: ref(item.position),
                        layoutSize: ref(item.size),
                        elementSize: ref(item.size),
                        active: ref(item.active ?? true),
                        absolute: ref(false)
                    })
                }
                return () => h('div')
            }
        })
        const Outer = defineComponent({
            name: 'OrigamCreateLayoutRoot',
            setup () {
                useCreateLayout(layoutProps)
                return () => h(Inner)
            }
        })

        mount(Outer)
        return { apis }
    }

    function stylesOf (api: ReturnType<typeof useLayoutItem>) {
        return api.layoutItemStyles.value as Record<string, unknown>
    }

    // The assertions below express the emitted styles in terms of the
    // constants, which guards the composable/const wiring but not the
    // values themselves — hence this explicit pin.
    it('layout constants hold their historical values', () => {
        expect(ROOT_ZINDEX).toBe(1000)
        expect(LAYOUT_ITEM_ZINDEX_STEP).toBe(2)
        expect(LAYOUT_SCRIM_ZINDEX_OFFSET).toBe(1)
        expect(LAYOUT_ITEM_HIDDEN_OFFSET).toBe(-110)
        expect(LAYOUT_OVERLAP_SEPARATOR).toBe(':')
        expect(LAYOUT_DEFAULT_OFFSET).toBe('0px')
    })

    it('item z-index sits above ROOT_ZINDEX on the LAYOUT_ITEM_ZINDEX_STEP ladder', () => {
        const { apis } = mountWithItems({}, [{ id: 'drawer', position: 'left', order: 0, size: 240 }])
        const zIndex = stylesOf(apis.drawer)['z-index'] as number

        expect(typeof zIndex).toBe('number')
        expect(zIndex).toBeGreaterThan(ROOT_ZINDEX)
        expect((zIndex - ROOT_ZINDEX) % LAYOUT_ITEM_ZINDEX_STEP).toBe(0)
    })

    it('scrim sits exactly LAYOUT_SCRIM_ZINDEX_OFFSET below its own item', () => {
        const { apis } = mountWithItems({}, [{ id: 'drawer', position: 'left', order: 0, size: 240 }])
        const zIndex = stylesOf(apis.drawer)['z-index'] as number
        const scrimZIndex = (apis.drawer.layoutItemScrimStyles.value as Record<string, unknown>)['z-index'] as number

        expect(scrimZIndex).toBe(zIndex - LAYOUT_SCRIM_ZINDEX_OFFSET)
    })

    it('two items on the same side are separated by LAYOUT_ITEM_ZINDEX_STEP', () => {
        const { apis } = mountWithItems({}, [
            { id: 'first', position: 'left', order: 0, size: 240 },
            { id: 'second', position: 'left', order: 1, size: 100 }
        ])
        const first = stylesOf(apis.first)['z-index'] as number
        const second = stylesOf(apis.second)['z-index'] as number

        expect(Math.abs(first - second)).toBe(LAYOUT_ITEM_ZINDEX_STEP)
    })

    it('an ACTIVE item is not translated off screen', () => {
        const { apis } = mountWithItems({}, [{ id: 'drawer', position: 'left', order: 0, size: 240, active: true }])
        expect(stylesOf(apis.drawer).transform).toBe('translateX(0%)')
    })

    it('an INACTIVE item is pushed off screen by LAYOUT_ITEM_HIDDEN_OFFSET', () => {
        const { apis } = mountWithItems({}, [{ id: 'drawer', position: 'left', order: 0, size: 240, active: false }])
        expect(stylesOf(apis.drawer).transform).toBe(`translateX(${LAYOUT_ITEM_HIDDEN_OFFSET}%)`)
    })

    it('an INACTIVE item on the opposite side is pushed the other way', () => {
        const { apis } = mountWithItems({}, [{ id: 'drawer', position: 'right', order: 0, size: 240, active: false }])
        expect(stylesOf(apis.drawer).transform).toBe(`translateX(${-LAYOUT_ITEM_HIDDEN_OFFSET}%)`)
    })

    it('a vertical item translates on the Y axis', () => {
        const { apis } = mountWithItems({}, [{ id: 'bar', position: 'top', order: 0, size: 64, active: false }])
        expect(stylesOf(apis.bar).transform).toBe(`translateY(${LAYOUT_ITEM_HIDDEN_OFFSET}%)`)
    })

    it('an overlaps entry joined by LAYOUT_OVERLAP_SEPARATOR shifts the overlapped item', () => {
        const items: Parameters<typeof mountWithItems>[1] = [
            { id: 'bar', position: 'top', order: 0, size: 64 },
            { id: 'drawer', position: 'left', order: 1, size: 240 }
        ]
        const withoutOverlap = mountWithItems({}, items)
        const withOverlap = mountWithItems(
            { overlaps: [`bar${LAYOUT_OVERLAP_SEPARATOR}drawer`] },
            items
        )

        expect(stylesOf(withOverlap.apis.drawer).top).not.toBe(stylesOf(withoutOverlap.apis.drawer).top)
    })

    it('an overlaps entry WITHOUT the separator is ignored', () => {
        const items: Parameters<typeof mountWithItems>[1] = [
            { id: 'bar', position: 'top', order: 0, size: 64 },
            { id: 'drawer', position: 'left', order: 1, size: 240 }
        ]
        const withoutOverlap = mountWithItems({}, items)
        const malformed = mountWithItems({ overlaps: ['bar-drawer'] }, items)

        expect(stylesOf(malformed.apis.drawer).top).toBe(stylesOf(withoutOverlap.apis.drawer).top)
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
