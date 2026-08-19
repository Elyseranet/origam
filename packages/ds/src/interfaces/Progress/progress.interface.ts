import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IProgressCircularProps } from './progress-circular.interface'
import type { IProgressLinearProps } from './progress-linear.interface'

import type { TProgressType } from '../../types/Progress/progress.type'

export interface IProgressProps extends IProgressLinearProps, IProgressCircularProps {
    type?: TProgressType
}

/** Slot signatures for `<OrigamProgress>`. */
export interface IProgressSlots {
    default?: () => any
}

export interface IProgressTypeProps extends ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps {
    indeterminate?: boolean
    modelValue?: string | number
    thickness?: string | number
    active?: boolean
    absolute?: boolean
    max?: number | string
    striped?: boolean
    /**
     * Accessible label for the progress bar (aria-label). When omitted,
     * defaults to `'Loading'`. Pass a localised string via your i18n
     * provider or the parent component's `labels` mechanism.
     */
    label?: string
}
