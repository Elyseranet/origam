/**
 * reference-row.util.ts — helpers over `IReferenceRow`, the row shape shared
 * by every `RowList` table of the reference pages.
 */

import type { IReferenceRow } from '~/interfaces/reference-row.interface'

/**
 * The paste-ready Vue attribute for a component prop row:
 *   - boolean type   → `disabled`          (presence = true)
 *   - any other type → `:prop-name=""`     (binding with an empty value)
 *
 * Passed to `<row-list :copy-value>` by the component props table.
 */
export function propCopyAttr (row: IReferenceRow): string {
    const typeLabel = !row.type ? '' : (typeof row.type === 'object' ? row.type.label : row.type)
    const kebab = row.label.replace(/([A-Z])/g, '-$1').toLowerCase()
    const isBoolean = typeLabel === 'boolean' || typeLabel.startsWith('boolean ')

    return isBoolean ? kebab : `:${ kebab }=""`
}
