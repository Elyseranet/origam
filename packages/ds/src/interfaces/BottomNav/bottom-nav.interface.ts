import type { IActiveProps } from '../Commons/active.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type { IBtnProps } from '../Btn/btn.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IGroupProps } from '../Commons/group.interface'
import type {
    IHoverEmits,
    IHoverProps
} from '../Commons/hover.interface'
import type { ILayoutItemProps } from '../Commons/layout.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'

import type { TBottomNavPosition } from '../../types/BottomNav/bottom-nav.type'
import type { TNavMode } from '../../types/Commons/mode.type'

export interface IBottomNavProps extends ITagProps, ICommonsComponentProps, IColorProps, IBgColorProps, IPaddingProps, IBorderProps, IElevationProps, IMarginProps, IDimensionProps, IDensityProps, IRoundedProps, ILayoutItemProps, IGroupProps, IHoverProps, IActiveProps, ITransitionComponentProps {
    grow?: boolean
    mode?: TNavMode
    items?: Array<IBtnProps>
    /**
     * Horizontal placement of the bar when it does not span the full width
     * (e.g. a custom `width`): `'start'` (inline-start), `'center'` or
     * `'end'` (inline-end).
     *
     * @default 'start'
     */
    position?: TBottomNavPosition
}

/** Emits fired by `<OrigamBottomNav>` — visibility v-model (`modelValue`) +
 *  hover propagation.
 *
 *  ⛔ Does NOT extend `IActiveEmits` (#unemitted-declarations lot 2/4).
 *  `active` state is sourced from `modelValue`
 *  (`useStateFlag(props, {state: 'active', source: 'modelValue'})` in
 *  `OrigamBottomNav.vue`), not from the `active` prop — the `active` /
 *  `activeClass` props (via `IActiveProps`, still extended by
 *  `IBottomNavProps`) are a PASS-THROUGH default forwarded to child
 *  `<origam-btn>` items, never a v-model the nav itself writes back to. A
 *  `update:active` emit therefore had no real writer: verified by mutation
 *  (`packages/tests/TU/origam/bottom-nav-active-dead.spec.ts`) that no
 *  interaction ever fires it, while `update:hover` (kept) genuinely does via
 *  the `useStateFlag`/`useVModel` relay — see
 *  `guards/lib/dead-emits.mjs`'s `computeStateFlagEmitted()`. */
export interface IBottomNavEmits extends ICommonsComponentEmits, IHoverEmits {}

/** Slot signatures for `<OrigamBottomNav>`. `item.{index}` (e.g.
 *  `item.0`) overrides a single button by position; `item` is the
 *  fallback used by every index without its own `item.{index}` slot. */
export interface IBottomNavSlots {
    default?: () => any
    [key: `item.${number}`]: ((data: { props: IBtnProps }) => any) | undefined
    item?: (data: { props: IBtnProps, index: number }) => any
}
