import type {
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IMarginProps,
    IPaddingProps,
    ISizeProps,
    ITagProps
} from '../../interfaces'

import type { TIcon } from '../../types'

export interface IBreadcrumbDividerProps extends ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IDensityProps, IColorProps, IBgColorProps, ISizeProps {
    divider: string | TIcon
}
