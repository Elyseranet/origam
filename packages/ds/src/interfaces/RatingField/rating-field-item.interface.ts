import type {
    IBorderProps,
    IClickEmits,
    IColorProps,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRippleProps,
    IRoundedProps,
    ISizeProps,
    ITagProps
} from '../../interfaces'

import type { TIcon } from '../../types'

export interface IRatingFieldItemProps extends ICommonsComponentProps, ITagProps, IColorProps, IDensityProps, IRippleProps, ISizeProps, IBorderProps, IPaddingProps, IMarginProps, IRoundedProps, IElevationProps {
    name?: string
    index?: number
    value: number
    label?: string
    itemAriaLabel?: string
    showStar?: boolean
    isFilled?: boolean
    isHovered?: boolean
    isHovering?: boolean
    disabled?: boolean
    readonly?: boolean
    fullIcon?: TIcon
    emptyIcon?: TIcon
    halfIncrements?: boolean
    checked?: boolean
    length?: number | string
}

/** Emits fired by `<OrigamRatingFieldItem>` — click + hover surface
 *  (pointer enter / leave drive the half-rating preview). */
export interface IRatingFieldItemEmits extends IClickEmits {
    (e: 'mouseenter', event: MouseEvent): void
    (e: 'mouseleave', event: MouseEvent): void
}
