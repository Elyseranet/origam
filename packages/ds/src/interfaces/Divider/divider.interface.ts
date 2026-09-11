import type { IBgColorProps,
    IColorProps, ICommonsComponentProps, IDirectionProps, IMarginProps } from '../../interfaces'

export interface IDividerProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IMarginProps, IDirectionProps {
    inset?: boolean
    length?: number | string
    thickness?: number | string
}
