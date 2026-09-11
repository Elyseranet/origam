import type {
    IActiveProps,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IHoverProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

import type { TBreadcrumbItem, TIcon } from '../../types'

export interface IBreadcrumbProps extends IColorProps, IBgColorProps, ITagProps, ICommonsComponentProps, IDensityProps, IRoundedProps, IPaddingProps, IMarginProps, IBorderProps, IElevationProps, IHoverProps, IActiveProps {
    disabled?: boolean
    divider?: string | TIcon
    items?: Array<TBreadcrumbItem>
}
