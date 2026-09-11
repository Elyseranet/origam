import type {
    IActiveProps,
    IBorderProps,
    IClickLabelEmits,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IFocusEmits,
    IHoverProps,
    IInputProps,
    IMarginProps,
    IPaddingProps,
    IRadioBtnProps,
    IRoundedProps
} from '../../interfaces'

export interface IRadioProps extends ICommonsComponentProps, IInputProps, IRadioBtnProps, IDensityProps, IPaddingProps, IMarginProps, IRoundedProps, IColorProps, IBorderProps, IElevationProps, IActiveProps, IHoverProps {

}

/** Emits fired by `<OrigamRadio>` — v-model + focus + label click. */
export interface IRadioEmits extends ICommonsComponentEmits, IFocusEmits, IClickLabelEmits {}
