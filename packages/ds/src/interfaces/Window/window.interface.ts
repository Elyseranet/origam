import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDirectionProps,
    IElevationProps,
    IHoverProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITagProps,
    ITouchHandlers
} from '../../interfaces'

import type { TIcon } from '../../types'

import type { ComputedRef, Ref } from 'vue'

export interface IWindowProps extends ICommonsComponentProps, ITagProps, IDirectionProps, IBorderProps, IPaddingProps, IMarginProps, IRoundedProps, IElevationProps, IBgColorProps, IHoverProps, IActiveProps {
    continuous?: boolean,
    nextIcon?: TIcon
    prevIcon?: TIcon
    reverse?: boolean,
    showArrows?: string | boolean
    touch?: boolean | ITouchHandlers
    modelValue?: any
    disabled?: boolean
    selectedClass?: string
    mandatory?: boolean
}

export interface IWindowProvide {
    transition: ComputedRef<undefined | string>
    transitionCount: Ref<number>
    transitionHeight: Ref<undefined | string>
    isReversed: Ref<boolean>
    rootRef: Ref<HTMLElement | undefined>
}

/** Emits fired by `<OrigamWindow>` — v-model on the active slide. */
export interface IWindowEmits extends ICommonsComponentEmits {}
