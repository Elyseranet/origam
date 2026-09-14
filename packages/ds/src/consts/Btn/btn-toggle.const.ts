import type { InjectionKey } from 'vue'
import type { IGroupProvide } from '../../interfaces/Commons/group.interface'

export const ORIGAM_BTN_TOGGLE_KEY: InjectionKey<IGroupProvide> = Symbol.for('origam:btn-toggle')
