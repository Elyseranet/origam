import type { InjectionKey, Ref } from 'vue'
import type { IDataTableItem } from '../../interfaces'

export const ORIGAM_DATA_TABLE_EXPAND_KEY: InjectionKey<{
    expand: (item: IDataTableItem, value: boolean) => void
    expanded: Ref<Set<string>>
    expandOnClick: Ref<boolean | undefined>
    isExpanded: (item: IDataTableItem) => boolean
    toggleExpand: (item: IDataTableItem) => void
}> = Symbol.for('origam:data-table-expand')
