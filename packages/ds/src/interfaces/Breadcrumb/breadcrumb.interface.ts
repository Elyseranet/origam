import type { IActiveProps } from '../Commons/active.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TBreadcrumbItem } from '../../types/Breadcrumb/breadcrumb.type'
import type { TIcon } from '../../types/Icon/icon.type'

export interface IBreadcrumbProps extends IColorProps, IBgColorProps, ITagProps, ICommonsComponentProps, IDensityProps, IRoundedProps, IPaddingProps, IMarginProps, IBorderProps, IElevationProps, IHoverProps, IActiveProps {
    disabled?: boolean
    divider?: string | TIcon
    items?: Array<TBreadcrumbItem>
}

/*********************************************************
 * IBreadcrumbEmits
 *
 * @description
 * Emits fired by `<OrigamBreadcrumb>` — none. Item interaction (click,
 * navigation) is owned by `<OrigamBreadcrumbItem>` / the consumer's
 * own `item`/`href` handling, not by the list wrapper.
 ********************************************************/
export interface IBreadcrumbEmits {}

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
