import { ComputedRef, InjectionKey, Ref } from 'vue'

import type { TListItemRole } from '../../types/List/list-item.type'

export const ORIGAM_LIST_KEY: InjectionKey<{
    hasPrepend: Ref<boolean>
    updateHasPrepend: (value: ComputedRef<boolean>) => void
    hasAppend: Ref<boolean>
    updateHasAppend: (value: ComputedRef<boolean>) => void
    /*********************************************************
     * itemRole
     *
     * @description
     * The ARIA role every row of THIS list must carry — `option` when
     * the list runs as a `listbox` (selection widget), `listitem` when
     * it runs as a plain `list`. Published by the list, never decided by
     * the row, so the container and its rows can never disagree.
     * @description
     * A `ComputedRef` rather than a value: the mode is derived from
     * props, and ADR-005 writes theme-resolved props AFTER `setup()`.
     * Reading it lazily at render is what makes the mode themeable at
     * all.
     ********************************************************/
    itemRole: ComputedRef<TListItemRole>
}> = Symbol.for('origam:list')
