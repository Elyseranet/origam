import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type {
    IGroupEmits,
    IGroupItemProps
} from '../Commons/group.interface'
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

/*********************************************************
 * ITabPanelEmits
 *
 * @description
 * `<OrigamTabPanel>` self-registers into the `ORIGAM_TAB_PANELS_KEY`
 * group via `useGroupItem`, which genuinely emits `group:selected` on
 * this component's own instance whenever `isSelected` changes.
 ********************************************************/
export interface ITabPanelEmits extends IGroupEmits {}

/** Slot signatures for `<OrigamTabPanel>`. */
export interface ITabPanelSlots {
    default?: () => any
}
