import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface ITableProps extends ICommonsComponentProps, IBorderProps, IRoundedProps, IElevationProps, IPaddingProps, IMarginProps, IHoverProps, IDimensionProps, IDensityProps, ITagProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight'> {
    fixedHeader?: boolean
    fixedFooter?: boolean
    caption?: string
    captionVisible?: boolean
    ariaRowcount?: number
}

export interface ITableEmits {}

/** Slot signatures for `<OrigamTable>`. */
export interface ITableSlots {
    top?: () => any
    /** Overrides the whole `<table>` element. */
    wrapper?: () => any
    default?: () => any
    bottom?: () => any
}
