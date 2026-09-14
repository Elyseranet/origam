// Tests for `useGroupedItems`
// (packages/ds/src/composables/DataTable/groupedItems.composable.ts).
//
// C5 audit (#classeur composables): flagged `defaut` — zero TU coverage.
//
// `useGroupedItems` is a pure computed wrapper around two already-tested
// utils (`groupItems` / `flattenItems`, see
// packages/tests/TU/utils/DataTable/group.util.spec.ts) — no
// `getCurrentInstance()` anywhere in it, no provide/inject, so these specs
// call it directly without mounting a component. What is specific to THIS
// composable (and therefore what these specs assert, rather than
// re-deriving the util behaviour) is the wiring: passthrough when `groupBy`
// is empty, and full reactivity to `items` / `groupBy` / `opened` ref
// changes.

import { computed, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useGroupedItems } from '@origam/composables/DataTable/groupedItems.composable'
import type { IDataTableGroupableItem, IDataTableSortItem } from '@origam/interfaces'

interface Row extends IDataTableGroupableItem<{ category: string; name: string }> {
    type: 'item'
    raw: { category: string; name: string }
}

function makeRow (category: string, name: string): Row {
    return { type: 'item', raw: { category, name } }
}

// ---------------------------------------------------------------------------
// Passthrough — no groupBy
// ---------------------------------------------------------------------------

describe('useGroupedItems — passthrough when groupBy is empty', () => {
    it('flatItems equals items unchanged (identity) when groupBy has no entries', () => {
        const rows = [makeRow('fruit', 'Apple'), makeRow('veg', 'Carrot')]
        const items = computed(() => rows)
        const groupBy = ref<IDataTableSortItem[]>([])
        const opened = ref(new Set<string>())

        const { flatItems } = useGroupedItems(items, groupBy, opened)

        expect(flatItems.value).toBe(rows)
    })
})

// ---------------------------------------------------------------------------
// Grouping — groups render as closed headers by default
// ---------------------------------------------------------------------------

describe('useGroupedItems — grouping with a groupBy key', () => {
    it('produces one group header per distinct value, items hidden while closed', () => {
        const rows = [makeRow('fruit', 'Apple'), makeRow('veg', 'Carrot'), makeRow('fruit', 'Banana')]
        const items = computed(() => rows)
        const groupBy = ref<IDataTableSortItem[]>([{ key: 'category' }])
        const opened = ref(new Set<string>())

        const { flatItems } = useGroupedItems(items, groupBy, opened)

        // Two group headers (fruit, veg), zero items — nothing opened yet.
        const headers = flatItems.value.filter((i) => 'type' in i && i.type === 'group')
        const leaves = flatItems.value.filter((i) => !('type' in i) || i.type !== 'group')
        expect(headers).toHaveLength(2)
        expect(leaves).toHaveLength(0)
    })

    it('reveals a group\'s items once its id is added to `opened`', () => {
        const rows = [makeRow('fruit', 'Apple'), makeRow('fruit', 'Banana')]
        const items = computed(() => rows)
        const groupBy = ref<IDataTableSortItem[]>([{ key: 'category' }])
        const opened = ref(new Set<string>())

        const { flatItems } = useGroupedItems(items, groupBy, opened)
        const header = flatItems.value.find((i) => 'type' in i && i.type === 'group')
        expect(header).toBeDefined()

        opened.value = new Set([(header as any).id])

        const leaves = flatItems.value.filter((i) => !('type' in i) || i.type !== 'group')
        expect(leaves).toHaveLength(2)
    })
})

// ---------------------------------------------------------------------------
// Reactivity
// ---------------------------------------------------------------------------

describe('useGroupedItems — reactivity', () => {
    it('re-derives when groupBy switches from empty to a key', async () => {
        const rows = [makeRow('fruit', 'Apple'), makeRow('veg', 'Carrot')]
        const items = computed(() => rows)
        const groupBy = ref<IDataTableSortItem[]>([])
        const opened = ref(new Set<string>())

        const { flatItems } = useGroupedItems(items, groupBy, opened)
        expect(flatItems.value).toBe(rows)

        groupBy.value = [{ key: 'category' }]
        await nextTick()

        const headers = flatItems.value.filter((i) => 'type' in i && i.type === 'group')
        expect(headers).toHaveLength(2)
    })

    it('re-derives when the underlying items list changes', async () => {
        const rowsRef = ref([makeRow('fruit', 'Apple')])
        const items = computed(() => rowsRef.value)
        const groupBy = ref<IDataTableSortItem[]>([{ key: 'category' }])
        const opened = ref(new Set<string>())

        const { flatItems } = useGroupedItems(items, groupBy, opened)
        expect(flatItems.value.filter((i) => 'type' in i && i.type === 'group')).toHaveLength(1)

        rowsRef.value = [makeRow('fruit', 'Apple'), makeRow('veg', 'Carrot')]
        await nextTick()

        expect(flatItems.value.filter((i) => 'type' in i && i.type === 'group')).toHaveLength(2)
    })
})
