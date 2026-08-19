import type { IActiveProps } from '../Commons/active.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type { IBtnProps } from './btn.interface'
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
import type { ISizeProps } from '../Commons/size.interface'
import type { IVariantProps } from '../Commons/variant.interface'

export interface IBtnGroupProps extends ITagProps, ICommonsComponentProps, IRoundedProps, IBorderProps, IDensityProps, IElevationProps, IColorProps, IBgColorProps, IMarginProps, IPaddingProps, IHoverProps, IActiveProps, IVariantProps, ISizeProps {
    divided?: boolean
    items?: Array<IBtnProps>
}

/** Slot signatures for `<OrigamBtnGroup>`. */
export interface IBtnGroupSlots {
    /** Overrides the whole auto-generated `<origam-btn>` list. */
    default?: () => any
    /** One call per item — overrides a single button. */
    item?: (data: { item: IBtnProps, index: number }) => any
}
