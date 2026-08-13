import type {
    IBorderProps,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDatePickerControlsProps,
    IDatePickerHeaderProps,
    IDatePickerMonthProps,
    IDatePickerMonthsProps,
    IDatePickerYearsProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IPickerProps,
    IRoundedProps
} from "../../interfaces"

import type { TDateMode, TTransitionProps } from "../../types"

// IPickerProps (via ISheetProps → IActiveProps) declares `active?: boolean | IActiveState`.
// IDatePickerControlsProps declares `active?: string | Array<string> | boolean | IActiveState`.
// TypeScript TS2320 requires the types to be identical across simultaneous extends.
// We omit `active` from IDatePickerControlsProps and let IPickerProps supply the
// canonical `active` shape; the `activeDate` alias in IDatePickerControlsProps
// is unused here so the Omit is safe.
export interface IDatePickerProps extends ICommonsComponentProps, IColorProps, IBorderProps, IRoundedProps, IElevationProps, IPaddingProps, IMarginProps, IPickerProps, Omit<IDatePickerControlsProps, 'active'>, IDatePickerMonthProps, IDatePickerMonthsProps, IDatePickerYearsProps, IDatePickerHeaderProps {
    modelValue?: string | Date | Array<string | Date>
}

/** Emits fired by `<OrigamDatePicker>` — main v-model + the three navigation
 *  channels (month / year / viewMode) the controls and tables push up. */
export interface IDatePickerEmits extends ICommonsComponentEmits {
    (e: 'update:month', value: number): void
    (e: 'update:year', value: number): void
    (e: 'update:viewMode', value: TDateMode): void
}

/** Scope forwarded on the `header` slot — the computed header text plus the
 *  reverse-aware transition wrapper (`OrigamTranslatePicker` /
 *  `OrigamReverseTranslatePicker`) driving its enter/leave direction. */
export interface IDatePickerHeaderSlot {
    header: string
    transition: TTransitionProps
}

/** Slot signatures for `<OrigamDatePicker>`. `title` / `default` / `actions`
 *  render with no scope (the default render swaps controls + month/months/
 *  years panels internally); `header` forwards `<OrigamDatePickerHeader>`'s
 *  computed text + transition so a custom render can reuse them. */
export interface IDatePickerSlots {
    title?: () => any
    header?: (props: IDatePickerHeaderSlot) => any
    default?: () => any
    actions?: () => any
}
