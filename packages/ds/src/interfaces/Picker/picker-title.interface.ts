import type { IBgColorProps,
    IColorProps, ICommonsComponentProps, ITagProps, ITypographyProps } from "../../interfaces"

// `IColorProps` exposes `color` / `bgColor` hooks. Pre-fix the
// PickerTitle SCSS read `var(--origam-picker-title---color)` from
// tokens, but the consumer-facing `<origam-picker-title color="primary">`
// was a silent no-op because the prop wasn't declared on the interface.
export interface IPickerTitleProps extends ICommonsComponentProps, ITagProps, IColorProps, IBgColorProps, ITypographyProps {
    title?: string
}
