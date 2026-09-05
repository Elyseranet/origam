import type { ICommonsComponentEmits } from '../Commons/commons.interface'
import type {
    IDialogProps,
    IDialogSlots
} from './dialog.interface'

export interface IDialogConfirmationProps extends IDialogProps {
    cancellable?: boolean
    /**
     * Clé i18n du libellé du bouton d'annulation.
     *
     * ⛔ Une CLÉ, pas la chaîne finale — c'est le composant qui traduit.
     * Les deux libellés étaient écrits en dur dans le template (`text="Cancel"`,
     * `text="Validate"`) et l'interface n'exposait que `cancellable` : un
     * consommateur non anglophone ne pouvait ni traduire ni renommer, sinon en
     * remplaçant le pied de dialogue ENTIER. Sur un dialogue de confirmation —
     * celui qui demande de valider une action — c'est le pire endroit possible.
     *
     * @default 'origam.dialog.confirmation.cancel'
     */
    cancelTextKey?: string
    /**
     * Clé i18n du libellé du bouton de validation. Mêmes règles que
     * `cancelTextKey`.
     *
     * @default 'origam.dialog.confirmation.validate'
     */
    validateTextKey?: string
}

/* `handleValidate` / `handleCancel` referment le dialogue en écrivant
 * `isActive.value = false`, où `isActive = useVModel(props, 'modelValue')`.
 * L'émission `update:modelValue` partait donc sans être déclarée (seuls
 * `validate` et `cancel` l'étaient) : Vue avertissait à chaque
 * confirmation ou annulation, et `onUpdate:modelValue` restait dans
 * `$attrs`. Même défaut que `IFormEmits` (commit 5b8ef33f). Prouvé au
 * runtime dans `packages/tests/TU/origam/relay-emits-declaration.spec.ts`. */
/*********************************************************
 * IDialogConfirmationEmits
 *
 * @description
 * Emits fired by `<OrigamDialogConfirmation>` — confirm/cancel buttons.
 ********************************************************/
export interface IDialogConfirmationEmits extends ICommonsComponentEmits {
    (e: 'validate', event?: MouseEvent): void
    (e: 'cancel', event?: MouseEvent): void
}

/*********************************************************
 * IDialogConfirmationSlots
 *
 * @description
 * Slot signatures for `<OrigamDialogConfirmation>` — same chrome slots as
 * `<OrigamDialog>`.
 *
 * @description
 * `default` and `header-title` sont transmis SANS scope ici : le template
 * fait `<slot name="…"/>` sans `v-bind`, contrairement aux versions
 * d'`<OrigamDialog>`.
 ********************************************************/
export interface IDialogConfirmationSlots extends Omit<IDialogSlots, 'default' | 'header-title'> {
    default?: () => any
    'header-title'?: () => any
}
