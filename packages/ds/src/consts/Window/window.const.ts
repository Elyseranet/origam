import type { IGroupItemProvide, IWindowProvide } from '../../interfaces'

import type { InjectionKey } from 'vue'

export const ORIGAM_WINDOW_KEY: InjectionKey<IWindowProvide> = Symbol.for('origam:window')
export const ORIGAM_WINDOW_GROUP_KEY: InjectionKey<IGroupItemProvide> = Symbol.for('origam:window-group')
