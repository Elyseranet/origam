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

import type { TDateMode } from "../../types"

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
