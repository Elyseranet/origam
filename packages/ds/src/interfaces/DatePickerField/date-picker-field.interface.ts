import type { IAdjacentSlots } from '../Commons/adjacent.interface'
import type { IChipProps } from '../Chip/chip.interface'
import type { IFieldSlots } from '../Field/field.interface'
import type { IMenuProps } from '../Menu/menu.interface'
import type { ITextFieldProps } from '../TextField/text-field.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'

export interface IDatePickerFieldProps extends ITextFieldProps, ITransitionComponentProps {
    menu?: boolean,
    menuProps?: IMenuProps,
    range?: boolean
    multiple?: boolean
    openOnClear?: boolean
    closeText?: string
    openText?: string
    closeOnSelect?: boolean
    chipProps?: IChipProps
    closableChips?: boolean
}

/** Slot signatures for `<OrigamDatePickerField>` — the field chrome
 *  slots (`IFieldSlots` minus its scoped `default`, since this field
 *  renders its own selection markup instead) plus `prepend` / `append`
 *  (`IAdjacentSlots`) and the date-selection overrides. */
export interface IDatePickerFieldSlots extends Omit<IFieldSlots, 'default'>, IAdjacentSlots {
    /** Overrides the formatted range text (`range` mode, single-select display). */
    rangeSelection?: () => any
    /** Overrides one selected-date chip (`multiple` mode). */
    chip?: (data: { item: string, index: number, props: Record<string, unknown> }) => any
    /** Overrides a single selected-date's text representation. */
    selection?: () => any
}
