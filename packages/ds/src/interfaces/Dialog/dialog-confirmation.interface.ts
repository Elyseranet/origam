import type { IDialogProps, IDialogSlots } from '../../interfaces'

export interface IDialogConfirmationProps extends IDialogProps {
    cancellable?: boolean
}

/** Emits fired by `<OrigamDialogConfirmation>` — confirm/cancel buttons. */
export interface IDialogConfirmationEmits {
    (e: 'validate', event?: MouseEvent): void
    (e: 'cancel', event?: MouseEvent): void
}

/** Slot signatures for `<OrigamDialogConfirmation>` — same chrome slots
 *  as `<OrigamDialog>`, but `default` and `header-title` are forwarded
 *  unscoped here (the template does `<slot name="…"/>` with no
 *  `v-bind`, unlike `<OrigamDialog>`'s own versions of those slots). */
export interface IDialogConfirmationSlots extends Omit<IDialogSlots, 'default' | 'header-title'> {
    default?: () => any
    'header-title'?: () => any
}
