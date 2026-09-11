import type { IBgColorProps,
    IColorProps, ICommonsComponentProps, IDimensionProps, IDirectionProps, ITagProps, ITypographyProps } from '../../interfaces'

import type { TInfiniteScrollMode, TInfiniteScrollSide } from '../../types'

export interface IInfiniteScrollProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IDimensionProps, ITagProps, IDirectionProps, ITypographyProps {
    side?: TInfiniteScrollSide
    mode?: TInfiniteScrollMode
    loadMoreText?: string
    emptyText?: string
    margin?: string
}

export interface IInfiniteScrollIntersectProps extends ICommonsComponentProps {
    side?: TInfiniteScrollSide
    rootRef: HTMLElement
    margin?: string
}

/** Emits fired by `<OrigamInfiniteScroll>` — `load` fires when the sentinel
 *  enters the viewport and the parent should fetch the next page. */
export interface IInfiniteScrollEmits {
    (e: 'load', value: { side: TInfiniteScrollSide, done: (status: 'ok' | 'empty' | 'error') => void }): void
}

/** Emits fired by `<OrigamInfiniteScrollIntersect>` — the lower-level
 *  sentinel that just bubbles its IntersectionObserver entries. */
export interface IInfiniteScrollIntersectEmits {
    (e: 'intersect', value: { isIntersecting: boolean, side: TInfiniteScrollSide }): void
}
