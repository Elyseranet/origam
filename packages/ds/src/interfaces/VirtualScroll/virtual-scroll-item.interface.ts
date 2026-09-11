import type { ICommonsComponentProps } from '../../interfaces'

export interface IVirtualScrollItemProps extends ICommonsComponentProps {
    renderless?: boolean
}

/** Emits fired by `<OrigamVirtualScrollItem>` — the resize-observed height
 *  is forwarded to the parent virtual scroller so it can update its
 *  intrinsic-size cache. */
export interface IVirtualScrollItemEmits {
    (e: 'update:height', value: number): void
}
