import type { ComponentPublicInstance } from 'vue'
import type { IDelayProps } from './delay.interface'

export interface IActivatorProps extends IDelayProps {
    target?: 'parent' | 'cursor' | (string & {}) | Element | ComponentPublicInstance | [x: number, y: number] | undefined
    activator?: 'parent' | 'cursor' | (string & {}) | Element | ComponentPublicInstance
    activatorProps?: any

    openOnClick?: boolean
    openOnContextMenu?: boolean
    openOnHover?: boolean
    openOnFocus?: boolean

    closeOnContentClick?: boolean
}
