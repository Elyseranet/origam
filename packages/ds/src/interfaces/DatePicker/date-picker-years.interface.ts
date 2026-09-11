import type { IColorProps, ICommonsComponentProps, IDimensionProps } from "../../interfaces"

export interface IDatePickerYearsProps extends ICommonsComponentProps, IColorProps, IDimensionProps {
    min?: unknown
    max?: unknown
    year?: number
}

/** Emits fired by `<OrigamDatePickerYears>` — click on a year tile. */
export interface IDatePickerYearsEmits {
    (e: 'update:year', value: number): void
}
