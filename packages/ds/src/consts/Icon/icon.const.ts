import type { InjectionKey } from 'vue'
import { OrigamClassIcon, OrigamSvgIcon } from '../../components/Icon'

import type { IIconSet } from '../../interfaces'

import type { TIconOptions } from '../../types'

export const ORIGAM_ICONS_KEY: InjectionKey<Required<TIconOptions>> = Symbol.for('origam:icons')

export const DEFAULT_SETS: Record<string, IIconSet> = {
    svg: {
        component: OrigamSvgIcon
    },
    class: {
        component: OrigamClassIcon
    }
}
