import type {
    IAdjacentEmits,
    IAdjacentProps,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IElevationProps,
    IHoverProps,
    ILocationProps,
    IRoundedProps,
    IStatusProps,
    ITagProps,
    ITransitionComponentProps,
    ITypographyProps
} from '../../interfaces'

/**
 * `IAdjacentProps` is pulled in explicitly (not just inherited through
 * `IStatusProps`) because `useStatus()` reads `props.prependIcon` /
 * `props.appendIcon` as a user-override fallback (see
 * `status.composable.ts`, which types its `props` param as
 * `IStatusProps & IAdjacentProps`) — before this fix `IBadgeProps` never
 * declared those fields, so a consumer's `prepend-icon` / `append-icon`
 * attribute fell through to the DOM as an inert attribute instead of
 * reaching the component, and `prependAvatar` / `appendAvatar` had no
 * effect at all despite the SCSS already anticipating an avatar image
 * (`:deep(img)` sizing rule). Only the `prepend` / `append` slots worked.
 */
export interface IBadgeProps extends ICommonsComponentProps, ITagProps, IBorderProps, IColorProps, IBgColorProps, ILocationProps, IRoundedProps, ITransitionComponentProps, IStatusProps, IHoverProps, IElevationProps, ITypographyProps, IAdjacentProps {
    content?: number | string
    dot?: boolean
    floating?: boolean
    inline?: boolean
    label?: string
    max?: number | string
    modelValue?: boolean
    offsetX?: number | string
    offsetY?: number | string
}

/** Emits fired by `<OrigamBadge>` — clicks on the prepend/append slots
 *  (same contract as `OrigamBtn` / `OrigamAlert`, via `useAdjacent`). */
export interface IBadgeEmits extends IAdjacentEmits {}
