import type { IStackProvide } from '../../interfaces'

import type { InjectionKey } from 'vue'
import { reactive } from 'vue'

export const ORIGAM_STACK_KEY: InjectionKey<IStackProvide> = Symbol.for('origam:stack')

export const GLOBAL_STACK = reactive<Array<[uid: number, zIndex: number]>>([])
