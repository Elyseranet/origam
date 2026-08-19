import type { IActiveProps } from '../Commons/active.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IClickLabelEmits,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IIndeterminateEmits,
    ITagProps
} from '../Commons/commons.interface'
import type { IColorProps } from '../Commons/color.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IFocusEmits } from '../Commons/focus.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IInputProps } from '../Input/input.interface'
import type { ILoaderProps } from '../Commons/loader.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISelectionControlProps } from '../SelectionControl/selection-control.interface'
import type { ISwitchTrackSlotsProps } from './switch-track.interface'

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
