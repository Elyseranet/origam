import type { IReferenceRow } from '~/interfaces/reference-row.interface'

/** Computes the clipboard payload of one `RowList` row — see `IRowListProps.copyValue`. */
export type TReferenceRowCopyValue = (row: IReferenceRow) => string
