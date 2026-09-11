import type { IInternalDataTableHeader } from "../../interfaces"

/*********************************************************
 * useCell
 ********************************************************/
export function useCell () {
    const getPadding = (column: IInternalDataTableHeader) => {
        if (column.key === 'data-table-select' || column.key === 'data-table-expand') {
            return '0 8'
        }

        if (column.padding) {
            return column.padding
        }

        return undefined
    }


    return {
        getPadding
    }
}
