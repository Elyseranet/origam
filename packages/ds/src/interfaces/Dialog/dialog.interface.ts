import type { ICardProps } from '../Card/card.interface'
import type { IClickOutsideEmits } from '../Commons/clickOutside.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IOverlayProps } from '../Overlay/overlay.interface'
import type { IStatusProps } from '../Commons/status.interface'
import type { TSize } from '../../types/Commons/size.type'

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

/** Slot signatures for `<OrigamDialog>` — the inner `<OrigamOverlay>`'s
 *  `default` scope, plus the `<OrigamCard>` chrome slots re-exposed
 *  under Dialog's own (hyphenated) slot names. `activator` only
 *  forwards the merged `props` bag, not the overlay's `isActive` —
 *  matches the template's `v-bind="{props}"` (destructured from
 *  `#activator="{props}"`). */
export interface IDialogSlots {
    activator?: (data: { props: Record<string, unknown> }) => any
    default?: (data: { isActive: boolean }) => any
    loader?: () => any
    header?: () => any
    'header-append'?: () => any
    'header-prepend'?: () => any
    'header-title'?: (data: { titleId: string }) => any
    'header-subtitle'?: () => any
    'header-content'?: () => any
    asset?: () => any
    text?: () => any
    content?: () => any
    footer?: () => any
}
