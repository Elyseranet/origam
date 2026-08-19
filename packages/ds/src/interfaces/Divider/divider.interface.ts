import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { IMarginProps } from '../Commons/margin.interface'

export interface IDividerProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IMarginProps, IDirectionProps {
    inset?: boolean
    length?: number | string
    thickness?: number | string
}
