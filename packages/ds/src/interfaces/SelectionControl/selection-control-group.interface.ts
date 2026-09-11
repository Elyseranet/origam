import type { IColorProps, ICommonsComponentEmits, ICommonsComponentProps, IDensityProps, IRippleProps } from '../../interfaces'
import type { TIcon } from '../../types'

import { Ref } from 'vue'

export interface ISelectionControlGroupProps extends ICommonsComponentProps, IColorProps, IDensityProps, IRippleProps {
    disabled?: boolean
    /** Error state. Accepts `boolean` or a `string` error message (same contract as `IValidationProps`). */
    error?: string | boolean
    inline?: boolean
    falseIcon?: TIcon
    trueIcon?: TIcon
    multiple?: boolean
    name?: string
    readonly?: boolean
    modelValue?: any
    type?: string
    valueComparator?: (a: any, b: any) => boolean
    items?: Array<any> | Record<string, any>
}

export interface ISelectionControlGroupEmits extends ICommonsComponentEmits {

}

export interface ISelectionControlGroupSlots {
    default?: (items: Array<any> | Record<string, any>) => any
    item?: (item: any, index: number | string) => any
    [key: string]: any
}

export interface ISelectionGroupContext {
    modelValue: Ref<any>
    forceUpdate: () => void
    onForceUpdate: (fn: () => void) => void
}
