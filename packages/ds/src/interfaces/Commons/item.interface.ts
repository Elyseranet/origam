import type { TSelectItemKey } from '../../types'

import { deepEqual } from '../../utils'

/*********************************************************
 * IItemProps
 *
 * @description
 * Data-source mixin shared by every component that turns a raw array
 * into selectable rows: `<OrigamList>`, `<OrigamSelect>`, and
 * `<OrigamMenu>` all `extends IItemProps` (List and Select via their
 * own props interface, Menu by consuming it directly in
 * `OrigamMenu.vue`). Genuinely transverse — issue #364 relocated it
 * here from `interfaces/List/list.interface.ts`, where it used to sit
 * despite List being only one of its three consumers.
 *
 * @description
 * Not to be confused with `IItemGroupItemProps` (`interfaces/ItemGroup/
 * item-group.interface.ts`) — that one types `<OrigamItem>`'s own
 * props and has no relationship to this data-normalisation surface
 * beyond the coincidental "Item" in both names.
 ********************************************************/
export interface IItemProps {
    items?: Array<any>
    itemTitle?: TSelectItemKey
    itemValue?: TSelectItemKey
    itemChildren?: TSelectItemKey
    itemProps?: TSelectItemKey
    returnObject?: boolean
    valueComparator?: typeof deepEqual
}
