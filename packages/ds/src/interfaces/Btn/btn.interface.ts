import type { IActiveProps } from '../Commons/active.interface'
import type { IBackdropProps } from '../Commons/backdrop.interface'
import type {
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
import type { IDensityProps } from '../Commons/density.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type {
    IGroupEmits,
    IGroupItemProps
} from '../Commons/group.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILinkProps } from '../Commons/router.interface'
import type { ILoaderProps } from '../Commons/loader.interface'
import type { ILocationProps } from '../Commons/location.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IOpacityProps } from '../Commons/opacity.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IPositionProps } from '../Commons/position.interface'
import type { IRippleProps } from '../Commons/ripple.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'
import type { ITypographyProps } from '../Commons/typography.interface'
import type { IVariantProps } from '../Commons/variant.interface'

import type { TIcon } from '../../types/Icon/icon.type'
import type {
    TStatus,
    TStatusPosition
} from '../../types/Commons/status.type'

/** Btn needs `status` / `statusIconPosition` from IStatusProps but its own
 *  `icon` prop accepts `boolean | TIcon` (boolean = icon-only mode) which is
 *  wider than `IIconProps.icon?: TIcon`.  Pulling the two status props in
 *  directly avoids the TS2430 incompatible-extends error.
 *
 *  ⛔ `variant` EST UN PRESET DE PROPS, PAS UNE COUCHE CSS (ADR-005 D1,
 *  converti par le lot 4 / #1027). La prop vient d'`IVariantProps` ; la table
 *  qui dit ce que chaque valeur IMPLIQUE est `BTN_VARIANT_PRESETS`
 *  (`consts/Btn/btn.const.ts`), appliquee par le resolveur de props au rang le
 *  plus FAIBLE de la chaine : prop du site d'appel > defaut de theme pour le
 *  composant > defaut global de theme > PRESET > `withDefaults`. Toute prop
 *  qu'un variant pose se redefinit donc a la main. La classe
 *  `origam-btn--variant-{valeur}` reste EMISE sans qu'aucune regle du DS ne
 *  s'y attache — elle appartient au consommateur, comme crochet d'override
 *  (tenu par le garde `no-variant-css`). Les deux ecarts de rendu assumes (la
 *  moitie `:focus-visible` de `plain` / `ghost`, la branche
 *  `@supports not (backdrop-filter)` de `ghost`) sont documentes sur
 *  `BTN_VARIANT_PRESETS`, pour qu'il n'en existe qu'une copie.
 *
 *  ⛔ RUPTURE, LOT 4 — la prop booleenne `flat`, `@deprecated` depuis
 *  longtemps au profit de `variant="flat"`, est SUPPRIMEE. Mesure avant
 *  retrait : zero `<origam-btn … flat>` dans `packages/ds/src`,
 *  `packages/marketing/src`, `packages/stories` et `packages/docs`, et zero
 *  reference a la classe `origam-btn--flat` dans `packages/tests`. Son unique
 *  lecteur etait le selecteur combine `&--flat, &--variant-flat`, qui part
 *  avec les blocs de variant. Les ruptures sont gratuites tant qu'aucun
 *  consommateur ne depend du paquet (`CLAUDE.md`, « c'est maintenant qu'il
 *  faut faire les ruptures »).
 *
 *  `IOpacityProps` et `IBackdropProps` entrent dans l'`extends` parce que le
 *  resolveur IGNORE toute cle de preset absente de `rawProps` : une prop non
 *  declaree rend le preset silencieusement inerte. `plain` a besoin de la
 *  premiere, `ghost` de la seconde. */
export interface IBtnProps extends ICommonsComponentProps, IColorProps, IBgColorProps, IBorderProps, IDensityProps, IDimensionProps, IElevationProps, IOpacityProps, IBackdropProps, IRoundedProps, ITagProps, ISizeProps, ILinkProps, IRippleProps, ILoaderProps, IPositionProps, ILocationProps, IGroupItemProps, IPaddingProps, IMarginProps, IAdjacentProps, IHoverProps, IActiveProps, IVariantProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
    /** Pass `true` to activate icon-only mode; pass a `TIcon` value to set the icon. */
    icon?: boolean | TIcon
    block?: boolean
    slim?: boolean
    stacked?: boolean
    text?: string
    status?: TStatus
    statusIconPosition?: TStatusPosition
}

/**
 * Emit signatures for `<OrigamBtn>`.
 *
 * ⛔ REMOVED SURFACE (#443, #577) — `click:prepend` / `click:append` used to
 * be inherited from `IAdjacentEmits`. They are GONE, not merely typed
 * away: `<OrigamBtn>` no longer relays a click from the prepend/append zone
 * at all (see `OrigamBtn.vue`, the spans carry no `@click` any more).
 *
 * They were never reachable by keyboard: the emit was bound to the
 * `origam-btn__prepend` / `origam-btn__append` `<span>`, while a keyboard
 * activation synthesises its click on the component ROOT, which never
 * reaches a descendant listener. The fix `useAdjacent` applies on the other
 * ten consumers — promote the zone to a `role="button"` tab stop — is
 * ILLEGAL here: Btn renders as `<button>` or `<a>`, and both forbid an
 * interactive-content descendant and any descendant with `tabindex`.
 *
 * Two actions are two buttons: compose them with `<origam-btn-group>`. The
 * `prepend` / `append` SLOTS are unaffected — see {@link IBtnSlots}.
 */
export interface IBtnEmits extends IGroupEmits {}

/** Slot signatures for `<OrigamBtn>`. */
export interface IBtnSlots extends IAdjacentSlots {
    /** Overrides the whole loader/prepend/content/append layout. */
    wrapper?: () => any
    /** Overrides the active loader (line/circular/skeleton), receives the
     *  forwarded `<OrigamProgress>` props. */
    loader?: (data: Record<string, unknown>) => any
    default?: () => any
}
