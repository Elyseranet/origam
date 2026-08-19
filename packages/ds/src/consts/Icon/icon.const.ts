import type { InjectionKey } from 'vue'
import { OrigamClassIcon, OrigamSvgIcon } from '../../components/Icon'

import type { IIconSet } from '../../interfaces/Icon/icon.interface'

import type { TIconOptions } from '../../types/Icon/icon.type'

export const ORIGAM_ICONS_KEY: InjectionKey<Required<TIconOptions>> = Symbol.for('origam:icons')

export const DEFAULT_SETS: Record<string, IIconSet> = {
    svg: {
        component: OrigamSvgIcon
    },
    class: {
        component: OrigamClassIcon
    }
}
