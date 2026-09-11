import type { IBorderProps } from '../Commons/border.interface'
import type { IColorProps } from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { IDatePickerControlsProps } from './date-picker-controls.interface'
import type { IDatePickerHeaderProps } from './date-picker-header.interface'
import type { IDatePickerMonthProps } from './date-picker-month.interface'
import type { IDatePickerMonthsProps } from './date-picker-months.interface'
import type { IDatePickerYearsProps } from './date-picker-years.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IPickerProps } from '../Picker/picker.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TDateMode } from '../../types/DatePicker/date-picker.type'
import type { TTransitionProps } from '../../types/Transition/transition.type'

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
