import { OrigamInlineEdit } from '../../components'

import type { TTextFieldType } from '../TextField/text-field.type'

export type TOrigamInlineEdit = InstanceType<typeof OrigamInlineEdit>

/**
 * Native HTML input types accepted by `<OrigamInlineEdit>` when not in
 * multiline mode. Intentionally a closed set — `password`, `file`,
 * `checkbox`, … don't fit the edit-in-place pattern and would require
 * a different UX surface.
 *
 * Narrows the shared `TEXT_FIELD_TYPE` vocabulary rather than declaring
 * a second, near-identical enum of HTML input types.
 */
export type TInlineEditInputType = Extract<TTextFieldType, 'text' | 'number' | 'email' | 'tel'>
