import type { IDialogProps } from '../../interfaces'

export interface IDialogConfirmationProps extends IDialogProps {
    cancellable?: boolean
}

/** Emits fired by `<OrigamDialogConfirmation>` — confirm/cancel buttons. */
export interface IDialogConfirmationEmits {
    (e: 'validate', event?: MouseEvent): void
    (e: 'cancel', event?: MouseEvent): void
}
