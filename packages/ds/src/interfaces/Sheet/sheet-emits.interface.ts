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
 * - `update:active` vient de `useActive(props)` : `onActive()` est câblé
 *   sur le clic ET sur `keydown.enter` / `keydown.space` du template, et
 *   écrit dans le v-model `active`. L'émission partait sans être
 *   déclarée. Prouvé au runtime dans
 *   `packages/tests/TU/origam/relay-emits-declaration.spec.ts`.
 */
export interface ISheetEmits extends IActiveEmits {
    (e: 'update:snap', id: TSheetSnapId): void

    (e: 'update:open', value: boolean): void
}

/** Slot signatures for `<OrigamSheet>`. */
export interface ISheetSlots {
    default?: () => any
}
