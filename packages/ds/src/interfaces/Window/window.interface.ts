import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    ICommonsComponentEmits,
    ICommonsComponentProps,
    IDirectionProps,
    IElevationProps,
    IGroupProvide,
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

/** Navigation button props forwarded by `<OrigamWindow>` to its
 *  prev/next `<origam-btn>` (spread via `v-bind`). */
export interface IWindowNavBtnProps {
    icon: TIcon
    class: string
    onClick: () => void
    'aria-label': string
}

/** Slot signatures for `<OrigamWindow>`. `default` / `additional`
 *  receive the window's own selection/navigation API (`useGroup`
 *  return value); `arrows` / `prev` / `next` receive the pre-built
 *  navigation button props. */
export interface IWindowSlots {
    default?: (group: IGroupProvide) => any
    arrows?: (data: { prevProps: IWindowNavBtnProps, nextProps: IWindowNavBtnProps, canMoveBack: boolean, canMoveForward: boolean }) => any
    prev?: (data: { props: IWindowNavBtnProps, canMove: boolean }) => any
    next?: (data: { props: IWindowNavBtnProps, canMove: boolean }) => any
    additional?: (group: IGroupProvide) => any
}
