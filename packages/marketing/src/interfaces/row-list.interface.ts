import type {
  ICommonsComponentEmits,
  ICommonsComponentProps,
  ICommonsComponentSlots
} from 'origam/interfaces'

import type { IReferenceRow } from '~/interfaces/reference-row.interface'
import type { TReferenceRowCopyValue } from '~/types/reference-row.type'

export interface IRowListProps extends ICommonsComponentProps {
  /** One row per label — see reference-row.interface.ts for the shape every table on these pages now shares. */
  items: IReferenceRow[]
  /**
   * `data-cy` prefix for each row, e.g. `"prop-row"` → `data-cy="prop-row-bg-color"`.
   * The suffix is the row's sanitized `label` (falls back to its index when
   * the row has no label, e.g. a util's single return value).
   */
  rowPrefix?: string
  /**
   * What the row's copy button puts on the clipboard. Defaults to the row's
   * `label`. A page that wants another payload (the component props table
   * copies a paste-ready attribute, see `propCopyAttr`) passes it here rather
   * than re-declaring the `title` slot: that slot also carries the type, the
   * default value and the `required` badge, which a re-declaration drops (#1169).
   */
  copyValue?: TReferenceRowCopyValue
}

export interface IRowListEmits extends ICommonsComponentEmits {

}

export interface IRowListSlots extends ICommonsComponentSlots {
  item: (props: { item: IReferenceRow }) => any
  title: (props: { label: string, item: IReferenceRow }) => any
  /** The visible label only, inside the monospace name (e.g. the `.` prefix of a directive modifier). The copy button, type, default and `required` stay in place. */
  name: (props: { label: string, item: IReferenceRow }) => any
  required: (props: { required: boolean }) => any
  type: (props: { type: IReferenceRow['type'] }) => any
  value: (props: { value: string | undefined }) => any
  description: (props: { descriptionKey: string | undefined, descriptionFallback: string }) => any
}
