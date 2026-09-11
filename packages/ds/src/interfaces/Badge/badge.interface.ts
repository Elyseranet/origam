import type {
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IElevationProps,
    IHoverProps,
    ILocationProps,
    IRoundedProps,
    IStatusProps,
    ITagProps,
    ITransitionComponentProps,
    ITypographyProps
} from '../../interfaces'

export interface IBadgeProps extends ICommonsComponentProps, ITagProps, IBorderProps, IColorProps, IBgColorProps, ILocationProps, IRoundedProps, ITransitionComponentProps, IStatusProps, IHoverProps, IElevationProps, ITypographyProps {
    content?: number | string
    dot?: boolean
    floating?: boolean
    inline?: boolean
    label?: string
    max?: number | string
    modelValue?: boolean
    offsetX?: number | string
    offsetY?: number | string
}
