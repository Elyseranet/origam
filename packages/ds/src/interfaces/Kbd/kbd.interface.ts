import type {
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IRoundedProps,
    ISizeProps,
    ITypographyProps,
} from '../../interfaces'

import type { TKbdVariant } from '../../types'

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
