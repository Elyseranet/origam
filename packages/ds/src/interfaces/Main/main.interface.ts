import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

export interface IMainProps extends ITagProps, ICommonsComponentProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IDimensionProps, IElevationProps, IBgColorProps, IColorProps {
    scrollable?: boolean
}
