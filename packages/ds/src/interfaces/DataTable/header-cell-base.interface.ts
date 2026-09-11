import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IColorProps } from '../Commons/color.interface'
import type { TIcon } from '../../types/Icon/icon.type'

/*********************************************************
 * IHeaderCellProps
 *
 * @description
 * Shared base extended by every header-related DataTable surface —
 * `IDataTableHeadersProps`, `IDataTableHeadersCellProps`,
 * `IDataTableHeaderCellProps`, and `IDataTableHeadersCellMobileProps`
 * each add their own members on top. Intra-family sharing only (all
 * four consumers live under `interfaces/DataTable/`), so this does
 * not block the family-as-a-module split (issue #364 / ADR-006) — it
 * just has no single "owning" component, hence its own file rather
 * than living inside one of the four sibling files.
 ********************************************************/
export interface IHeaderCellProps extends ICommonsComponentProps, IColorProps {
    disableSort?: boolean
    headerProps?: any
    sticky?: boolean
    multiSort?: boolean
    sortAscIcon?: TIcon
    sortDescIcon?: TIcon
}
