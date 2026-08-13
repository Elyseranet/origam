import { ALIGN } from '../../enums'
import type { ICommonsComponentProps, IDimensionProps, IPaddingProps, ITagProps } from '../../interfaces'

export interface IDataTableColumnProps extends ICommonsComponentProps, ITagProps, IDimensionProps, IPaddingProps {
    align?: ALIGN.START | ALIGN.END | ALIGN.CENTER
    fixed?: boolean
    fixedOffset?: number | string
    lastFixed?: boolean
    nowrap?: boolean
}

/** Slot signature for `<OrigamDataTableColumnCell>` — a plain content cell,
 *  no scope passed through (the header/row callers compute their own
 *  scoped props before forwarding into this wrapper). */
export interface IDataTableColumnCellSlots {
    default?: () => any
}
