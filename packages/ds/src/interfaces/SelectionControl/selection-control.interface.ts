import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    IColorProps, ICommonsComponentEmits, ICommonsComponentProps, IDensityProps, IElevationProps, ISelectionControlGroupProps,
    IHoverProps,
    IRoundedProps
} from '../../interfaces'
import type { TColor, TIcon } from '../../types'

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
