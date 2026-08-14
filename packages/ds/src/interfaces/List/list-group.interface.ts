import type {
    IActiveProps,
    IAdjacentProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IHoverProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

import type { TIcon } from '../../types'

export interface IListGroupProps extends ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IAdjacentProps, IActiveProps, IHoverProps {
    collapseIcon?: TIcon
    expandIcon?: TIcon
    fluid?: boolean
    title?: string
    value?: any
}

export interface IListActivatorProps extends ICommonsComponentProps, ITagProps {

}

/** Slot signatures for `<OrigamListGroupActivator>`. */
export interface IListActivatorSlots {
    default?: () => any
}

/** Emits fired by `<OrigamListGroup>` — click on the activator chrome
 *  (used by parents to toggle the open state). */
export interface IListGroupEmits {
    (e: 'click:activator', payload: { open: boolean; event: Event }): void
}

/** Scope forwarded to `<OrigamListGroup>`'s `activator` slot (and
 *  forwarded straight through by `<OrigamList>` / `<OrigamListChildren>`'s
 *  own `groupActivator` slot). */
export interface IListGroupActivatorSlotProps {
    events: Record<string, unknown>
    props: IListActivatorProps
    isOpen: boolean
    toggleIcon?: TIcon
}

/** Slot signatures for `<OrigamListGroup>`. */
export interface IListGroupSlots {
    default?: () => any
    activator?: (data: IListGroupActivatorSlotProps) => any
    items?: () => any
}
