import type { IStackProvide } from '../../interfaces/Commons/stack.interface'

import type { InjectionKey } from 'vue'
import { reactive } from 'vue'

export const ORIGAM_STACK_KEY: InjectionKey<IStackProvide> = Symbol.for('origam:stack')

export const GLOBAL_STACK = reactive<Array<[uid: number, zIndex: number]>>([])

/*********************************************************
 * STACK_Z_INDEX_STEP
 *
 * @description
 * Gap inserted between two consecutive entries of `GLOBAL_STACK`.
 *
 * @description
 * A newly activated overlay takes the previous top entry's z-index plus
 * this step, leaving room for a component to layer its own internals
 * (scrim, content, close affordance) between two stack rungs without
 * escaping its own band.
 ********************************************************/
export const STACK_Z_INDEX_STEP = 10

/*********************************************************
 * KEYDOWN_STACK_TOP (#1492)
 *
 * @description
 * Sommet de `GLOBAL_STACK` photographie a l'arrivee d'un evenement clavier
 * (phase de capture sur `window`), par evenement. Un handler plus bas dans
 * la propagation (ex. le `keydown` du select, qui ferme son menu) peut
 * depiler un overlay avant que les ecouteurs `window` des autres ne
 * tournent : le point de reference doit etre celui du debut de l'evenement.
 ********************************************************/
export const KEYDOWN_STACK_TOP = new WeakMap<Event, number | undefined>()
