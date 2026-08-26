import type { IActiveProps } from '../Commons/active.interface'
import type { IAdjacentProps } from '../Commons/adjacent.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IListGroupProps extends ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IPaddingProps, IMarginProps, IBorderProps, IRoundedProps, IAdjacentProps, IActiveProps, IHoverProps {
    collapseIcon?: TIcon
    expandIcon?: TIcon
    fluid?: boolean
    title?: string
    value?: any
}

export interface IListActivatorProps extends ICommonsComponentProps, ITagProps {

}

/*********************************************************
 * IListActivatorEmits
 *
 * @description
 * `<OrigamListGroupActivator>` emits nothing of its own — it's a
 * transparent chrome wrapper around the `default` slot; the actual
 * toggle click is handled/emitted by the parent `<OrigamListGroup>`.
 ********************************************************/
export interface IListActivatorEmits {}

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
