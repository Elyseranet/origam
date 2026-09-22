import type { TProbeIdentity, TProbeMode, TProbeScope } from './probe-matrix.type'

export interface IProbeConfig {
    scope: TProbeScope
    identity?: TProbeIdentity
    mode?: TProbeMode
}

export interface IProbeRow {
    config: string
    component: string
    fg: string
    bg: string
    ratio: number
}
