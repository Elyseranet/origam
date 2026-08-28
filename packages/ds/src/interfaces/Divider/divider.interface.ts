import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    INoEmits,
    INoSlots
} from '../Commons/commons.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { IMarginProps } from '../Commons/margin.interface'

export interface IDividerProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IMarginProps, IDirectionProps {
    inset?: boolean
    length?: number | string
    thickness?: number | string
}

/*********************************************************
 * Événements et slots
 *
 * @description
 * `<OrigamDivider>` n'émet rien : il rend un `<hr>` nu, sans le moindre
 * gestionnaire. Il n'expose aucun slot non plus — `<hr>` est un élément
 * vide et le template ne contient aucun `<slot>`. Les deux surfaces sont
 * donc déclarées vides À DESSEIN (cf. `INoEmits` / `INoSlots`).
 ********************************************************/
export interface IDividerEmits extends INoEmits {}

export interface IDividerSlots extends INoSlots {}
