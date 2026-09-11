import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TColor } from '../../types/Commons/color.type'
import type {
    TInfiniteScrollMode,
    TInfiniteScrollSide
} from '../../types/InfiniteScroll/infinite-scroll.type'

/*********************************************************
 * IInfiniteScrollProps
 *
 * @description
 * Props for `<OrigamInfiniteScroll>` — the only consumer.
 * `IInfiniteScrollIntersectProps` / `IInfiniteScrollIntersectEmits`
 * (the lower-level sentinel component) moved out to
 * `interfaces/InfiniteScroll/infinite-scroll-intersect.interface.ts`
 * under issue #364 — this file used to hold both distinct component
 * surfaces.
 ********************************************************/
export interface IInfiniteScrollProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IDimensionProps, ITagProps, IDirectionProps, Pick<ITypographyProps, 'fontSize'> {
    side?: TInfiniteScrollSide
    mode?: TInfiniteScrollMode
    loadMoreText?: string
    emptyText?: string
    margin?: string
}

/** Emits fired by `<OrigamInfiniteScroll>` — `load` fires when the sentinel
 *  enters the viewport and the parent should fetch the next page. */
export interface IInfiniteScrollEmits {
    (e: 'load', value: { side: TInfiniteScrollSide, done: (status: 'ok' | 'empty' | 'error') => void }): void
}

/** Scope forwarded to every `<OrigamInfiniteScroll>` side slot
 *  (`error` / `empty` / `loading` / `loadMore`) — which edge triggered
 *  it, plus a ready-to-bind click handler + the resolved color. */
export interface IInfiniteScrollSideSlotProps {
    side: TInfiniteScrollSide
    props: { onClick: () => void, color: TColor | undefined }
}

/** Slot signatures for `<OrigamInfiniteScroll>`. */
export interface IInfiniteScrollSlots {
    error?: (data: IInfiniteScrollSideSlotProps) => any
    empty?: (data: IInfiniteScrollSideSlotProps) => any
    loading?: (data: IInfiniteScrollSideSlotProps) => any
    loadMore?: (data: IInfiniteScrollSideSlotProps) => any
    default?: () => any
}
