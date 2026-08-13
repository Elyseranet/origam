import { OrigamInlineEdit } from '../../components'

export type TOrigamInlineEdit = InstanceType<typeof OrigamInlineEdit>

/**
 * Native HTML input types accepted by `<OrigamInlineEdit>` when not in
 * multiline mode. Intentionally a closed set — `password`, `file`,
 * `checkbox`, … don't fit the edit-in-place pattern and would require
 * a different UX surface.
 */
export type TInlineEditInputType = 'text' | 'number' | 'email' | 'tel'
