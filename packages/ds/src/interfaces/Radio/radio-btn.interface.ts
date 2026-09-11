import type {
    IClickLabelEmits,
    ICommonsComponentEmits,
    ICommonsComponentProps
} from '../Commons/commons.interface'
import type { ISelectionControlProps } from '../SelectionControl/selection-control.interface'
import type { TColor } from '../../types/Commons/color.type'
import type { TIcon } from '../../types/Icon/icon.type'

export interface IRadioBtnProps extends ICommonsComponentProps, ISelectionControlProps {

}

/**
 * Emits fired by `<OrigamRadioBtn>` — same surface as `<OrigamRadio>`.
 *
 * ⛔ `IFocusEmits` was REMOVED from this list (LOT 3, unemitted-declarations
 * guard). It declared `update:focused`, which this component cannot emit:
 * it has no focus handling at all — no `focus`/`blur` handler, no
 * `useFocus` call — and `focused` isn't even one of its props. The event
 * was dead surface: declared, never emitted, impossible to trigger.
 *
 * Same precedent as `ICheckboxBtnEmits` (`checkbox-btn.interface.ts`), same
 * reasoning: not an observable break — a consumer binding `@update:focused`
 * received nothing before and receives nothing after. The only change is
 * that the listener now flows through `$attrs` instead of being swallowed
 * by a declaration that lied about firing it.
 */
export interface IRadioBtnEmits extends ICommonsComponentEmits, IClickLabelEmits {}

/** Slot signatures for `<OrigamRadioBtn>` — forwarded, unscoped `default` /
 *  `label`, and the same `input` scope as `<OrigamSelectionControl>`. */
export interface IRadioBtnSlots {
    default?: () => any
    input?: (data: { model: any, color?: TColor, bgColor?: TColor, icon?: TIcon, props: any }) => any
    label?: () => any
}
