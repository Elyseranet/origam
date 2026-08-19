import type { ICommonsComponentEmits } from '../Commons/commons.interface'
import type { IListItemProps } from '../List/list-item.interface'
import type { IListProps } from '../List/list.interface'
import type { IOverlayProps } from '../Overlay/overlay.interface'

export interface IMenuProvide {
    register (): void

    unregister (): void

    closeParents (): void
}

export interface IMenuProps extends IOverlayProps, IListProps, IListItemProps {
    id?: string
}

/** Emits fired by `<OrigamMenu>` — v-model on the open state, the
 *  native `contextmenu` bubble forwarded for parents that want to
 *  show their own context menu instead, and `select` when the user
 *  picks a leaf row of the `items` tree.
 *
 *  `select` matters because `<origam-menu :items="…">` renders its own
 *  rows: the consumer never gets a handle on the `<origam-list-item>`
 *  that receives the click. Without it, the only way to learn which row
 *  was picked is to hang an `onClick` on every item object. Rows that
 *  open a submenu do NOT emit — they are navigation, not a choice. */
export interface IMenuEmits extends ICommonsComponentEmits {
    (e: 'contextmenu', event: MouseEvent): void

    (e: 'select', item: IListItemProps): void
}

/** Slot signatures for `<OrigamMenu>`. `activator` only forwards the
 *  merged `props` bag (not the inner overlay's `isActive`) — matches
 *  the template's `v-bind="{props}"` (destructured from
 *  `#activator="{props}"`). */
export interface IMenuSlots {
    activator?: (data: { props: Record<string, unknown> }) => any
    default?: () => any
}
