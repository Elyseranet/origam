import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDimensionProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISizeProps,
    ITagProps
} from '../../interfaces'

import type { TIcon, TIconComponent } from '../../types'

export interface IIconProps {
    icon?: TIcon
}

export interface IIconComponentProps extends IIconProps, IColorProps, IBgColorProps, ICommonsComponentProps, ITagProps, ISizeProps, IPaddingProps, IMarginProps, IBorderProps, IDimensionProps, IRoundedProps {
    disabled?: boolean
}

export interface IIconAliases {
    [name: string]: TIcon
}

export interface IIconSet {
    component: TIconComponent
}
