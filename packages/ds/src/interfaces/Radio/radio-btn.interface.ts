import type {
    IClickLabelEmits,
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type { ISelectionControlProps } from '../SelectionControl/selection-control.interface'
import type { TColor } from '../../types/Commons/color.type'
import type { TIcon } from '../../types/Icon/icon.type'

export interface IRadioBtnProps extends ICommonsComponentProps, ISelectionControlProps {

}

/** Emits fired by `<OrigamRadioBtn>` — same surface as `<OrigamRadio>`. */
export interface IRadioBtnEmits extends ICommonsComponentEmits, IFocusEmits, IClickLabelEmits {}

/** Slot signatures for `<OrigamRadioBtn>` — forwarded, unscoped `default` /
 *  `label`, and the same `input` scope as `<OrigamSelectionControl>`. */
export interface IRadioBtnSlots {
    default?: () => any
    input?: (data: { model: any, color?: TColor, bgColor?: TColor, icon?: TIcon, props: any }) => any
    label?: () => any
}
