import type { ICommonsComponentEmits, IDialogProps, IDialogSlots } from '../../interfaces'

export interface IDialogConfirmationProps extends IDialogProps {
    cancellable?: boolean
}

/* `handleValidate` / `handleCancel` referment le dialogue en écrivant
 * `isActive.value = false`, où `isActive = useVModel(props, 'modelValue')`.
 * L'émission `update:modelValue` partait donc sans être déclarée (seuls
 * `validate` et `cancel` l'étaient) : Vue avertissait à chaque
 * confirmation ou annulation, et `onUpdate:modelValue` restait dans
 * `$attrs`. Même défaut que `IFormEmits` (commit 5b8ef33f). Prouvé au
 * runtime dans `packages/tests/TU/origam/relay-emits-declaration.spec.ts`. */
/** Emits fired by `<OrigamDialogConfirmation>` — confirm/cancel buttons. */
export interface IDialogConfirmationEmits extends ICommonsComponentEmits {
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
