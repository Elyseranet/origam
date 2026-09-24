import type { ComponentPublicInstance } from 'vue'
import type { IDelayProps } from './delay.interface'
import type { TAnyString } from '../../types/Commons/commons.type'

export interface IActivatorProps extends IDelayProps {
    target?: 'parent' | 'cursor' | TAnyString | Element | ComponentPublicInstance | [x: number, y: number] | undefined
    activator?: 'parent' | 'cursor' | TAnyString | Element | ComponentPublicInstance
    activatorProps?: any

    openOnClick?: boolean
    openOnContextMenu?: boolean
    openOnHover?: boolean
    openOnFocus?: boolean

    closeOnContentClick?: boolean
}
