import type { ICommonsComponentProps, IGroupEmits, IGroupItemProps, ILazyProps, ITransitionComponentProps } from '../../interfaces'

export interface IWindowItemProps extends ICommonsComponentProps, ILazyProps, IGroupItemProps, ITransitionComponentProps {
    transition?: boolean | string
    reverseTransition?: boolean | string
}

/** Emits fired by `<OrigamWindowItem>` — group membership lifecycle. */
export interface IWindowItemEmits extends IGroupEmits {}
