import type { InjectionKey } from 'vue'
import type { IGroupItemProvide } from '../../interfaces'

export const ORIGAM_EXPANSION_PANEL_KEY: InjectionKey<IGroupItemProvide> = Symbol.for('origam:expansion-panel')
