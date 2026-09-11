import type {
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IMarginProps,
    IPaddingProps,
    IProgressCircularProps,
    IProgressLinearProps,
    ITagProps
} from '../../interfaces'

import type { TProgressType } from '../../types'

export interface IProgressProps extends IProgressLinearProps, IProgressCircularProps {
    type?: TProgressType
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
