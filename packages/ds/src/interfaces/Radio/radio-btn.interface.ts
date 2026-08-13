import type { IClickLabelEmits, ICommonsComponentEmits, ICommonsComponentProps, IFocusEmits, ISelectionControlProps } from '../../interfaces'
import type { TColor, TIcon } from '../../types'

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
