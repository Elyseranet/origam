import type { InjectionKey } from 'vue'
import type { IExpansionPanelGroupItemProvide } from '../../interfaces/ExpansionPanel/expansion-panel.interface'

export const ORIGAM_EXPANSION_PANEL_KEY: InjectionKey<IExpansionPanelGroupItemProvide> = Symbol.for('origam:expansion-panel')
