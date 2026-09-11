import type { IGroupItemProvide } from '../../interfaces/Commons/group.interface'
import type { IWindowProvide } from '../../interfaces/Window/window.interface'

import type { InjectionKey } from 'vue'

export const ORIGAM_WINDOW_KEY: InjectionKey<IWindowProvide> = Symbol.for('origam:window')
export const ORIGAM_WINDOW_GROUP_KEY: InjectionKey<IGroupItemProvide> = Symbol.for('origam:window-group')
