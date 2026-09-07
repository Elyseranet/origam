import type { IActiveEmits } from '../Commons/active.interface'

import type { TSheetSnapId } from '../../types/Sheet/sheet.type'

/**
 * Emit signature for `<OrigamSheet>`.
 *
 * - `update:snap` fires whenever the gesture or `snapTo()` settles on a
 *   new snap-point id. Useful for analytics or to drive an external
 *   state machine (e.g. router-backed sheets).
 * - `update:open` is the v-model:open companion — emitted on the
 *   closed/non-closed boundary so two-way binding stays consistent
 *   when the user dismisses via swipe-down.
 * - `update:active` vient de `useStateFlag(props, { state: 'active' })` :
 *   son `toggle()` est câblé sur `@click` — et UNIQUEMENT là — puis écrit
 *   dans le v-model `active`. L'émission partait sans être déclarée.
 *   Prouvé au runtime dans
 *   `packages/tests/TU/origam/relay-emits-declaration.spec.ts`.
 *
 *   ⛔ Ce commentaire a longtemps annoncé « le clic ET `keydown.enter` /
 *   `keydown.space` », et un composable `useActive` qui n'existe plus.
 *   Ni l'un ni l'autre n'est vrai : le template de `OrigamSheet.vue` ne
 *   lie que `@click`, et son `tag` par défaut est `div` — donc aucun
 *   élément natif ne convertit une touche en clic. Le chemin clavier
 *   n'existe pas.
 */
export interface ISheetEmits extends IActiveEmits {
    (e: 'update:snap', id: TSheetSnapId): void

    (e: 'update:open', value: boolean): void
}

/** Slot signatures for `<OrigamSheet>`. */
export interface ISheetSlots {
    default?: () => any
}
