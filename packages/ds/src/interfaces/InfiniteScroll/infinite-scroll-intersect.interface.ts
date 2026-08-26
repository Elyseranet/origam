import type { ICommonsComponentProps } from '../Commons/commons.interface'

import type { TInfiniteScrollSide } from '../../types/InfiniteScroll/infinite-scroll.type'

/*********************************************************
 * IInfiniteScrollIntersectProps / IInfiniteScrollIntersectEmits
 *
 * @description
 * Props/emits for `<OrigamInfiniteScrollIntersect>` — the lower-level
 * sentinel component, only consumer. Split out of
 * `interfaces/InfiniteScroll/infinite-scroll.interface.ts` under issue
 * #364, which used to hold two distinct component surfaces
 * (InfiniteScroll / InfiniteScrollIntersect) in one file.
 ********************************************************/
export interface IInfiniteScrollIntersectProps extends ICommonsComponentProps {
    side?: TInfiniteScrollSide
    rootRef: HTMLElement
    margin?: string
}

/** Emits fired by `<OrigamInfiniteScrollIntersect>` — the lower-level
 *  sentinel that just bubbles its IntersectionObserver entries. */
export interface IInfiniteScrollIntersectEmits {
    (e: 'intersect', value: { isIntersecting: boolean, side: TInfiniteScrollSide }): void
}

/*********************************************************
 * IInfiniteScrollIntersectSlots
 *
 * @description
 * `<OrigamInfiniteScrollIntersect>` renders a single sentinel `<div>` —
 * no `<slot>` in its template.
 ********************************************************/
export interface IInfiniteScrollIntersectSlots {}
