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

/*********************************************************
 * IDatePickerMonthEmits
 *
 * @description
 * Emits fired by `<OrigamDatePickerMonth>`. `update:date` is the real
 * v-model write-back: `useDatePickerCalendar` wires `date` through
 * `useVModel`, and every click handler in this component (single /
 * multiple / range selection) assigns `model.value = …`, which
 * `useVModel`'s setter turns into `emit('update:date', …)`.
 * @description
 * `year` and `month` are ALSO wired through `useVModel` inside the same
 * composable (so `update:year` / `update:month` exist on the emit
 * surface at the Vue runtime level), but this component only ever
 * READS `year.value` / `month.value` — it never assigns to them. They
 * are therefore deliberately left off this interface: declaring them
 * here would document an emit this component never actually fires.
 ********************************************************/
export interface IDatePickerMonthEmits {
    (e: 'update:date', value: ReadonlyArray<unknown> | Array<unknown>): void
}
