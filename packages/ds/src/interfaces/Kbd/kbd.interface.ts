import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TKbdVariant } from '../../types/Kbd/kbd.type'

export interface IKbdProps extends ICommonsComponentProps, IColorProps, IBgColorProps, ISizeProps, IBorderProps, IRoundedProps, ITypographyProps {
    /** Single key label (e.g. "⌘", "Ctrl", "A"). Overridden by the default slot. */
    text?: string
    /** Composed shortcut rendered as individual nested `<kbd>` elements (e.g. ['Ctrl', 'Shift', 'Z']). */
    combination?: string[]
    /** Character shown between each key in a combination. Defaults to '+'. */
    separator?: string
    /** Visual variant. Defaults to 'outlined'. */
    variant?: TKbdVariant
}

/** Slot signatures for `<OrigamKbd>`. The default slot wins over both
 *  the `combination` and `text` props. */
export interface IKbdSlots {
    default?: () => any
}
