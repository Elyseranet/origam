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
