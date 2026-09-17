import type { IBorderProps } from '../Commons/border.interface'
import type {
    IClickEmits,
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IColorProps } from '../Commons/color.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRippleProps } from '../Commons/ripple.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'

import type { TIcon } from '../../types/Icon/icon.type'

export interface IRatingFieldItemProps extends ICommonsComponentProps, ITagProps, IColorProps, IDensityProps, IRippleProps, ISizeProps, IBorderProps, IPaddingProps, IMarginProps, IRoundedProps, IElevationProps {
    name?: string
    index?: number
    value: number
    label?: string
    itemAriaLabel?: string
    showStar?: boolean
    isFilled?: boolean
    isHovered?: boolean
    isHovering?: boolean
    disabled?: boolean
    readonly?: boolean
    fullIcon?: TIcon
    emptyIcon?: TIcon
    halfIncrements?: boolean
    checked?: boolean
    length?: number | string
}

/** Emits fired by `<OrigamRatingFieldItem>` — click + hover surface
 *  (pointer enter / leave drive the half-rating preview), plus the two
 *  KEYBOARD channels added by #812.
 *
 *  `change` is the native `<input type="radio">` change event. It is the only
 *  signal a keyboard selection produces: the browser's own radio-group
 *  navigation (arrows, `Space`) fires `click` + `change` on the newly selected
 *  radio and never touches the star `<div>` the pointer path goes through. Not
 *  forwarding it is exactly why arrows moved nothing before #812.
 *
 *  `keydown` carries the keys the platform does NOT implement for a radio
 *  group — measured in Chromium: `Home` and `End` are plain no-ops natively,
 *  so the WAI-ARIA radiogroup pattern's "go to first / last" has to be
 *  written. The parent also uses this channel to cancel the native arrow /
 *  `Space` default while `readonly`. */
export interface IRatingFieldItemEmits extends IClickEmits {
    (e: 'mouseenter', event: MouseEvent): void
    (e: 'mouseleave', event: MouseEvent): void
    (e: 'change', event: Event): void
    (e: 'keydown', event: KeyboardEvent): void
}

/** Slot signatures for `<OrigamRatingFieldItem>`. */
export interface IRatingFieldItemSlots {
    /** Overrides the star/icon button — `props` is the resolved
     *  `<OrigamBtn>` prop bag (icon, color, ripple, click handlers…). */
    item?: (data: { props: Record<string, unknown>, value: number }) => any
}
