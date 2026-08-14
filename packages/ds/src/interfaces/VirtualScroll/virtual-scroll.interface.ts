import type { ICommonsComponentProps, IDimensionProps, IVirtualProps } from '../../interfaces'

export interface IVirtualScrollProps extends ICommonsComponentProps, IDimensionProps, IVirtualProps {
    items?: Array<any>
    renderless?: boolean
}

/** Scope forwarded to the per-index `item.{index}` slot — the index is
 *  implied by the slot's own name, so it isn't repeated in the scope
 *  (unlike the `item` fallback below). `item` is typed `any` because
 *  `IVirtualScrollProps.items` itself is declared `Array<any>`. */
export interface IVirtualScrollItemSlotProps {
    item: any
}

/** Scope forwarded to the un-indexed `item` fallback slot (used when no
 *  `item.{index}` override exists for the current row) — same as
 *  `IVirtualScrollItemSlotProps` plus the explicit `index`, since the
 *  fallback isn't keyed by position. */
export interface IVirtualScrollFallbackItemSlotProps extends IVirtualScrollItemSlotProps {
    index: number
}

/** Scope forwarded to the per-index `item.renderless.{index}` slot
 *  (renderless mode). Adds the resize-observed element ref forwarded
 *  by the child `<OrigamVirtualScrollItem>`'s own `renderless` slot. */
export interface IVirtualScrollRenderlessItemSlotProps extends IVirtualScrollItemSlotProps {
    itemRef: HTMLElement | null | undefined
}

/** Scope forwarded to the un-indexed `item.renderless` fallback slot. */
export interface IVirtualScrollRenderlessFallbackItemSlotProps extends IVirtualScrollRenderlessItemSlotProps {
    index: number
}

/**
 * Slot signatures for `<OrigamVirtualScroll>`.
 *
 * Per-row overrides are only known at runtime (`item.{index}` and
 * `item.renderless.{index}`), so they're expressed as template-literal
 * index signatures alongside the un-indexed fallback names the
 * template also checks (`slot name="item.renderless"` / `slot
 * name="item"`), mirroring `IExpansionPanelsSlots`.
 */
export interface IVirtualScrollSlots {
    item?: (data: IVirtualScrollFallbackItemSlotProps) => any
    'item.renderless'?: (data: IVirtualScrollRenderlessFallbackItemSlotProps) => any
    [key: `item.${number}`]: ((data: IVirtualScrollItemSlotProps) => any) | undefined
    [key: `item.renderless.${number}`]: ((data: IVirtualScrollRenderlessItemSlotProps) => any) | undefined
}
