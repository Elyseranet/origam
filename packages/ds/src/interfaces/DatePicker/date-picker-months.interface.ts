import type { IColorProps, ICommonsComponentProps, IDimensionProps } from "../../interfaces"

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
