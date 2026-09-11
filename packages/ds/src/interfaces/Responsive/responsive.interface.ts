import type { IBorderProps } from '../Commons/border.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

export interface IResponsiveProps extends IDimensionProps, ICommonsComponentProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps {
    aspectRatio?: string | number
    contentClass?: string
    inline?: boolean
}

export interface IResponsiveEmits {}

/** Slot signatures for `<OrigamResponsive>`. */
export interface IResponsiveSlots {
    additional?: () => any
    default?: () => any
}
