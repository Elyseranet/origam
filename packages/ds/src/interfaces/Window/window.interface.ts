import type { IActiveProps } from '../Commons/active.interface'
import type { IBgColorProps } from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDirectionProps } from '../Commons/direction.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IGroupProvide } from '../Commons/group.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITouchHandlers } from '../Commons/touch.interface'

import type { TIcon } from '../../types/Icon/icon.type'

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
