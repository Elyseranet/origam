import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ICommonsComponentSlots
} from '../Commons/commons.interface'
import type {
    ISelectionControlEmits,
    ISelectionControlProps
} from '../SelectionControl/selection-control.interface'
import type { TColor } from '../../types/Commons/color.type'
import type { TIcon } from '../../types/Icon/icon.type'

export interface ICheckboxBtnProps extends ICommonsComponentProps, ISelectionControlProps {
    indeterminate?: boolean
    indeterminateIcon?: TIcon
}

/**
 * Emits fired by `<OrigamCheckboxBtn>`.
 *
 * ⛔ `IFocusEmits` a ete RETIRE de cette liste (classeur L54, critere C5).
 * Il declarait `update:focused`, que ce composant ne peut PAS emettre : il
 * n'a aucune gestion du focus — ni handler `focus`/`blur`, ni appel a
 * `useFocus` — et `focused` n'est meme pas une de ses props. L'evenement
 * etait donc une surface morte : declare, jamais emis, impossible a
 * declencher.
 *
 * Ce n'est pas une rupture observable : un consommateur qui bindait
 * `@update:focused` ne recevait rien avant et ne recevra rien apres. Seul
 * change le fait que le listener transite desormais par `$attrs` au lieu
 * d'etre absorbe par une declaration mensongere.
 *
 * `<OrigamCheckbox>`, lui, appelle bien `useFocus(props)` — dont le
 * `useVModel(props, 'focused')` emet reellement `update:focused`. C'est LUI
 * qui porte legitimement cet evenement, et il le garde.
 */
export interface ICheckboxBtnEmits extends ICommonsComponentEmits, ISelectionControlEmits {
    (e: 'update:indeterminate', event: any): void
}

export interface ICheckboxBtnSlots extends ICommonsComponentSlots {
    label?: () => any
    input?: (data: { props: any, icon?: TIcon, textColorStyles?: TColor, backgroundColorStyles?: TColor, model: any }) => any
}
