import { useSort } from './sort.composable'
import { SORT_DIRECTION } from '../../enums'
import type { IInternalDataTableHeader } from '../../interfaces/DataTable/data-table-header.interface'
import type { IHeaderCellProps } from '../../interfaces/DataTable/header-cell-base.interface'

/*********************************************************
 * useHeadersCell
 *
 * @description
 * Resolves which sort icon (asc/desc) a header cell should show for
 * the current `sortBy` state — reads `useSort`'s injection, NOT the
 * `ORIGAM_DATA_TABLE_HEADERS_KEY` injection `useHeaders` (own file)
 * manages, so the two hooks are independent despite living in the
 * same domain folder.
 ********************************************************/
export function useHeadersCell (props: IHeaderCellProps) {
    const {sortBy} = useSort()

    const getSortIcon = (column: IInternalDataTableHeader) => {
        const item = sortBy.value
            .find((sortByItem) => {
                return sortByItem.key === column.key
            })

        if (!item) return props.sortAscIcon

        return item.order === SORT_DIRECTION.ASC ? props.sortAscIcon : props.sortDescIcon
    }

    return {getSortIcon}
}
