import type { ISelectionGroupContext } from "../../interfaces"
import type { InjectionKey } from 'vue'

export const ORIGAM_SELECTION_CONTROL_GROUP_KEY: InjectionKey<ISelectionGroupContext> = Symbol.for('origam:selection-control-group')
