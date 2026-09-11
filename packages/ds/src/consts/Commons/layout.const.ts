import type { InjectionKey, ShallowRef } from 'vue'
import type { ILayoutProvide } from '../../interfaces'

export const ORIGAM_LAYOUT_KEY: InjectionKey<ILayoutProvide> = Symbol.for('origam:layout')
export const ORIGAM_LAYOUT_ITEM_KEY: InjectionKey<ShallowRef<{ id: string; }>> = Symbol.for('origam:layout-item')

export const ROOT_ZINDEX = 1000
