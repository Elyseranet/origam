import type { InjectionKey } from 'vue'
import type { IMenuProvide } from '../../interfaces/Menu/menu.interface'

export const ORIGAM_MENU_KEY: InjectionKey<IMenuProvide> = Symbol.for('origam:menu')
