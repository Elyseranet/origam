import type { IActiveProps } from '../Commons/active.interface'
import type {
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
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
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILinkProps } from '../Commons/router.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

export interface IBreadcrumbItemProps extends ICommonsComponentProps, ITagProps, IBorderProps, IPaddingProps, IMarginProps, IRoundedProps, ILinkProps, IColorProps, IBgColorProps, IDensityProps, IAdjacentProps, IHoverProps, IActiveProps {
    title: string
    disabled?: boolean
}

/** Emits fired by `<OrigamBreadcrumbItem>` — clicks on prepend/append icons. */
export interface IBreadcrumbItemEmits extends IAdjacentEmits {}

/** Slot signatures for `<OrigamBreadcrumbItem>`. */
export interface IBreadcrumbItemSlots extends IAdjacentSlots {
    /** Overrides the item's title label. */
    default?: () => any
}
