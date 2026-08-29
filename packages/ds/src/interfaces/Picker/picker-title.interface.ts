import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

// `IColorProps` exposes `color` / `bgColor` hooks. Pre-fix the
// PickerTitle SCSS read `var(--origam-picker-title---color)` from
// tokens, but the consumer-facing `<origam-picker-title color="primary">`
// was a silent no-op because the prop wasn't declared on the interface.
export interface IPickerTitleProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'letterSpacing'> {
    title?: string
}

/** Slot signatures for `<OrigamPickerTitle>`. The default slot wins
 *  over the `title` prop. */
export interface IPickerTitleSlots {
    default?: () => any
}

/*********************************************************
 * IPickerTitleEmits
 *
 * @description
 * `<OrigamPickerTitle>` only ever renders its slot/title text — it
 * never calls `emit(...)` in its script.
 ********************************************************/
export interface IPickerTitleEmits {}
