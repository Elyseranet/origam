import type { IAccessibleClickableProps } from '../Commons/accessible-clickable.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ISizeProps } from '../Commons/size.interface'

import type {
    TIcon,
    TIconComponent
} from '../../types/Icon/icon.type'

export interface IIconProps {
    icon?: TIcon
}

/*********************************************************
 * IIconComponentProps
 *
 * @description
 * Surface de props partagee par <OrigamIcon> et ses quatre feuilles de
 * rendu : ClassIcon, ComponentIcon, LigatureIcon, SvgIcon.
 *
 * PAS de prop disabled ici, et c'est delibere. Elle y a ete declaree puis
 * retiree : aucun des cinq composants ne la lisait, et une icone est un
 * element de rendu, pas un element interactif — il n'y a rien a desactiver.
 *
 * Un etat desactive se peint sur le controle qui PORTE l'icone (bouton,
 * champ, item de liste), dont l'icone herite opacite et curseur. C'est
 * aussi ce qui empeche un meme controle d'afficher deux traitements
 * desactives divergents.
 ********************************************************/
export interface IIconComponentProps extends IIconProps, IColorProps, IBgColorProps, ICommonsComponentProps, ITagProps, ISizeProps, IPaddingProps, IMarginProps, IBorderProps, IDimensionProps, IRoundedProps {
}

/*********************************************************
 * IIconClickableComponentProps
 *
 * @description
 * ⛔ issue #653 — `IIconComponentProps` PLUS the compile-time contract:
 * `clickable: true` requires `aria-label` or `aria-labelledby`. Used by
 * the four icon leaves that actually implement the a11y half of the
 * contract via `useIconAccessibility()` — `OrigamIcon`, `OrigamClassIcon`,
 * `OrigamComponentIcon`, `OrigamLigatureIcon`.
 *
 * `OrigamSvgIcon` deliberately keeps plain `IIconComponentProps`: it
 * hardcodes `aria-hidden="true"` on its inner `<svg>` and never calls
 * `useIconAccessibility()` / exposes a `role`, so it has no clickable
 * a11y contract to enforce here — widening its props with `clickable`
 * would advertise a capability it does not implement. See #653 report
 * for the follow-up this gap deserves as its own ticket.
 *
 * ⛔ A `type` intersection, not an `interface extends` — see
 * `IAccessibleClickableProps` for why, and for the `withDefaults()` trap
 * this specific shape falls into.
 ********************************************************/
export type IIconClickableComponentProps = IIconComponentProps & IAccessibleClickableProps

/*********************************************************
 * IIconComponentEmits
 *
 * @description
 * Emits shared by `<OrigamIcon>` and its four leaves (ClassIcon,
 * ComponentIcon, LigatureIcon, SvgIcon) — empty on purpose. An icon is a
 * pure render element: none of the five components calls `emit(...)`
 * anywhere in its script.
 ********************************************************/
export interface IIconComponentEmits {}

/** Slot signatures shared by `<OrigamIcon>` and `<OrigamComponentIcon>` —
 *  a single unscoped `default` slot holding the icon glyph / fallback. */
export interface IIconComponentSlots {
    default?: () => any
}

/*********************************************************
 * IClassIconSlots
 *
 * @description
 * `<OrigamClassIcon>` renders a self-closing `<component>` — no `<slot>`
 * in its template.
 ********************************************************/
export interface IClassIconSlots {}

/*********************************************************
 * ILigatureIconSlots
 *
 * @description
 * `<OrigamLigatureIcon>` renders `{{ icon }}` as text content — no
 * `<slot>` in its template.
 ********************************************************/
export interface ILigatureIconSlots {}

/*********************************************************
 * ISvgIconSlots
 *
 * @description
 * `<OrigamSvgIcon>` always renders its inline `<svg>` — no `<slot>` in
 * its template.
 ********************************************************/
export interface ISvgIconSlots {}

export interface IIconAliases {
    [name: string]: TIcon
}

export interface IIconSet {
    component: TIconComponent
}
