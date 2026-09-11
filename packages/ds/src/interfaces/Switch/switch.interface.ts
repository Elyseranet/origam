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
    IIndeterminateEmits,
    IInputProps,
    ILoaderProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ISelectionControlProps,
    ITagProps
} from '../../interfaces'

export interface ISwitchProps extends ICommonsComponentProps, ITagProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IInputProps, ISelectionControlProps, ILoaderProps, IColorProps, IDensityProps, IElevationProps, IActiveProps, IHoverProps {
    indeterminate?: boolean
    inset?: boolean
    flat?: boolean
}

/** Emits fired by `<OrigamSwitch>` — v-model + focus + indeterminate
 *  (three-state) + label click. */
export interface ISwitchEmits extends ICommonsComponentEmits, IFocusEmits, IIndeterminateEmits, IClickLabelEmits {}
