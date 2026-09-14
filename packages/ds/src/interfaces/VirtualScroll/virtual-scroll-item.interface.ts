import type { ICommonsComponentProps } from '../Commons/commons.interface'

export interface IVirtualScrollItemProps extends ICommonsComponentProps {
    renderless?: boolean
}

/** Emits fired by `<OrigamVirtualScrollItem>` — the resize-observed height
 *  is forwarded to the parent virtual scroller so it can update its
 *  intrinsic-size cache. */
export interface IVirtualScrollItemEmits {
    (e: 'update:height', value: number): void
}

/** Slot signatures for `<OrigamVirtualScrollItem>`. */
export interface IVirtualScrollItemSlots {
    /** Renderless mode only (`renderless: true`) — receives the
     *  resize-observed element ref so the consumer can attach it to
     *  their own markup instead of the built-in wrapper `<div>`. */
    renderless?: (data: { itemRef: HTMLElement | null | undefined }) => any
    /** Default (non-renderless) content, rendered inside the wrapper `<div>`. */
    default?: () => any
}
