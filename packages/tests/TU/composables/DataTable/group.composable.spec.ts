// Tests for the DataTable group composable
// (packages/ds/src/composables/DataTable/group.composable.ts):
// createGroupBy / provideGroupBy / useGroupBy.
//
// C5 audit (#classeur composables): flagged `defaut` — zero TU coverage.
// NOT to be confused with `packages/tests/TU/composables/Commons/group.composable.spec.ts`,
// which tests an unrelated `useGroup`/`useGroupItem` pair (radio-style
// selection groups, own provide/inject key) living at
// `packages/ds/src/composables/Commons/group.composable.ts`. Same base
// filename, two different composables — the DataTable one is scoped here.
//
// `createGroupBy` wraps `useVModel`, which calls `getCurrentInstance()` —
// every test therefore mounts a real host component rather than calling the
// factories at module scope, mirroring the sibling
// `pagination.composable.spec.ts` / `sort.composable.spec.ts` pattern in
// this same directory.

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { createGroupBy, provideGroupBy, useGroupBy } from '@origam/composables/DataTable/group.composable'
import type { IDataTableGroup, IDataTableGroupableItem, IDataTableSortItem } from '@origam/interfaces'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mountGroupBy (opts: {
    initialGroupBy?: IDataTableSortItem[]
    initialSortBy?: IDataTableSortItem[]
} = {}) {
    const sortBy = ref<IDataTableSortItem[]>(opts.initialSortBy ?? [])
    let createApi!: ReturnType<typeof createGroupBy>
    let provideApi!: ReturnType<typeof provideGroupBy>

    const Host = defineComponent({
        name: 'GroupByHost',
        props: { groupBy: { type: Array, default: undefined } },
        emits: ['update:groupBy'],
        setup (props) {
            createApi = createGroupBy(props as any)
            provideApi = provideGroupBy({ groupBy: createApi.groupBy, sortBy })
            return () => h('div')
        }
    })

    const wrapper = mount(Host, {
        props: opts.initialGroupBy !== undefined ? { groupBy: opts.initialGroupBy } : {}
    })

    return {
        wrapper,
        sortBy,
        create: () => createApi,
        provide: () => provideApi
    }
}

function makeGroup (id: string, items: IDataTableGroup['items']): IDataTableGroup {
    return { type: 'group', id, key: id, value: id, depth: 0, items }
}

function makeItem (raw: unknown): IDataTableGroupableItem {
    return { type: 'item', raw }
}

// ---------------------------------------------------------------------------
// createGroupBy — v-model seed
// ---------------------------------------------------------------------------

describe('createGroupBy', () => {
    it('defaults to an empty array when the groupBy prop is unset', () => {
        const { create } = mountGroupBy()
        expect(create().groupBy.value).toEqual([])
    })

    it('seeds from the groupBy prop when provided', () => {
        const { create } = mountGroupBy({ initialGroupBy: [{ key: 'category' }] })
        expect(create().groupBy.value).toEqual([{ key: 'category' }])
    })
})

// ---------------------------------------------------------------------------
// provideGroupBy — sortByWithGroups
// ---------------------------------------------------------------------------

describe('provideGroupBy — sortByWithGroups', () => {
    it('prepends groupBy entries (order defaulted to false) ahead of sortBy', () => {
        const { provide } = mountGroupBy({
            initialGroupBy: [{ key: 'category' }],
            initialSortBy: [{ key: 'name', order: 'asc' }]
        })
        expect(provide().sortByWithGroups.value).toEqual([
            { key: 'category', order: false },
            { key: 'name', order: 'asc' }
        ])
    })

    it('preserves an explicit order already set on a group entry', () => {
        const { provide } = mountGroupBy({
            initialGroupBy: [{ key: 'category', order: 'desc' }]
        })
        expect(provide().sortByWithGroups.value).toEqual([{ key: 'category', order: 'desc' }])
    })

    it('reacts when groupBy changes', async () => {
        const { create, provide } = mountGroupBy()
        expect(provide().sortByWithGroups.value).toEqual([])

        create().groupBy.value = [{ key: 'status' }]
        await nextTick()

        expect(provide().sortByWithGroups.value).toEqual([{ key: 'status', order: false }])
    })
})

// ---------------------------------------------------------------------------
// provideGroupBy — toggleGroup / isGroupOpen
// ---------------------------------------------------------------------------

describe('provideGroupBy — toggleGroup / isGroupOpen', () => {
    it('a group starts closed', () => {
        const { provide } = mountGroupBy()
        const group = makeGroup('g1', [])
        expect(provide().isGroupOpen(group)).toBe(false)
    })

    it('toggleGroup opens a closed group', () => {
        const { provide } = mountGroupBy()
        const group = makeGroup('g1', [])
        provide().toggleGroup(group)
        expect(provide().isGroupOpen(group)).toBe(true)
    })

    it('toggleGroup closes an open group', () => {
        const { provide } = mountGroupBy()
        const group = makeGroup('g1', [])
        provide().toggleGroup(group)
        provide().toggleGroup(group)
        expect(provide().isGroupOpen(group)).toBe(false)
    })

    it('toggling one group does not affect another', () => {
        const { provide } = mountGroupBy()
        const g1 = makeGroup('g1', [])
        const g2 = makeGroup('g2', [])
        provide().toggleGroup(g1)
        expect(provide().isGroupOpen(g1)).toBe(true)
        expect(provide().isGroupOpen(g2)).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// provideGroupBy — extractRows
// ---------------------------------------------------------------------------

describe('provideGroupBy — extractRows', () => {
    it('returns a flat array of raw items from a flat (ungrouped) list', () => {
        const { provide } = mountGroupBy()
        const items = [makeItem('a'), makeItem('b')]
        expect(provide().extractRows(items)).toEqual(items)
    })

    it('flattens a single level of nested groups', () => {
        const { provide } = mountGroupBy()
        const items = [makeGroup('g1', [makeItem('a'), makeItem('b')])]
        expect(provide().extractRows(items)).toEqual([makeItem('a'), makeItem('b')])
    })

    it('flattens multiple nested group levels (recursive dive)', () => {
        const { provide } = mountGroupBy()
        const items = [
            makeGroup('g1', [
                makeGroup('g1-a', [makeItem('a')]),
                makeItem('b')
            ]),
            makeItem('c')
        ]
        expect(provide().extractRows(items)).toEqual([makeItem('a'), makeItem('b'), makeItem('c')])
    })

    it('returns an empty array for an empty list', () => {
        const { provide } = mountGroupBy()
        expect(provide().extractRows([])).toEqual([])
    })
})

// ---------------------------------------------------------------------------
// useGroupBy — injection round-trip / missing-context guard
// ---------------------------------------------------------------------------

describe('useGroupBy', () => {
    it('a descendant reads back the same API instance provideGroupBy exposed', () => {
        let injected: ReturnType<typeof useGroupBy> | undefined

        const Child = defineComponent({
            name: 'GroupByChild',
            setup () {
                injected = useGroupBy()
                return () => h('div')
            }
        })

        const sortBy = ref<IDataTableSortItem[]>([])
        const Parent = defineComponent({
            name: 'GroupByParent',
            setup () {
                const groupBy = ref<IDataTableSortItem[]>([{ key: 'category' }])
                provideGroupBy({ groupBy, sortBy })
                return () => h(Child)
            }
        })

        mount(Parent)

        expect(injected).toBeDefined()
        expect(injected!.groupBy.value).toEqual([{ key: 'category' }])
    })

    it('throws "Missing group!" when no ancestor called provideGroupBy', () => {
        let threw = false

        const Orphan = defineComponent({
            name: 'GroupByOrphan',
            setup () {
                try {
                    useGroupBy()
                } catch {
                    threw = true
                }
                return () => h('div')
            }
        })

        mount(Orphan)
        expect(threw).toBe(true)
    })
})
