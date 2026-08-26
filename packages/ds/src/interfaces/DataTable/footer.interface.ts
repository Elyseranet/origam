import type { IAdjacentSlots } from '../Commons/adjacent.interface'
import type { IAlignProps } from '../Commons/align.interface'
import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IPaddingProps } from '../Commons/padding.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IDataTableFooterProps extends ICommonsComponentProps, IColorProps, IPaddingProps, IAlignProps {
    prevIcon?: TIcon
    nextIcon?: TIcon
    firstIcon?: TIcon
    lastIcon?: TIcon
    itemsPerPageText?: string
    pageText?: string
    firstPageLabel?: string
    prevPageLabel?: string
    nextPageLabel?: string
    lastPageLabel?: string
    itemsPerPageOptions?: Array<number | { title: string, value: number }>
    showCurrentPage?: boolean
}

/** Slot signatures for `<OrigamDataTableFooter>` — both `prepend` and
 *  `append` render with no scope (bracket the items-per-page / pagination
 *  row), so the shared `IAdjacentSlots` contract applies unchanged. */
export interface IDataTableFooterSlots extends IAdjacentSlots {
}

/** `<OrigamDataTableFooter>` delegates every interaction to the nested
 *  `<origam-select>` / `<origam-pagination>` (both handled internally
 *  via composables) — nothing is emitted upward. */
export interface IDataTableFooterEmits {}
