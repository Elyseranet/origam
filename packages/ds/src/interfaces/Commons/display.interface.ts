import type { Ref } from 'vue'
import type { TBreakpoint, TDisplayThresholds } from '../../types'

export interface IDisplayProps {
    mobileBreakpoint?: number | TBreakpoint
}

export interface IDisplayOptions {
    mobileBreakpoint?: number | TBreakpoint
    thresholds?: Partial<TDisplayThresholds>
}

export interface IDisplayPlatform {
    android: boolean
    ios: boolean
    cordova: boolean
    electron: boolean
    chrome: boolean
    edge: boolean
    firefox: boolean
    opera: boolean
    win: boolean
    mac: boolean
    linux: boolean
    touch: boolean
    ssr: boolean
}

export interface IDisplayInstance {
    xs: Ref<boolean>
    sm: Ref<boolean>
    md: Ref<boolean>
    lg: Ref<boolean>
    xl: Ref<boolean>
    xxl: Ref<boolean>
    smAndUp: Ref<boolean>
    mdAndUp: Ref<boolean>
    lgAndUp: Ref<boolean>
    xlAndUp: Ref<boolean>
    smAndDown: Ref<boolean>
    mdAndDown: Ref<boolean>
    lgAndDown: Ref<boolean>
    xlAndDown: Ref<boolean>
    name: Ref<TBreakpoint>
    height: Ref<number>
    width: Ref<number>
    mobile: Ref<boolean>
    mobileBreakpoint: Ref<number | TBreakpoint>
    platform: Ref<IDisplayPlatform>
    thresholds: Ref<TDisplayThresholds>

    /** @internal */
    ssr: boolean

    update (): void
}

export interface IInternalDisplayOptions {
    mobileBreakpoint: number | TBreakpoint
    thresholds: TDisplayThresholds
}
