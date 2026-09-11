import type { InjectionKey } from 'vue'
import { BREAKPOINTS } from '../../enums'

import type { IDisplayInstance, IDisplayOptions } from '../../interfaces'

import type { TBreakpoint } from '../../types'

export const ORIGAM_DISPLAY_KEY: InjectionKey<IDisplayInstance> = Symbol.for('origam:display')

export const DEFAULT_DISPLAY_OPTIONS: IDisplayOptions = {
    mobileBreakpoint: 'lg',
    thresholds: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
        xxl: 2560
    }
}

export const BREAKPOINTS_ARRAY: Array<TBreakpoint> = [BREAKPOINTS.SM, BREAKPOINTS.MD, BREAKPOINTS.LG, BREAKPOINTS.XL, BREAKPOINTS.XXL]
