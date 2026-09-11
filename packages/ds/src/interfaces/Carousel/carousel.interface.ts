import type { IActiveProps, IBgColorProps, IColorProps, ICommonsComponentEmits, ICommonsComponentProps, IDimensionProps, IHoverProps, ITagProps, IWindowProps } from '../../interfaces'
import type { TIcon, TInline } from '../../types'

export interface ICarouselProps extends IWindowProps, IColorProps, IBgColorProps, ICommonsComponentProps, ITagProps, IDimensionProps, IHoverProps, IActiveProps {
    cycle?: boolean
    delimiterIcon?: TIcon
    hideDelimiters?: boolean
    hideDelimiterBackground?: boolean
    interval?: number | string
    progress?: boolean
    verticalDelimiters?: boolean | TInline
}

/** Emits fired by `<OrigamCarousel>` — v-model on the active slide index. */
export interface ICarouselEmits extends ICommonsComponentEmits {}
