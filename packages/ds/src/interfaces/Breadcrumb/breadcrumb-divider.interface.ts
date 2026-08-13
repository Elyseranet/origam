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

/** Slot signatures for `<OrigamBreadcrumbDivider>`. */
export interface IBreadcrumbDividerSlots {
    default?: () => any
}

export interface IBreadcrumbDividerProps extends ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IDensityProps, IColorProps, IBgColorProps, ISizeProps {
    divider: string | TIcon
}
