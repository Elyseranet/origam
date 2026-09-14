import type {
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

export interface ICardHeaderProps extends ITagProps, ICommonsComponentProps, IBorderProps, IRoundedProps, IPaddingProps, IMarginProps, IDensityProps, IAdjacentProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
    subtitle?: string | number
    title?: string | number
    /*********************************************************
     * titleId
     *
     * @description
     * DOM id posed on the rendered `.origam-card-header__title` element
     * — distinct from `id` (already claimed by `ICommonsComponentProps`
     * for the header's OWN root/style id). A consumer that needs an
     * `aria-labelledby` target pointing at the title (e.g. `<OrigamDialog>`
     * for its `role="dialog"`) passes this instead of reusing `id`, the
     * same separation `OrigamRatingField` already applies for its own
     * `useStyle` id vs. the consumer's `id` prop (#381/#412).
     ********************************************************/
    titleId?: string
}

/** Emits fired by `<OrigamCardHeader>` — clicks on prepend/append slots. */
export interface ICardHeaderEmits extends IAdjacentEmits {}

/** Slot signatures for `<OrigamCardHeader>`. */
export interface ICardHeaderSlots extends IAdjacentSlots {
    /** Overrides the whole prepend/content/append layout. */
    wrapper?: () => any
    title?: (data: { title: string | number | undefined }) => any
    subtitle?: (data: { subtitle: string | number | undefined }) => any
    default?: () => any
}
