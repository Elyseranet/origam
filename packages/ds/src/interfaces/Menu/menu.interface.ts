import type { ICommonsComponentEmits, IListItemProps, IListProps, IOverlayProps } from '../../interfaces'

export interface IMenuProvide {
    register (): void

    unregister (): void

    closeParents (): void
}

export interface IMenuProps extends IOverlayProps, IListProps, IListItemProps {
    id?: string
}

/** Emits fired by `<OrigamMenu>` — v-model on the open state plus the
 *  native `contextmenu` bubble forwarded for parents that want to
 *  show their own context menu instead. */
export interface IMenuEmits extends ICommonsComponentEmits {
    (e: 'contextmenu', event: MouseEvent): void
}

/** Slot signatures for `<OrigamMenu>`. `activator` only forwards the
 *  merged `props` bag (not the inner overlay's `isActive`) — matches
 *  the template's `v-bind="{props}"` (destructured from
 *  `#activator="{props}"`). */
export interface IMenuSlots {
    activator?: (data: { props: Record<string, unknown> }) => any
    default?: () => any
}
