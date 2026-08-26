import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { IMarginProps } from '../Commons/margin.interface'

export interface IDividerProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IMarginProps, IDirectionProps {
    inset?: boolean
    length?: number | string
    thickness?: number | string
}

/*********************************************************
 * IDividerEmits
 *
 * @description
 * Emits fired by `<OrigamDivider>` — none. Renders a bare `<hr>`,
 * no interactive state.
 ********************************************************/
export interface IDividerEmits {}

/*********************************************************
 * IDividerSlots
 *
 * @description
 * Slot signatures for `<OrigamDivider>` — none. The rendered `<hr>`
 * cannot host content.
 ********************************************************/
export interface IDividerSlots {}
