import { ALIGN } from '../../enums/Commons/align.enum'
import { DATATABLE_SKELETON_CELL } from '../../enums/DataTable/data-table.enum'
import type { IInternalDataTableHeader } from '../../interfaces/DataTable/data-table-header.interface'

/*********************************************************
 * getSkeletonCellShape
 *
 * @description
 * Which silhouette a placeholder cell draws for `column`. The descriptor
 * has no "type", so the shape is read from what it does carry: the
 * reserved `data-table-select` / `data-table-expand` keys are controls,
 * an `align: 'end'` column holds figures, anything else is text.
 ********************************************************/
export function getSkeletonCellShape (column: Pick<IInternalDataTableHeader, 'key' | 'align'>): DATATABLE_SKELETON_CELL {
    if (column.key === 'data-table-select' || column.key === 'data-table-expand') return DATATABLE_SKELETON_CELL.CONTROL

    if (column.align === ALIGN.END) return DATATABLE_SKELETON_CELL.END

    return DATATABLE_SKELETON_CELL.TEXT
}
