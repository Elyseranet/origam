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

/** Slot signatures for `<OrigamBreadcrumb>`. `item.{index}` /
 *  `divider.{index}` override a single item/divider by position;
 *  `item` / `divider` are the fallback used by every index without its
 *  own indexed slot. */
export interface IBreadcrumbSlots {
    default?: () => any
    [key: `item.${number}`]: ((data: { item: TBreadcrumbItem, index: number }) => any) | undefined
    item?: (data: { item: TBreadcrumbItem, index: number }) => any
    'item.title'?: () => any
    [key: `divider.${number}`]: ((data: { divider: string | TIcon | undefined }) => any) | undefined
    divider?: (data: { divider: string | TIcon | undefined }) => any
}
