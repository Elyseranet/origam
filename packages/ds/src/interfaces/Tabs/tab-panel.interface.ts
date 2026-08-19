import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IGroupItemProps } from '../Commons/group.interface'
import type { ILazyProps } from '../Commons/lazy.interface'

/**
 * Props for `<OrigamTabPanel>` — a single tab content panel.
 *
 *  - `value`   identifier matching the sibling `<OrigamTab>`.
 *  - `eager`   if `false` (default) the panel content is mounted
 *              only when first activated and kept alive afterwards.
 *              If `true`, the content is mounted from the start.
 */
export interface ITabPanelProps extends ICommonsComponentProps, ITagProps, IGroupItemProps, ILazyProps {
    tag?: string
}

/** Slot signatures for `<OrigamTabPanel>`. */
export interface ITabPanelSlots {
    default?: () => any
}
