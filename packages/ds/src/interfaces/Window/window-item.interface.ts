import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type {
    IGroupEmits,
    IGroupItemProps
} from '../Commons/group.interface'
import type { ILazyProps } from '../Commons/lazy.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'

export interface IWindowItemProps extends ICommonsComponentProps, ILazyProps, IGroupItemProps, ITransitionComponentProps {
    transition?: boolean | string
    reverseTransition?: boolean | string
}

/** Emits fired by `<OrigamWindowItem>` — group membership lifecycle. */
export interface IWindowItemEmits extends IGroupEmits {}

/** Slot signatures for `<OrigamWindowItem>`. */
export interface IWindowItemSlots {
    default?: () => any
}
