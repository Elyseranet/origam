import type { TSheetSnapId } from '../../types'

/**
 * Emit signature for `<OrigamSheet>`.
 *
 * - `update:snap` fires whenever the gesture or `snapTo()` settles on a
 *   new snap-point id. Useful for analytics or to drive an external
 *   state machine (e.g. router-backed sheets).
 * - `update:open` is the v-model:open companion — emitted on the
 *   closed/non-closed boundary so two-way binding stays consistent
 *   when the user dismisses via swipe-down.
 */
export interface ISheetEmits {
    (e: 'update:snap', id: TSheetSnapId): void

    (e: 'update:open', value: boolean): void
}
