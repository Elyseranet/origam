import { ALIGN } from '../../enums'
import type { ICommonsComponentProps, IDimensionProps, IPaddingProps, ITagProps } from '../../interfaces'

export interface IDataTableColumnProps extends ICommonsComponentProps, ITagProps, IDimensionProps, IPaddingProps {
    align?: ALIGN.START | ALIGN.END | ALIGN.CENTER
    fixed?: boolean
    fixedOffset?: number | string
    lastFixed?: boolean
    nowrap?: boolean
}
