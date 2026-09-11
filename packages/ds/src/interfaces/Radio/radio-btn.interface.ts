import type { IClickLabelEmits, ICommonsComponentEmits, ICommonsComponentProps, IFocusEmits, ISelectionControlProps } from '../../interfaces'

export interface IRadioBtnProps extends ICommonsComponentProps, ISelectionControlProps {

}

/** Emits fired by `<OrigamRadioBtn>` — same surface as `<OrigamRadio>`. */
export interface IRadioBtnEmits extends ICommonsComponentEmits, IFocusEmits, IClickLabelEmits {}
