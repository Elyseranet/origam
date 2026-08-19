import type { ComputedRef, Ref } from 'vue'
import { computed } from 'vue'
import type { IDataTableGroupableItem, IDataTableSortItem } from '../../interfaces'
import { flattenItems, groupItems } from '../../utils'

/*********************************************************
 * useGroupedItems
 *
 * @description
 * Pure item-grouping hook: builds the grouped tree (via `groupItems`)
 * and flattens it back to a display list honouring `opened` groups.
 * Independent from `useGroupBy` / `provideGroupBy` / `createGroupBy`
 * (own file) — it consumes `groupBy` / `opened` refs as plain
 * arguments, never the `ORIGAM_DATA_TABLE_GROUP_KEY` injection those
 * manage.
 ********************************************************/
export function useGroupedItems<T extends IDataTableGroupableItem> (
    items: ComputedRef<Array<T>>,
    groupBy: Ref<Array<IDataTableSortItem>>,
    opened: Ref<Set<string>>
) {
    const flatItems = computed(() => {
        if (!groupBy.value.length) return items.value

        const groupedItems = groupItems(items.value, groupBy.value.map(item => item.key))

        return flattenItems(groupedItems, opened.value)
    })

    return {flatItems}
}
