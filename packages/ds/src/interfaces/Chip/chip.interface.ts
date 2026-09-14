import type { IActiveProps } from '../Commons/active.interface'
import type {
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    IClickCloseEmits,
    IClickEmits,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type {
    IGroupEmits,
    IGroupItemProps
} from '../Commons/group.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILinkProps } from '../Commons/router.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRippleProps } from '../Commons/ripple.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IChipProps extends ICommonsComponentProps, IAdjacentProps, ITagProps, IColorProps, IBgColorProps, IRippleProps, IBorderProps, IRoundedProps, IPaddingProps, IMarginProps, IDensityProps, IGroupItemProps, ILinkProps, ISizeProps, IElevationProps, IActiveProps, IHoverProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight'> {
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
