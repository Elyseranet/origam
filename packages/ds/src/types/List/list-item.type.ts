import OrigamListItem from '../../components/List/OrigamListItem.vue'
import { LIST_ITEM_TYPE } from '../../enums/List/list-item.enum'

export type TListItemType = `${LIST_ITEM_TYPE}`

export type TListItemSlot = {
    isActive: boolean
    isSelected: boolean
    isIndeterminate: boolean
    select: (value: boolean) => void
}

export type TOrigamListItem = InstanceType<typeof OrigamListItem>
