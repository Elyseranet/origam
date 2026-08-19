import type {
    ICalendarProps,
    IDay
} from './date-picker-calendar.interface'
import type { IColorProps } from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'

import type { TTransitionProps } from '../../types/Transition/transition.type'

export interface IDatePickerMonthProps extends ICommonsComponentProps, IColorProps, ICalendarProps {
    hideWeekdays?: boolean
    multiple?: boolean | number | (string & {})
    range?: boolean
    showWeek?: boolean
    transition?: TTransitionProps
    reverseTransition?: TTransitionProps
}

/** Scope for the `days` slot — one calendar cell. `props` is pre-wired
 *  (`onClick`) so a custom render can spread it onto any element and still
 *  select the day correctly. */
export interface IDatePickerMonthDaySlot {
    props: {
        onClick: (event: MouseEvent) => void
    }
    item: IDay
    index: number
}

export interface IDatePickerMonthSlots {
    days?: (props: IDatePickerMonthDaySlot) => any
}
