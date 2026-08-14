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
    ISwitchTrackSlotsProps,
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

/** Slot signatures for `<OrigamSwitch>`. `track.true` / `track.false`
 *  forward straight through to the nested `<OrigamSwitchTrack>`'s own
 *  slots of the same name; `loader` overrides the circular spinner
 *  painted on the thumb during an async toggle. */
export interface ISwitchSlots {
    'track.true'?: (props: ISwitchTrackSlotsProps) => any
    'track.false'?: (props: ISwitchTrackSlotsProps) => any
    loader?: () => any
}
