import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ICommonsComponentSlots,
    ITagProps
} from '../Commons/commons.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface ILabelProps extends ICommonsComponentProps, IMarginProps, IPaddingProps, IBorderProps, IRoundedProps, IColorProps, IBgColorProps, ITagProps, ITypographyProps {
    text?: string
    floating?: boolean
    required?: boolean
    name?: string
}

export interface ILabelEmits {
    (e: 'click', event: MouseEvent): void
}

export interface ILabelSlots extends ICommonsComponentSlots {
}
