import type {
    IActiveProps,
    IAdjacentEmits,
    IAdjacentProps,
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
