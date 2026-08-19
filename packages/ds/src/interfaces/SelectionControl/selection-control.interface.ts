import type { IActiveProps } from '../Commons/active.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { ISelectionControlGroupProps } from './selection-control-group.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { TColor } from '../../types/Commons/color.type'
import type { TIcon } from '../../types/Icon/icon.type'

/**
 * `border` / `rounded` / `elevation` (props-first, issue #241) — declared
 * here so `OrigamSelectionControl` (the element that owns the visible
 * state-layer box behind the Checkbox/Radio glyph) can consume them via
 * the standard `useBorder` / `useRounded` / `useElevation` composables,
 * mirroring the `ISwitchTrackProps` pattern (the track owns the surface,
 * not the outer `OrigamSwitch`). `ICheckboxBtnProps` / `IRadioBtnProps`
 * extend this interface, so `OrigamCheckbox(Btn)` / `OrigamRadio(Btn)`
 * forward these values down automatically through `filterProps` without
 * any additional wiring.
 */
export interface ISelectionControlProps extends ICommonsComponentProps, Partial<Omit<ISelectionControlGroupProps, 'items'>>, IColorProps, IBgColorProps, IActiveProps, IHoverProps, IDensityProps, IBorderProps, IRoundedProps, IElevationProps {
    label?: string
    trueValue?: any
    falseValue?: any
    value?: any
    required?: boolean
    /** @deprecated Use the `active` object prop instead. Kept for back-compat. */
    activeColor?: TColor
    /** @deprecated Use the `active` object prop instead. Kept for back-compat. */
    activeBgColor?: TColor
}

export interface ISelectionControlEmits extends ICommonsComponentEmits {
    (e: 'click:label', event: MouseEvent): void
}

export interface ISelectionControlSlots {
    default?: (data: { model: any, color?: TColor, bgColor?: TColor, icon?: TIcon, props: any }) => any
    label?: () => any
    input?: (data: { model: any, color?: TColor, bgColor?: TColor, icon?: TIcon, props: any, textColorStyles?: any, backgroundColorStyles?: any }) => any
}
