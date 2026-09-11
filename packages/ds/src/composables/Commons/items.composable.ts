import { computed } from 'vue'
import type { IInternalListItem, IItemProps } from '../../interfaces'

import { deepEqual, transformListItem, transformListItems } from '../../utils'

/*********************************************************
 * useItems
 ********************************************************/
export function useItems (props: IItemProps & { itemType?: string }) {
    const items = computed(() => {
        if (props.items) {
            return transformListItems(props, props.items)
        }

        return []
    })
    const hasNullItem = computed(() => {
        return items.value.some((item) => {
            return item.value === null
        })
    })
    const valueComparator = computed(() => {
        return props.valueComparator ? props.valueComparator : deepEqual
    })

    const transformIn = (value: any[]): IInternalListItem[] => {
        if (!hasNullItem.value) {
            // When the model value is null, return an InternalItem
            // based on null only if null is one of the items
            value = value.filter(v => v !== null)
        }

        return value.map((v) => {
            if (props.returnObject && typeof v === 'string') {
                // String model value means value is a custom input value from combobox
                // Don't look up existing items if the model value is a string
                return transformListItem(props, v)
            }

            return items.value.find((item) => {
                return valueComparator.value(v, item.value)
            }) || transformListItem(props, v)
        }) as IInternalListItem[]
    }

    const transformOut = (value: IInternalListItem[]): any[] => {
        return props.returnObject
            ? value.map(({raw}) => raw)
            : value.map(({value}) => value)
    }

    return {items, transformIn, transformOut}
}
