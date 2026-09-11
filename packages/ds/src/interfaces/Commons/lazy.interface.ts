import type { ICommonsComponentEmits, ICommonsComponentProps, IDimensionProps, ITagProps, ITransitionComponentProps } from '../../interfaces'

export interface ILazyProps {
    eager?: boolean
}

export interface ILazyComponentProps extends ICommonsComponentProps, IDimensionProps, ITagProps, ITransitionComponentProps {
    modelValue?: boolean
    options?: IntersectionObserverInit
}

/** Emits fired by `<OrigamLazy>` — v-model fires when the intersection
 *  observer flips the wrapper to "visible". */
export interface ILazyEmits extends ICommonsComponentEmits {}
