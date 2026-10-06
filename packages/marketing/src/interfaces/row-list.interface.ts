import type {
  ICommonsComponentEmits,
  ICommonsComponentProps,
  ICommonsComponentSlots
} from 'origam/interfaces'

import type { IReferenceRow } from '~/interfaces/reference-row.interface'

export interface IRowListProps extends ICommonsComponentProps {
  /** One row per label — see reference-row.interface.ts for the shape every table on these pages now shares. */
  items: IReferenceRow[]
  /**
   * `data-cy` prefix for each row, e.g. `"prop-row"` → `data-cy="prop-row-bg-color"`.
   * The suffix is the row's sanitized `label` (falls back to its index when
   * the row has no label, e.g. a util's single return value).
   */
  rowPrefix?: string
}

export interface IRowListEmits extends ICommonsComponentEmits {

}

export interface IRowListSlots extends ICommonsComponentSlots {
  item: (props: { item: IReferenceRow }) => any
  title: (props: { label: string, item: IReferenceRow }) => any
  required: (props: { required: boolean }) => any
  type: (props: { type: IReferenceRow['type'] }) => any
  value: (props: { value: string | undefined }) => any
  description: (props: { descriptionKey: string | undefined, descriptionFallback: string }) => any
}
