import type { IColorProps, ICommonsComponentProps, IDimensionProps } from "../../interfaces"

import type { TColor } from "../../types"

export interface IDatePickerMonthsProps extends ICommonsComponentProps, IColorProps, IDimensionProps {
    min?: unknown
    max?: unknown
    month?: number
    year?: number
}

/** Emits fired by `<OrigamDatePickerMonths>` — click on a month tile. */
export interface IDatePickerMonthsEmits {
    (e: 'update:month', value: number): void
}

/** One month tile's derived state (`btnProps()`'s first argument). */
export interface IDatePickerMonthsItem {
    isDisabled: boolean
    text: string
    value: number
}

/** Pre-wired `<origam-btn>` props (`btnProps()`'s return value) — spread
 *  them onto a custom render to keep the active/disabled/click wiring. */
export interface IDatePickerMonthsButtonProps {
    active: boolean
    color: TColor | undefined
    disabled: boolean
    rounded: boolean
    text: string
    key: string
    onClick: () => void
}

/** Scope for the `month` slot. */
export interface IDatePickerMonthsSlot {
    month: IDatePickerMonthsItem
    index: number
    props: IDatePickerMonthsButtonProps
}

export interface IDatePickerMonthsSlots {
    month?: (props: IDatePickerMonthsSlot) => any
}
