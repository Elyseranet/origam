import type { IWindowProvide } from '../../interfaces'

import type { TTransitionMode, TTransitionProps } from '../../types'

export interface ITransitionComponentProps {
    transition?: boolean | string | TTransitionProps
    disabled?: boolean
}

export interface ITransitionProps {
    mode?: TTransitionMode
    disabled?: boolean
    name?: string
    group?: boolean
    hideOnLeave?: boolean
    leaveAbsolute?: boolean
    origin?: string
}

export interface ITranslateScaleProps extends ITransitionProps {
    target?: HTMLElement | [x: number, y: number]
}

export interface ITransitionWindowProps extends ITransitionProps {
    window?: IWindowProvide
}
