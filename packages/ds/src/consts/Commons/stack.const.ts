import type { IStackProvide } from '../../interfaces/Commons/stack.interface'

import type { InjectionKey } from 'vue'
import { reactive } from 'vue'

export const ORIGAM_STACK_KEY: InjectionKey<IStackProvide> = Symbol.for('origam:stack')

export const GLOBAL_STACK = reactive<Array<[uid: number, zIndex: number]>>([])

/**
 * Gap inserted between two consecutive entries of `GLOBAL_STACK`.
 *
 * A newly activated overlay takes the previous top entry's z-index plus
 * this step, leaving room for a component to layer its own internals
 * (scrim, content, close affordance) between two stack rungs without
 * escaping its own band.
 */
export const STACK_Z_INDEX_STEP = 10
