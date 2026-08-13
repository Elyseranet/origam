import type {
    IActiveProps,
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots,
    IBorderProps,
    IBgColorProps,
    IClickCloseEmits,
    IClickEmits,
    IColorProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDensityProps,
    IElevationProps,
    IGroupEmits,
    IGroupItemProps,
    IHoverProps,
    ILinkProps,
    IMarginProps,
    IPaddingProps,
    IRippleProps,
    IRoundedProps,
    ISizeProps,
    ITagProps,
    ITypographyProps
} from '../../interfaces'

import type { TIcon } from '../../types'

export interface IChipProps extends ICommonsComponentProps, IAdjacentProps, ITagProps, IColorProps, IBgColorProps, IRippleProps, IBorderProps, IRoundedProps, IPaddingProps, IMarginProps, IDensityProps, IGroupItemProps, ILinkProps, ISizeProps, IElevationProps, IActiveProps, IHoverProps, ITypographyProps {
    closable?: boolean
    closeIcon?: TIcon
    closeLabel?: string
    draggable?: boolean
    filter?: boolean
    filterIcon?: TIcon
    label?: boolean
    link?: boolean
    pill?: boolean
    text?: string
    modelValue?: boolean
}

/** Emits fired by `<OrigamChip>` — generic click, close button, group
 *  membership, prepend/append icons, and v-model on dismissal. */
export interface IChipEmits extends ICommonsComponentEmits, IClickEmits, IClickCloseEmits, IAdjacentEmits, IGroupEmits {}

/** Slot signatures for `<OrigamChip>`. */
export interface IChipSlots extends IAdjacentSlots {
    /** Shown while `filter` is set and the chip is selected. */
    filter?: (data: { filterIcon: TIcon | undefined }) => any
    /** Overrides the `text` prop, receives the group-membership API when
     *  the chip lives inside an `<OrigamChipGroup>`. */
    default?: (data: {
        isSelected: boolean | undefined
        selectedClass: Array<string | undefined> | false | undefined
        select: ((value: boolean) => void) | undefined
        toggle: (() => void) | undefined
        value: unknown
        disabled: boolean | undefined
    }) => any
    close?: (data: { closeIcon: TIcon | undefined }) => any
}
