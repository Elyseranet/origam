import type { ICardProps, IClickOutsideEmits, ICommonsComponentEmits, ICommonsComponentProps, IOverlayProps, IStatusProps } from '../../interfaces'
import type { TSize } from '../../types'

export interface IDialogProps extends ICommonsComponentProps, IOverlayProps, ICardProps, IStatusProps {
    fullscreen?: boolean
    retainFocus?: boolean
    scrollable?: boolean
    size?: TSize
}

/** Emits fired by `<OrigamDialog>` — v-model on the open state, outside
 *  click bubbling, and the `isRead` lifecycle hook that fires the first
 *  time the dialog body becomes visible (used for the "mark as read"
 *  pattern on terms-of-service / consent dialogs). */
export interface IDialogEmits extends ICommonsComponentEmits, IClickOutsideEmits {
    (e: 'isRead', value: boolean): void
}
