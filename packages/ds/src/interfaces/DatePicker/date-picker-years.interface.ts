import type { IColorProps, ICommonsComponentProps, IDimensionProps } from "../../interfaces"

import type { TColor } from "../../types"

export interface IDatePickerYearsProps extends ICommonsComponentProps, IColorProps, IDimensionProps {
    min?: unknown
    max?: unknown
    year?: number
}

/** Emits fired by `<OrigamDatePickerYears>` — click on a year tile. */
export interface IDatePickerYearsEmits {
    (e: 'update:year', value: number): void
}

/** One year tile's derived state (`btnProps()`'s first argument). */
export interface IDatePickerYearsItem {
    text: string
    value: number
}

/** Pre-wired `<origam-btn>` props (`btnProps()`'s return value) — spread
 *  them onto a custom render to keep the active/scroll-into-view/click
 *  wiring. `ref` is only set on the currently-selected tile (drives the
 *  mount-time `scrollIntoView`). Typed `unknown`, not `TTemplateRef`: Vue
 *  treats an object's `ref` key as a reserved vnode binding and rewrites
 *  its type through its own `Ref`-unwrapping machinery at the template
 *  boundary, so the concrete `templateRef()` return type never survives
 *  the round-trip — this field exists for spreading, not for reading. */
export interface IDatePickerYearsButtonProps {
    ref: unknown
    active: boolean
    color: TColor | undefined
    rounded: boolean
    text: string
    key: string
    onClick: () => void
}

/** Scope for the `year` slot. */
export interface IDatePickerYearsSlot {
    year: IDatePickerYearsItem
    index: number
    props: IDatePickerYearsButtonProps
}

export interface IDatePickerYearsSlots {
    year?: (props: IDatePickerYearsSlot) => any
}
