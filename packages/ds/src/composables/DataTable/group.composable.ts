import type { Ref } from 'vue'
import { computed, inject, provide, ref } from 'vue'
import { useVModel } from '../../composables'
import { ORIGAM_DATA_TABLE_GROUP_KEY } from '../../consts'
import type {
    IDataTableGroup,
    IDataTableGroupableItem,
    IDataTableGroupProps,
    IDataTableProvideGroup,
    IDataTableSortItem
} from '../../interfaces'

/*********************************************************
 * createGroupBy
 *
 * @description
 * Reads the `groupBy` prop into the v-model ref `provideGroupBy`
 * expects. Kept alongside `useGroupBy` / `provideGroupBy` in this file
 * — all three address the same `ORIGAM_DATA_TABLE_GROUP_KEY` contract.
 * `useGroupedItems` (own file) is the pure item-grouping sibling and
 * does not depend on any of the three.
 ********************************************************/
export function createGroupBy (props: IDataTableGroupProps) {
    const groupBy = useVModel(props, 'groupBy', [])

    return {groupBy}
}

/*********************************************************
 * provideGroupBy
 *
 * @description
 * Provider-side hook: derives `sortByWithGroups` plus the
 * `toggleGroup` / `isGroupOpen` / `extractRows` helpers, and provides
 * `ORIGAM_DATA_TABLE_GROUP_KEY` for `useGroupBy` consumers down the
 * tree.
 ********************************************************/
export function provideGroupBy (options: {
    groupBy: Ref<Array<IDataTableSortItem>>,
    sortBy: Ref<Array<IDataTableSortItem>>
}): IDataTableProvideGroup {
    const {groupBy, sortBy} = options
    const opened = ref(new Set<string>())

    const sortByWithGroups = computed(() => {
        return groupBy.value.map<IDataTableSortItem>(val => ({
            ...val,
            order: val.order ?? false
        })).concat(sortBy.value)
    })

    const isGroupOpen = (group: IDataTableGroup) => {
        return opened.value.has(group.id)
    }
    const toggleGroup = (group: IDataTableGroup) => {
        const newOpened = new Set(opened.value)
        if (!isGroupOpen(group)) newOpened.add(group.id)
        else newOpened.delete(group.id)

        opened.value = newOpened
    }
    const extractRows = <T extends IDataTableGroupableItem> (items: (T | IDataTableGroup<T>)[]) => {
        const dive = (group: IDataTableGroup<T>): T[] => {
            const arr = []

            for (const item of group.items) {
                if ('type' in item && item.type === 'group') {
                    arr.push(...dive(item))
                } else {
                    arr.push(item as T)
                }
            }

            return arr
        }

        return dive({type: 'group', items, id: 'dummy', key: 'dummy', value: 'dummy', depth: 0})
    }

    const data = {sortByWithGroups, toggleGroup, opened, groupBy, extractRows, isGroupOpen}

    provide(ORIGAM_DATA_TABLE_GROUP_KEY, data)

    return data
}

/*********************************************************
 * useGroupBy
 *
 * @description
 * Reads the injected group state provided by `provideGroupBy`.
 * Independent from `useGroupedItems` (own file) — that hook groups a
 * plain items array and never touches this injection.
 ********************************************************/
export function useGroupBy () {
    const data = inject(ORIGAM_DATA_TABLE_GROUP_KEY)

    if (!data) throw new Error('Missing group!')

    return data
}
