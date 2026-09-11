import { OrigamInfiniteScroll } from "../../components"
import { INFINITE_SCROLL_MODE, INFINITE_SCROLL_SIDE, INFINITE_SCROLL_STATUS } from '../../enums'

export type TInfiniteScrollSide = `${INFINITE_SCROLL_SIDE}`

export type TInfiniteScrollMode = `${INFINITE_SCROLL_MODE}`

export type TInfiniteScrollStatus = `${INFINITE_SCROLL_STATUS}`

export type TOrigamInfiniteScroll = InstanceType<typeof OrigamInfiniteScroll>
