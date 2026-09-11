import { computed, MaybeRef, ref, Ref, unref, watchEffect } from 'vue'
import type { IFiltersProps, IInternalItem } from '../../interfaces'

import type { TFilterKeyFunctions, TFilterMatch } from '../../types'

import { filterItems } from '../../utils'

/*********************************************************
 * useFilter
 ********************************************************/
export function useFilter<T extends IInternalItem> (
    props: IFiltersProps,
    items: MaybeRef<T[]>,
    query: Ref<string | undefined> | (() => string | undefined),
    options?: {
        transform?: (item: T) => Record<string, unknown>
        customKeyFilter?: MaybeRef<TFilterKeyFunctions | undefined>
    }
) {
    const filteredItems: Ref<T[]> = ref([])
    const filteredMatches: Ref<Map<unknown, Record<string, TFilterMatch>>> = ref(new Map())
    const transformedItems = computed(() => (
        options?.transform
            ? unref(items).map(item => ([item, options.transform!(item)] as const))
            : unref(items)
    ))

    watchEffect(() => {
        const _query = typeof query === 'function' ? query() : unref(query)
        const strQuery = (
            typeof _query !== 'string' &&
            typeof _query !== 'number'
        ) ? '' : String(_query)

        const results = filterItems(
            transformedItems.value,
            strQuery,
            {
                customKeyFilter: {
                    ...props.customKeyFilter,
                    ...unref(options?.customKeyFilter)
                },
                default: props.customFilter,
                filterKeys: props.filterKeys,
                filterMode: props.filterMode,
                noFilter: props.noFilter
            }
        )

        const originalItems = unref(items)

        const _filteredItems: typeof filteredItems['value'] = []
        const _filteredMatches: typeof filteredMatches['value'] = new Map()
        results.forEach(({index, matches}) => {
            const item = originalItems[index]
            _filteredItems.push(item)
            _filteredMatches.set(item.value, matches)
        })
        filteredItems.value = _filteredItems
        filteredMatches.value = _filteredMatches
    })

    const getMatches = (item: T) => {
        return filteredMatches.value.get(item.value)
    }

    return {filteredItems, filteredMatches, getMatches}
}
