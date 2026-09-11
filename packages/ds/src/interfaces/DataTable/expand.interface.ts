import type { Ref } from 'vue'
import type { IDataTableItem } from './items.interface'
import type { TVModel } from '../../types/Commons/v-model.type'

export interface IDataTableExpandProps {
    expandOnClick?: boolean
    showExpand?: boolean
    expanded?: Array<string>
}

export interface IDataTableProvideExpanded {
    expand: (item: IDataTableItem, value: boolean) => void
    expanded: TVModel<IDataTableExpandProps, 'expanded', Set<string>>
    expandOnClick: Ref<boolean | undefined>
    isExpanded: (item: IDataTableItem) => boolean
    toggleExpand: (item: IDataTableItem) => void
}
