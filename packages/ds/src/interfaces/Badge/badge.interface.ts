import type {
    IAdjacentEmits,
    IAdjacentProps,
    IAdjacentSlots
} from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IHoverEmits, IHoverProps } from '../Commons/hover.interface'
import type { ILocationProps } from '../Commons/location.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { IStatusProps } from '../Commons/status.interface'
import type { ITransitionComponentProps } from '../Commons/transition-component.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

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
export interface IBadgeProps extends ICommonsComponentProps, ITagProps, IBorderProps, IColorProps, IBgColorProps, ILocationProps, IRoundedProps, ITransitionComponentProps, IStatusProps, IHoverProps, IElevationProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight'>, IAdjacentProps {
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
 *  (same contract as `OrigamBtn` / `OrigamAlert`, via `useAdjacent`),
 *  plus `update:hover` (C7).
 *
 *  ⛔ `update:hover` PARTAIT DEJA sans etre declare ici. Badge cable un vrai
 *  survol — `useStateFlag(props, {state:'hover'})` + `@mouseenter` /
 *  `@mouseleave` sur la racine — dont `set()` / `unset()` ecrivent a travers
 *  le v-model. Vue lit le gestionnaire dans `vnode.props`, ou un
 *  `onUpdate:hover` non declare atterrit quand meme via les attrs : l'emit
 *  fonctionnait donc PAR ACCIDENT, et Vue le faisait EN PLUS retomber en
 *  ecouteur natif sur l'element racine.
 *
 *  Le declarer aligne trois choses qui divergeaient : le type public, la
 *  Variant « Events - update:hover » que la story expose depuis toujours
 *  (OrigamBadge.story.vue:146), et le comportement reel. Mesure : cf.
 *  packages/tests/TU/components/Badge/badge-hover-emit-declared.spec.ts */
export interface IBadgeEmits extends IAdjacentEmits, IHoverEmits {}

/** Slot signatures for `<OrigamBadge>`. */
export interface IBadgeSlots extends IAdjacentSlots {
    default?: () => any
    badge?: () => any
}
