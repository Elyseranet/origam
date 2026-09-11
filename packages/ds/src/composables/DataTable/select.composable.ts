import { useVModel } from '../../composables'

import { allSelectStrategy, ORIGAM_DATA_TABLE_SELECT_KEY, pageSelectStrategy, singleSelectStrategy } from '../../consts'

import { DATATABLE_SELECT_STRATEGY } from '../../enums'

import type { IDataTableProvideSelection, IDataTableSelectableItem, IDataTableSelectProps } from '../../interfaces'

import { deepEqual, wrapInArray } from '../../utils'

import { computed, inject, provide, Ref } from 'vue'

/*********************************************************
 * provideSelection
 ********************************************************/
export function provideSelection (
    props: IDataTableSelectProps,
    {allItems, currentPage}: {
        allItems: Ref<Array<IDataTableSelectableItem>>,
        currentPage: Ref<Array<IDataTableSelectableItem>>
    }
): IDataTableProvideSelection {
    const valueComparator = computed(() => {
        return props.valueComparator ?? deepEqual
    })
    const allSelectable = computed(() => allItems.value.filter(item => item.selectable))
    const currentPageSelectable = computed(() => currentPage.value.filter(item => item.selectable))
    const selectStrategy = computed(() => {
        if (typeof props.selectStrategy === 'object') return props.selectStrategy

        switch (props.selectStrategy) {
            case DATATABLE_SELECT_STRATEGY.SINGLE:
                return singleSelectStrategy
            case DATATABLE_SELECT_STRATEGY.ALL:
                return allSelectStrategy
            case DATATABLE_SELECT_STRATEGY.PAGE:
            default:
                return pageSelectStrategy
        }
    })

    const selected = useVModel(props, 'modelValue', props.modelValue, (v) => {
        return new Set(wrapInArray(v).map(v => {
            return allItems.value.find((item) => valueComparator.value(v, item.value))?.value ?? v
        }))
    }, (v) => {
        return [...v.values()]
    })

    const isSelected = (items: IDataTableSelectableItem | Array<IDataTableSelectableItem>): boolean => {
        return wrapInArray(items).every(item => selected.value.has(item.value))
    }
    const isSomeSelected = (items: IDataTableSelectableItem | Array<IDataTableSelectableItem>): boolean => {
        return wrapInArray(items).some(item => selected.value.has(item.value))
    }
    const select = (items: Array<IDataTableSelectableItem>, value: boolean) => {
        const newSelected = selectStrategy.value.select({
            items,
            value,
            selected: new Set(selected.value)
        })

        selected.value = newSelected
    }
    const toggleSelect = (item: IDataTableSelectableItem) => {
        select([item], !isSelected([item]))
    }
    const selectAll = (value: boolean) => {
        const newSelected = selectStrategy.value.selectAll({
            value,
            allItems: allSelectable.value,
            currentPage: currentPageSelectable.value,
            selected: new Set(selected.value)
        })

        selected.value = newSelected
    }

    const someSelected = computed(() => {
        return selected.value.size > 0
    })
    const allSelected = computed(() => {
        const items = selectStrategy.value.allSelected({
            allItems: allSelectable.value,
            currentPage: currentPageSelectable.value
        })
        return !!items.length && isSelected(items)
    })
    const showSelectAll = computed(() => {
        return selectStrategy.value.showSelectAll
    })

    const data = {
        toggleSelect,
        select,
        selectAll,
        isSelected,
        isSomeSelected,
        someSelected,
        allSelected,
        showSelectAll
    }

    provide(ORIGAM_DATA_TABLE_SELECT_KEY, data)

    return data
}

/*********************************************************
 * useSelection
 ********************************************************/
export function useSelection () {
    const data = inject(ORIGAM_DATA_TABLE_SELECT_KEY)

    if (!data) throw new Error('Missing selection!')

    return data
}
