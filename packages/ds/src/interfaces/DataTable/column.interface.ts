import { ALIGN } from '../../enums/Commons/align.enum'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IPaddingProps } from '../Commons/padding.interface'

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

/*********************************************************
 * IDataTableColumnCellEmits
 *
 * @description
 * `<OrigamDataTableColumnCell>` renders a static `<td>`/`<th>` cell —
 * no user interaction is wired, nothing is emitted.
 ********************************************************/
export interface IDataTableColumnCellEmits {}
