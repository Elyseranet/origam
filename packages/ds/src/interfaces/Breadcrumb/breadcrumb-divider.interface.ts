import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { ISizeProps } from '../Commons/size.interface'

import type { TIcon } from '../../types/Icon/icon.type'

/** Slot signatures for `<OrigamBreadcrumbDivider>`. */
export interface IBreadcrumbDividerSlots {
    default?: () => any
}

export interface IBreadcrumbDividerProps extends ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IDensityProps, IColorProps, IBgColorProps, ISizeProps {
    divider: string | TIcon
}

/** Emits fired by `<OrigamBreadcrumbDivider>` — none. Purely
 *  presentational, renders the `divider` prop verbatim. */
export interface IBreadcrumbDividerEmits {}
