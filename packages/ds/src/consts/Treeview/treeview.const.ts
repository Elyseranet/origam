import type { InjectionKey } from 'vue'
import type { ITreeviewProvide } from '../../interfaces/Treeview/treeview.interface'

export const ORIGAM_TREEVIEW_KEY: InjectionKey<ITreeviewProvide> = Symbol.for('origam:treeview')
