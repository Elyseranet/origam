import type { IActiveProps, IBgColorProps, IColorProps, ICommonsComponentEmits, ICommonsComponentProps, IDimensionProps, IGroupProvide, IHoverProps, ITagProps, IWindowNavBtnProps, IWindowProps } from '../../interfaces'
import type { TIcon, TInline } from '../../types'

/** One entry of `IGroupProvide['items'].value` — the resolved (unwrapped)
 *  item descriptor iterated by `<OrigamCarousel>`'s delimiter dots. */
export interface ICarouselDelimiterItem {
    id: number
    value: unknown
    disabled: boolean | undefined
}

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

/** Slot signatures for `<OrigamCarousel>` — thin wrapper over
 *  `<OrigamWindow>`'s own slots (`default` / `prev` / `next` /
 *  `arrows` share the exact same scope), plus the delimiter dots
 *  (`item.{index}` / `item`) and the cycle `progress` bar. */
export interface ICarouselSlots {
    default?: (group: IGroupProvide) => any
    additional?: (group: IGroupProvide) => any
    [key: `item.${number}`]: ((data: { props: Record<string, unknown>, item: ICarouselDelimiterItem }) => any) | undefined
    item?: (data: { props: Record<string, unknown>, item: ICarouselDelimiterItem, index: number }) => any
    progress?: (data: { percent: number }) => any
    prev?: (data: { props: IWindowNavBtnProps, canMove: boolean }) => any
    next?: (data: { props: IWindowNavBtnProps, canMove: boolean }) => any
    arrows?: (data: { prevProps: IWindowNavBtnProps, nextProps: IWindowNavBtnProps, canMoveBack: boolean, canMoveForward: boolean }) => any
}
