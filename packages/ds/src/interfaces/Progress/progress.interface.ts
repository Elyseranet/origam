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

export interface IProgressEmits {}

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
     * Accessible label for the progress bar (aria-label). Carries a
     * **locale key**, not final text — it is resolved through the DS
     * `t()` mechanism, so it follows the active locale out of the box.
     * Defaults to `'origam.loading'`.
     *
     * A raw string that matches no key is returned unchanged, so
     * `label="Uploading photo"` still works for consumers who prefer to
     * translate on their side.
     */
    label?: string
}
