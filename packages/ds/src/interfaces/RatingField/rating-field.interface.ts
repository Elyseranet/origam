import type {
    ICommonsComponentEmits,
    IInputProps,
    ILabelProps,
    IRippleProps,
    ITagProps
} from '../../interfaces'

import type { TBlock, TIcon } from '../../types'

export interface IRatingFieldProps extends IInputProps, IRippleProps, ITagProps, ILabelProps {
    name?: string
    itemAriaLabel?: string
    clearable?: boolean
    disabled?: boolean
    emptyIcon?: TIcon
    fullIcon?: TIcon
    halfIncrements?: boolean
    hover?: boolean
    length?: number | string
    readonly?: boolean
    modelValue?: number | string
    itemLabels?: Array<string>
    itemLabelPosition?: TBlock
}

/** Emits fired by `<OrigamRatingField>` — v-model on the rating value. */
export interface IRatingFieldEmits extends ICommonsComponentEmits {}
